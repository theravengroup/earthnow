/**
 * Client-side SSE parser for /api/ask-earth responses.
 * Pure function: no React, no component coupling.
 */

export type AskEarthTone =
  | 'normal'
  | 'crisis'
  | 'budget_reached'
  | 'rate_limited';

export interface AskEarthMeta {
  tone: AskEarthTone;
  tier?: 'imminent' | 'possible';
  scope?: 'session' | 'ip';
  retryAfterSec?: number;
  spendUsd?: number;
  capUsd?: number;
  toolCalls?: string[];
}

export interface AskEarthDone {
  tokensIn?: number;
  tokensOut?: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
  toolCalls?: string[];
  costUsd?: number;
  fingerprint?: string;
  tier?: 'imminent' | 'possible';
  model?: string;
}

export interface AskEarthCallbacks {
  onMeta?: (meta: AskEarthMeta) => void;
  onText?: (delta: string) => void;
  onDone?: (done: AskEarthDone) => void;
  onError?: (err: { code: string; message: string }) => void;
}

/**
 * Stream an Ask Earth response. Handles both 200 (success) and 429
 * (rate-limited, still SSE) — both use the same render path.
 */
export async function askEarth(
  question: string,
  sessionId: string,
  signal: AbortSignal,
  cb: AskEarthCallbacks
): Promise<void> {
  const res = await fetch('/api/ask-earth', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question, sessionId }),
    signal,
  });

  const ct = res.headers.get('content-type') ?? '';

  // Non-SSE errors (validation, internal 500s) — fall back to JSON body
  if (!ct.includes('text/event-stream')) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      // ignore
    }
    cb.onError?.({ code: `http_${res.status}`, message: msg });
    return;
  }

  if (!res.body) {
    cb.onError?.({ code: 'no_body', message: 'Empty response body' });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sepIdx = buffer.indexOf('\n\n');
      while (sepIdx !== -1) {
        const rawEvent = buffer.slice(0, sepIdx);
        buffer = buffer.slice(sepIdx + 2);
        handleEvent(rawEvent, cb);
        sepIdx = buffer.indexOf('\n\n');
      }
    }
    if (buffer.trim().length > 0) handleEvent(buffer, cb);
  } catch (err) {
    if ((err as { name?: string })?.name !== 'AbortError') {
      cb.onError?.({
        code: 'stream_error',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

function handleEvent(raw: string, cb: AskEarthCallbacks): void {
  const lines = raw.split('\n');
  let event = '';
  let data = '';
  for (const line of lines) {
    if (line.startsWith('event: ')) event = line.slice(7).trim();
    else if (line.startsWith('data: ')) data = line.slice(6);
  }
  if (!event || !data) return;

  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return;
  }

  switch (event) {
    case 'meta':
      cb.onMeta?.(parsed as AskEarthMeta);
      break;
    case 'text':
      cb.onText?.((parsed as { delta: string }).delta);
      break;
    case 'done':
      cb.onDone?.(parsed as AskEarthDone);
      break;
    case 'error':
      cb.onError?.(parsed as { code: string; message: string });
      break;
  }
}
