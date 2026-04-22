/**
 * Ask Earth request logger.
 *
 * Every request (LLM, crisis, budget-capped, rate-limited) gets a log row.
 * Logs go to Upstash with a 90-day TTL and are indexed in a sorted set for
 * time-range queries. Crisis hits additionally land in ask_earth:crisis_hits
 * for fast triage.
 */

import { getRedis, KEYS } from './upstash';

export type LogTone =
  | 'normal'
  | 'refusal'
  | 'uncertainty'
  | 'crisis'
  | 'budget_reached'
  | 'rate_limited'
  | 'validation_error';

export interface LogEntry {
  id: string;
  ts: number;
  sessionId?: string;
  ipHash: string;
  question: string;
  answer: string;
  tone: LogTone;
  tier?: 'imminent' | 'possible';
  tokensIn?: number;
  tokensOut?: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
  toolCalls?: string[];
  latencyMs: number;
  crisisHit?: boolean;
  costEstimateUsd?: number;
  model?: string;
}

const LOG_TTL_SEC = 90 * 86400;

export async function writeLog(entry: LogEntry): Promise<void> {
  const redis = getRedis();
  const key = KEYS.log(entry.id);
  await redis
    .multi()
    .set(key, JSON.stringify(entry), { ex: LOG_TTL_SEC })
    .zadd(KEYS.logIndex, { score: entry.ts, member: entry.id })
    .exec();

  if (entry.crisisHit) {
    await redis.zadd(KEYS.crisisHits, { score: entry.ts, member: entry.id });
  }
}

export function makeLogId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
