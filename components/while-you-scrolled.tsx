"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { DAILY_RATES } from "@/lib/data/daily-rates";

// Each interstitial has a message template, a per-second rate, a color, and formatting options
type Tone = "positive" | "negative" | "neutral";

interface InterstitialDef {
  prefix: string;
  suffix: string;
  perSecond: number;
  color: string;
  decimals?: number;
  unit?: string;
  tone: Tone;
}

// Negative — alarming stats in warm/red tones
const NEGATIVE_POOL: InterstitialDef[] = [
  {
    prefix: "While you scrolled this far,",
    suffix: "tonnes of CO₂ were released into the atmosphere",
    perSecond: DAILY_RATES.co2Tonnes / 86400,
    color: "#f59e0b",
    tone: "negative",
  },
  {
    prefix: "Since you arrived,",
    suffix: "tonnes of food were thrown away",
    perSecond: DAILY_RATES.foodWastedTonnes / 86400,
    color: "#f97316",
    decimals: 1,
    tone: "negative",
  },
  {
    prefix: "While you scrolled,",
    suffix: "was spent on military worldwide",
    perSecond: DAILY_RATES.militarySpending / 86400,
    color: "#ef4444",
    unit: "$",
    tone: "negative",
  },
  {
    prefix: "While you were here,",
    suffix: "people lost their lives to hunger",
    perSecond: DAILY_RATES.hungerDeaths / 86400,
    color: "#ef4444",
    decimals: 1,
    tone: "negative",
  },
  {
    prefix: "While you scrolled this far,",
    suffix: "tonnes of plastic entered the ocean",
    perSecond: DAILY_RATES.plasticEnteringOceans / 86400,
    color: "#f97316",
    decimals: 2,
    tone: "negative",
  },
  {
    prefix: "In the time you've been here,",
    suffix: "acres of forest disappeared",
    perSecond: (DAILY_RATES.treesLostHectares * 2.471) / 86400,
    color: "#f59e0b",
    decimals: 1,
    tone: "negative",
  },
  {
    prefix: "Since you arrived on this page,",
    suffix: "tonnes of topsoil were lost to erosion",
    perSecond: DAILY_RATES.soilLostTonnes / 86400,
    color: "#a3734c",
    tone: "negative",
  },
];

// Positive — hopeful stats in green/teal tones
const POSITIVE_POOL: InterstitialDef[] = [
  {
    prefix: "Since you started reading,",
    suffix: "babies took their first breath",
    perSecond: DAILY_RATES.births / 86400,
    color: "#14b8a6",
    decimals: 1,
    tone: "positive",
  },
  {
    prefix: "While you were reading,",
    suffix: "vaccines were administered worldwide",
    perSecond: DAILY_RATES.vaccinesAdministered / 86400,
    color: "#22c55e",
    tone: "positive",
  },
  {
    prefix: "In the time you've been here,",
    suffix: "MWh of renewable energy were generated",
    perSecond: DAILY_RATES.renewableEnergyMWh / 86400,
    color: "#4ade80",
    tone: "positive",
  },
  {
    prefix: "While you scrolled,",
    suffix: "trees were planted around the world",
    perSecond: DAILY_RATES.treesPlanted / 86400,
    color: "#22c55e",
    decimals: 1,
    tone: "positive",
  },
  {
    prefix: "Since you arrived,",
    suffix: "was invested in education worldwide",
    perSecond: DAILY_RATES.educationSpending / 86400,
    color: "#14b8a6",
    unit: "$",
    tone: "positive",
  },
];

// Neutral — fascinating stats in silver/purple/cyan tones
const NEUTRAL_POOL: InterstitialDef[] = [
  {
    prefix: "While you were reading this page,",
    suffix: "Google searches were performed",
    perSecond: DAILY_RATES.googleSearches / 86400,
    color: "#94a3b8",
    tone: "neutral",
  },
  {
    prefix: "In the time you've been on this page,",
    suffix: "emails were sent around the world",
    perSecond: DAILY_RATES.emailsSent / 86400,
    color: "#94a3b8",
    tone: "neutral",
  },
  {
    prefix: "Since you started scrolling,",
    suffix: "photos were taken worldwide",
    perSecond: DAILY_RATES.photosTaken / 86400,
    color: "#a78bfa",
    tone: "neutral",
  },
  {
    prefix: "In the time since you loaded this page,",
    suffix: "credit card transactions were processed",
    perSecond: DAILY_RATES.creditCardTransactions / 86400,
    color: "#94a3b8",
    tone: "neutral",
  },
  {
    prefix: "Since you started reading,",
    suffix: "AI tokens were processed",
    perSecond: DAILY_RATES.aiTokensProcessed / 86400,
    color: "#a78bfa",
    tone: "neutral",
  },
];

