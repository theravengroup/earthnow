/**
 * Ask Earth — Tool definitions + server-side handlers
 *
 * Two tools Claude may invoke when Earth needs a grounded number:
 *
 *   - get_today_estimate(metric)   → cumulative since UTC midnight (daily_estimate)
 *   - get_static_reference(fact)   → time-independent planetary reference (static_reference)
 *
 * Every tool return includes a `confidence_type` field that the system prompt
 * keys its phrasing off of. No raw numbers are returned without a confidence tag.
 */

import { DAILY_RATES } from '@/lib/data/daily-rates';
import type Anthropic from '@anthropic-ai/sdk';

// ── Metric catalog: daily-rate-based ──────────────────────────────────────
// Each entry names a metric Earth may ask about, maps it to a daily total
// from lib/data/daily-rates.ts, and provides the canonical unit string.
// Extending this list is the normal way to add new grounded metrics.

export const DAILY_METRICS = {
  births: { daily: DAILY_RATES.births, unit: 'births' },
  deaths: { daily: DAILY_RATES.deaths, unit: 'deaths' },
  population_growth: { daily: DAILY_RATES.populationGrowth, unit: 'people' },
  co2_tonnes: { daily: DAILY_RATES.co2Tonnes, unit: 'tonnes of CO₂' },
  forest_hectares_lost: { daily: DAILY_RATES.treesLostHectares, unit: 'hectares of forest' },
  trees_planted: { daily: DAILY_RATES.treesPlanted, unit: 'trees' },
  plastic_tonnes_to_ocean: { daily: DAILY_RATES.plasticEnteringOceans, unit: 'tonnes of plastic' },
  ice_tonnes_lost: { daily: DAILY_RATES.iceLostTonnes, unit: 'tonnes of ice' },
  soil_tonnes_lost: { daily: DAILY_RATES.soilLostTonnes, unit: 'tonnes of soil' },
  water_liters_used: { daily: DAILY_RATES.waterLiters, unit: 'liters of water' },
  food_tonnes_wasted: { daily: DAILY_RATES.foodWastedTonnes, unit: 'tonnes of food' },
  renewable_mwh_generated: { daily: DAILY_RATES.renewableEnergyMWh, unit: 'MWh of renewable energy' },
  vaccines_administered: { daily: DAILY_RATES.vaccinesAdministered, unit: 'vaccine doses' },
  hunger_deaths: { daily: DAILY_RATES.hungerDeaths, unit: 'deaths from hunger' },
  military_spending_usd: { daily: DAILY_RATES.militarySpending, unit: 'U.S. dollars' },
  education_spending_usd: { daily: DAILY_RATES.educationSpending, unit: 'U.S. dollars' },
  emails_sent: { daily: DAILY_RATES.emailsSent, unit: 'emails' },
  google_searches: { daily: DAILY_RATES.googleSearches, unit: 'searches' },
  photos_taken: { daily: DAILY_RATES.photosTaken, unit: 'photographs' },
  ai_tokens_processed: { daily: DAILY_RATES.aiTokensProcessed, unit: 'AI tokens' },
} as const;

type DailyMetric = keyof typeof DAILY_METRICS;

// ── Static reference catalog ──────────────────────────────────────────────
// Time-independent planetary references. Values are the usual published
// estimates; Earth's phrasing will soften precision via static_reference.

export const STATIC_REFERENCES = {
  world_population: {
    value: 8_100_000_000,
    unit: 'people',
    note: 'approximate current total',
  },
  atmospheric_co2_ppm: {
    value: 422,
    unit: 'parts per million',
    note: 'approximate current atmospheric concentration',
  },
  ocean_surface_coverage_percent: {
    value: 71,
    unit: 'percent of Earth\'s surface',
    note: 'classical figure',
  },
  land_surface_coverage_percent: {
    value: 29,
    unit: 'percent of Earth\'s surface',
    note: 'classical figure',
  },
  average_temperature_anomaly_c: {
    value: 1.2,
    unit: 'degrees Celsius above pre-industrial average',
    note: 'approximate current global mean anomaly',
  },
  planet_age_years: {
    value: 4_540_000_000,
    unit: 'years',
    note: 'best scientific estimate',
  },
} as const;

