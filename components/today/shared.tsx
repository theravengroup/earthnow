"use client";

import { useState, useEffect } from "react";
import {
  Baby, Skull, Cloud, TreePine, Zap, Droplets, Search, Shield,
  GraduationCap, Camera, Utensils,
} from "lucide-react";
import { DAILY_RATES } from "@/lib/data/daily-rates";
// SITE_URL is available for consumers that need it; re-exported for convenience
export { SITE_URL } from "@/lib/constants";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Returns the number of seconds elapsed since midnight UTC.
 * When `forDate` is a past date (before today UTC), returns the full 86 400 s
 * so that computed values reflect the complete day rather than ticking live.
 */
export function getSecondsSinceMidnightUTC(forDate?: Date): number {
  const now = new Date();
  if (forDate) {
    const todayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    if (forDate.getTime() < todayUTC.getTime()) {
      return 86400;
    }
  }
  const midnightUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  return (now.getTime() - midnightUTC.getTime()) / 1000;
}

/** Format a number with comma separators. */
export function formatNumber(num: number, decimals = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Format a large number with K / M / B / T abbreviation. */
export function formatAbbreviated(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return formatNumber(num);
}

// ============================================================================
// TYPES
// ============================================================================

export type HeroStatResult = {
  text: string;
  highlight1: string;
  mid: string;
  highlight2: string | null;
  end: string;
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const HERO_STAT_TEMPLATES: Array<(...args: number[]) => HeroStatResult> = [
  (births: number, deaths: number) => ({
    text: `So far today, `,
    highlight1: formatNumber(births),
    mid: ` people have been born and `,
    highlight2: formatNumber(deaths),
    end: ` have died.`,
  }),
  (co2: number) => ({
    text: `Humanity has released `,
    highlight1: formatAbbreviated(co2),
    mid: ` tonnes of CO₂ since midnight.`,
    highlight2: null,
    end: ``,
  }),
  (military: number, education: number) => ({
    text: `The world has spent `,
    highlight1: `$${formatAbbreviated(military)}`,
    mid: ` on military and `,
    highlight2: `$${formatAbbreviated(education)}`,
    end: ` on education today.`,
  }),
  (births: number, treesLost: number) => ({
    text: `Since midnight: `,
    highlight1: formatNumber(births),
    mid: ` new lives, `,
    highlight2: formatNumber(treesLost),
    end: ` hectares of forest lost.`,
  }),
  (searches: number) => ({
    text: `Google has processed `,
    highlight1: formatAbbreviated(searches),
    mid: ` searches since midnight.`,
    highlight2: null,
    end: ``,
  }),
  (photos: number, deaths: number) => ({
    text: `Today: `,
    highlight1: formatAbbreviated(photos),
    mid: ` photos taken, `,
    highlight2: formatNumber(deaths),
    end: ` lives ended.`,
  }),
  (water: number) => ({
    text: `Humanity has used `,
    highlight1: formatAbbreviated(water),
    mid: ` liters of water today.`,
    highlight2: null,
    end: ``,
  }),
  (births: number) => ({
    text: ``,
    highlight1: formatNumber(births),
    mid: ` new humans today. Each one will emit ~4 tonnes of CO₂ per year.`,
    highlight2: null,
    end: ``,
  }),
  (foodWasted: number) => ({
    text: `So far today, `,
    highlight1: formatAbbreviated(foodWasted),
    mid: ` tonnes of food have been wasted.`,
    highlight2: null,
    end: ``,
  }),
  (energy: number) => ({
    text: `The planet has generated `,
    highlight1: formatAbbreviated(energy),
    mid: ` MWh of energy since midnight.`,
    highlight2: null,
    end: ``,
  }),
];

export const STAT_CARDS = [
  // Row 1
  { icon: Baby,        label: "Births Today",           color: "#22c55e", dailyRate: DAILY_RATES.births,           abbreviated: false },
  { icon: Skull,       label: "Deaths Today",           color: "#ef4444", dailyRate: DAILY_RATES.deaths,           abbreviated: false },
  { icon: Baby,        label: "Population Growth",      color: "#eab308", dailyRate: DAILY_RATES.populationGrowth, abbreviated: false },
  { icon: Cloud,       label: "CO₂ Emitted (tonnes)",   color: "#f97316", dailyRate: DAILY_RATES.co2Tonnes,        abbreviated: true  },
  // Row 2
  { icon: TreePine,    label: "Trees Lost (hectares)",  color: "#ef4444", dailyRate: DAILY_RATES.treesLostHectares, abbreviated: false },
  { icon: Zap,         label: "Energy Generated (MWh)", color: "#06b6d4", dailyRate: DAILY_RATES.energyMWh,        abbreviated: true  },
  { icon: Droplets,    label: "Water Used (liters)",    color: "#3b82f6", dailyRate: DAILY_RATES.waterLiters,      abbreviated: true  },
  { icon: Utensils,    label: "Food Wasted (tonnes)",   color: "#f97316", dailyRate: DAILY_RATES.foodWastedTonnes, abbreviated: true  },
  // Row 3
  { icon: Search,      label: "Google Searches",        color: "#14b8a6", dailyRate: DAILY_RATES.googleSearches,   abbreviated: true  },
  { icon: Shield,      label: "Military Spending ($)",  color: "#ef4444", dailyRate: DAILY_RATES.militarySpending, abbreviated: true,  prefix: "$" },
  { icon: GraduationCap, label: "Education Spending ($)", color: "#22c55e", dailyRate: DAILY_RATES.educationSpending, abbreviated: true, prefix: "$" },
  { icon: Camera,      label: "Photos Taken",           color: "#a855f7", dailyRate: DAILY_RATES.photosTaken,      abbreviated: true  },
] as const;

export const CONTRAST_PAIRS = [
  { left: { label: "MEALS WASTED TODAY",           dailyTotal: 3_300_000,       color: "#f43f5e" }, right: { label: "HUNGER DEATHS TODAY",                         dailyTotal: 25_000,        color: "#f97316" } },
  { left: { label: "MILITARY SPENDING TODAY ($)",  dailyTotal: 6_300_000_000,   color: "#ef4444" }, right: { label: "EDUCATION SPENDING TODAY ($)",                dailyTotal: 18_000_000_000, color: "#22c55e" } },
  { left: { label: "CO₂ EMITTED TODAY (TONNES)",  dailyTotal: 115_000_000,     color: "#eab308" }, right: { label: "TREES PLANTED TODAY",                         dailyTotal: 500_000,        color: "#22c55e" } },
  { left: { label: "BIRTHS TODAY",                 dailyTotal: 385_000,         color: "#22c55e" }, right: { label: "SPECIES MOVED TOWARD EXTINCTION TODAY",       dailyTotal: 150,            color: "#ef4444" } },
  { left: { label: "PHOTOS TAKEN TODAY",           dailyTotal: 4_700_000_000,   color: "#f59e0b" }, right: { label: "FOREST LOST TODAY (HECTARES)",                dailyTotal: 20_000,         color: "#ef4444" } },
  { left: { label: "OIL PUMPED TODAY (BARRELS)",   dailyTotal: 100_000_000,     color: "#eab308" }, right: { label: "RENEWABLE ENERGY TODAY (MWH)",                dailyTotal: 470_000_000,    color: "#22c55e" } },
  { left: { label: "AD SPENDING TODAY ($)",        dailyTotal: 2_700_000_000,   color: "#f59e0b" }, right: { label: "MENTAL HEALTH CRISIS CALLS TODAY",            dailyTotal: 1_500_000,      color: "#a855f7" } },
  { left: { label: "CORPORATE PROFITS TODAY ($)",  dailyTotal: 137_000_000_000, color: "#22c55e" }, right: { label: "HUNGER DEATHS TODAY",                         dailyTotal: 25_000,         color: "#f97316" } },
] as const;

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * A live-ticking numeric stat.
 *
 * When `isPast` is true the value is frozen at the full-day total rather than
 * ticking forward in real time.
 */
export function LiveStat({
  dailyRate,
  abbreviated = false,
  prefix = "",
  color,
  isPast = false,
}: {
  dailyRate: number;
  abbreviated?: boolean;
  prefix?: string;
  color: string;
  isPast?: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const updateValue = () => {
      const seconds = isPast ? 86400 : getSecondsSinceMidnightUTC();
      setValue((dailyRate / 86400) * seconds);
    };

    updateValue();
    if (!isPast) {
      const interval = setInterval(updateValue, 1000);
      return () => clearInterval(interval);
    }
  }, [dailyRate, isPast]);

  const formatted = abbreviated ? formatAbbreviated(value) : formatNumber(value);

  return (
    <span className="font-mono text-[2rem] font-bold tabular-nums" style={{ color }}>
      {prefix}{formatted}
    </span>
  );
}

/**
 * A small pulsing dot used as a "live" indicator on stat cards.
 *
 * When `isPast` is true the animation is suppressed and the dot is dimmed.
 */
export function BreathingDot({
  color,
  delay = 0,
  isPast = false,
}: {
  color: string;
  delay?: number;
  isPast?: boolean;
}) {
  return (
    <div
      className="absolute right-3 top-3 h-2 w-2 rounded-full"
      style={{
        background: color,
        boxShadow: `0 0 6px ${color}80`,
        animation: isPast ? "none" : `dot-breathe 3s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: isPast ? 0.5 : 1,
      }}
    />
  );
}

/**
 * A stat card showing a live-ticking (or frozen, for past dates) metric.
 */
export function StatCard({
  icon: Icon,
  label,
  color,
  dailyRate,
  abbreviated,
  prefix = "",
  index,
  isPast = false,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  color: string;
  dailyRate: number;
  abbreviated: boolean;
  prefix?: string;
  index: number;
  isPast?: boolean;
}) {
  return (
    <div
      className="relative rounded-xl p-5 text-center"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <BreathingDot color={color} delay={index * 0.5} isPast={isPast} />
      <Icon className="mx-auto mb-3 h-6 w-6" style={{ color, opacity: 0.5 }} />
      <LiveStat
        dailyRate={dailyRate}
        abbreviated={abbreviated}
        prefix={prefix}
        color={color}
        isPast={isPast}
      />
      <p
        className="mt-2 font-sans text-[0.75rem] uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        {label}
      </p>
    </div>
  );
}

/**
 * A contrast pair card that ticks live or shows the full-day total for past dates.
 *
 * Note: the `today/page.tsx` version uses `px-6 py-8 w-full` whilst the
 * `[date]/page.tsx` version uses `px-8 py-10 minWidth: 280px`. The merged
 * component preserves the richer [date] styling which works equally well in
 * both contexts; callers can override via className or a wrapper if needed.
 */
export function ContrastCard({
  label,
  dailyTotal,
  color,
  isPast = false,
}: {
  label: string;
  dailyTotal: number;
  color: string;
  isPast?: boolean;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const updateValue = () => {
      const seconds = isPast ? 86400 : getSecondsSinceMidnightUTC();
      setValue((dailyTotal / 86400) * seconds);
    };

    updateValue();
    if (!isPast) {
      const interval = setInterval(updateValue, 1000);
      return () => clearInterval(interval);
    }
  }, [dailyTotal, isPast]);

  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl px-8 py-10"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}40`,
        minWidth: "280px",
      }}
    >
      <span
        className="font-mono text-[2.5rem] font-bold tabular-nums md:text-[3rem]"
        style={{ color }}
      >
        {formatAbbreviated(value)}
      </span>
      <span
        className="mt-2 text-center font-sans text-[0.7rem] uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {label}
      </span>
    </div>
  );
}
