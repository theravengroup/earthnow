/**
 * Rate limiting for Ask Earth.
 *
 * Two separate limits, both enforced:
 *   - Per-session-per-day:  10 asks
 *   - Per-IP-per-hour:      30 asks
 *
 * IP is HMAC-hashed with IP_HASH_SECRET before anything touches storage —
 * raw IPs are never persisted.
 */

import { createHmac } from 'node:crypto';
import { getRedis, KEYS } from './upstash';

export const SESSION_DAY_LIMIT = Number(
  process.env.ASK_EARTH_SESSION_DAY_LIMIT ?? '10'
);
export const IP_HOUR_LIMIT = Number(
  process.env.ASK_EARTH_IP_HOUR_LIMIT ?? '30'
);

export const RATE_LIMIT_MESSAGE = 'That is enough for now. Come back later.';

export interface RateLimitOk {
  ok: true;
}
export interface RateLimitBlocked {
  ok: false;
  scope: 'session' | 'ip';
  limit: number;
  retryAfterSec: number;
}
export type RateLimitResult = RateLimitOk | RateLimitBlocked;

export function hashIp(ip: string): string {
  const secret = process.env.IP_HASH_SECRET;
  if (!secret) {
    throw new Error('IP_HASH_SECRET is not set');
  }
  return createHmac('sha256', secret).update(ip).digest('base64url');
}

export function extractIp(request: Request): string {
  // `x-vercel-forwarded-for` is set by Vercel and not user-controllable —
  // use it when available. `x-real-ip` is also Vercel-set.
  const vercelXff = request.headers.get('x-vercel-forwarded-for');
  if (vercelXff) return vercelXff.split(',')[0].trim();
  const xr = request.headers.get('x-real-ip');
  if (xr) return xr.trim();
  // Standard `x-forwarded-for` is a client-appendable list on Vercel.
  // The real client IP is the LAST entry (Vercel appends it); reading the
  // first entry would trust whatever the attacker sent.
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return '0.0.0.0';
}

export async function checkRateLimit(
  sessionId: string | undefined,
  ipHash: string
): Promise<RateLimitResult> {
  const redis = getRedis();

  const ipKey = KEYS.ipHour(ipHash);
  const [ipCount] = await redis
    .multi()
    .incr(ipKey)
    .expire(ipKey, 3600)
    .exec<[number, number]>();

  if (ipCount > IP_HOUR_LIMIT) {
    const retry = await redis.ttl(ipKey);
    return {
      ok: false,
      scope: 'ip',
      limit: IP_HOUR_LIMIT,
      retryAfterSec: retry > 0 ? retry : 3600,
    };
  }

  if (sessionId) {
    const sessKey = KEYS.sessionDay(sessionId);
    const [sessCount] = await redis
      .multi()
      .incr(sessKey)
      .expire(sessKey, 86400)
      .exec<[number, number]>();
    if (sessCount > SESSION_DAY_LIMIT) {
      const retry = await redis.ttl(sessKey);
      return {
        ok: false,
        scope: 'session',
        limit: SESSION_DAY_LIMIT,
        retryAfterSec: retry > 0 ? retry : 86400,
      };
    }
  }

  return { ok: true };
}
