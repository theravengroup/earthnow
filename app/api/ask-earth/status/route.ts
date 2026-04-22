/**
 * GET /api/ask-earth/status
 *
 * Operational visibility for Ask Earth. Returns current-month spend,
 * call count, and cap config. Gated by STATUS_AUTH_TOKEN via the
 * `x-status-token` header (query-string tokens leak into access logs).
 */

import { NextResponse } from 'next/server';
import { getBudgetConfig, getCurrentSpend } from '@/lib/ask-earth/budget';
import { safeEqual } from '@/lib/ask-earth/safe-equal';

export const runtime = 'nodejs';

function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function GET(request: Request) {
  const expected = process.env.STATUS_AUTH_TOKEN;
  if (!expected) {
    console.error('[ask-earth/status] STATUS_AUTH_TOKEN not configured');
    return unauthorized();
  }

  const provided = request.headers.get('x-status-token');
  if (!provided || !safeEqual(provided, expected)) {
    return unauthorized();
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
