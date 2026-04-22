/**
 * Monthly budget cap with optimistic pre-reserve + reconcile.
 *
 * Bias: overcount-and-cap-early over undercount-and-overspend.
 *
 * Flow per LLM-calling request:
 *   1. reserve(maxCost)  — computes upper-bound cost, INCRBYFLOAT into
 *      ask_earth:budget:{YYYYMM}, checks against soft cap. If over → caller
 *      short-circuits with degradation message (and releases reservation so
 *      counter isn't permanently inflated by cap-reached calls).
 *   2. LLM call
 *   3. reconcile(reserved, actual) — credits (usually negative delta) so the
 *      counter reflects what we actually spent. If LLM call throws, the
 *      reservation stays — that's the safe direction.
 *
 * Crisis calls never touch the budget (no LLM).
 */

import { getRedis, KEYS, utcMonthKey } from './upstash';

// Sonnet 4.6 pricing (USD / million tokens) — per docs.anthropic.com
export const SONNET_4_6_PRICING = {
  input: 3.0,
  output: 15.0,
  cacheWrite5m: 3.75,
  cacheRead: 0.3,
} as const;

// ~35 days keeps the current-month counter alive long enough for stragglers
// after month rollover, and gets auto-wiped before the next same-month cycle.
const BUDGET_TTL_SEC = 35 * 86400;

export interface BudgetConfig {
  monthlyUsd: number;
  softCapUsd: number;
}

export function getBudgetConfig(): BudgetConfig {
  const monthly = Number(process.env.ASK_EARTH_MONTHLY_BUDGET_USD ?? '100');
  const soft = Number(process.env.ASK_EARTH_SOFT_CAP_USD ?? '90');
  return { monthlyUsd: monthly, softCapUsd: soft };
}

/**
 * Upper-bound cost estimate for an uncached call (worst case — first call
 * of the month, or cache expired). Used as the reservation amount.
 * System + few-shots ≈ 4700 tokens; user question ≤ 500 chars ≈ 200 tokens;
 * output capped at max_tokens.
 */
export function estimateMaxCostUsd(maxOutputTokens: number): number {
  const inputTokens = 4900;
  const outputTokens = maxOutputTokens;
  return (
    (inputTokens * SONNET_4_6_PRICING.input) / 1_000_000 +
    (outputTokens * SONNET_4_6_PRICING.output) / 1_000_000
  );
}

/**
 * Actual cost from response.usage, accounting for cache reads/writes.
 */
export function actualCostUsd(usage: {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}): number {
  const input = usage.input_tokens ?? 0;
  const output = usage.output_tokens ?? 0;
  const cacheRead = usage.cache_read_input_tokens ?? 0;
  const cacheWrite = usage.cache_creation_input_tokens ?? 0;
  return (
    (input * SONNET_4_6_PRICING.input) / 1_000_000 +
    (output * SONNET_4_6_PRICING.output) / 1_000_000 +
    (cacheRead * SONNET_4_6_PRICING.cacheRead) / 1_000_000 +
    (cacheWrite * SONNET_4_6_PRICING.cacheWrite5m) / 1_000_000
  );
}

export interface ReserveOk {
  ok: true;
  reservedUsd: number;
  priorSpendUsd: number;
}
export interface ReserveBlocked {
  ok: false;
  reason: 'soft_cap_reached';
  spendUsd: number;
  capUsd: number;
}
export type ReserveResult = ReserveOk | ReserveBlocked;

/**
 * Pre-flight reservation. If adding `reservation` would exceed softCapUsd,
 * decline without adding to the counter (soft bounds). If it would fit,
 * INCRBYFLOAT the reservation and return ok.
 *
 * Note: this is NOT atomic between check and increment. Two concurrent
 * requests can both pass the check and both reserve, briefly exceeding the
 * cap by up to (concurrency × reservation). Acceptable: soft cap leaves
 * $10 headroom under the hard ceiling.
 */
export async function reserve(reservation: number): Promise<ReserveResult> {
  const { softCapUsd } = getBudgetConfig();
  const redis = getRedis();
  const key = KEYS.budget();

  const raw = await redis.get<string | number>(key);
  const prior = raw === null || raw === undefined ? 0 : Number(raw);

  if (prior + reservation > softCapUsd) {
    return {
      ok: false,
      reason: 'soft_cap_reached',
      spendUsd: prior,
      capUsd: softCapUsd,
    };
  }

  await redis.incrbyfloat(key, reservation);
  await redis.expire(key, BUDGET_TTL_SEC);
  await redis.incr(KEYS.budgetCount());
  await redis.expire(KEYS.budgetCount(), BUDGET_TTL_SEC);

  return { ok: true, reservedUsd: reservation, priorSpendUsd: prior };
}

/**
 * Reconcile reservation against actual cost. Delta is usually negative
 * (actual < reservation), crediting the counter down toward the real spend.
 *
 * If this call fails, the reservation stays — bias toward capping early.
 */
export async function reconcile(
  reservedUsd: number,
  actualUsd: number
): Promise<void> {
  const delta = actualUsd - reservedUsd;
  if (delta === 0) return;
  const redis = getRedis();
  await redis.incrbyfloat(KEYS.budget(), delta);
}

/**
 * Release the reservation without charging — used when we reserve but then
 * decide not to make the LLM call (e.g. we detect a problem after reserving).
 * Currently not invoked from the main flow but useful in future branches.
 */
export async function releaseReservation(reservedUsd: number): Promise<void> {
  if (reservedUsd === 0) return;
  const redis = getRedis();
  await redis.incrbyfloat(KEYS.budget(), -reservedUsd);
}

export const DEGRADATION_MESSAGE = `I have spoken as much as EarthNow can afford this month. Come back when the moon returns. If you'd like to keep me speaking sooner, the Support button is how.`;

export async function getCurrentSpend(): Promise<{
  month: string;
  spendUsd: number;
  callCount: number;
}> {
  const redis = getRedis();
  const month = utcMonthKey();
  const [spendRaw, countRaw] = await redis.mget<[string | null, string | null]>(
    KEYS.budget(month),
    KEYS.budgetCount(month)
  );
  return {
    month,
    spendUsd: spendRaw === null ? 0 : Number(spendRaw),
    callCount: countRaw === null ? 0 : Number(countRaw),
  };
}
