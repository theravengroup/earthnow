/**
 * GET /api/ask-earth/status
 *
 * Operational visibility for Ask Earth. Returns current-month spend,
 * call count, and cap config. Gated by STATUS_AUTH_TOKEN — the caller
 * must send it as `x-status-token` header or `?token=…` query param.
 */

import { NextResponse } from 'next/server';
import { getBudgetConfig, getCurrentSpend } from '@/lib/ask-earth/budget';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const expected = process.env.STATUS_AUTH_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: 'STATUS_AUTH_TOKEN not configured' },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const provided =
    request.headers.get('x-status-token') ?? url.searchParams.get('token');
  if (provided !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let spend;
  try {
    spend = await getCurrentSpend();
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Upstash read failed',
      },
      { status: 503 }
    );
  }

  const { monthlyUsd, softCapUsd } = getBudgetConfig();
  const percent = softCapUsd > 0 ? (spend.spendUsd / softCapUsd) * 100 : 0;

  return NextResponse.json({
    month: spend.month,
    spendUsd: Number(spend.spendUsd.toFixed(4)),
    callCount: spend.callCount,
    softCapUsd,
    ceilingUsd: monthlyUsd,
    percentUsedOfSoftCap: Number(percent.toFixed(2)),
  });
}