type StaticReference = keyof typeof STATIC_REFERENCES;

// ── Math helper ───────────────────────────────────────────────────────────

function secondsSinceUtcMidnight(now = new Date()): number {
  const h = now.getUTCHours();
  const m = now.getUTCMinutes();
  const s = now.getUTCSeconds();
  return h * 3600 + m * 60 + s;
}

// ── Tool handlers ─────────────────────────────────────────────────────────

interface ToolResult {
  value: number;
  unit: string;
  confidence_type: 'daily_estimate' | 'static_reference' | 'modeled_total';
  note?: string;
}

export function getTodayEstimate(metric: string): ToolResult | { error: string } {
  if (!(metric in DAILY_METRICS)) {
    return { error: `Unknown metric: ${metric}. Valid metrics: ${Object.keys(DAILY_METRICS).join(', ')}` };
  }
  const entry = DAILY_METRICS[metric as DailyMetric];
  const perSecond = entry.daily / 86400;
  const secondsElapsed = secondsSinceUtcMidnight();
  const value = perSecond * secondsElapsed;
  return {
    value: Math.round(value),
    unit: entry.unit,
    confidence_type: 'daily_estimate',
    note: `cumulative since 00:00 UTC; value grows continuously`,
  };
}

export function getStaticReference(fact: string): ToolResult | { error: string } {
  if (!(fact in STATIC_REFERENCES)) {
    return { error: `Unknown fact: ${fact}. Valid facts: ${Object.keys(STATIC_REFERENCES).join(', ')}` };
  }
  const entry = STATIC_REFERENCES[fact as StaticReference];
  return {
    value: entry.value,
    unit: entry.unit,
    confidence_type: 'static_reference',
    note: entry.note,
  };
}

// ── Tool definitions for the Anthropic API ────────────────────────────────

export const TOOL_DEFS: Anthropic.Tool[] = [
  {
    name: 'get_today_estimate',
    description:
      'Return the estimated cumulative value of a global metric since 00:00 UTC today. ' +
      'Use when the question asks about "today" or "so far today" for rate-based metrics ' +
      '(births, deaths, CO₂ emitted, forest lost, water used, emails sent, etc.). ' +
      'Returns {value, unit, confidence_type: "daily_estimate"}. Phrase the answer with estimate-flavored language ' +
      '("by today\'s reckoning, roughly…", "the current estimate is…").',
    input_schema: {
      type: 'object',
      properties: {
        metric: {
          type: 'string',
          enum: Object.keys(DAILY_METRICS),
          description: 'Which metric to estimate.',
        },
      },
      required: ['metric'],
    },
  },
  {
    name: 'get_static_reference',
    description:
      'Return a time-independent planetary reference value (world population estimate, atmospheric CO₂ ppm, ' +
      'ocean/land surface coverage, global mean temperature anomaly, age of Earth, etc.). ' +
      'Use for questions that do not hinge on "today". Returns {value, unit, confidence_type: "static_reference"}. ' +
      'Phrase the answer plainly ("about X", "just over X").',
    input_schema: {
      type: 'object',
      properties: {
        fact: {
          type: 'string',
          enum: Object.keys(STATIC_REFERENCES),
          description: 'Which reference to return.',
        },
      },
      required: ['fact'],
    },
  },
];

// ── Dispatcher ────────────────────────────────────────────────────────────

export function executeToolCall(
  name: string,
  input: Record<string, unknown>
): ToolResult | { error: string } {
  if (name === 'get_today_estimate') {
    const metric = typeof input.metric === 'string' ? input.metric : '';
    return getTodayEstimate(metric);
  }
  if (name === 'get_static_reference') {
    const fact = typeof input.fact === 'string' ? input.fact : '';
    return getStaticReference(fact);
  }
  return { error: `Unknown tool: ${name}` };
}
