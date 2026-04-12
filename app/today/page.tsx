"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, Copy } from "lucide-react";
import { SITE_URL } from "@/lib/constants";
import { UniversalNavbar } from "@/components/universal-navbar";
import { ShareButton } from "@/components/share-button";
import { toast } from "sonner";
import {
  getSecondsSinceMidnightUTC,
  formatNumber,
  formatAbbreviated,
  HERO_STAT_TEMPLATES,
  STAT_CARDS,
  CONTRAST_PAIRS,
  LiveStat,
  BreathingDot,
  StatCard,
  ContrastCard,
  type HeroStatResult,
} from "@/components/today/shared";

// Get current date formatted
function getCurrentDate(): { dayOfWeek: string; fullDate: string; isoDate: string } {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
  const dayOfWeek = now.toLocaleDateString('en-US', options).toUpperCase();
  const fullDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const isoDate = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  return { dayOfWeek, fullDate, isoDate };
}

// Calculate years ago from a historical year
function getYearsAgo(year: number | string): number {
  const currentYear = new Date().getFullYear();
  const numYear = typeof year === 'number' ? year : currentYear;
  return currentYear - numYear;
}

// ============================================================================
// HISTORICAL ERA DATA
// ============================================================================

interface HistoricalEra {
  id: string;
  year: number | string;
  yearDisplay: string;
  name: string;
  isToday?: boolean;
  data: {
    population: number;
    dailyBirths: number;
    dailyDeaths: number;
    dailyCO2: number;
    internetUsers: number;
    dailyGoogleSearches: number;
    smartphones: number;
    dailyEnergy: number;
    dailyWater: number;
    dailyFoodWasted: number;
    dailyMilitary: number;
    dailyEducation: number;
    dailyPhotos: number;
  };
}

