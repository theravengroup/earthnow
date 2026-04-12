"use client";
// EarthNow - Real-time planetary data visualization
// Last updated: March 2026

import React, { useEffect, useState, useRef, useCallback, Suspense, createContext, useContext, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Utensils, Heart, Zap, Globe, Cpu, Droplet, TreePine, Car, Download, Copy, Check, Share2, Mouse, Shield, Mail, BookOpen, Flame, Search, Trees, Package, Fish, Cloud, Baby, Skull, Camera, Play, Moon, GraduationCap, Smartphone, Trash2, DollarSign, Droplets, MessageCircle, AlertTriangle, Megaphone, Phone, Fuel, Wine, Dumbbell, Database, Mountain, Landmark, Snowflake, Wind, TrendingUp, Rabbit, Clock, HeartPulse, Hand } from "lucide-react";
import { SITE_URL } from "@/lib/constants";
import { ExpandToggleLink } from "@/components/interactive-link";
import { UniversalNavbar } from "@/components/universal-navbar";
import { ContrastMoment } from "@/components/contrast-moment";
import { CinematicIntroWrapper, ReplayIntroLink } from "@/components/cinematic-intro";

// Dynamically import heavy below-fold components to reduce initial JS bundle
const SystemsExplorer = dynamic(
  () => import("@/components/systems-explorer").then((m) => ({ default: m.SystemsExplorer })),
  { ssr: false, loading: () => <div className="min-h-[400px]" /> }
);
const ExpandedImpactSections = dynamic(
  () => import("@/components/expanded-impact-sections").then((m) => ({ default: m.ExpandedImpactSections })),
  { ssr: false, loading: () => <div className="min-h-[300px]" /> }
);
const DonateSection = dynamic(
  () => import("@/components/donate-section").then((m) => ({ default: m.DonateSection })),
  { ssr: false, loading: () => <div className="min-h-[400px]" /> }
);
const NowWhatSection = dynamic(
  () => import("@/components/now-what-section").then((m) => ({ default: m.NowWhatSection })),
  { ssr: false, loading: () => <div className="min-h-[200px]" /> }
);
const ImpactShareCarousel = dynamic(
  () => import("@/components/impact-share-carousel").then((m) => ({ default: m.ImpactShareCarousel })),
  { ssr: false, loading: () => <div className="min-h-[300px]" /> }
);
import { ACTION_POOL } from "./action-data";
import { SYSTEMS_DEEP_DIVE } from "./systems-data";
import { CONTRAST_DATA, type ContrastEntry } from "@/lib/data/contrast-data";
import {
  vitalSignsRow1,
  vitalSignsRow2,
  vitalSignsRow3,
  vitalSignsRow4,
  vitalSignsRow5,
  AI_TOKENS_PER_DAY,
  AI_TOKENS_PER_SECOND,
  type MetricConfig,
} from "@/lib/data/vital-signs";
import { CIVILIZATION_SIGNAL_POOL, type CivilizationSignal } from "@/lib/data/civilization-signals";
import { heroTickerPairings } from "@/lib/data/hero-ticker";
import { StarField } from "@/components/hero/star-field";
import { GlobalTickProvider, useGlobalTick, getSecondsSinceLocalMidnight } from "@/hooks/use-global-tick";
import { formatNumber } from "@/lib/format";
import { toast } from "sonner";
import { MetricCard } from "@/components/vital-signs/metric-card";
import { CivilizationSignalCard } from "@/components/vital-signs/civilization-signal-card";
import { ExpandableSystemSection, VitalSignsPulseGlow, RowHeader } from "@/components/vital-signs/expandable-system-section";
import { PlanetaryBalanceIndicator } from "@/components/vital-signs/planetary-balance";
import {
  AnimatedNumber,
  ImpactCard,
  LiveTimeCounter,
  LiveStat,
  ShareMomentSection,
} from "@/components/impact/lifetime-impact";
import { drawRoundRect, formatLargeNumber, formatTime, formatTimeWithUnit, PER_SECOND_RATES, type ShareMomentState } from "@/lib/canvas/generate-share-card";

// Dynamically import the globe component with SSR disabled
const EarthGlobe = dynamic(
  () => import("@/components/earth-globe").catch(() => {
    return { default: () => <div className="aspect-square w-[400px] rounded-full bg-[#0d1f2d] mx-auto md:w-[650px]" /> };
  }),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square w-[400px] rounded-full bg-[#0d1f2d] mx-auto md:w-[650px]" />
    ),
  }
);



// Pre-computed satellite dots positions
const SATELLITE_DOTS: Array<{ left: number; top: number; size: number }> = [
  { left: 38, top: 16, size: 2 }, { left: 52, top: 17, size: 2 }, { left: 45, top: 15, size: 3 },
  { left: 41, top: 18, size: 2 }, { left: 58, top: 16, size: 1 }, { left: 49, top: 19, size: 2 },
  { left: 36, top: 17, size: 2 }, { left: 55, top: 18, size: 2 }, { left: 43, top: 16, size: 3 },
  { left: 61, top: 17, size: 2 }, { left: 39, top: 19, size: 1 }, { left: 47, top: 15, size: 2 },
  { left: 53, top: 19, size: 2 }, { left: 37, top: 16, size: 2 }, { left: 59, top: 18, size: 1 },
  { left: 44, top: 17, size: 2 }, { left: 50, top: 16, size: 3 }, { left: 40, top: 18, size: 2 },
  { left: 56, top: 15, size: 2 }, { left: 48, top: 18, size: 2 }, { left: 35, top: 17, size: 1 },
  { left: 62, top: 16, size: 2 }, { left: 42, top: 19, size: 2 }, { left: 54, top: 17, size: 2 },
  { left: 46, top: 16, size: 3 }, { left: 38, top: 18, size: 2 }, { left: 57, top: 19, size: 1 },
  { left: 51, top: 15, size: 2 }, { left: 41, top: 17, size: 2 }, { left: 60, top: 18, size: 2 },
  { left: 36, top: 19, size: 2 }, { left: 63, top: 17, size: 1 }, { left: 45, top: 18, size: 2 },
  { left: 52, top: 16, size: 2 }, { left: 39, top: 15, size: 3 }, { left: 58, top: 17, size: 2 },
  { left: 43, top: 19, size: 2 }, { left: 49, top: 17, size: 2 },
];






// Counter Component for Ticker
// Uses shared global tick for efficient timer management
function Counter({
  icon: Icon,
  color,
  label,
  baseValue,
  incrementPerSecond,
  useAbbreviated = false,
  isStatic = false,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  label: string;
  baseValue: number;
  incrementPerSecond: number;
  useAbbreviated?: boolean;
  isStatic?: boolean;
}) {
  const { secondsSinceMidnight, isLoaded } = useGlobalTick();
  
  // Calculate value from shared tick (or use static value)
  const value = isStatic ? baseValue : baseValue + (secondsSinceMidnight * incrementPerSecond);

  // Generate text shadow glow based on color
  const textShadow = `0 0 10px ${color}, 0 0 40px ${color}4d`;
  const displayValue = useAbbreviated ? formatNumber(value) : Math.floor(value).toLocaleString();

  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ width: '100%', height: '100%' }}>
      <Icon className="h-5 w-5 shrink-0 mb-2" style={{ color }} />
      <span
        className="font-mono text-xl font-semibold tabular-nums"
        style={{ 
          color, 
          textShadow,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
        suppressHydrationWarning
      >
        {displayValue}
      </span>
      <span 
        className="mt-1 text-[11px] font-medium uppercase tracking-wider text-[#768a9e]"
        style={{
          maxWidth: '100%',
          lineHeight: 1.3,
          wordWrap: 'break-word',
        }}
      >
        {label}
      </span>
    </div>
  );
}



















