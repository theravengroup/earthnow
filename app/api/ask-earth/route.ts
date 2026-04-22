/**
 * POST /api/ask-earth
 *
 * Single-answer endpoint for Ask Earth.
 *
 * Flow (in order):
 *   1. Zod validate
 *   2. Rate limit (Upstash) — session-day + ip-hour
 *   3. Crisis pre-filter — short-circuit the LLM
 *   4. Budget reserve — if month spend would exceed soft cap, degrade
 *   5. LLM tool-use loop
 *   6. Reconcile actual cost against reservation
 *   7. Log + stream SSE
 *
 * Every outcome (success, crisis, degradation, rate-limit, validation) is
 * logged to Upstash. Crisis + degradation responses are pre-written templates
 * streamed via the same SSE channel as LLM answers.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import {
  classifyCrisis,
  CRISIS_RESPONSES,
  SYSTEM_PROMPT,
  FEW_SHOT_EXAMPLES,
} from '@/lib/ask-earth/system-prompt';
import { TOOL_DEFS, executeToolCall } from '@/lib/ask-earth/tools';
import {
  checkRateLimit,
  extractIp,
  hashIp,
  RATE_LIMIT_MESSAGE,
} from '@/lib/ask-earth/rate-limit';
import {
  actualCostUsd,
  DEGRADATION_MESSAGE,
  estimateMaxCostUsd,
  reconcile,
  reserve,
} from '@/lib/ask-earth/budget';
import { makeLogId, writeLog, type LogEntry } from '@/lib/ask-earth/logger';

export const runtime = 'nodejs';
export const maxDuration = 30;

const requestSchema = z.object({
  question: z.string().trim().min(1).max(500),
  sessionId: z.string().optional(),
});

const MODEL = process.env.ASK_EARTH_MODEL ?? 'claude-sonnet-4-6';
const MAX_TOOL_TURNS = 5;
const MAX_TOKENS = 1024;

// ── SSE helpers ────────────────────────────────────────────────────────
function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function sseResponse(
  write: (emit: (event: string, data: unknown) => void) => void | Promise<void>
): Response {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: string, data: unknown) => {
        controller.enqueue(enc.encode(sseEvent(event, data)));
      };
      try {
        await write(emit);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        emit('error', { code: 'internal', message });
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
    },
  });
}

// Fire-and-forget logging — never throw from log writes into the handler.
function safeLog(entry: LogEntry): void {
  writeLog(entry).catch((err) => {
    console.error('[ask-earth] log write failed:', err);
  });
}

// ── Handler ────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const startTs = Date.now();
  const logId = makeLogId();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Server not configured: ANTHROPIC_API_KEY missing' },
      { status: 500 }
    );
  }

  // Parse + validate
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Validation failed' },
      { status: 400 }
    );
  }
  const { question, sessionId } = parsed.data;

  // IP + hash
  let ipHash: string;
  try {
    ipHash = hashIp(extractIp(request));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'IP hashing failed' },
      { status: 500 }
    );
  }

  // ── 1. Rate limit ──────────────────────────────────────────────────
  let rl;
  try {
    rl = await checkRateLimit(sessionId, ipHash);
  } catch (err) {
    console.error('[ask-earth] rate-limit check failed:', err);
    return NextResponse.json(
      { error: 'Rate limiter unavailable' },
      { status: 503 }
    );
  }
  if (!rl.ok) {
    safeLog({
      id: logId,
      ts: startTs,
      sessionId,
      ipHash,
      question,
      answer: RATE_LIMIT_MESSAGE,
      tone: 'rate_limited',
      latencyMs: Date.now() - startTs,
    });
    // SSE stream with 429 status — same render path as every other outcome,
    // still honest to HTTP semantics.
    const enc = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const emit = (event: string, data: unknown) => {
          controller.enqueue(enc.encode(sseEvent(event, data)));
        };
        emit('meta', {
          tone: 'rate_limited',
          scope: rl.scope,
          retryAfterSec: rl.retryAfterSec,
        });
        emit('text', { delta: RATE_LIMIT_MESSAGE });
        emit('done', { fingerprint: 'rate-limit-template' });
        controller.close();
      },
    });
    return new Response(stream, {
      status: 429,
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        'x-accel-buffering': 'no',
        'retry-after': String(rl.retryAfterSec),
      },
    });
  }

  // ── 2. Crisis pre-filter ───────────────────────────────────────────
  const tier = classifyCrisis(question);
  if (tier) {
    const response = CRISIS_RESPONSES[tier];
    safeLog({
      id: logId,
      ts: startTs,
      sessionId,
      ipHash,
      question,
      answer: response,
      tone: 'crisis',
      tier,
      latencyMs: Date.now() - startTs,
      crisisHit: true,
    });
    return sseResponse((emit) => {
      emit('meta', { tone: 'crisis', tier });
      emit('text', { delta: response });
      emit('done', { fingerprint: 'crisis-template', tier });
    });
  }

  // ── 3. Budget reserve ──────────────────────────────────────────────
  const reservation = estimateMaxCostUsd(MAX_TOKENS);
  let reserveRes;
  try {
    reserveRes = await reserve(reservation);
  } catch (err) {
    console.error('[ask-earth] budget reserve failed:', err);
    return NextResponse.json(
      { error: 'Budget check unavailable' },
      { status: 503 }
    );
  }
  if (!reserveRes.ok) {
    safeLog({
      id: logId,
      ts: startTs,
      sessionId,
      ipHash,
      question,
      answer: DEGRADATION_MESSAGE,
      tone: 'budget_reached',
      latencyMs: Date.now() - startTs,
    });
    return sseResponse((emit) => {
      emit('meta', {
        tone: 'budget_reached',
        spendUsd: reserveRes.spendUsd,
        capUsd: reserveRes.capUsd,
      });
      emit('text', { delta: DEGRADATION_MESSAGE });
      emit('done', { fingerprint: 'budget-template' });
    });
  }

  // ── 4. LLM tool-use loop ───────────────────────────────────────────
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const lastIdx = FEW_SHOT_EXAMPLES.length - 1;
  const fewShotMessages: Anthropic.MessageParam[] = FEW_SHOT_EXAMPLES.flatMap(
    (ex, i) => [
      { role: 'user' as const, content: ex.user },
      i === lastIdx
        ? {
            role: 'assistant' as const,
            content: [
              {
                type: 'text' as const,
                text: ex.earth,
                cache_control: { type: 'ephemeral' as const },
              },
            ],
          }
        : { role: 'assistant' as const, content: ex.earth },
    ]
  );

  let messages: Anthropic.MessageParam[] = [
    ...fewShotMessages,
    { role: 'user', content: question },
  ];

  const toolCalls: string[] = [];
  let finalText = '';
  let tokensIn = 0;
  let tokensOut = 0;
  let cacheReadTokens = 0;
  let cacheCreationTokens = 0;

  try {
    for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
      const response = await anthropic.messages.create({
        model: MODEL,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages,
        tools: TOOL_DEFS,
        max_tokens: MAX_TOKENS,
      });

      tokensIn += response.usage.input_tokens;
      tokensOut += response.usage.output_tokens;
      cacheReadTokens += response.usage.cache_read_input_tokens ?? 0;
      cacheCreationTokens += response.usage.cache_creation_input_tokens ?? 0;

      if (response.stop_reason === 'tool_use') {
        const toolUses = response.content.filter(
          (c): c is Anthropic.ToolUseBlock => c.type === 'tool_use'
        );
        for (const t of toolUses) toolCalls.push(t.name);

        messages = [
          ...messages,
          { role: 'assistant', content: response.content },
          {
            role: 'user',
            content: toolUses.map((t) => ({
              type: 'tool_result' as const,
              tool_use_id: t.id,
              content: JSON.stringify(
                executeToolCall(t.name, t.input as Record<string, unknown>)
              ),
            })),
          },
        ];
        continue;
      }

      finalText = response.content
        .filter((c): c is Anthropic.TextBlock => c.type === 'text')
        .map((c) => c.text)
        .join('');
      break;
    }
  } catch (err) {
    // LLM call failed — reservation stays (safe direction).
    console.error('[ask-earth] LLM call failed:', err);
    safeLog({
      id: logId,
      ts: startTs,
      sessionId,
      ipHash,
      question,
      answer: '',
      tone: 'normal',
      latencyMs: Date.now() - startTs,
      model: MODEL,
    });
    return NextResponse.json(
      { error: 'LLM call failed' },
      { status: 502 }
    );
  }

  if (!finalText) {
    // Reservation stays. Caller retries if needed.
    return NextResponse.json(
      { error: 'Model loop exceeded tool-turn limit without final text' },
      { status: 502 }
    );
  }

  // ── 5. Reconcile actual cost ───────────────────────────────────────
  const actual = actualCostUsd({
    input_tokens: tokensIn,
    output_tokens: tokensOut,
    cache_read_input_tokens: cacheReadTokens,
    cache_creation_input_tokens: cacheCreationTokens,
  });
  reconcile(reservation, actual).catch((err) => {
    console.error('[ask-earth] budget reconcile failed:', err);
  });

  // ── 6. Log ─────────────────────────────────────────────────────────
  const latencyMs = Date.now() - startTs;
  safeLog({
    id: logId,
    ts: startTs,
    sessionId,
    ipHash,
    question,
    answer: finalText,
    tone: 'normal',
    tokensIn,
    tokensOut,
    cacheReadTokens,
    cacheCreationTokens,
    toolCalls,
    latencyMs,
    costEstimateUsd: actual,
    model: MODEL,
  });

  // ── 7. Stream final text ───────────────────────────────────────────
  return sseResponse((emit) => {
    emit('meta', { tone: 'normal', toolCalls });
    emit('text', { delta: finalText });
    emit('done', {
      tokensIn,
      tokensOut,
      cacheReadTokens,
      cacheCreationTokens,
      toolCalls,
      costUsd: actual,
      model: MODEL,
    });
  });
}
