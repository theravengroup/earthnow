"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Baby, Skull, Cloud, TreePine, Zap, Droplets, Search, Shield, 
  GraduationCap, Camera, ChevronDown, Copy, Utensils, ArrowRight
} from "lucide-react";
import { SITE_URL } from "@/lib/constants";
import { UniversalNavbar } from "@/components/universal-navbar";
import { toast } from "sonner";

// ============================================================================
// DAILY RATE CONSTANTS (same as homepage)
// ============================================================================
import { DAILY_RATES } from "@/lib/data/daily-rates";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Parse date string YYYY-MM-DD
function parseDate(dateStr: string): Date | null {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
  if (isNaN(date.getTime())) return null;
  return date;
}

// Check if date is today (UTC)
function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}

// Check if date is in the past (before today UTC)
function isPastDate(date: Date): boolean {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return date.getTime() < todayUTC.getTime();
}

// Get seconds since midnight UTC for a given date
function getSecondsSinceMidnightUTC(forDate?: Date): number {
  const now = new Date();
  if (forDate && isPastDate(forDate)) {
    // For past dates, return full 24 hours
    return 86400;
  }
  const midnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return (now.getTime() - midnightUTC.getTime()) / 1000;
}

// Format numbers with commas
function formatNumber(num: number, decimals = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format with abbreviations (K, M, B, T)
function formatAbbreviated(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return formatNumber(num);
}

// Format date for display
function formatDateForDisplay(date: Date): { dayOfWeek: string; fullDate: string; isoDate: string } {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', timeZone: 'UTC' };
  const dayOfWeek = date.toLocaleDateString('en-US', options).toUpperCase();
  const fullDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const isoDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  return { dayOfWeek, fullDate, isoDate };
}

// Get today's ISO date string
function getTodayISODate(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

// ============================================================================
// HERO STAT TEMPLATES
// ============================================================================
type HeroStatResult = { text: string; highlight1: string; mid: string; highlight2: string | null; end: string };
const HERO_STAT_TEMPLATES: Array<(...args: number[]) => HeroStatResult> = [
  (births: number, deaths: number) => ({
    text: `So far today, `,
    highlight1: formatNumber(births),
    mid: ` people have been born and `,
    highlight2: formatNumber(deaths),
    end: ` have died.`
  }),
  (co2: number) => ({
    text: `Humanity has released `,
    highlight1: formatAbbreviated(co2),
    mid: ` tonnes of CO₂ since midnight.`,
    highlight2: null,
    end: ``
  }),
  (military: number, education: number) => ({
    text: `The world has spent `,
    highlight1: `$${formatAbbreviated(military)}`,
    mid: ` on military and `,
    highlight2: `$${formatAbbreviated(education)}`,
    end: ` on education today.`
  }),
  (births: number, treesLost: number) => ({
    text: `Since midnight: `,
    highlight1: formatNumber(births),
    mid: ` new lives, `,
    highlight2: formatNumber(treesLost),
    end: ` hectares of forest lost.`
  }),
  (searches: number) => ({
    text: `Google has processed `,
    highlight1: formatAbbreviated(searches),
    mid: ` searches since midnight.`,
    highlight2: null,
    end: ``
  }),
  (photos: number, deaths: number) => ({
    text: `Today: `,
    highlight1: formatAbbreviated(photos),
    mid: ` photos taken, `,
    highlight2: formatNumber(deaths),
    end: ` lives ended.`
  }),
  (water: number) => ({
    text: `Humanity has used `,
    highlight1: formatAbbreviated(water),
    mid: ` liters of water today.`,
    highlight2: null,
    end: ``
  }),
  (births: number) => ({
    text: ``,
    highlight1: formatNumber(births),
    mid: ` new humans today. Each one will emit ~4 tonnes of CO₂ per year.`,
    highlight2: null,
    end: ``
  }),
  (foodWasted: number) => ({
    text: `So far today, `,
    highlight1: formatAbbreviated(foodWasted),
    mid: ` tonnes of food have been wasted.`,
    highlight2: null,
    end: ``
  }),
  (energy: number) => ({
    text: `The planet has generated `,
    highlight1: formatAbbreviated(energy),
    mid: ` MWh of energy since midnight.`,
    highlight2: null,
    end: ``
  }),
];

// ============================================================================
// STAT CARD DATA
// ============================================================================
const STAT_CARDS = [
  { icon: Baby, label: "Births Today", color: "#22c55e", dailyRate: DAILY_RATES.births, abbreviated: false },
  { icon: Skull, label: "Deaths Today", color: "#ef4444", dailyRate: DAILY_RATES.deaths, abbreviated: false },
  { icon: Baby, label: "Population Growth", color: "#eab308", dailyRate: DAILY_RATES.populationGrowth, abbreviated: false },
  { icon: Cloud, label: "CO₂ Emitted (tonnes)", color: "#f97316", dailyRate: DAILY_RATES.co2Tonnes, abbreviated: true },
  { icon: TreePine, label: "Trees Lost (hectares)", color: "#ef4444", dailyRate: DAILY_RATES.treesLostHectares, abbreviated: false },
  { icon: Zap, label: "Energy Generated (MWh)", color: "#06b6d4", dailyRate: DAILY_RATES.energyMWh, abbreviated: true },
  { icon: Droplets, label: "Water Used (liters)", color: "#3b82f6", dailyRate: DAILY_RATES.waterLiters, abbreviated: true },
  { icon: Utensils, label: "Food Wasted (tonnes)", color: "#f97316", dailyRate: DAILY_RATES.foodWastedTonnes, abbreviated: true },
  { icon: Search, label: "Google Searches", color: "#14b8a6", dailyRate: DAILY_RATES.googleSearches, abbreviated: true },
  { icon: Shield, label: "Military Spending ($)", color: "#ef4444", dailyRate: DAILY_RATES.militarySpending, abbreviated: true, prefix: "$" },
  { icon: GraduationCap, label: "Education Spending ($)", color: "#22c55e", dailyRate: DAILY_RATES.educationSpending, abbreviated: true, prefix: "$" },
  { icon: Camera, label: "Photos Taken", color: "#a855f7", dailyRate: DAILY_RATES.photosTaken, abbreviated: true },
];

// ============================================================================
// CONTRAST PAIRS
// ============================================================================
const CONTRAST_PAIRS = [
  { left: { label: "MEALS WASTED TODAY", dailyTotal: 3300000, color: "#f43f5e" }, right: { label: "HUNGER DEATHS TODAY", dailyTotal: 25000, color: "#f97316" } },
  { left: { label: "MILITARY SPENDING TODAY ($)", dailyTotal: 6300000000, color: "#ef4444" }, right: { label: "EDUCATION SPENDING TODAY ($)", dailyTotal: 18000000000, color: "#22c55e" } },
  { left: { label: "CO₂ EMITTED TODAY (TONNES)", dailyTotal: 115000000, color: "#eab308" }, right: { label: "TREES PLANTED TODAY", dailyTotal: 500000, color: "#22c55e" } },
  { left: { label: "BIRTHS TODAY", dailyTotal: 385000, color: "#22c55e" }, right: { label: "SPECIES MOVED TOWARD EXTINCTION TODAY", dailyTotal: 150, color: "#ef4444" } },
  { left: { label: "PHOTOS TAKEN TODAY", dailyTotal: 4700000000, color: "#f59e0b" }, right: { label: "FOREST LOST TODAY (HECTARES)", dailyTotal: 20000, color: "#ef4444" } },
  { left: { label: "OIL PUMPED TODAY (BARRELS)", dailyTotal: 100000000, color: "#eab308" }, right: { label: "RENEWABLE ENERGY TODAY (MWH)", dailyTotal: 470000000, color: "#22c55e" } },
  { left: { label: "AD SPENDING TODAY ($)", dailyTotal: 2700000000, color: "#f59e0b" }, right: { label: "MENTAL HEALTH CRISIS CALLS TODAY", dailyTotal: 1500000, color: "#a855f7" } },
  { left: { label: "CORPORATE PROFITS TODAY ($)", dailyTotal: 137000000000, color: "#22c55e" }, right: { label: "HUNGER DEATHS TODAY", dailyTotal: 25000, color: "#f97316" } },
];

// ============================================================================
// HISTORICAL CONTEXT DATA
// ============================================================================
const HISTORICAL_CONTEXT = [
  { label: "World Population", bce10k: "5M", ce1000: "310M", y2000: "6.1B", today: "8.1B" },
  { label: "Daily CO₂ from Human Activity", bce10k: "~0", ce1000: "~0", y2000: "~67M tonnes", today: "~115M tonnes" },
  { label: "Internet Users", bce10k: "—", ce1000: "—", y2000: "~360M", today: "~5.5B" },
  { label: "Daily Google Searches", bce10k: "—", ce1000: "—", y2000: "~20M", today: "~8.5B" },
  { label: "Smartphones in Use", bce10k: "—", ce1000: "—", y2000: "0", today: "~6.8B" },
  { label: "Energy Consumed Daily", bce10k: "~fire only", ce1000: "~wood/animal", y2000: "~280M MWh", today: "~450M MWh" },
  { label: "Speed of Fastest Communication", bce10k: "walking (~3mph)", ce1000: "horse (~30mph)", y2000: "internet (light speed)", today: "internet (light speed)" },
];

// ============================================================================
// COMPONENTS
// ============================================================================

// Live ticking stat value (or static for past dates)
function LiveStat({ 
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
    <span 
      className="font-mono text-[2rem] font-bold tabular-nums"
      style={{ color }}
    >
      {prefix}{formatted}
    </span>
  );
}

// Breathing dot indicator
function BreathingDot({ color, delay = 0, isPast = false }: { color: string; delay?: number; isPast?: boolean }) {
  return (
    <div
      className="absolute right-3 top-3 h-2 w-2 rounded-full"
      style={{
        background: color,
        boxShadow: `0 0 6px ${color}80`,
        animation: isPast ? 'none' : `dot-breathe 3s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: isPast ? 0.5 : 1,
      }}
    />
  );
}

// Stat Card Component
function StatCard({ 
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
      <Icon 
        className="mx-auto mb-3 h-6 w-6" 
        style={{ color, opacity: 0.5 }} 
      />
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

// Contrast Pair Card
function ContrastCard({ 
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

// Past Date Banner
function PastDateBanner({ dateStr }: { dateStr: string }) {
  return (
    <div 
      className="fixed left-0 right-0 top-[60px] z-40 flex items-center justify-center gap-3 py-3"
      style={{ 
        background: "rgba(10, 14, 23, 0.95)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span 
        className="font-sans text-sm"
        style={{ color: "rgba(255,255,255,0.6)" }}
      >
        This briefing is from {dateStr}.
      </span>
      <Link 
        href="/today"
        className="flex items-center gap-1 font-sans text-sm font-medium transition-colors hover:text-white"
        style={{ color: "#2dd4bf" }}
      >
        See today&apos;s briefing
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// Share Link Section
function ShareLinkSection({ 
  isoDate, 
  fullDate,
  isPast,
}: { 
  isoDate: string; 
  fullDate: string;
  isPast: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [liveStats, setLiveStats] = useState({ births: 0, deaths: 0, co2: 0 });
  
  const shareUrl = `${SITE_URL}/today/${isoDate}`;
  const displayUrl = `earthnow.app/today/${isoDate}`;
  
  useEffect(() => {
    const updateStats = () => {
      const seconds = isPast ? 86400 : getSecondsSinceMidnightUTC();
      setLiveStats({
        births: Math.floor((DAILY_RATES.births / 86400) * seconds),
        deaths: Math.floor((DAILY_RATES.deaths / 86400) * seconds),
        co2: Math.floor((DAILY_RATES.co2Tonnes / 86400) * seconds),
      });
    };
    updateStats();
    if (!isPast) {
      const interval = setInterval(updateStats, 5000);
      return () => clearInterval(interval);
    }
  }, [isPast]);
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };
  
  const handleShareX = () => {
    const tweetText = `Today on Earth: ${formatNumber(liveStats.births)} born, ${formatNumber(liveStats.deaths)} died, ${formatAbbreviated(liveStats.co2)} tonnes of CO₂. Every second counts.`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  const buttonStyle = {
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "999px",
    padding: "10px 24px",
    fontSize: "14px",
    fontFamily: "'Outfit', sans-serif",
    background: "transparent",
    color: "white",
    cursor: "pointer",
    transition: "all 0.2s ease",
  };
  
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 
          className="mb-6 font-serif text-white"
          style={{ fontSize: "clamp(24px, 2.5vw, 40px)" }}
        >
          Share {isPast ? "This" : "Today's"} Briefing
        </h2>
        
        {/* Shareable URL Display */}
        <div 
          className="mb-8 rounded-xl px-6 py-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
          }}
        >
          <p 
            className="font-mono"
            style={{ 
              fontSize: "1.2rem", 
              color: "#2dd4bf",
              letterSpacing: "0.02em",
            }}
          >
            {displayUrl}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleCopyLink}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy Link"}
            </span>
          </button>
          
          <button
            onClick={handleShareX}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Share on X
          </button>
          
          <button
            onClick={handleShareLinkedIn}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Share on LinkedIn
          </button>
        </div>
        
        <p 
          className="font-sans"
          style={{ fontSize: "14px", opacity: 0.4 }}
        >
          Or just send someone the link. It works.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function TodayDatePage() {
  const router = useRouter();
  const params = useParams();
  const dateParam = params.date as string;
  
  const [heroStatIndex] = useState(() => Math.floor(Math.random() * HERO_STAT_TEMPLATES.length));
  const [contrastPairIndex] = useState(() => Math.floor(Math.random() * CONTRAST_PAIRS.length));
  const [heroStatValues, setHeroStatValues] = useState({
    births: 0, deaths: 0, co2: 0, treesLost: 0, energy: 0, water: 0,
    searches: 0, military: 0, education: 0, photos: 0, foodWasted: 0,
  });
  
  // Parse and validate date
  const parsedDate = useMemo(() => parseDate(dateParam), [dateParam]);
  const isPast = parsedDate ? isPastDate(parsedDate) : false;
  const isTodayDate = parsedDate ? isToday(parsedDate) : false;
  
  // Get formatted date info
  const { dayOfWeek, fullDate, isoDate } = useMemo(() => {
    if (parsedDate) {
      return formatDateForDisplay(parsedDate);
    }
    return { dayOfWeek: '', fullDate: '', isoDate: '' };
  }, [parsedDate]);
  
  const selectedPair = CONTRAST_PAIRS[contrastPairIndex];
  
  // Redirect invalid dates to /today
  useEffect(() => {
    if (!parsedDate) {
      router.replace('/today');
    }
  }, [parsedDate, router]);
  
  // Update hero stat values
  useEffect(() => {
    const updateValues = () => {
      const seconds = isPast ? 86400 : getSecondsSinceMidnightUTC();
      setHeroStatValues({
        births: (DAILY_RATES.births / 86400) * seconds,
        deaths: (DAILY_RATES.deaths / 86400) * seconds,
        co2: (DAILY_RATES.co2Tonnes / 86400) * seconds,
        treesLost: (DAILY_RATES.treesLostHectares / 86400) * seconds,
        energy: (DAILY_RATES.energyMWh / 86400) * seconds,
        water: (DAILY_RATES.waterLiters / 86400) * seconds,
        searches: (DAILY_RATES.googleSearches / 86400) * seconds,
        military: (DAILY_RATES.militarySpending / 86400) * seconds,
        education: (DAILY_RATES.educationSpending / 86400) * seconds,
        photos: (DAILY_RATES.photosTaken / 86400) * seconds,
        foodWasted: (DAILY_RATES.foodWastedTonnes / 86400) * seconds,
      });
    };
    
    updateValues();
    if (!isPast) {
      const interval = setInterval(updateValues, 1000);
      return () => clearInterval(interval);
    }
  }, [isPast]);
  
  // Generate hero stat based on template index
  const heroStat = useMemo(() => {
    const templates = [
      () => HERO_STAT_TEMPLATES[0](heroStatValues.births, heroStatValues.deaths),
      () => HERO_STAT_TEMPLATES[1](heroStatValues.co2),
      () => HERO_STAT_TEMPLATES[2](heroStatValues.military, heroStatValues.education),
      () => HERO_STAT_TEMPLATES[3](heroStatValues.births, heroStatValues.treesLost),
      () => HERO_STAT_TEMPLATES[4](heroStatValues.searches),
      () => HERO_STAT_TEMPLATES[5](heroStatValues.photos, heroStatValues.deaths),
      () => HERO_STAT_TEMPLATES[6](heroStatValues.water),
      () => HERO_STAT_TEMPLATES[7](heroStatValues.births),
      () => HERO_STAT_TEMPLATES[8](heroStatValues.foodWasted),
      () => HERO_STAT_TEMPLATES[9](heroStatValues.energy),
    ];
    return templates[heroStatIndex % templates.length]();
  }, [heroStatIndex, heroStatValues]);
  
  if (!parsedDate) {
    return null; // Will redirect
  }
  
  return (
    <>
      <UniversalNavbar />
      
      {isPast && <PastDateBanner dateStr={fullDate} />}
      
      <main 
        className="min-h-screen"
        style={{ 
          background: "linear-gradient(180deg, #0a0e17 0%, #0d1220 50%, #0a0e17 100%)",
          paddingTop: isPast ? "100px" : "60px",
        }}
      >
        {/* ================================================================
            SECTION 1: HERO DATE
        ================================================================ */}
        <section 
          className="relative flex flex-col items-center px-6"
          style={{ minHeight: "50vh", paddingTop: "15vh" }}
        >
          {/* Day of week */}
          <p 
            className="mb-3 font-sans tracking-widest"
            style={{ 
              fontSize: "clamp(12px, 1.2vw, 16px)", 
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
            }}
          >
            {dayOfWeek}
          </p>
          
          {/* Full date */}
          <h1 
            className="font-serif font-light text-white"
            style={{ fontSize: "clamp(32px, 5vw, 72px)" }}
          >
            {fullDate}
          </h1>
          
          {/* Teal line */}
          <div 
            className="my-8"
            style={{ 
              width: "60px", 
              height: "2px", 
              background: "#2dd4bf" 
            }} 
          />
          
          {/* Hero stat sentence */}
          <p 
            className="max-w-3xl text-center font-serif italic"
            style={{ 
              fontSize: "clamp(16px, 2vw, 28px)", 
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            {heroStat.text}
            <span className="font-mono not-italic" style={{ color: "#2dd4bf" }}>
              {heroStat.highlight1}
            </span>
            {heroStat.mid}
            {heroStat.highlight2 && (
              <span className="font-mono not-italic" style={{ color: "#2dd4bf" }}>
                {heroStat.highlight2}
              </span>
            )}
            {heroStat.end}
          </p>
          
          {/* Scroll indicator - 40px below stat */}
          <motion.div 
            className="mt-10"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown 
              className="h-6 w-6" 
              style={{ color: "rgba(255,255,255,0.3)" }} 
            />
          </motion.div>
        </section>
        
        {/* ================================================================
            SECTION 2: TODAY'S VITAL SIGNS
        ================================================================ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 
              className="mb-8 text-center font-serif text-white"
              style={{ fontSize: "clamp(24px, 2.5vw, 40px)" }}
            >
              {isPast ? "That Day's" : "Today's"} Numbers
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: "16px" }}>
              {STAT_CARDS.map((card, index) => (
                <StatCard
                  key={card.label}
                  icon={card.icon}
                  label={card.label}
                  color={card.color}
                  dailyRate={card.dailyRate}
                  abbreviated={card.abbreviated}
                  prefix={card.prefix}
                  index={index}
                  isPast={isPast}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* ================================================================
            SECTION 3: TODAY'S CONTRAST
        ================================================================ */}
        <section 
          className="flex flex-col items-center justify-center px-6 py-12"
        >
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-12">
            <ContrastCard 
              label={selectedPair.left.label}
              dailyTotal={selectedPair.left.dailyTotal}
              color={selectedPair.left.color}
              isPast={isPast}
            />
            <ContrastCard 
              label={selectedPair.right.label}
              dailyTotal={selectedPair.right.dailyTotal}
              color={selectedPair.right.color}
              isPast={isPast}
            />
          </div>
          <p 
            className="font-serif italic"
            style={{ 
              fontSize: "clamp(14px, 1.2vw, 18px)", 
              color: "rgba(255,255,255,0.5)",
              marginTop: "16px",
            }}
          >
            Happening at the same time.
          </p>
        </section>
        
        {/* ================================================================
            SECTION 4: TODAY IN CONTEXT (4 time periods)
        ================================================================ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 
              className="mb-8 text-center font-serif text-white"
              style={{ fontSize: "clamp(24px, 2.5vw, 40px)" }}
            >
              {isPast ? "That Day" : "Today"} in Context
            </h2>
            
            {/* 4-Column Headers */}
            <div 
              className="mb-4 px-6"
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(4, 1fr)", 
                gap: "16px",
              }}
            >
              {[
                { label: "10,000 BCE", opacity: 0.55 },
                { label: "1000 CE", opacity: 0.7 },
                { label: "Year 2000", opacity: 0.85 },
                { label: "Today", opacity: 1 },
              ].map((col) => (
                <span 
                  key={col.label}
                  className="text-center font-sans"
                  style={{ 
                    fontSize: "0.75rem", 
                    letterSpacing: "0.12em", 
                    textTransform: "uppercase",
                    color: `rgba(255,255,255,${col.opacity})`,
                  }}
                >
                  {col.label}
                </span>
              ))}
            </div>
            
            {/* Comparison Rows */}
            <div className="space-y-3">
              {HISTORICAL_CONTEXT.map((item) => (
                <div 
                  key={item.label}
                  className="rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Metric Label - centered above row */}
                  <div className="pt-4 text-center">
                    <span 
                      className="font-sans"
                      style={{ 
                        fontSize: "0.7rem", 
                        letterSpacing: "0.1em", 
                        textTransform: "uppercase",
                        opacity: 0.5,
                        color: "white",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                  
                  {/* 4 values across */}
                  <div 
                    className="px-6 pb-4 pt-2"
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(4, 1fr)", 
                      gap: "16px",
                    }}
                  >
                    {/* 10,000 BCE */}
                    <div className="text-center">
                      <span 
                        className="font-mono"
                        style={{ fontSize: "1rem", opacity: 0.55, color: "white" }}
                      >
                        {item.bce10k}
                      </span>
                    </div>
                    
                    {/* 1000 CE */}
                    <div className="text-center">
                      <span 
                        className="font-mono"
                        style={{ fontSize: "1rem", opacity: 0.7, color: "white" }}
                      >
                        {item.ce1000}
                      </span>
                    </div>
                    
                    {/* Year 2000 */}
                    <div className="text-center">
                      <span 
                        className="font-mono"
                        style={{ fontSize: "1rem", opacity: 0.85, color: "white" }}
                      >
                        {item.y2000}
                      </span>
                    </div>
                    
                    {/* Today */}
                    <div className="text-center">
                      <span 
                        className="font-mono"
                        style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2dd4bf" }}
                      >
                        {item.today}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* ================================================================
            SECTION 5: SHARE THIS BRIEFING
        ================================================================ */}
        <ShareLinkSection isoDate={isoDate} fullDate={fullDate} isPast={isPast} />
        
        {/* ================================================================
            SECTION 6: CTA
        ================================================================ */}
        <section className="px-6 py-12 text-center">
          <p 
            className="mb-8 font-serif italic"
            style={{ 
              fontSize: "clamp(18px, 1.8vw, 28px)", 
              color: "rgba(255,255,255,0.8)" 
            }}
          >
            See the full picture.
          </p>
          
          <Link 
            href="/"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-sans text-sm font-medium text-white transition-all duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
              boxShadow: "0 0 30px rgba(20, 184, 166, 0.3)",
            }}
          >
            Explore EarthNow
          </Link>
          
          <p className="mt-6">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-donate-modal"))}
              className="font-sans text-sm transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer" }}
            >
              Or support the mission.
            </button>
          </p>
        </section>
      </main>
    </>
  );
}