// System Card Component for Explore the Systems section
function SystemCard({
  icon: Icon,
  title,
  tagline,
  gradientFrom,
  gradientTo,
  stats,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  tagline: string;
  gradientFrom: string;
  gradientTo: string;
  stats: { label: string; dailyTotal: number; color: string; abbreviated?: boolean }[];
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [statValues, setStatValues] = useState(() => 
    stats.map(() => 0)
  );

  // Delay initial sync until after hydration completes using double rAF
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const secondsSinceMidnight = getSecondsSinceLocalMidnight();
        setStatValues(stats.map(stat => (stat.dailyTotal / 86400) * secondsSinceMidnight));
        
        interval = setInterval(() => {
          setStatValues(prev => 
            prev.map((val, i) => val + (stats[i].dailyTotal / 86400))
          );
        }, 1000);
      });
    });
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stats]);

  return (
    <div
      className="group relative flex h-[400px] flex-col overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top gradient accent bar */}
      <div
        className="w-full shrink-0 transition-all duration-300"
        style={{
          height: isHovered ? '8px' : '4px',
          minHeight: '4px',
          background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
        }}
      />

      {/* Card content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Icon with glow */}
        <div
          className="mb-4 h-10 w-10"
          style={{
            filter: `drop-shadow(0 0 12px ${gradientFrom}60)`,
          }}
        >
          <Icon className="h-10 w-10" style={{ color: gradientFrom }} />
        </div>

        {/* Title */}
        <h3 className="mb-2 font-serif text-[22px] font-semibold text-white">
          {title}
        </h3>

        {/* Tagline */}
        <p className="mb-auto text-[14px] leading-relaxed text-[#94a3b8]">
          {tagline}
        </p>

        {/* Stats at bottom */}
        <div className="mt-6 flex flex-col gap-3">
          {stats.map((stat, i) => {
            const displayValue = stat.abbreviated 
              ? formatNumber(statValues[i]) 
              : Math.floor(statValues[i]).toLocaleString();
            return (
              <div key={stat.label} className="flex flex-col">
                <span
                  className="font-mono text-[16px] font-semibold tabular-nums"
                  style={{
                    color: stat.color,
                    textShadow: `0 0 8px ${stat.color}4d`,
                  }}
                  suppressHydrationWarning
                >
                  {displayValue}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8]">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Explore the Systems data
const systemsData = [
  {
    icon: Users,
    title: "People",
    tagline: "8.1 billion stories. 385,000 new ones beginning today.",
    gradientFrom: "#22c55e",
    gradientTo: "#14b8a6",
    stats: [
      { label: "Births Today", dailyTotal: 380000, color: "#22c55e", abbreviated: false },
      { label: "Deaths Today", dailyTotal: 155000, color: "#ef4444", abbreviated: false },
      { label: "Net Growth Today", dailyTotal: 225000, color: "#10b981", abbreviated: false },
    ],
  },
  {
    icon: Zap,
    title: "Energy",
    tagline: "The engine of civilization. 600 exajoules annually.",
    gradientFrom: "#eab308",
    gradientTo: "#f59e0b",
    stats: [
      { label: "Energy Used Today (MWh)", dailyTotal: 1580000000, color: "#eab308", abbreviated: true },
      { label: "Renewables Today (MWh)", dailyTotal: 470000000, color: "#22c55e", abbreviated: true },
      { label: "Oil Pumped Today (barrels)", dailyTotal: 100000000, color: "#f97316", abbreviated: true },
    ],
  },
  {
    icon: Globe,
    title: "Planet",
    tagline: "4.5 billion years old. 8.7 million species. One home.",
    gradientFrom: "#14b8a6",
    gradientTo: "#06b6d4",
    stats: [
      { label: "CO₂ Today (tonnes)", dailyTotal: 115000000, color: "#eab308", abbreviated: true },
      { label: "Forest Lost Today (hectares)", dailyTotal: 20000, color: "#ef4444", abbreviated: false },
      { label: "Plastic Produced Today (tonnes)", dailyTotal: 1000000, color: "#768a9e", abbreviated: false },
    ],
  },
  {
    icon: Utensils,
    title: "Food",
    tagline: "11 billion tons produced. One-third never reaches a plate.",
    gradientFrom: "#f43f5e",
    gradientTo: "#fb7185",
    stats: [
      { label: "Food Produced Today (tonnes)", dailyTotal: 9900000, color: "#22c55e", abbreviated: true },
      { label: "Food Wasted Today (tonnes)", dailyTotal: 3300000, color: "#f43f5e", abbreviated: true },
      { label: "Hunger Deaths Today", dailyTotal: 25000, color: "#f97316", abbreviated: false },
    ],
  },
  {
    icon: Cpu,
    title: "Technology",
    tagline: "5 billion connected. Reshaping every system.",
    gradientFrom: "#8b5cf6",
    gradientTo: "#a78bfa",
    stats: [
      { label: "Google Searches Today", dailyTotal: 8500000000, color: "#3b82f6", abbreviated: true },
      { label: "Emails Sent Today", dailyTotal: 300000000000, color: "#06b6d4", abbreviated: true },
      { label: "Smartphones Sold Today", dailyTotal: 3800000, color: "#8b5cf6", abbreviated: true },
    ],
  },
];

// While You Were Here Section Component
const WhileYouWereHereSection = React.forwardRef<HTMLDivElement>(function WhileYouWereHereSection(_, forwardedRef) {
  const internalRef = useRef<HTMLDivElement>(null);
  const sectionRef = (forwardedRef as React.RefObject<HTMLDivElement>) || internalRef;
  const [phase, setPhase] = useState<'hidden' | 'narrative' | 'counters'>('hidden');
  const [values, setValues] = useState({
    births: 0,
    deaths: 0,
    co2: 0,
    forest: 0,
    searches: 0,
  });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const glowRef = useRef<HTMLDivElement>(null);
  const pulseBoostTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPulseTimeRef = useRef<number>(0);
  
  // Track time on page - starts when component mounts
  useEffect(() => {
    startTimeRef.current = Date.now();
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Trigger glow pulse boost (debounced)
  const triggerGlowPulse = React.useCallback(() => {
    const now = Date.now();
    // Debounce: only trigger if 150ms has passed since last pulse
    if (now - lastPulseTimeRef.current < 150) return;
    lastPulseTimeRef.current = now;
    
    if (glowRef.current) {
      // Clear any pending timeout
      if (pulseBoostTimeoutRef.current) {
        clearTimeout(pulseBoostTimeoutRef.current);
      }
      
      // Add boost class
      glowRef.current.classList.add('pulse-boost');
      
      // Remove after 200ms
      pulseBoostTimeoutRef.current = setTimeout(() => {
        glowRef.current?.classList.remove('pulse-boost');
      }, 200);
    }
  }, []);
  
  // Format elapsed time as "X minutes Y seconds" or "Y seconds"
  const formatElapsedTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes === 0) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
  };

  // Phase 1: Section comes into view -> show narrative
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && phase === 'hidden') {
          setPhase('narrative');
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [phase]);

  // Phase 2: After narrative appears, show counters after 1 second delay
  useEffect(() => {
    if (phase === 'narrative') {
      const timer = setTimeout(() => {
        setPhase('counters');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Phase 3: Start counting when counters are visible
  useEffect(() => {
    if (phase !== 'counters') return;

    const interval = setInterval(() => {
      setValues((prev) => ({
        births: prev.births + 4.3,
        deaths: prev.deaths + 1.8,
        co2: prev.co2 + 1170,
        forest: prev.forest + 0.5,
        searches: prev.searches + 99000,
      }));
      // Trigger synchronized glow pulse
      triggerGlowPulse();
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, triggerGlowPulse]);

  type HeroStat = { key: string; label: string; color: string; value: number; decimals?: number };

  // Top row: 3 items (larger)
  const topRowStats: HeroStat[] = [
    { key: "births", label: "Births", color: "#14b8a6", value: values.births },
    { key: "co2", label: "CO₂ Emitted (tonnes)", color: "#f59e0b", value: values.co2 },
    { key: "forest", label: "Forest Lost (hectares)", color: "#22c55e", value: values.forest, decimals: 1 },
  ];

  // Bottom row: 2 items (slightly smaller)
  const bottomRowStats: HeroStat[] = [
    { key: "deaths", label: "Deaths", color: "#94a3b8", value: values.deaths },
    { key: "searches", label: "Google Searches", color: "#8b5cf6", value: values.searches },
  ];

  return (
    <motion.section
      ref={sectionRef}
      id="while-you-were-here"
      className="relative flex items-center justify-center overflow-hidden bg-[#0a0e17] px-6 pb-24 pt-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      {/* Ambient breathing glow behind metrics - pulses with telemetry updates */}
      <div 
        ref={glowRef}
        className="ambient-glow-breathing pointer-events-none absolute left-1/2 top-1/2"
        style={{
          width: '900px',
          height: '450px',
          background: 'radial-gradient(ellipse at center, rgba(20,184,166,0.08) 0%, rgba(20,184,166,0.03) 35%, transparent 60%)',
        }}
      />
      
      <div className="relative z-10 mx-auto w-full max-w-[1100px] text-center">
        {/* Narrative Heading */}
        <motion.h2 
          className="font-serif text-[32px] font-medium text-[#e2e8f0] md:text-[44px]"
          initial={{ opacity: 0 }}
          animate={phase !== 'hidden' ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          While you were here
        </motion.h2>
        
        {/* Live Timer */}
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={phase !== 'hidden' ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span 
            className="font-mono text-[20px] md:text-[24px]"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            ({formatElapsedTime(elapsedSeconds)})
          </span>
        </motion.div>
        
        {/* Continuation */}
        <motion.p 
          className="mt-4 font-serif text-[32px] font-medium text-white md:text-[44px]"
          initial={{ opacity: 0 }}
          animate={phase !== 'hidden' ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          the planet kept moving.
        </motion.p>

        {/* Metrics Grid - 3+2 Layout */}
        <motion.div 
          className="relative mt-[60px] flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={phase === 'counters' ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Top Row - 3 items (larger) */}
          <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {topRowStats.map((stat, index) => (
              <motion.div 
                key={stat.key} 
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={phase === 'counters' ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <span
                  className="font-mono text-[48px] font-bold tabular-nums leading-none md:text-[60px]"
                  style={{ color: stat.color }}
                >
                  {stat.decimals 
                    ? stat.value.toFixed(stat.decimals)
                    : Math.floor(stat.value).toLocaleString()
                  }
                </span>
                <span className="mt-3 text-[12px] uppercase tracking-wider text-[#94a3b8] md:text-[14px]">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
          
          {/* Bottom Row - 2 items (slightly smaller, centered) */}
          <div className="mt-12 grid w-full max-w-[600px] grid-cols-1 gap-10 md:mt-14 md:grid-cols-2 md:gap-8">
            {bottomRowStats.map((stat, index) => (
              <motion.div 
                key={stat.key} 
                className="flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={phase === 'counters' ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              >
                <span
                  className="font-mono text-[40px] font-bold tabular-nums leading-none md:text-[48px]"
                  style={{ color: stat.color }}
                >
                  {stat.decimals 
                    ? stat.value.toFixed(stat.decimals)
                    : Math.floor(stat.value).toLocaleString()
                  }
                </span>
                <span className="mt-3 text-[11px] uppercase tracking-wider text-[#94a3b8] md:text-[13px]">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Closing Line */}
        <motion.div 
          className="mt-[70px]"
          initial={{ opacity: 0 }}
          animate={phase === 'counters' ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <p 
            className="font-serif text-[16px] italic md:text-[18px]"
            style={{ color: '#768a9e' }}
          >
            Every second counts.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
});

// Icon mapping for ticker
const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Utensils, Heart, Shield, Mail, BookOpen, Flame, Users, Search, Trees, Package, Fish, Cloud, TreePine, Baby, Skull, Camera, Cpu, Play, Moon, GraduationCap, Smartphone, Trash2, DollarSign, Droplets, MessageCircle, AlertTriangle, Megaphone, Phone, Fuel, Zap, Wine, Dumbbell, HeartPulse, Database, Mountain, Landmark, Snowflake, Wind, TrendingUp, Rabbit, Clock,
};

// Isolated countdown component — ticks every second without re-rendering the parent
function ShuffleCountdown({ interval }: { interval: number }) {
  const [countdown, setCountdown] = useState(interval);
  useEffect(() => {
    setCountdown(interval);
    const tick = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? interval : prev - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [interval]);

  return (
    <div className="mt-8 flex flex-col items-center gap-2.5" suppressHydrationWarning>
      {/* Progress bar — wider and taller for visibility */}
      <div className="overflow-hidden rounded-full" style={{ width: 180, height: 4, background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${(countdown / interval) * 100}%`,
            background: 'linear-gradient(90deg, rgba(20,184,166,0.6), #14b8a6)',
            transition: 'width 1s linear',
            boxShadow: '0 0 8px rgba(20,184,166,0.4)',
          }}
          suppressHydrationWarning
        />
      </div>
      <span className="font-mono text-[13px]" style={{ color: 'rgba(148,163,184,0.85)', letterSpacing: '0.04em' }} suppressHydrationWarning>
        new signals in {countdown}s
      </span>
    </div>
  );
}

export default function Home() {
  const impactRef = useRef<HTMLDivElement>(null);
  const vitalSignsRef = useRef<HTMLDivElement>(null);
  const systemsRef = useRef<HTMLDivElement>(null);
  const milestonesRef = useRef<HTMLDivElement>(null);
  const rightNowRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const [birthYear, setBirthYear] = useState<number | "">("");
  const [calculatedImpact, setCalculatedImpact] = useState<{
    waterUsed: number;
    co2Produced: number;
    treesToOffset: number;
    mealsConsumed: number;
    energyUsed: number;
    milesTraveled: number;
    hungerDeaths: number;
    forestLost: number;
    co2Released: number;
    wasteProduced: number;
    plasticUsed: number;
    poopProduced: number;
    daysLived: number;
  } | null>(null);

  // Random hero ticker pairing - selected once on mount
  const [heroTickerIndex, setHeroTickerIndex] = useState<number>(0);
  useEffect(() => {
    setHeroTickerIndex(Math.floor(Math.random() * heroTickerPairings.length));
  }, []);
  
  // Fisher-Yates shuffle (proper, unbiased)
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Pick 16 random signals from the full pool, shuffle them uniformly
  // All tiles same size — no heroes, no wide cards, pure variety
  const buildCivAssignment = useCallback((): CivilizationSignal[] => {
    return shuffle(CIVILIZATION_SIGNAL_POOL).slice(0, 16);
  }, []);

  const [displayedSignals, setDisplayedSignals] = useState<CivilizationSignal[]>(() => []);

  // Initialize on mount and rotate every 60 seconds
  // Countdown is handled by ShuffleCountdown component to avoid re-rendering entire page
  const SHUFFLE_INTERVAL = 60;
  const [shuffleKey, setShuffleKey] = useState(0);
  const [shufflePhase, setShufflePhase] = useState<'idle' | 'fading-out' | 'fading-in'>('idle');
  const shuffleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayedSignals(buildCivAssignment());
  }, [buildCivAssignment]);

  // Animated shuffle: fade-out → swap data → fade-in → idle
  const triggerAnimatedShuffle = useCallback(() => {
    // Phase 1: Fade out (0.6s + stagger)
    setShufflePhase('fading-out');

    shuffleTimeoutRef.current = setTimeout(() => {
      // Phase 2: Swap data while invisible
      setDisplayedSignals(buildCivAssignment());
      setShuffleKey(k => k + 1);
      setShufflePhase('fading-in');

      shuffleTimeoutRef.current = setTimeout(() => {
        // Phase 3: Back to idle
        setShufflePhase('idle');
      }, 700); // fade-in duration + stagger buffer
    }, 700); // fade-out duration + stagger buffer
  }, [buildCivAssignment]);

  useEffect(() => {
    const timer = setInterval(triggerAnimatedShuffle, SHUFFLE_INTERVAL * 1000);
    return () => {
      clearInterval(timer);
      if (shuffleTimeoutRef.current) clearTimeout(shuffleTimeoutRef.current);
    };
  }, [triggerAnimatedShuffle]);

  // Share Your Impact state
  const [impactShareState, setImpactShareState] = useState<'idle' | 'generating' | 'success'>('idle');
  const [impactImageDataUrl, setImpactImageDataUrl] = useState<string | null>(null);
  const [impactImageBlob, setImpactImageBlob] = useState<Blob | null>(null);
  const [impactShareMenuOpen, setImpactShareMenuOpen] = useState(false);
  const [isImpactShareAction, setIsImpactShareAction] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [currentShareCard, setCurrentShareCard] = useState<{intro: string; value: string; unit: string; context: string; color: string} | null>(null);
  const [impactGlobeBase64, setImpactGlobeBase64] = useState<string | null>(null);
  const impactCanvasRef = useRef<HTMLCanvasElement>(null);
  const impactShareMenuRef = useRef<HTMLDivElement>(null);

  // Check if file sharing is supported for impact share
  useEffect(() => {
    const checkShareSupport = async () => {
      try {
        if ("share" in navigator && "canShare" in navigator) {
          const testFile = new File(['test'], 'test.png', { type: 'image/png' });
          const supported = navigator.canShare({ files: [testFile] });
          setCanShareFiles(supported);
        }
      } catch {
        setCanShareFiles(false);
      }
    };
    checkShareSupport();
  }, []);

  // Close impact share menu on outside click
  useEffect(() => {
    if (!impactShareMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (impactShareMenuRef.current && !impactShareMenuRef.current.contains(e.target as Node)) {
        setImpactShareMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImpactShareMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [impactShareMenuOpen]);

  // Pre-load Earth image for impact share card
  useEffect(() => {
    const loadGlobeImage = async () => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = '/earth-globe.jpg';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
        });
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setImpactGlobeBase64(canvas.toDataURL('image/jpeg', 0.9));
        }
      } catch {
        // Fallback handled in generateImpactCard
      }
    };
    loadGlobeImage();
  }, []);

  // Generate Impact Share Card - Matches carousel card design
  const generateImpactCard = async (): Promise<{ blob: Blob | null; dataUrl: string | null }> => {
    const canvas = impactCanvasRef.current;
    if (!canvas || !calculatedImpact) return { blob: null, dataUrl: null };
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return { blob: null, dataUrl: null };
    
    // Use currentShareCard if available, otherwise use first card data
    const defaultCard = {
      intro: "In my lifetime, I've used",
      value: formatNumber(calculatedImpact.waterUsed),
      unit: "gallons of clean water.",
      context: "That's 3 Olympic swimming pools. Most of it went down the drain.",
      color: "#00bcd4",
    };
    const card = currentShareCard || defaultCard;
    
    // Instagram-optimized square dimensions
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;
    
    // Helper to draw rounded rect
    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };
    
    // Helper to wrap text
    const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
      ctx.font = `italic ${fontSize}px Georgia, serif`;
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };
    
    // ============================================
    // LAYER 1: Earth background with cover fit
    // ============================================
    let imageDrawn = false;
    
    if (impactGlobeBase64) {
      const earthImg = new Image();
      await new Promise<void>((resolve) => {
        earthImg.onload = () => {
          const imgRatio = earthImg.naturalWidth / earthImg.naturalHeight;
          const canvasRatio = width / height;
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgRatio > canvasRatio) {
            drawHeight = height;
            drawWidth = height * imgRatio;
            drawX = (width - drawWidth) / 2;
            drawY = 0;
          } else {
            drawWidth = width;
            drawHeight = width / imgRatio;
            drawX = 0;
            drawY = (height - drawHeight) / 2;
          }
          
          ctx.drawImage(earthImg, drawX, drawY, drawWidth, drawHeight);
          imageDrawn = true;
          resolve();
        };
        earthImg.onerror = () => resolve();
        earthImg.src = impactGlobeBase64;
      });
    }
    
    // Fallback gradient if image fails
    if (!imageDrawn) {
      const bgGradient = ctx.createRadialGradient(
        width * 0.5, height * 0.4, 0,
        width * 0.5, height * 0.4, width * 0.7
      );
      bgGradient.addColorStop(0, '#1a3a5c');
      bgGradient.addColorStop(0.4, '#0d1f33');
      bgGradient.addColorStop(0.7, '#0a0e17');
      bgGradient.addColorStop(1, '#0a0e17');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    // ============================================
    // LAYER 2: Dark overlay gradient
    // ============================================
    const darkOverlay = ctx.createLinearGradient(0, 0, 0, height);
    darkOverlay.addColorStop(0, 'rgba(10,14,23,0.3)');
    darkOverlay.addColorStop(0.6, 'rgba(10,14,23,0.92)');
    darkOverlay.addColorStop(1, 'rgba(10,14,23,0.98)');
    ctx.fillStyle = darkOverlay;
    ctx.fillRect(0, 0, width, height);
    
    // ============================================
    // LAYER 3: Stars overlay
    // ============================================
    for (let i = 0; i < 60; i++) {
      const seed = i * 7919;
      const x = (seed * 13) % width;
      const y = (seed * 17) % height;
      const size = 1 + ((seed * 23) % 2);
      const opacity = 0.15 + ((seed * 29) % 30) / 100;
      
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }
    
    // ============================================
    // HEADER: EARTHNOW at top center
    // ============================================
    ctx.font = '600 28px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('EARTHNOW', width / 2, 80);
    
    // Born in {birthYear} below
    ctx.font = '400 22px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#22d3ee';
    ctx.fillText(`Born in ${birthYear}`, width / 2, 115);
    
    // ============================================
    // GLASS PANEL (centered, bottom half)
    // ============================================
    const panelX = 80;
    const panelY = 500;
    const panelWidth = 920;
    const panelHeight = 480;
    const panelRadius = 24;
    
    drawRoundRect(panelX, panelY, panelWidth, panelHeight, panelRadius);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // ============================================
    // INSIDE GLASS PANEL
    // ============================================
    
    // Intro text (italic serif, centered)
    const introLines = wrapText(card.intro, 800, 32);
    ctx.font = 'italic 32px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.textAlign = 'center';
    let introY = panelY + 70;
    for (const line of introLines) {
      ctx.fillText(line, width / 2, introY);
      introY += 40;
    }
    
    // Big number with glow
    const numberY = panelY + 210;
    ctx.save();
    ctx.shadowColor = card.color;
    ctx.shadowBlur = 40;
    ctx.font = '700 120px ui-monospace, "SF Mono", Monaco, monospace';
    ctx.fillStyle = card.color;
    ctx.textAlign = 'center';
    ctx.fillText(card.value, width / 2, numberY);
    ctx.restore();
    
    // Main number (without shadow)
    ctx.font = '700 120px ui-monospace, "SF Mono", Monaco, monospace';
    ctx.fillStyle = card.color;
    ctx.textAlign = 'center';
    ctx.fillText(card.value, width / 2, numberY);
    
    // Unit text (italic serif)
    const unitLines = wrapText(card.unit, 800, 32);
    ctx.font = 'italic 32px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    let unitY = panelY + 310;
    for (const line of unitLines) {
      ctx.fillText(line, width / 2, unitY);
      unitY += 40;
    }
    
    // Context text (smaller, subdued)
    const contextLines = wrapText(card.context, 700, 22);
    ctx.font = '400 22px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    let contextY = panelY + 390;
    for (const line of contextLines) {
      ctx.fillText(line, width / 2, contextY);
      contextY += 30;
    }
    
    // earthnow.app footer
    ctx.font = '400 18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('earthnow.app', width / 2, panelY + 450);
    
    await new Promise(requestAnimationFrame);
    
    const dataUrl = canvas.toDataURL('image/png');
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({ blob, dataUrl: dataUrl && dataUrl.length > 100 ? dataUrl : null });
      }, 'image/png');
    });
  };

  // Handle generate impact card
  const handleGenerateImpact = async () => {
    setImpactShareState('generating');
    try {
      const { blob, dataUrl } = await generateImpactCard();
      if (blob && dataUrl) {
        setImpactImageBlob(blob);
        setImpactImageDataUrl(dataUrl);
        setImpactShareState('success');
      } else {
        setImpactShareState('idle');
        toast.error('Failed to generate image');
      }
    } catch {
      setImpactShareState('idle');
      toast.error('An error occurred');
    }
  };

  // Impact share handlers
  const getImpactSummary = () => {
    if (!calculatedImpact) return '';
    const hungerDeaths = Math.round(calculatedImpact.hungerDeaths / 1000000);
    return `Born in ${birthYear}, I've used ${formatNumber(calculatedImpact.waterUsed)} gallons of water, produced ${Math.floor(calculatedImpact.co2Produced).toLocaleString()} tonnes of CO₂, and consumed ${formatNumber(calculatedImpact.mealsConsumed)} meals. Calculate your impact at earthnow.app`;
  };

  const handleImpactShare = async () => {
    setIsImpactShareAction(true);
    try {
      let blob = impactImageBlob;
      if (!blob) {
        const result = await generateImpactCard();
        blob = result.blob;
      }
      if (!blob) throw new Error('No image');
      
      const summary = getImpactSummary();
      
      if (navigator.share) {
        const canShareFiles = navigator.canShare?.({
          files: [new File([blob], 'earthnow-impact.png', { type: 'image/png' })]
        });
        
        if (canShareFiles) {
          await navigator.share({
            title: 'My Lifetime Impact',
            text: summary,
            url: SITE_URL,
            files: [new File([blob], 'earthnow-impact.png', { type: 'image/png' })]
          });
        } else {
          await navigator.share({
            title: 'My Lifetime Impact',
            text: summary,
            url: SITE_URL,
          });
        }
        setImpactShareMenuOpen(false);
      } else {
        await navigator.clipboard.writeText(SITE_URL);
        toast.success('Link copied', { description: 'Share link copied to clipboard', duration: 2000 });
        setImpactShareMenuOpen(false);
      }
    } catch (err) {
      const errorName = err instanceof Error ? err.name : 'UnknownError';
      if (errorName !== 'AbortError') {
        toast.error('Sharing failed');
      }
    } finally {
      setIsImpactShareAction(false);
    }
  };

  const handleImpactDownload = async () => {
    setIsImpactShareAction(true);
    try {
      let blob = impactImageBlob;
      if (!blob) {
        const result = await generateImpactCard();
        blob = result.blob;
      }
      if (!blob) throw new Error('No image');
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `earthnow-impact-${birthYear}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Image downloaded', { description: 'Impact card saved to your device', duration: 2000 });
      setImpactShareMenuOpen(false);
    } catch {
      toast.error('Download failed');
    } finally {
      setIsImpactShareAction(false);
    }
  };

  const handleImpactCopyImage = async () => {
    setIsImpactShareAction(true);
    try {
      let blob = impactImageBlob;
      if (!blob) {
        const result = await generateImpactCard();
        blob = result.blob;
      }
      if (!blob) throw new Error('No image');
      
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        toast.success('Image copied', { description: 'Impact card copied to clipboard', duration: 2000 });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `earthnow-impact-${birthYear}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.info('Image downloaded', { description: 'Clipboard not supported, image downloaded instead', duration: 2500 });
      }
      setImpactShareMenuOpen(false);
    } catch {
      toast.error('Copy failed');
    } finally {
      setIsImpactShareAction(false);
    }
  };

  const selectedPairing = heroTickerPairings[heroTickerIndex];
  const tickerData = [
    { 
      label: selectedPairing.left.label, 
      baseValue: (selectedPairing.left as { isStatic?: boolean }).isStatic ? selectedPairing.left.dailyTotal : 0, 
      perSecond: (selectedPairing.left as { isStatic?: boolean }).isStatic ? 0 : selectedPairing.left.dailyTotal / 86400, 
      color: selectedPairing.left.color, 
      icon: selectedPairing.left.icon, 
      abbreviated: selectedPairing.left.dailyTotal >= 1000000,
      isStatic: (selectedPairing.left as { isStatic?: boolean }).isStatic || false,
    },
    { 
      label: selectedPairing.right.label, 
      baseValue: (selectedPairing.right as { isStatic?: boolean }).isStatic ? selectedPairing.right.dailyTotal : 0, 
      perSecond: (selectedPairing.right as { isStatic?: boolean }).isStatic ? 0 : selectedPairing.right.dailyTotal / 86400, 
      color: selectedPairing.right.color, 
      icon: selectedPairing.right.icon, 
      abbreviated: selectedPairing.right.dailyTotal >= 1000000,
      isStatic: (selectedPairing.right as { isStatic?: boolean }).isStatic || false,
    },
  ];

  // Scroll-based active section detection (reverse loop approach)
  useEffect(() => {
    const sections = [
      { id: "vital-signs", ref: vitalSignsRef },
      { id: "systems", ref: systemsRef },
      { id: "milestones", ref: milestonesRef },
      { id: "your-impact", ref: impactRef },
      { id: "while-you-were-here", ref: rightNowRef },
    ];

    const handleActiveSection = () => {
      const threshold = window.innerHeight * 0.4;
      let active = "";
      
      // Loop from last to first - find the last section whose top is above 40% of viewport
      for (let i = sections.length - 1; i >= 0; i--) {
        const ref = sections[i].ref;
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (rect.top < threshold) {
            active = sections[i].id;
            break;
          }
        }
      }
      
      setActiveSection(active);
    };

    window.addEventListener("scroll", handleActiveSection);
    handleActiveSection(); // Initial check
    
    return () => window.removeEventListener("scroll", handleActiveSection);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to section from hash on page load (e.g. when navigating from /today or /terra)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    // Small delay to ensure page is fully rendered before scrolling
    const timer = setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const calculateImpact = () => {
    if (!birthYear || birthYear < 1920 || birthYear > 2025) return;
    
    const currentYear = new Date().getFullYear();
    const yearsAlive = currentYear - birthYear;
    const daysAlive = yearsAlive * 365;
    
    setCalculatedImpact({
      waterUsed: daysAlive * 100, // gallons
      co2Produced: daysAlive * 0.033, // tonnes
      treesToOffset: Math.round((daysAlive * 0.033) / (0.06 * yearsAlive)), // trees
      mealsConsumed: daysAlive * 3,
      energyUsed: daysAlive * 57, // kWh
      milesTraveled: daysAlive * 40,
      hungerDeaths: daysAlive * 25000,
      forestLost: daysAlive * 20000, // hectares
      co2Released: daysAlive * 115000000, // tonnes
      wasteProduced: daysAlive * 4.4, // pounds per day average
      plasticUsed: daysAlive * 0.3, // pounds per day average
      poopProduced: daysAlive * 0.28, // pounds per day average (~102 lbs/year)
      daysLived: daysAlive,
    });
  };

  const resetCalculator = () => {
    setBirthYear("");
    setCalculatedImpact(null);
  };

  return (
    <CinematicIntroWrapper>
    <GlobalTickProvider>
    <>
      {/* ============================================
          LAYER 1: GLOBAL NAVBAR (z-1000, fixed)
          - MUST be OUTSIDE any overflow:hidden container
          - Fixed to viewport top, always visible
          ============================================ */}
      <UniversalNavbar
        activeSection={activeSection}
        onSectionClick={scrollToSection}
      />
      
      {/* Main page content */}
      <div className="noise-overlay relative min-h-screen bg-[#0a0e17]" style={{ paddingTop: '64px' }}>

      {/* Background gradient orbs - bold and visible, clipped to viewport */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main teal orb behind globe — pre-softened gradient, no filter:blur */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '1200px',
            height: '1200px',
            background: 'radial-gradient(circle, rgba(20,184,166,0.18) 0%, rgba(20,184,166,0.06) 30%, transparent 55%)',
          }}
        />
        {/* Blue orb upper right */}
        <div
          className="absolute right-[5%] top-[15%]"
          style={{
            width: '900px',
            height: '900px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0.03) 35%, transparent 60%)',
          }}
        />
        {/* Purple orb to the right */}
        <div
          className="absolute right-[15%] top-[50%]"
          style={{
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0.02) 35%, transparent 60%)',
          }}
        />
      </div>

      {/* Star field with individually twinkling stars */}
      <StarField />

      {/* Hero Section */}
      <section className="relative flex min-h-[500px] flex-col items-center justify-center overflow-hidden px-4 md:min-h-screen">
        {/* Satellite dots - clustered above the globe */}
        <div className="pointer-events-none absolute inset-0 z-[2] hidden md:block">
          {SATELLITE_DOTS.map((dot, i) => (
            <div
              key={`satellite-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${dot.left}%`,
                top: `${dot.top}%`,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                background: '#ef4444',
                boxShadow: '0 0 4px rgba(239,68,68,0.6)',
              }}
            />
          ))}
          {/* Satellite label - below the dot cluster */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-center font-mono"
            style={{
              top: '26%',
            }}
          >
            <div className="leading-snug mb-1">
              <div 
                className="text-[14px]"
                style={{
                  color: '#ef4444',
                  textShadow: '0 0 8px rgba(239,68,68,0.4)',
                }}
              >
                12,952 active satellites in orbit
              </div>
            </div>
            <div className="leading-snug mb-1">
              <div 
                className="text-[12px]"
                style={{
                  color: '#f97316',
                  textShadow: '0 0 8px rgba(249,115,22,0.4)',
                }}
              >
                6,000 tons of space debris
              </div>
            </div>
          </div>
        </div>

        {/* 3D Globe - centered with absolute positioning */}
        <div 
className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <EarthGlobe />
        </div>

{/* Brand Lockup - Pinned to top */}
        <div className="absolute left-0 right-0 top-0 z-10 flex flex-col items-center pt-8 md:pt-12">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {/* Main brand line with horizontal rules */}
            <div className="flex items-center gap-4">
              <motion.div
                className="h-[1px] w-8 md:w-12"
                style={{
                  background: 'linear-gradient(to right, transparent, #14b8a6)',
                }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              />
              <motion.span
                className="font-sans text-[13px] font-medium uppercase tracking-[0.35em] md:text-[15px]"
                style={{
                  color: '#14b8a6',
                  textShadow: '0 0 20px rgba(20,184,166,0.3)',
                }}
                animate={{
                  textShadow: [
                    '0 0 20px rgba(20,184,166,0.3)',
                    '0 0 25px rgba(20,184,166,0.4)',
                    '0 0 20px rgba(20,184,166,0.3)',
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                EarthNow
              </motion.span>
              <motion.div
                className="h-[1px] w-8 md:w-12"
                style={{
                  background: 'linear-gradient(to left, transparent, #14b8a6)',
                }}
                initial={{ scaleX: 0, originX: 1 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              />
            </div>
            {/* Subtitle */}
            <motion.span
              className="mt-2 font-sans text-[10px] font-medium uppercase tracking-[0.35em] md:text-[11px]"
              style={{ color: 'rgba(148,163,184,0.7)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              Real-Time Earth Signal
            </motion.span>
          </motion.div>
        </div>
        
        {/* Text Content */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1
              className="mb-6 font-serif font-bold leading-tight text-white"
              style={{ fontSize: 'clamp(20px, 5.5vw, 56px)' }}
            >
            The planet is changing every second.
          </h1>

          <p className="mb-10 max-w-xl text-lg text-[#94a3b8]">
            See the patterns, pressures, and turning points shaping life on Earth.
          </p>

          <div className="flex flex-col items-center gap-4 pb-8 md:pb-0">
              <div className="flex w-full justify-center px-4">
                <motion.button
                  onClick={() => document.getElementById('your-impact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="cta-primary w-full max-w-[320px] rounded-full px-8 py-4 text-[16px] font-semibold text-white transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                    border: '1px solid rgba(20,184,166,0.4)',
                    letterSpacing: '0.02em',
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    background: 'linear-gradient(135deg, #14b8a6, #06b6d4)',
                    boxShadow: '0 0 35px rgba(20,184,166,0.4), 0 4px 15px rgba(0,0,0,0.3)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Your Lifetime Impact
                </motion.button>
              </div>
              
              {/* Replay Intro link - below hero tagline */}
              <div className="w-full text-center" style={{ position: 'relative', zIndex: 10 }}>
                <ReplayIntroLink />
              </div>
            </div>
          </motion.div>

        {/* Ticker Bar - Focused 2-card layout */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 hidden px-4 pb-6 pt-4 md:block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          {/* Desktop layout */}
          <div className="mx-auto hidden max-w-2xl flex-col items-center md:flex">
            <div style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                {tickerData.map((item, index) => {
                  const IconComponent = iconMap[item.icon];
                  return (
                    <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
                      {index === 1 && (
                        <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch' }} />
                      )}
                      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Counter icon={IconComponent} color={item.color} label={item.label} baseValue={item.baseValue} incrementPerSecond={item.perSecond} useAbbreviated={item.abbreviated} isStatic={item.isStatic} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', padding: '12px 0' }}>happening at the same time</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>
            </div>
          </div>
          

        </motion.div>
      </section>

      {/* Suspense boundary for Vital Signs Section */}
      <Suspense fallback={<div className="min-h-[600px] bg-[#0a0e17]" />}>
      {/* The Vital Signs Section */}
      <motion.section
        id="vital-signs"
        ref={vitalSignsRef}
        className="vital-signs-container relative overflow-hidden bg-[#0a0e17] px-3 py-16 sm:px-6 sm:py-24 md:px-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Background gradient orbs for Vital Signs - bold and visible */}
        <div className="pointer-events-none absolute inset-0">
          {/* Teal orb upper left — pre-softened, no filter:blur */}
          <div
            className="absolute -left-[5%] -top-[10%]"
            style={{
              width: '1000px',
              height: '1000px',
              background: 'radial-gradient(circle, rgba(20,184,166,0.10) 0%, rgba(20,184,166,0.03) 30%, transparent 55%)',
            }}
          />
          {/* Purple orb lower right */}
          <div
            className="absolute -bottom-[5%] -right-[5%]"
            style={{
              width: '900px',
              height: '900px',
              background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0.02) 30%, transparent 55%)',
            }}
          />
          {/* Amber orb center-bottom */}
          <div
            className="absolute bottom-[10%] left-[30%]"
            style={{
              width: '800px',
              height: '800px',
              background: 'radial-gradient(circle, rgba(234,179,8,0.05) 0%, rgba(234,179,8,0.015) 30%, transparent 55%)',
            }}
          />
          {/* Synchronized pulse glow - heartbeat of the planet */}
          <VitalSignsPulseGlow />
        </div>
        
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          {/* Section Heading */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-serif text-[28px] sm:text-[36px] md:text-[40px] font-semibold text-white">
              The Vital Signs
            </h2>
            <p className="text-[16px] text-[#94a3b8] md:text-[18px]">
              {"What's happening on Earth right now."}
            </p>
          </div>

          {/* Planetary Balance Indicator */}
          <PlanetaryBalanceIndicator />

          {/* Civilization Signals - Most Important Indicators */}
          <div 
            className="relative mb-20 rounded-3xl px-8 py-14"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(20,184,166,0.08) 0%, transparent 60%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Subtle glow behind section */}
            <div 
              className="absolute inset-0 -z-10"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(20,184,166,0.04) 0%, rgba(20,184,166,0.01) 40%, transparent 65%)',
              }}
            />
            
            {/* Section Header */}
            <div className="mb-10 text-center">
              <h3 className="mb-2 font-serif text-2xl font-semibold text-white md:text-3xl">
                Civilization Signals
              </h3>
              <p className="text-[14px] text-[#768a9e] md:text-[15px]">
                The most powerful real-time indicators of humanity and the planet
              </p>
{/* Device-aware hint text */}
  <div className="flex items-center justify-center gap-2 text-center">
    <Mouse className="pointer-coarse:hidden h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
    <Hand className="pointer-fine:hidden h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
    <span className="pointer-coarse:hidden text-[14px] font-medium italic" style={{ color: 'rgba(255,255,255,0.65)' }}>
      Hover over any signal to see its per-minute rate
    </span>
    <span className="pointer-fine:hidden text-[14px] font-medium italic" style={{ color: 'rgba(255,255,255,0.65)' }}>
      Tap any signal to see its per-minute rate
    </span>
  </div>
              {/* Sentiment color guide */}
              <div className="mt-3 flex items-center justify-center gap-5 text-[11px] text-[#768a9e]">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-[2px] w-4 rounded-full bg-[#14b8a6]" />
                  Positive
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-[2px] w-4 rounded-full bg-[#ef4444]" />
                  Challenging
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-[2px] w-4 rounded-full bg-[#768a9e]" />
                  Neutral
                </span>
              </div>
            </div>

{/* Civilization Signals Grid — uniform 4 cols desktop, 2 cols mobile */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {displayedSignals.map((signal, idx) => (
                  <CivilizationSignalCard
                    key={`civ-${signal.label}`}
                    color={signal.color}
                    label={signal.label}
                    ratePerSecond={signal.ratePerSecond}
                    useAbbreviated={signal.useAbbreviated}
                    prefix={signal.prefix}
                    index={idx}
                    staticValue={signal.staticValue}
                    decimalPlaces={signal.decimalPlaces}
                    staticRateDisplay={signal.staticRateDisplay}
                    sentiment={signal.sentiment}
                    shufflePhase={shufflePhase}
                    totalCards={displayedSignals.length}
                  />
              ))}
            </div>
            {/* Shuffle countdown — isolated component to avoid re-rendering the whole page every second */}
            <ShuffleCountdown key={shuffleKey} interval={SHUFFLE_INTERVAL} />
          </div>

          {/* Contrast Moment - Pool E (Scale & Paradox) */}
          <ContrastMoment pool="E" key="contrast-E" />

          {/* Metric Cards Grid */}
          <div className="flex flex-col">
            {/* Row 1 - Life & Death */}
            <ExpandableSystemSection
              title="Life & Death"
              subtitle="The rhythm of humanity — who arrives, who departs."
              accentColor="#22c55e"
              backgroundGradient="radial-gradient(ellipse at center, rgba(255,120,120,0.04) 0%, transparent 70%)"
              metrics={vitalSignsRow1}
              systemStatus="increasing"
            />

            {/* Contrast Moment - Pool A (Food & Population) */}
            <ContrastMoment pool="A" key="contrast-A" />

            {/* Row 2 - Planet & Resources */}
            <ExpandableSystemSection
              title="Planet & Resources"
              subtitle="What we take from the Earth, and what we put back."
              accentColor="#14b8a6"
              backgroundGradient="radial-gradient(ellipse at center, rgba(120,255,180,0.04) 0%, transparent 70%)"
              metrics={vitalSignsRow2}
              systemStatus="increasing"
            />

            {/* Contrast Moment - Pool B (Environment) */}
            <ContrastMoment pool="B" key="contrast-B" />

            {/* Row 3 - Health */}
            <ExpandableSystemSection
              title="Health"
              subtitle="The cost of how we live."
              accentColor="#a855f7"
              backgroundGradient="radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)"
              metrics={vitalSignsRow3}
              systemStatus="stable"
            />

            {/* Contrast Moment - Pool F (Health & Industry) */}
            <ContrastMoment pool="F" key="contrast-F" />

            {/* Row 4 - Money & Power */}
            <ExpandableSystemSection
              title="Money & Power"
              subtitle="Where the world spends its wealth."
              accentColor="#ef4444"
              backgroundGradient="radial-gradient(ellipse at center, rgba(255,200,120,0.04) 0%, transparent 70%)"
              metrics={vitalSignsRow4}
              systemStatus="increasing"
            />

            {/* Contrast Moment - Pool C (Money & Systems) */}
            <ContrastMoment pool="C" key="contrast-C" />

            {/* Row 5 - Technology */}
            <ExpandableSystemSection
              title="Technology"
              subtitle="The digital pulse of civilization."
              accentColor="#3b82f6"
              backgroundGradient="radial-gradient(ellipse at center, rgba(120,180,255,0.04) 0%, transparent 70%)"
              metrics={vitalSignsRow5}
              systemStatus="increasing"
            />
          </div>
        </div>
      </motion.section>
      </Suspense>

      {/* Suspense boundary for Systems Explorer Section */}
      <Suspense fallback={<div className="min-h-[400px] bg-[#0a0e17]" />}>
      {/* Explore the Systems Section */}
      <motion.section
        id="systems"
        ref={systemsRef}
        className="relative overflow-hidden bg-[#0a0e17] px-6 py-24 md:px-12 [overflow-anchor:none]"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          {/* Section Heading */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-serif text-[28px] sm:text-[36px] md:text-[40px] font-semibold text-white">
              Explore the Systems
            </h2>
<p className="text-[16px] text-[#94a3b8] md:text-[18px]">
  The interconnected forces that define life on Earth.
  </p>
          </div>

          {/* Cinematic Systems Explorer */}
          <SystemsExplorer />
        </div>
      </motion.section>
      </Suspense>

      {/* Contrast Moment - Pool D (Technology & Disconnection) */}
      <ContrastMoment pool="D" key="contrast-D" />

      {/* Suspense boundary for Timeline Preview Section */}
      <Suspense fallback={<div className="min-h-[500px] bg-[#0a0e17]" />}>
      {/* How Humanity Learned to See the Planet - Timeline Preview Section */}
      <motion.section
        ref={milestonesRef}
        id="milestones"
        className="relative overflow-hidden px-6 pb-16 pt-32 md:px-12"
        style={{
          background: 'linear-gradient(180deg, #0a0e17 0%, #0d1220 50%, #0a0e17 100%)',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative z-10 mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-16 text-center">
            {/* Eyebrow - matches navbar label */}
            <motion.span
              className="mb-4 inline-block text-[12px] font-medium uppercase tracking-[0.12em] text-[#94a3b8]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              How We Got Here
            </motion.span>
            <motion.h2 
              className="mb-8 font-serif text-[36px] font-semibold leading-tight text-white md:text-[44px]"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            >
              How We Learned to See the Planet
            </motion.h2>

            <motion.div 
              className="mx-auto max-w-2xl space-y-5 text-[16px] leading-relaxed text-[#94a3b8] md:text-[17px]"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
            >
              <p>
                For thousands of years humanity slowly uncovered how the Earth works.
              </p>
              <p className="text-[15px] text-[#768a9e] md:text-[16px]">
                Astronomers measured its size.<br />
                Scientists discovered the forces shaping climate.<br />
                Explorers mapped the oceans and continents.
              </p>
              <p className="text-[#b8c5d6]">
                Those discoveries built the knowledge that allows us to understand the planet today.
              </p>
            </motion.div>
          </div>

          {/* Timeline Preview */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          >
            {/* Timeline spine */}
            <div className="relative">
              <div 
                className="absolute left-0 right-0 top-[11px] h-[2px]"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 10%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.15) 90%, transparent 100%)',
                }}
              />
              
              {/* Milestone nodes */}
              <div className="relative flex justify-between">
                {[
                  { year: "~8000 BCE", title: "Agriculture Spreads", slug: "agricultural-revolution-begins" },
                  { year: "~240 BCE", title: "Earth Measured", slug: "eratosthenes-measures-earth" },
                  { year: "1687", title: "Newton's Principia", slug: "newtons-principia-published" },
                  { year: "1856", title: "CO₂ Warming Discovered", slug: "eunice-footes-co2-discovery" },
                  { year: "1968", title: "Earthrise Photograph", slug: "earthrise-photograph" },
                  { year: "1972", title: "Blue Marble", slug: "blue-marble-photograph" },
                  { year: "2009", title: "Planetary Boundaries", slug: "planetary-boundaries-framework" },
                  { year: "Now", title: "Real-Time Monitoring", slug: "" },
                ].map((milestone, index) => (
                  <motion.div
                    key={milestone.slug || 'present'}
                    className="group flex flex-col items-center"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.25 + index * 0.06 }}
                  >
                    {milestone.slug ? (
                      <Link
                        href={`/timeline#${milestone.slug}`}
                        className="flex flex-col items-center"
                      >
                        {/* Node */}
                        <div 
                          className="relative z-10 h-[10px] w-[10px] rounded-full transition-all duration-300 group-hover:scale-150"
                          style={{
                            background: index === 7 ? '#22c55e' : 'rgba(255,255,255,0.6)',
                            boxShadow: 'none',
                          }}
                        >
                          {/* Hover glow */}
                          <div 
                            className="absolute inset-[-6px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            style={{
                              background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)',
                            }}
                          />
                          {/* Pulse animation on hover */}
                          <div 
                            className="absolute inset-[-4px] animate-ping rounded-full opacity-0 group-hover:opacity-40"
                            style={{
                              background: 'rgba(255,255,255,0.4)',
                              animationDuration: '1.5s',
                            }}
                          />
                        </div>
                        
                        {/* Year label */}
                        <span className="mt-4 whitespace-nowrap font-mono text-[12px] text-[#94a3b8] transition-colors duration-300 group-hover:text-white md:text-[13px]">
                          {milestone.year}
                        </span>
                        
                        {/* Title - hidden on mobile, visible on md+ */}
                        <span className="mt-1 hidden max-w-[90px] text-center text-[11px] leading-snug text-[#768a9e] transition-colors duration-300 group-hover:text-[#94a3b8] md:block md:text-[12px]">
                          {milestone.title}
                        </span>
                      </Link>
                    ) : (
                      <div className="flex flex-col items-center">
                        {/* Present node - no link */}
                        <div 
                          className="relative z-10 h-[10px] w-[10px] rounded-full"
                          style={{
                            background: '#22c55e',
                            boxShadow: '0 0 12px rgba(34,197,94,0.5)',
                          }}
                        >
                          {/* Continuous pulse for "Now" */}
                          <div 
                            className="absolute inset-[-4px] animate-ping rounded-full"
                            style={{
                              background: 'rgba(34,197,94,0.4)',
                              animationDuration: '2s',
                            }}
                          />
                        </div>
                        <span className="mt-4 whitespace-nowrap font-mono text-[12px] text-[#22c55e] md:text-[13px]">
                          {milestone.year}
                        </span>
                        <span className="mt-1 hidden max-w-[90px] text-center text-[11px] leading-snug text-[#22c55e]/70 md:block md:text-[12px]">
                          {milestone.title}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Key Turning Points */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { year: "1804", title: "1 Billion People", desc: "Global population reaches its first billion after 200,000 years of human history." },
                { year: "1970", title: "First Earth Day", desc: "20 million Americans rally, launching the modern environmental movement." },
                { year: "1997", title: "Kyoto Protocol", desc: "First international treaty to reduce greenhouse gas emissions is adopted." },
                { year: "2023", title: "8 Billion People", desc: "Global population reaches 8 billion. Growth is slowing, but the total keeps climbing." },
              ].map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  className="group relative overflow-hidden rounded-xl p-5"
                  style={{
                    background: 'rgba(15,23,42,0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.35 + index * 0.1 }}
                  whileHover={{ 
                    borderColor: 'rgba(20,184,166,0.3)',
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Subtle top accent line */}
                  <div 
                    className="absolute left-0 top-0 h-[2px] w-full opacity-60"
                    style={{ background: 'linear-gradient(to right, transparent, #14b8a6, transparent)' }}
                  />
                  <span className="font-mono text-[13px] font-bold text-[#14b8a6]">
                    {milestone.year}
                  </span>
                  <h3 className="mt-2 font-serif text-[17px] text-white">
                    {milestone.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#768a9e]">
                    {milestone.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className="flex flex-col items-center gap-3 text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.5 }}
          >
            <Link
              href="/timeline"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-[15px] font-medium text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}
            >
              Explore the Full Timeline
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <span className="text-[13px] italic text-[#94a3b8]">
              Why history matters to live Earth data
            </span>
          </motion.div>
        </div>
      </motion.section>
      </Suspense>

      {/* Suspense boundary for Lifetime Impact Calculator */}
      <Suspense fallback={<div className="min-h-[500px] bg-[#0a0e17]" />}>
      {/* Lifetime Impact Calculator Section */}
      <motion.section
        id="your-impact"
        ref={impactRef}
        className="relative overflow-hidden bg-[#0a0e17] px-6 pb-8 pt-16 sm:pb-16 md:px-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="relative z-10 mx-auto w-full max-w-5xl">
          {/* Pill Badge */}
          <div className="mb-6 flex justify-center">
            <span 
              className="rounded-full px-5 py-2 text-[14px] font-medium"
              style={{
                border: '1px solid rgba(20,184,166,0.4)',
                color: '#14b8a6',
              }}
            >
              Personal Impact Calculator
            </span>
          </div>

          {/* Section Heading */}
          <div className="mb-8 text-center">
            <h2 className="mb-4 font-serif text-[28px] sm:text-[36px] md:text-[40px] font-semibold text-white">
              Your Lifetime Impact
            </h2>
<p className="text-[16px] text-[#94a3b8] md:text-[18px]">
  Every life leaves a measurable mark. Enter your birth year to see yours.
  </p>
          </div>

          {/* Disclaimer Note */}
          <p className="mx-auto mb-10 max-w-2xl text-center text-[16px] italic text-[#94a3b8]">
            These calculations represent the average human&apos;s environmental footprint based on global consumption data. Individual impact varies by country, lifestyle, and consumption habits.
          </p>

          {/* Input Area */}
          <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
            <input
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value ? parseInt(e.target.value) : "")}
              placeholder="BIRTH YEAR"
              min={1920}
              max={2025}
              className="hide-number-spinner rounded-lg border text-center font-mono text-white uppercase focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:font-mono placeholder:uppercase placeholder:opacity-50"
              style={{
                background: '#1e293b',
                borderColor: '#334155',
                minWidth: 260,
                padding: '12px 24px',
                appearance: 'none',
                MozAppearance: 'textfield',
                WebkitAppearance: 'none',
              }}
            />
            <motion.button
              onClick={calculateImpact}
              className="cta-primary rounded-full px-6 py-3 text-[14px] font-semibold text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                border: '1px solid rgba(20,184,166,0.4)',
              }}
              whileHover={{ 
                scale: 1.03,
                boxShadow: '0 0 35px rgba(20,184,166,0.4), 0 4px 15px rgba(0,0,0,0.3)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              Calculate Impact
            </motion.button>
            <motion.button
              onClick={resetCalculator}
              className="rounded-full px-6 py-3 text-[14px] font-medium text-white transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              whileHover={{ 
                scale: 1.03,
                background: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.4)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              Reset
            </motion.button>
          </div>

          {/* Result Cards Grid */}
          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ImpactCard
              value={calculatedImpact?.waterUsed ?? 0}
              label="Gallons of Water Used"
              color="#06b6d4"
              abbreviated={true}
              comparison={calculatedImpact ? `That's about ${((calculatedImpact.waterUsed) / 660000).toFixed(1)} Olympic swimming pools` : undefined}
            />
            <ImpactCard
              value={calculatedImpact?.co2Produced ?? 0}
              label="Tonnes of CO₂ Produced"
              color="#eab308"
              abbreviated={false}
              comparison={calculatedImpact ? `Equal to driving around the Earth ${((calculatedImpact.co2Produced * 1000 / 404) * 1000 / 24901).toFixed(1)} times` : undefined}
            />
            <ImpactCard
              value={calculatedImpact?.treesToOffset ?? 0}
              label="Trees to Offset Your Carbon"
              color="#22c55e"
              abbreviated={false}
              comparison={calculatedImpact ? "A small forest just for you" : undefined}
            />
            <ImpactCard
              value={calculatedImpact?.mealsConsumed ?? 0}
              label="Meals Consumed"
              color="#f43f5e"
              abbreviated={true}
              comparison={calculatedImpact ? "That's 3 meals every single day" : undefined}
            />
            <ImpactCard
              value={calculatedImpact?.poopProduced ?? 0}
              label="Pounds of Poop Produced"
              color="#a3744e"
              abbreviated={true}
              comparison={calculatedImpact ? `That's about ${(calculatedImpact.poopProduced / 2000).toFixed(1)} tons` : undefined}
            />
            <ImpactCard
              value={calculatedImpact?.energyUsed ?? 0}
              label="kWh of Energy Used"
              color="#f59e0b"
              abbreviated={true}
              comparison={calculatedImpact ? `Enough to power a home for ${(calculatedImpact.energyUsed / 10500).toFixed(1)} years` : undefined}
            />
            <ImpactCard
              value={calculatedImpact?.milesTraveled ?? 0}
              label="Miles Traveled"
              color="#8b5cf6"
              abbreviated={true}
              comparison={calculatedImpact ? `That's ${(calculatedImpact.milesTraveled / 238900).toFixed(1)} trips to the Moon` : undefined}
            />
            <ImpactCard
              value={calculatedImpact?.wasteProduced ?? 0}
              label="Pounds of Waste Generated"
              color="#ef4444"
              abbreviated={true}
              comparison={calculatedImpact ? `That's ${(calculatedImpact.wasteProduced / 2000).toFixed(1)} tons of trash` : undefined}
            />
            <ImpactCard
              value={calculatedImpact?.plasticUsed ?? 0}
              label="Pounds of Plastic Used"
              color="#ec4899"
              abbreviated={true}
              comparison={calculatedImpact ? "None of it has decomposed yet" : undefined}
            />
          </div>

          {/* Hidden canvas for impact card generation */}
          <canvas 
            ref={impactCanvasRef} 
            className="hidden"
            width={1080}
            height={1080}
          />

          {/* Share Your Impact Button - only shown when results are displayed */}
          {calculatedImpact && impactShareState === 'idle' && (
            <motion.div
              className="mb-8 flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <motion.button
                onClick={handleGenerateImpact}
                className="group inline-flex items-center gap-3 rounded-full px-8 py-4 text-[15px] font-medium text-white transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                  border: '1px solid rgba(20,184,166,0.4)',
                  boxShadow: '0 0 30px rgba(20, 184, 166, 0.2)',
                }}
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: '0 0 35px rgba(20,184,166,0.4), 0 4px 15px rgba(0,0,0,0.3)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 className="h-5 w-5" />
                Share My Impact
              </motion.button>
            </motion.div>
          )}

          {/* Generating state */}
          {calculatedImpact && impactShareState === 'generating' && (
            <motion.div
              className="mb-8 flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#14b8a6] border-t-transparent" />
              <p className="text-[14px] text-[#768a9e]">Creating your impact card...</p>
            </motion.div>
          )}

          {/* Success state - show carousel of 9 single-stat cinematic cards */}
          {calculatedImpact && impactShareState === 'success' && (
            <motion.div
              className="mx-auto mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
<ImpactShareCarousel
                  birthYear={birthYear as string}
                  calculatedImpact={calculatedImpact}
                  onRegenerate={handleGenerateImpact}
                  onShareCurrentCard={(card) => setCurrentShareCard(card)}
                  onGetImageBlob={async () => {
                    try {
                      const result = await generateImpactCard();
                      return result?.blob ?? null;
                    } catch {
                      return null;
                    }
                  }}
                />
            </motion.div>
          )}

          {/* Callout Box */}
          {calculatedImpact && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-lg p-6"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderLeft: '3px solid #14b8a6',
              }}
            >
              <p className="text-[15px] leading-relaxed text-[#94a3b8]">
                While you&apos;ve been alive, approximately{" "}
                <span className="font-semibold text-white">
                  {Math.round(calculatedImpact.hungerDeaths / 1000000)} million
                </span>{" "}
                people have died of hunger,{" "}
                <span className="font-semibold text-white">
                  {(calculatedImpact.forestLost / 1000000).toFixed(1)} million
                </span>{" "}
                hectares of forest have been lost, and{" "}
                <span className="font-semibold text-white">
                  {calculatedImpact.co2Released / 1000000000000 >= 1 
                    ? `${(calculatedImpact.co2Released / 1000000000000).toFixed(2)} trillion`
                    : `${(calculatedImpact.co2Released / 1000000000).toFixed(1)} billion`}
                </span>{" "}
                tonnes of CO₂ have been released.
              </p>
            </motion.div>
          )}

          {/* Expanded Impact Sections */}
          {calculatedImpact && (
            <ExpandedImpactSections birthYear={birthYear} />
          )}
        </div>
      </motion.section>

      {/* Transition Section - Invitation to Observe */}
      <motion.section
        className="relative flex flex-col items-center justify-center px-6 pt-8 sm:pt-[60px] text-center"
        style={{
          paddingBottom: '24px',
          background: '#070b11',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h2
          className="font-serif text-[32px] font-semibold leading-tight text-white md:text-[44px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          The planet doesn&apos;t pause.
        </motion.h2>
        <motion.p
          className="mx-auto mt-6 max-w-[480px] text-[16px] leading-relaxed md:text-[18px]"
          style={{ color: 'rgba(255,255,255,0.7)' }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Every second, systems are moving, shifting, accelerating.<br />
          Most of it happens unseen.
        </motion.p>
        <motion.span
          className="mt-8 text-[13px] italic"
          style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Stay here for a moment and watch.
        </motion.span>
      </motion.section>
      </Suspense>

      {/* Now What? Section - after Personal Impact Calculator */}
      <NowWhatSection key="now-what" />

      {/* Suspense boundary for WhileYouWereHere and Support sections */}
      <Suspense fallback={<div className="min-h-[400px] bg-[#0a0e17]" />}>
      {/* While You Were on This Page Section */}
      <WhileYouWereHereSection ref={rightNowRef} />

      {/* Support Section - flows directly from emotional peak */}
      <DonateSection />
      </Suspense>

      {/* Suspense boundary for Share section */}
      <Suspense fallback={<div className="min-h-[300px] bg-[#0a0e17]" />}>
      {/* Share Your Moment on Earth Section */}
      <ShareMomentSection />
      </Suspense>

      {/* Terra Lobby CTA Section */}
      <section
        style={{
          background: "linear-gradient(135deg, rgba(20,184,166,0.06) 0%, rgba(10,14,23,0) 100%)",
          borderTop: "1px solid rgba(20,184,166,0.15)",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0 }}
            className="font-mono"
            style={{
              color: "#14b8a6",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: "16px",
            }}
          >
            FOR ORGANIZATIONS
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-serif"
            style={{
              color: "white",
              fontSize: "52px",
              marginBottom: "20px",
            }}
          >
            Want Terra in your lobby?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-sans"
            style={{
              color: "#94a3b8",
              fontSize: "18px",
              maxWidth: "560px",
              margin: "0 auto 32px auto",
              lineHeight: 1.6,
            }}
          >
            Terra is a real-time planetary dashboard designed for lobby displays. Plug it in. Watch people stop and stare.
          </motion.p>
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.45 }}
            href="/terra"
            className="inline-block font-sans rounded-full transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: "#14b8a6",
              color: "white",
              fontSize: "15px",
              padding: "12px 32px",
            }}
          >
            Learn About Terra →
          </motion.a>
        </div>
      </section>

      </div>
    </>
    </GlobalTickProvider>
    </CinematicIntroWrapper>
  );
}
