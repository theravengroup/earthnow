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
import { extractIp, hashIp } from '@/lib/ask-earth/rate-limit';
import { getRedis, KEYS } from '@/lib/ask-earth/upstash';

export const runtime = 'nodejs';

// Modest per-IP cap. Defense-in-depth against token leak → Upstash
// hammering. Legitimate monitoring easily stays under this.
const STATUS_IP_HOUR_LIMIT = 60;

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

  // Per-IP rate limit after successful auth. Key is scoped to status so
  // it doesn't share a bucket with the main Ask Earth endpoint.
  try {
    const ipHash = hashIp(extractIp(request));
    const redis = getRedis();
    const key = KEYS.statusIpHour(ipHash);
    const [count] = await redis
      .multi()
      .incr(key)
      .expire(key, 3600)
      .exec<[number, number]>();
    if (count > STATUS_IP_HOUR_LIMIT) {
      const retry = await redis.ttl(key);
      return NextResponse.json(
        { error: 'rate_limited' },
        {
          status: 429,
          headers: { 'retry-after': String(retry > 0 ? retry : 3600) },
        }
      );
    }
  } catch (err) {
    // Rate-limit check failure must not block authenticated monitoring.
    console.error('[ask-earth/status] rate-limit check failed:', err);
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
