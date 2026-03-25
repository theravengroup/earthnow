"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Daily rates (same as homepage)
const DAILY_RATES = {
  population: 8100000000, // World population (static, but shown)
  births: 385000,
  deaths: 155000,
  co2: 115000000,
  trees: 20000,
  energy: 1580000000,
  water: 12000000000000,
  waste: 3300000,
  searches: 8500000000,
  military: 6300000000,
  education: 18000000000,
  photos: 4700000000,
};

// Stat configuration
const STAT_CONFIG: Record<string, { label: string; color: string; abbreviated: boolean; prefix?: string; isStatic?: boolean }> = {
  population: { label: "World Population", color: "#22c55e", abbreviated: true, isStatic: true },
  births: { label: "Births Today", color: "#22c55e", abbreviated: false },
  deaths: { label: "Deaths Today", color: "#ef4444", abbreviated: false },
  co2: { label: "CO₂ Today (tonnes)", color: "#f97316", abbreviated: true },
  trees: { label: "Forest Lost (hectares)", color: "#ef4444", abbreviated: false },
  energy: { label: "Energy Generated (MWh)", color: "#06b6d4", abbreviated: true },
  water: { label: "Water Used (liters)", color: "#3b82f6", abbreviated: true },
  waste: { label: "Food Wasted (tonnes)", color: "#f97316", abbreviated: true },
  searches: { label: "Google Searches", color: "#14b8a6", abbreviated: true },
  military: { label: "Military Spending ($)", color: "#ef4444", abbreviated: true, prefix: "$" },
  education: { label: "Education Spending ($)", color: "#22c55e", abbreviated: true, prefix: "$" },
  photos: { label: "Photos Taken", color: "#a855f7", abbreviated: true },
};

// Formatting functions
function formatNumber(num: number): string {
  return Math.floor(num).toLocaleString("en-US");
}

function formatAbbreviated(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(1) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return Math.floor(num).toLocaleString("en-US");
}

function getSecondsSinceMidnightUTC(): number {
  const now = new Date();
  return now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds() + now.getUTCMilliseconds() / 1000;
}

// Breathing dot component
function BreathingDot({ color }: { color: string }) {
  return (
    <div
      className="breathing-dot"
      style={{
        width: "4px",
        height: "4px",
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 4px ${color}`,
      }}
    />
  );
}

// Individual stat display
function StatDisplay({ 
  statKey, 
  theme, 
  currentValues 
}: { 
  statKey: string; 
  theme: "dark" | "light";
  currentValues: Record<string, number>;
}) {
  const config = STAT_CONFIG[statKey];
  if (!config) return null;

  const value = currentValues[statKey] || 0;
  const formatted = config.abbreviated ? formatAbbreviated(value) : formatNumber(value);
  
  // Adjust colors for light theme
  const numberColor = theme === "light" 
    ? (config.color === "#22c55e" ? "#16a34a" : config.color === "#ef4444" ? "#dc2626" : config.color)
    : config.color;
  const labelColor = theme === "light" ? "#374151" : "white";
  const labelOpacity = theme === "light" ? 0.7 : 0.5;

  return (
    <div className="flex flex-col items-center" style={{ gap: "4px" }}>
      <div className="flex items-center" style={{ gap: "6px" }}>
        <BreathingDot color={config.color} />
        <span 
          className="font-mono"
          style={{ 
            fontSize: "20px", 
            fontWeight: 700, 
            color: numberColor,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {config.prefix || ""}{formatted}
        </span>
      </div>
      <span 
        className="font-sans"
        style={{ 
          fontSize: "9px", 
          letterSpacing: "0.1em", 
          textTransform: "uppercase", 
          opacity: labelOpacity,
          color: labelColor,
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {config.label}
      </span>
    </div>
  );
}

function EmbedContent() {
  const searchParams = useSearchParams();
  
  // Parse URL parameters
  const statsParam = searchParams.get("stats") || "population,co2,births";
  const theme = (searchParams.get("theme") as "dark" | "light") || "dark";
  const layout = (searchParams.get("layout") as "horizontal" | "vertical") || "horizontal";
  const brand = searchParams.get("brand") !== "false";
  
  const statKeys = statsParam.split(",").filter(key => STAT_CONFIG[key]);
  
  // Current values state
  const [currentValues, setCurrentValues] = useState<Record<string, number>>({});
  
  // Update values every second
  useEffect(() => {
    const updateValues = () => {
      const seconds = getSecondsSinceMidnightUTC();
      const newValues: Record<string, number> = {};
      
      for (const key of Object.keys(DAILY_RATES)) {
        const config = STAT_CONFIG[key];
        if (config?.isStatic) {
          newValues[key] = DAILY_RATES[key as keyof typeof DAILY_RATES];
        } else {
          newValues[key] = (DAILY_RATES[key as keyof typeof DAILY_RATES] / 86400) * seconds;
        }
      }
      
      setCurrentValues(newValues);
    };
    
    updateValues();
    const interval = setInterval(updateValues, 1000);
    return () => clearInterval(interval);
  }, []);

  const bgColor = theme === "dark" ? "#0a0e17" : "#ffffff";
  const brandTextColor = theme === "dark" ? "white" : "#374151";

  return (
    <>
      {/* Import fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" 
        rel="stylesheet" 
      />
      
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          overflow: hidden;
          background: ${bgColor};
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .breathing-dot {
          animation: breathe 3s ease-in-out infinite;
        }
      `}</style>
      
      <div 
        className="flex flex-col"
        style={{ 
          background: bgColor,
          width: "fit-content",
          minWidth: "200px",
          padding: "16px 24px",
        }}
      >
        {/* Stats container */}
        <div 
          className="flex"
          style={{ 
            flexDirection: layout === "horizontal" ? "row" : "column",
            gap: layout === "horizontal" ? "32px" : "16px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {statKeys.map((key) => (
            <StatDisplay 
              key={key} 
              statKey={key} 
              theme={theme} 
              currentValues={currentValues}
            />
          ))}
        </div>
        
        {/* Branding */}
        {brand && (
          <a
            href="https://earthnow.app?ref=widget"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
            style={{ 
              height: "24px",
              gap: "6px",
              marginTop: "12px",
              textDecoration: "none",
            }}
          >
            <div 
              style={{ 
                width: "4px", 
                height: "4px", 
                borderRadius: "50%", 
                background: "#14b8a6",
              }} 
            />
            <span 
              style={{ 
                fontSize: "10px", 
                opacity: 0.4, 
                color: brandTextColor,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              EarthNow
            </span>
          </a>
        )}
      </div>
    </>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0a0e17", width: "200px", height: "80px" }} />}>
      <EmbedContent />
    </Suspense>
  );
}