function formatNumber(n: number, decimals: number = 0, unit?: string): string {
  let formatted: string;
  if (n >= 1_000_000) {
    formatted = (n / 1_000_000).toFixed(1) + "M";
  } else if (n >= 10_000) {
    formatted = Math.floor(n).toLocaleString();
  } else if (decimals > 0) {
    formatted = n.toFixed(decimals);
  } else {
    formatted = Math.floor(n).toLocaleString();
  }
  return unit === "$" ? `$${formatted}` : formatted;
}

// Fisher-Yates shuffle with seed derived from date (so it's stable per page load but different per visit)
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function SingleInterstitial({ def }: { def: InterstitialDef }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [value, setValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  // Intersection observer — start counting when visible
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          startTimeRef.current = performance.now();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  // Animation loop — smooth counting
  useEffect(() => {
    if (!isVisible || startTimeRef.current === null) return;

    const tick = () => {
      const elapsed = (performance.now() - startTimeRef.current!) / 1000;
      setValue(elapsed * def.perSecond);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isVisible, def.perSecond]);

  return (
    <div ref={ref} className="relative overflow-hidden">
      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "800px",
          height: "300px",
          background: `radial-gradient(ellipse at center, ${def.color}12 0%, ${def.color}06 40%, transparent 70%)`,
        }}
        animate={isVisible ? {
          opacity: [0.4, 0.8, 0.4],
          scale: [0.95, 1.05, 0.95],
        } : { opacity: 0 }}
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* Subtle horizontal lines */}
      <div
        className="absolute left-0 right-0 top-0"
        style={{
          height: "1px",
          background: `linear-gradient(to right, transparent 0%, ${def.color}25 30%, ${def.color}25 70%, transparent 100%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "1px",
          background: `linear-gradient(to right, transparent 0%, ${def.color}25 30%, ${def.color}25 70%, transparent 100%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
        {/* Prefix text */}
        <motion.p
          className="font-serif text-[18px] italic text-[#768a9e] md:text-[20px]"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {def.prefix}
        </motion.p>

        {/* The big number */}
        <motion.div
          className="mt-5 md:mt-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <span
            className="font-mono text-[52px] font-bold tabular-nums leading-none md:text-[72px]"
            style={{ color: def.color }}
          >
            {formatNumber(value, def.decimals, def.unit)}
          </span>
        </motion.div>

        {/* Suffix text */}
        <motion.p
          className="mt-4 font-serif text-[22px] text-[#e2e8f0] md:mt-5 md:text-[28px]"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          {def.suffix}
        </motion.p>

        {/* Tiny ticking indicator */}
        <motion.div
          className="mt-6 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: def.color,
              animation: "interstitial-pulse 2s ease-in-out infinite",
            }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a5568]">
            live
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Hook that selects `count` random interstitials on mount.
 * Guarantees a balanced tone mix: picks from negative, positive, and neutral pools
 * so visitors always see a mix of alarming, hopeful, and fascinating stats.
 * Stable for the page session — changes on reload/revisit.
 */
export function useRandomInterstitials(count: number) {
  return useMemo(() => {
    // Pick 2 negative, 1 positive, 1 neutral (for count=4)
    // For other counts, distribute roughly evenly with at least 1 of each tone
    const neg = shuffleArray(NEGATIVE_POOL);
    const pos = shuffleArray(POSITIVE_POOL);
    const neu = shuffleArray(NEUTRAL_POOL);

    const picks: InterstitialDef[] = [];
    if (count >= 3) {
      // At least one of each tone
      picks.push(neg[0], pos[0], neu[0]);
      // Fill remaining from a shuffled combined pool (excluding already picked)
      const remaining = shuffleArray([...neg.slice(1), ...pos.slice(1), ...neu.slice(1)]);
      for (let i = 0; picks.length < count && i < remaining.length; i++) {
        picks.push(remaining[i]);
      }
    } else {
      // For small counts, just shuffle everything
      const all = shuffleArray([...neg, ...pos, ...neu]);
      picks.push(...all.slice(0, count));
    }

    // Shuffle final order so tones aren't always in the same sequence
    return shuffleArray(picks);
  }, [count]);
}

/**
 * Renders a single interstitial by index from a pre-selected set.
 */
export function WhileYouScrolled({ interstitial }: { interstitial: InterstitialDef }) {
  return <SingleInterstitial def={interstitial} />;
}