const HISTORICAL_ERAS: HistoricalEra[] = [
  { 
    id: "10000bce", year: -10000, yearDisplay: "10,000 BCE", name: "Dawn of Agriculture",
    data: { population: 5e6, dailyBirths: 30, dailyDeaths: 28, dailyCO2: 0, internetUsers: 0, dailyGoogleSearches: 0, smartphones: 0, dailyEnergy: 1000, dailyWater: 50e6, dailyFoodWasted: 0, dailyMilitary: 0, dailyEducation: 0, dailyPhotos: 0 }
  },
  { 
    id: "3000bce", year: -3000, yearDisplay: "3,000 BCE", name: "First Cities",
    data: { population: 45e6, dailyBirths: 300, dailyDeaths: 280, dailyCO2: 0, internetUsers: 0, dailyGoogleSearches: 0, smartphones: 0, dailyEnergy: 5000, dailyWater: 500e6, dailyFoodWasted: 0, dailyMilitary: 0, dailyEducation: 0, dailyPhotos: 0 }
  },
  { 
    id: "1ce", year: 1, yearDisplay: "1 CE", name: "Roman Empire",
    data: { population: 300e6, dailyBirths: 2700, dailyDeaths: 2600, dailyCO2: 1000, internetUsers: 0, dailyGoogleSearches: 0, smartphones: 0, dailyEnergy: 20000, dailyWater: 3e9, dailyFoodWasted: 100, dailyMilitary: 1000, dailyEducation: 0, dailyPhotos: 0 }
  },
  { 
    id: "1000", year: 1000, yearDisplay: "1000", name: "Medieval World",
    data: { population: 310e6, dailyBirths: 2800, dailyDeaths: 2700, dailyCO2: 5000, internetUsers: 0, dailyGoogleSearches: 0, smartphones: 0, dailyEnergy: 50000, dailyWater: 5e9, dailyFoodWasted: 500, dailyMilitary: 10000, dailyEducation: 100, dailyPhotos: 0 }
  },
  { 
    id: "1500", year: 1500, yearDisplay: "1500", name: "Age of Exploration",
    data: { population: 500e6, dailyBirths: 5500, dailyDeaths: 5200, dailyCO2: 15000, internetUsers: 0, dailyGoogleSearches: 0, smartphones: 0, dailyEnergy: 100000, dailyWater: 10e9, dailyFoodWasted: 1000, dailyMilitary: 100000, dailyEducation: 1000, dailyPhotos: 0 }
  },
  { 
    id: "1750", year: 1750, yearDisplay: "1750", name: "Pre-Industrial",
    data: { population: 800e6, dailyBirths: 9000, dailyDeaths: 8500, dailyCO2: 30000, internetUsers: 0, dailyGoogleSearches: 0, smartphones: 0, dailyEnergy: 200000, dailyWater: 20e9, dailyFoodWasted: 5000, dailyMilitary: 1e6, dailyEducation: 10000, dailyPhotos: 0 }
  },
  { 
    id: "1800", year: 1800, yearDisplay: "1800", name: "Industrial Revolution",
    data: { population: 1e9, dailyBirths: 11000, dailyDeaths: 10500, dailyCO2: 100000, internetUsers: 0, dailyGoogleSearches: 0, smartphones: 0, dailyEnergy: 500000, dailyWater: 30e9, dailyFoodWasted: 10000, dailyMilitary: 5e6, dailyEducation: 100000, dailyPhotos: 0 }
  },
  { 
    id: "1900", year: 1900, yearDisplay: "1900", name: "Modern Era Begins",
    data: { population: 1.6e9, dailyBirths: 18000, dailyDeaths: 17000, dailyCO2: 5e6, internetUsers: 0, dailyGoogleSearches: 0, smartphones: 0, dailyEnergy: 5e6, dailyWater: 100e9, dailyFoodWasted: 100000, dailyMilitary: 50e6, dailyEducation: 10e6, dailyPhotos: 0 }
  },
  { 
    id: "1950", year: 1950, yearDisplay: "1950", name: "Post-War Boom",
    data: { population: 2.5e9, dailyBirths: 100000, dailyDeaths: 60000, dailyCO2: 15e6, internetUsers: 0, dailyGoogleSearches: 0, smartphones: 0, dailyEnergy: 50e6, dailyWater: 500e9, dailyFoodWasted: 500000, dailyMilitary: 500e6, dailyEducation: 100e6, dailyPhotos: 1e6 }
  },
  { 
    id: "1970", year: 1970, yearDisplay: "1970", name: "Digital Dawn",
    data: { population: 3.7e9, dailyBirths: 200000, dailyDeaths: 100000, dailyCO2: 40e6, internetUsers: 0, dailyGoogleSearches: 0, smartphones: 0, dailyEnergy: 150e6, dailyWater: 1e12, dailyFoodWasted: 1e6, dailyMilitary: 1.5e9, dailyEducation: 500e6, dailyPhotos: 10e6 }
  },
  { 
    id: "1990", year: 1990, yearDisplay: "1990", name: "Internet Age",
    data: { population: 5.3e9, dailyBirths: 300000, dailyDeaths: 150000, dailyCO2: 60e6, internetUsers: 3e6, dailyGoogleSearches: 0, smartphones: 0, dailyEnergy: 280e6, dailyWater: 2e12, dailyFoodWasted: 2e6, dailyMilitary: 3e9, dailyEducation: 2e9, dailyPhotos: 50e6 }
  },
  { 
    id: "2000", year: 2000, yearDisplay: "2000", name: "New Millennium",
    data: { population: 6.1e9, dailyBirths: 370000, dailyDeaths: 155000, dailyCO2: 67e6, internetUsers: 360e6, dailyGoogleSearches: 20e6, smartphones: 0, dailyEnergy: 320e6, dailyWater: 2.5e12, dailyFoodWasted: 2.5e6, dailyMilitary: 4e9, dailyEducation: 3e9, dailyPhotos: 80e6 }
  },
  { 
    id: "2010", year: 2010, yearDisplay: "2010", name: "Mobile Era",
    data: { population: 6.9e9, dailyBirths: 380000, dailyDeaths: 156000, dailyCO2: 90e6, internetUsers: 2e9, dailyGoogleSearches: 3e9, smartphones: 300e6, dailyEnergy: 380e6, dailyWater: 3e12, dailyFoodWasted: 2.8e6, dailyMilitary: 5e9, dailyEducation: 4e9, dailyPhotos: 300e6 }
  },
  { 
    id: "2020", year: 2020, yearDisplay: "2020", name: "Pandemic Era",
    data: { population: 7.8e9, dailyBirths: 385000, dailyDeaths: 162000, dailyCO2: 100e6, internetUsers: 4.5e9, dailyGoogleSearches: 5.5e9, smartphones: 3.5e9, dailyEnergy: 420e6, dailyWater: 3.2e12, dailyFoodWasted: 3e6, dailyMilitary: 6e9, dailyEducation: 4.5e9, dailyPhotos: 1.4e9 }
  },
  { 
    id: "today", year: new Date().getFullYear(), yearDisplay: "Today", name: "Now", isToday: true,
    data: { population: 8.1e9, dailyBirths: 385000, dailyDeaths: 165000, dailyCO2: 115e6, internetUsers: 5.5e9, dailyGoogleSearches: 8.5e9, smartphones: 6.8e9, dailyEnergy: 450e6, dailyWater: 3.5e12, dailyFoodWasted: 3e6, dailyMilitary: 6.8e9, dailyEducation: 4.6e9, dailyPhotos: 4.4e9 }
  },
];

