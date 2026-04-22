/**
 * GET /api/ask-earth/digest
 *
 * Daily beta digest. Pulls the last 24h of Ask Earth activity from Upstash
 * and emails it via Resend to ASK_EARTH_DIGEST_EMAIL. Gated by CRON_SECRET
 * so only the Vercel cron (or someone with the secret) can trigger it.
 *
 * Scheduled via vercel.json: runs daily at 09:00 UTC. Vercel cron calls GET
 * with `Authorization: Bearer $CRON_SECRET` automatically.
 */

import { NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { getRedis, KEYS } from '@/lib/ask-earth/upstash';
import { getBudgetConfig, getCurrentSpend } from '@/lib/ask-earth/budget';
import type { LogEntry } from '@/lib/ask-earth/logger';
import { safeEqual } from '@/lib/ask-earth/safe-equal';

export const runtime = 'nodejs';
export const maxDuration = 30;

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_SAMPLE = 50;

function fmtUsd(n: number): string {
  return `$${n.toFixed(4)}`;
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET(request: Request) {
  // Auth gate
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error('[ask-earth/digest] CRON_SECRET not configured');
    return unauthorized();
  }
  const auth = request.headers.get('authorization');
  if (!auth || !safeEqual(auth, `Bearer ${expected}`)) {
    return unauthorized();
  }

  const to = process.env.ASK_EARTH_DIGEST_EMAIL ?? 'hello@danjahn.com';
  const now = Date.now();
  const since = now - DAY_MS;

  let spend: Awaited<ReturnType<typeof getCurrentSpend>>;
  let logIds: string[];
  let crisisIds: string[];
  try {
    const redis = getRedis();
    spend = await getCurrentSpend();
    // Last 24h log IDs (sorted set by ts)
    logIds = await redis.zrange<string[]>(KEYS.logIndex, since, now, {
      byScore: true,
      rev: true,
    });
    crisisIds = await redis.zrange<string[]>(KEYS.crisisHits, since, now, {
      byScore: true,
      rev: true,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Upstash read failed',
      },
      { status: 503 }
    );
  }

  // Pull full entries for a sample
  const sampleIds = logIds.slice(0, MAX_SAMPLE);
  const redis = getRedis();
  const sampleRaw =
    sampleIds.length > 0
      ? await redis.mget<(string | null)[]>(
          ...sampleIds.map((id) => KEYS.log(id))
        )
      : [];
  const samples: LogEntry[] = sampleRaw
    .filter((s): s is string => typeof s === 'string')
    .map((s) => {
      try {
        return JSON.parse(s) as LogEntry;
      } catch {
        return null;
      }
    })
    .filter((e): e is LogEntry => e !== null);

  const { monthlyUsd, softCapUsd } = getBudgetConfig();
  const pct =
    softCapUsd > 0 ? ((spend.spendUsd / softCapUsd) * 100).toFixed(1) : '0';

  // Tone tallies
  const tones = samples.reduce<Record<string, number>>((acc, s) => {
    acc[s.tone] = (acc[s.tone] ?? 0) + 1;
    return acc;
  }, {});

  // Build HTML + text
  const subject = `Ask Earth — ${new Date().toUTCString().slice(0, 16)}`;

  const toneSummary = Object.entries(tones)
    .map(([t, n]) => `${t}: ${n}`)
    .join(' · ');

  const crisisRows = samples
    .filter((s) => s.tone === 'crisis')
    .slice(0, 20)
    .map(
      (s) => `
    <tr>
      <td style="padding:6px 10px;color:#94a3b8;font-size:12px;font-family:ui-monospace,monospace">${new Date(s.ts).toISOString().slice(11, 19)}Z</td>
      <td style="padding:6px 10px;color:#e2e8f0"><b>${esc(s.tier ?? '?')}</b></td>
      <td style="padding:6px 10px;color:#e2e8f0">${esc(s.question)}</td>
    </tr>`
    )
    .join('');

  const llmRows = samples
    .filter((s) => s.tone === 'normal')
    .slice(0, 30)
    .map(
      (s) => `
    <tr>
      <td style="padding:6px 10px;color:#94a3b8;font-size:12px;font-family:ui-monospace,monospace">${new Date(s.ts).toISOString().slice(11, 19)}Z</td>
      <td style="padding:6px 10px;color:#e2e8f0">${esc(s.question)}</td>
      <td style="padding:6px 10px;color:#e2e8f0;font-style:italic">${esc(s.answer)}</td>
      <td style="padding:6px 10px;color:#94a3b8;font-size:12px;font-family:ui-monospace,monospace">${fmtDuration(s.latencyMs)}</td>
      <td style="padding:6px 10px;color:#94a3b8;font-size:12px;font-family:ui-monospace,monospace">${fmtUsd(s.costEstimateUsd ?? 0)}</td>
    </tr>`
    )
    .join('');

  const html = `
<html>
  <body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0a0e17;color:#e2e8f0;padding:24px;margin:0">
    <div style="max-width:720px;margin:0 auto">
      <p style="font-size:20px;margin:0 0 24px 0;color:#14b8a6">Ask Earth — daily digest</p>

      <div style="background:#0f1524;border:1px solid #1e293b;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="margin:0 0 8px 0;font-size:13px;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase">Current-month spend</p>
        <p style="margin:0;font-size:28px;font-weight:600">${fmtUsd(spend.spendUsd)} <span style="color:#94a3b8;font-size:14px">of ${fmtUsd(softCapUsd)} soft cap (${fmtUsd(monthlyUsd)} ceiling) · ${pct}%</span></p>
        <p style="margin:12px 0 0 0;font-size:13px;color:#94a3b8">${spend.callCount} LLM calls this month · last 24h: ${logIds.length} total, ${crisisIds.length} crisis</p>
        <p style="margin:6px 0 0 0;font-size:13px;color:#94a3b8">${toneSummary || 'no activity'}</p>
      </div>

      ${
        crisisRows
          ? `
      <p style="font-size:14px;color:#f59e0b;margin:24px 0 8px 0;letter-spacing:0.08em;text-transform:uppercase">Crisis hits (last 24h)</p>
      <table style="width:100%;border-collapse:collapse;background:#0f1524;border-radius:8px;overflow:hidden">
        ${crisisRows}
      </table>`
          : ''
      }

      <p style="font-size:14px;color:#94a3b8;margin:24px 0 8px 0;letter-spacing:0.08em;text-transform:uppercase">Recent answers (last 24h, up to 30)</p>
      <table style="width:100%;border-collapse:collapse;background:#0f1524;border-radius:8px;overflow:hidden">
        ${llmRows || '<tr><td style="padding:16px;color:#94a3b8">No LLM calls in the last 24h.</td></tr>'}
      </table>

      <p style="font-size:11px;color:#475569;margin-top:32px">EarthNow · sent ${new Date().toISOString()}</p>
    </div>
  </body>
</html>`;

  const text = [
    `Ask Earth — ${new Date().toUTCString()}`,
    '',
    `Current-month spend: ${fmtUsd(spend.spendUsd)} of ${fmtUsd(softCapUsd)} soft cap (${pct}%)`,
    `LLM calls this month: ${spend.callCount}`,
    `Last 24h: ${logIds.length} total, ${crisisIds.length} crisis`,
    `Tones: ${toneSummary || 'no activity'}`,
  ].join('\n');

  try {
    await getResend().emails.send({
      from: 'EarthNow <onboarding@resend.dev>',
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Resend send failed',
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    month: spend.month,
    spendUsd: spend.spendUsd,
    softCapUsd,
    last24h: { total: logIds.length, crisis: crisisIds.length },
    sent: to,
  });
}
