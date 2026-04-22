/**
 * Upstash Redis client — single source for Ask Earth state.
 *
 * Responsible for: rate limit counters, request logs, monthly budget counter,
 * crisis-hit index.
 *
 * Fails closed: if env vars are missing in production, requests error out
 * rather than running the LLM without rate/budget protection.
 */

import { Redis } from '@upstash/redis';

let client: Redis | null = null;

export function getRedis(): Redis {
  if (client) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      'Upstash env vars missing: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN'
    );
  }

  client = new Redis({ url, token });
  return client;
}

// ── Shared key builders ────────────────────────────────────────────────

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function utcDayKey(d = new Date()): string {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}`;
}

export function utcHourKey(d = new Date()): string {
  return `${utcDayKey(d)}${pad2(d.getUTCHours())}`;
}

export function utcMonthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}`;
}

export const KEYS = {
  sessionDay: (sessionId: string) => `ask_earth:session:${sessionId}:day:${utcDayKey()}`,
  ipHour: (ipHash: string) => `ask_earth:ip:${ipHash}:hour:${utcHourKey()}`,
  statusIpHour: (ipHash: string) => `ask_earth:status:ip:${ipHash}:hour:${utcHourKey()}`,
  log: (id: string) => `ask_earth:log:${id}`,
  logIndex: 'ask_earth:log_index',
  crisisHits: 'ask_earth:crisis_hits',
  budget: (month = utcMonthKey()) => `ask_earth:budget:${month}`,
  budgetCount: (month = utcMonthKey()) => `ask_earth:budget:count:${month}`,
} as const;