// Map stat card keys to historical data keys
const STAT_KEY_MAP: Record<string, keyof HistoricalEra['data']> = {
  "Births Today": "dailyBirths",
  "Deaths Today": "dailyDeaths",
  "Population Growth": "dailyBirths", // Will subtract deaths
  "CO₂ Emitted (tonnes)": "dailyCO2",
  "Trees Lost (hectares)": "dailyCO2", // Proxy - trees weren't tracked historically
  "Energy Generated (MWh)": "dailyEnergy",
  "Water Used (liters)": "dailyWater",
  "Food Wasted (tonnes)": "dailyFoodWasted",
  "Google Searches": "dailyGoogleSearches",
  "Military Spending ($)": "dailyMilitary",
  "Education Spending ($)": "dailyEducation",
  "Photos Taken": "dailyPhotos",
};

// ============================================================================
// HISTORICAL CONTEXT DATA (for "Today in Context" section - 4 time periods)
// ============================================================================
const HISTORICAL_CONTEXT = [
  { label: "World Population", bce10k: "5M", ce1000: "310M", y2000: "6.1B", today: "8.1B" },
  { label: "Daily CO₂ from Human Activity", bce10k: "~0", ce1000: "~0", y2000: "~67M tonnes", today: "~115M tonnes" },
  { label: "Internet Users", bce10k: "—", ce1000: "—", y2000: "~360M", today: "~5.5B" },
  { label: "Daily Google Searches", bce10k: "—", ce1000: "—", y2000: "~20M", today: "~8.5B" },
  { label: "Smartphones in Use", bce10k: "—", ce1000: "—", y2000: "0", today: "~6.8B" },
  { label: "Photos Taken Daily", bce10k: "0", ce1000: "0", y2000: "~80M", today: "~4.4B" },
  { label: "Data Created Daily", bce10k: "0", ce1000: "0", y2000: "~12GB", today: "~2.5 quintillion bytes" },
];
  
// ============================================================================
// ERA SCROLLER COMPONENT
// ============================================================================

function EraScroller({ 
  selectedEraId, 
  onEraSelect,
  showBanner,
  selectedEra,
  onBackToToday,
}: { 
  selectedEraId: string;
  onEraSelect: (era: HistoricalEra) => void;
  showBanner?: boolean;
  selectedEra?: HistoricalEra;
  onBackToToday?: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [justSelected, setJustSelected] = useState<string | null>(null);
  
  // Auto-scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);
  
  const handleEraClick = (eraId: string) => {
    setJustSelected(eraId);
    const era = HISTORICAL_ERAS.find(e => e.id === eraId);
    if (era) onEraSelect(era);
    setTimeout(() => setJustSelected(null), 200);
  };
  
  return (
    <div 
      className="sticky z-50 w-full"
      style={{ 
        top: "80px",
        background: "rgba(10,14,23,0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Left fade gradient */}
      <div 
        className="pointer-events-none absolute left-0 top-0 z-10 h-full"
        style={{
          width: "60px",
          background: "linear-gradient(90deg, rgba(10,14,23,0.95) 0%, transparent 100%)",
        }}
      />
      
      {/* Right fade gradient */}
      <div 
        className="pointer-events-none absolute right-0 top-0 z-10 h-full"
        style={{
          width: "60px",
          background: "linear-gradient(270deg, rgba(10,14,23,0.95) 0%, transparent 100%)",
        }}
      />
      
      <div 
        ref={scrollRef}
        className="date-scroller mx-auto max-w-7xl overflow-x-auto overflow-y-hidden"
        style={{
          height: "56px",
          padding: "6px 24px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div 
          className="flex h-full items-center"
          style={{ gap: "6px" }}
        >
          {HISTORICAL_ERAS.map((era) => {
            const isSelected = selectedEraId === era.id;
            const isPulsing = justSelected === era.id;
            
            return (
              <button
                key={era.id}
                onClick={() => handleEraClick(era.id)}
                className="relative flex shrink-0 flex-col items-center justify-center transition-all duration-150"
                style={{
                  minWidth: "80px",
                  height: "44px",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  textAlign: "center",
                  background: isSelected ? "rgba(45,212,191,0.15)" : "transparent",
                  color: isSelected ? "#2dd4bf" : "rgba(255,255,255,0.35)",
                  border: isSelected ? "1px solid rgba(45,212,191,0.3)" : "1px solid transparent",
                  transform: isPulsing ? "scale(1.05)" : "scale(1)",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                  }
                }}
              >
                {/* Pulsing dot for Today */}
                {era.isToday && (
                  <div
                    className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
                    style={{
                      background: "#2dd4bf",
                      boxShadow: "0 0 4px #2dd4bf",
                      animation: "dot-breathe 3s ease-in-out infinite",
                    }}
                  />
                )}
                <span 
                  className="font-mono"
                  style={{ 
                    fontSize: "13px", 
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {era.yearDisplay}
                </span>
                <span 
                  className="font-sans"
                  style={{ 
                    fontSize: "8px", 
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    opacity: 0.5,
                    lineHeight: 1.2,
                    marginTop: "2px",
                  }}
                >
                  {era.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Past Era Banner - inside sticky container */}
      {showBanner && selectedEra && onBackToToday && (
        <div
          className="w-full font-sans"
          style={{
            textAlign: "center",
            padding: "10px 16px",
            fontFamily: "Outfit, sans-serif",
            fontSize: "13px",
            color: "rgba(255,255,255,0.45)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          Viewing estimated data for {selectedEra.yearDisplay} — {selectedEra.name}.
          <button
            onClick={onBackToToday}
            style={{ 
              color: "#2dd4bf", 
              marginLeft: "8px",
              cursor: "pointer",
              background: "none",
              border: "none",
              fontFamily: "inherit",
              fontSize: "inherit",
            }}
          >
            Back to today →
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PAST ERA BANNER COMPONENT (kept for reference but now inline above)
// ============================================================================

function PastEraBanner({
  era,
  onBackToToday
}: {
  era: HistoricalEra;
  onBackToToday: () => void;
}) {
  return (
    <div
      className="w-full font-sans"
      style={{
        textAlign: "center",
        padding: "14px 16px",
        fontFamily: "Outfit, sans-serif",
        fontSize: "13px",
        color: "rgba(255,255,255,0.45)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      Viewing estimated data for {era.yearDisplay} — {era.name}.
      <button
        onClick={onBackToToday}
        style={{ 
          color: "#2dd4bf", 
          marginLeft: "8px",
          cursor: "pointer",
          background: "none",
          border: "none",
          fontFamily: "inherit",
          fontSize: "inherit",
        }}
      >
        Back to today →
      </button>
    </div>
  );
}

// ============================================================================
// HISTORICAL STAT CARD (for past eras - shows "not yet invented" for 0 values)
// ============================================================================

function HistoricalStatCard({ 
  icon: Icon, 
  label, 
  color, 
  value, 
  abbreviated, 
  prefix = "",
  index,
  notInvented = false,
}: { 
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string; 
  color: string; 
  value: number; 
  abbreviated: boolean;
  prefix?: string;
  index: number;
  notInvented?: boolean;
}) {
  const formatted = abbreviated ? formatAbbreviated(value) : formatNumber(value);
  
  return (
    <div
      className="relative rounded-xl p-5 text-center"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Icon 
        className="mx-auto mb-3 h-6 w-6" 
        style={{ color, opacity: notInvented ? 0.2 : 0.5 }} 
      />
      {notInvented ? (
        <>
          <span 
            className="font-mono text-[2rem] font-bold"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            —
          </span>
          <p 
            className="mt-1 font-sans"
            style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}
          >
            Not yet invented
          </p>
        </>
      ) : (
        <span 
          className="font-mono text-[2rem] font-bold tabular-nums"
          style={{ color }}
        >
          {prefix}{formatted}
        </span>
      )}
      <p 
        className="mt-2 font-sans text-[0.75rem] uppercase tracking-widest"
        style={{ color: notInvented ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)" }}
      >
        {label}
      </p>
    </div>
  );
}

// ============================================================================
// SHARE LINK SECTION COMPONENT
// ============================================================================

function ShareLinkSection({ 
  era,
  isViewingToday,
}: { 
  era: HistoricalEra;
  isViewingToday: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [liveStats, setLiveStats] = useState({ births: 0, deaths: 0, co2: 0, population: 0 });
  
  const shareUrl = `${SITE_URL}/today`;
  const displayUrl = `earthnow.app/today`;
  
  useEffect(() => {
    const updateStats = () => {
      if (isViewingToday) {
        const multiplier = getSecondsSinceMidnightUTC() / 86400;
        setLiveStats({
          births: Math.floor(era.data.dailyBirths * multiplier),
          deaths: Math.floor(era.data.dailyDeaths * multiplier),
          co2: Math.floor(era.data.dailyCO2 * multiplier),
          population: era.data.population,
        });
      } else {
        setLiveStats({
          births: era.data.dailyBirths,
          deaths: era.data.dailyDeaths,
          co2: era.data.dailyCO2,
          population: era.data.population,
        });
      }
    };
    updateStats();
    if (isViewingToday) {
      const interval = setInterval(updateStats, 5000);
      return () => clearInterval(interval);
    }
  }, [isViewingToday, era]);
  
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
    let tweetText: string;
    if (isViewingToday) {
      tweetText = `Today on Earth: ${formatNumber(liveStats.births)} born, ${formatNumber(liveStats.deaths)} died, ${formatAbbreviated(liveStats.co2)} tonnes of CO₂. Every second counts.`;
    } else {
      const todayEra = HISTORICAL_ERAS.find(e => e.isToday)!;
      tweetText = `In ${era.yearDisplay}, the world had ${formatAbbreviated(era.data.population)} people and released ~${formatAbbreviated(era.data.dailyCO2)} tonnes of CO₂ per day. Today: ${formatAbbreviated(todayEra.data.population)} people and ~${formatAbbreviated(todayEra.data.dailyCO2)} tonnes. See the acceleration:`;
    }
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
          Share Today&apos;s Briefing
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

export default function TodayPage() {
  const [heroStatIndex] = useState(() => Math.floor(Math.random() * HERO_STAT_TEMPLATES.length));
  const [contrastPairIndex] = useState(() => Math.floor(Math.random() * CONTRAST_PAIRS.length));
  
  // Get today's date info
  const todayInfo = useMemo(() => getCurrentDate(), []);
  
  // Selected era state - defaults to "today"
  const [selectedEraId, setSelectedEraId] = useState("today");
  
  // Get the selected era
  const selectedEra = useMemo(() => {
    return HISTORICAL_ERAS.find(e => e.id === selectedEraId) || HISTORICAL_ERAS[HISTORICAL_ERAS.length - 1];
  }, [selectedEraId]);
  
  const selectedPair = CONTRAST_PAIRS[contrastPairIndex];
  const isViewingToday = selectedEra.isToday === true;
  
  // Handle era selection from scroller
  const handleEraSelect = (era: HistoricalEra) => {
    setSelectedEraId(era.id);
  };
  
  // Handle "Back to today" click
  const handleBackToToday = () => {
    setSelectedEraId("today");
  };
  
  // Calculate hero stat values - live for today, static for historical eras
  const [heroStatValues, setHeroStatValues] = useState({
    births: 0,
    deaths: 0,
    co2: 0,
    military: 0,
    education: 0,
    treesLost: 0,
    searches: 0,
    photos: 0,
    water: 0,
    foodWasted: 0,
    energy: 0,
    population: 0,
  });
  
  useEffect(() => {
    const updateValues = () => {
      const data = selectedEra.data;
      // For today, use partial day from midnight UTC; for historical eras, use full day
      const multiplier = isViewingToday 
        ? getSecondsSinceMidnightUTC() / 86400 
        : 1;
      
      setHeroStatValues({
        births: data.dailyBirths * multiplier,
        deaths: data.dailyDeaths * multiplier,
        co2: data.dailyCO2 * multiplier,
        military: data.dailyMilitary * multiplier,
        education: data.dailyEducation * multiplier,
        treesLost: Math.round(data.dailyCO2 / 5000) * multiplier, // Proxy based on CO2
        searches: data.dailyGoogleSearches * multiplier,
        photos: data.dailyPhotos * multiplier,
        water: data.dailyWater * multiplier,
        foodWasted: data.dailyFoodWasted * multiplier,
        energy: data.dailyEnergy * multiplier,
        population: data.population,
      });
    };
    
    updateValues();
    // Only tick for today
    if (isViewingToday) {
      const interval = setInterval(updateValues, 1000);
      return () => clearInterval(interval);
    }
  }, [isViewingToday, selectedEra]);
  
  // Get hero stat content
  const getHeroStat = () => {
    const templates = [
      () => HERO_STAT_TEMPLATES[0](heroStatValues.births, heroStatValues.deaths),
      () => HERO_STAT_TEMPLATES[1](heroStatValues.co2),
      () => HERO_STAT_TEMPLATES[2](heroStatValues.military, heroStatValues.education),
      () => HERO_STAT_TEMPLATES[3](heroStatValues.births, heroStatValues.treesLost),
      () => HERO_STAT_TEMPLATES[4](heroStatValues.searches),
      () => HERO_STAT_TEMPLATES[5](heroStatValues.photos, heroStatValues.deaths),
      () => HERO_STAT_TEMPLATES[6](heroStatValues.water),
      () => HERO_STAT_TEMPLATES[7](heroStatValues.births, heroStatValues.co2),
      () => HERO_STAT_TEMPLATES[8](heroStatValues.foodWasted),
      () => HERO_STAT_TEMPLATES[9](heroStatValues.energy),
    ];
    return templates[heroStatIndex]();
  };
  
  const heroStat = getHeroStat();
  
  return (
    <>
      <UniversalNavbar />
      
      {/* Era Scroller Strip (includes Past Era Banner when viewing historical era) */}
      <EraScroller 
        selectedEraId={selectedEraId} 
        onEraSelect={handleEraSelect}
        showBanner={!isViewingToday}
        selectedEra={selectedEra}
        onBackToToday={handleBackToToday}
      />
      
      <main className="min-h-screen bg-[#0a0e17]">
        {/* ================================================================
            SECTION 1: HERO DATE/ERA
        ================================================================ */}
        <section 
          className="relative flex flex-col items-center px-6"
          style={{ minHeight: "50vh", paddingTop: "15vh" }}
        >
          {isViewingToday ? (
            <>
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
                {todayInfo.dayOfWeek}
              </p>
              
              {/* Full date */}
              <h1 
                className="font-serif font-light text-white"
                style={{ fontSize: "clamp(32px, 5vw, 72px)" }}
              >
                {todayInfo.fullDate}
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
                <span className="font-mono not-italic text-[#2dd4bf]">
                  {heroStat.highlight1}
                </span>
                {heroStat.mid}
                {heroStat.highlight2 && (
                  <span className="font-mono not-italic text-[#2dd4bf]">
                    {heroStat.highlight2}
                  </span>
                )}
                {heroStat.end}
              </p>
            </>
          ) : (
            <>
              {/* Era year */}
              <h2
                className="font-serif font-light text-white"
                style={{ fontSize: "clamp(48px, 8vw, 120px)" }}
              >
                {selectedEra.yearDisplay}
              </h2>
              
              {/* Era name */}
              <p 
                className="mb-4 font-sans tracking-widest"
                style={{ 
                  fontSize: "clamp(12px, 1.2vw, 18px)", 
                  letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                }}
              >
                {selectedEra.name}
              </p>
              
              {/* Years ago */}
              <p 
                className="font-sans"
                style={{ 
                  fontSize: "clamp(12px, 1vw, 14px)", 
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                This day, {formatNumber(getYearsAgo(selectedEra.year))} years ago
              </p>
              
              {/* Teal line */}
              <div 
                className="my-8"
                style={{ 
                  width: "60px", 
                  height: "2px", 
                  background: "#2dd4bf" 
                }} 
              />
              
              {/* Historical comparison sentence */}
              <p 
                className="max-w-3xl text-center font-serif italic"
                style={{ 
                  fontSize: "clamp(16px, 2vw, 28px)", 
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.6,
                }}
              >
                The world had{" "}
                <span className="font-mono not-italic text-[#2dd4bf]">
                  {formatAbbreviated(selectedEra.data.population)}
                </span>
                {" "}people. Today it has{" "}
                <span className="font-mono not-italic text-[#2dd4bf]">
                  {formatAbbreviated(HISTORICAL_ERAS.find(e => e.isToday)!.data.population)}
                </span>.
              </p>
            </>
          )}
          
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
            SECTION 2: ERA'S VITAL SIGNS
        ================================================================ */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 
              className="mb-8 text-center font-serif text-white"
              style={{ fontSize: "clamp(24px, 2.5vw, 40px)" }}
            >
              {isViewingToday ? "Today's Numbers" : `${selectedEra.yearDisplay} — Daily Numbers`}
            </h2>
            
            <div className="grid grid-cols-2 gap-[16px] lg:grid-cols-4">
              {STAT_CARDS.map((card, index) => {
                // Get historical value for this stat
                const dataKey = STAT_KEY_MAP[card.label];
                let historicalValue = dataKey ? selectedEra.data[dataKey] : 0;
                
                // Special handling for Population Growth
                if (card.label === "Population Growth") {
                  historicalValue = selectedEra.data.dailyBirths - selectedEra.data.dailyDeaths;
                }
                
                // Check if this metric existed in this era
                const notInvented = (
                  (card.label === "Google Searches" && selectedEra.data.dailyGoogleSearches === 0 && !selectedEra.isToday) ||
                  (card.label === "Photos Taken" && selectedEra.data.dailyPhotos === 0 && !selectedEra.isToday && typeof selectedEra.year === 'number' && selectedEra.year < 1900)
                );
                
                if (isViewingToday) {
                  return (
                    <StatCard
                      key={card.label}
                      icon={card.icon}
                      label={card.label}
                      color={card.color}
                      dailyRate={card.dailyRate}
                      abbreviated={card.abbreviated}
                      prefix={"prefix" in card ? card.prefix : undefined}
                      index={index}
                    />
                  );
                } else {
                  return (
                    <HistoricalStatCard
                      key={card.label}
                      icon={card.icon}
                      label={card.label}
                      color={card.color}
                      value={historicalValue}
                      abbreviated={card.abbreviated}
                      prefix={"prefix" in card ? card.prefix : undefined}
                      index={index}
                      notInvented={notInvented}
                    />
                  );
                }
              })}
            </div>
          </div>
        </section>
        
        {/* ================================================================
            SECTION 3: CONTRAST (only show for today)
        ================================================================ */}
        {isViewingToday && (
          <section 
            className="flex flex-col items-center justify-center px-6 py-12"
          >
            <div style={{
              maxWidth: 680,
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              overflow: 'hidden',
            }}>
              {/* Top card */}
              <div style={{ padding: '24px 24px 20px' }}>
                <ContrastCard
                  label={selectedPair.left.label}
                  dailyTotal={selectedPair.left.dailyTotal}
                  color={selectedPair.left.color}
                />
              </div>

              {/* Divider with label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 18,
                  color: 'rgba(255,255,255,0.7)',
                  whiteSpace: 'nowrap',
                  padding: '12px 0',
                }}>
                  happening at the same time
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Bottom card */}
              <div style={{ padding: '20px 24px 20px' }}>
                <ContrastCard
                  label={selectedPair.right.label}
                  dailyTotal={selectedPair.right.dailyTotal}
                  color={selectedPair.right.color}
                />
              </div>

              {/* Share button */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '10px 20px 14px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}>
                <ShareButton
                  text={`${selectedPair.left.label}: ${selectedPair.right.label}\n\nHappening at the same time.\n\nearthnow.app`}
                  label="Share"
                  size="sm"
                  align="center"
                />
              </div>
            </div>
          </section>
        )}
        
        {/* ================================================================
            SECTION 4: TODAY IN CONTEXT (only show for today - redundant for historical eras)
        ================================================================ */}
        {isViewingToday && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 
              className="mb-8 text-center font-serif text-white"
              style={{ fontSize: "clamp(24px, 2.5vw, 40px)" }}
            >
              Today in Context
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
        )}
        
        {/* ================================================================
            SECTION 5: SHARE TODAY'S BRIEFING
        ================================================================ */}
        <ShareLinkSection era={selectedEra} isViewingToday={isViewingToday} />
        
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
