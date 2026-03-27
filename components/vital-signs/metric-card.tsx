"use client";

import React, { useState } from "react";
import { useGlobalTick } from "@/hooks/use-global-tick";
import { formatNumber } from "@/lib/format";

export interface MetricCardProps {
  color: string;
  label: string;
  ratePerSecond: number;
  useAbbreviated?: boolean;
  prefix?: string;
  index?: number;
  staticValue?: number;
  decimalPlaces?: number;
}

// Metric Card Component
// Uses shared global tick for efficient timer management
// Wrapped in React.memo to prevent re-renders when parent state changes
export const MetricCard = React.memo(function MetricCard({
  color,
  label,
  ratePerSecond,
  useAbbreviated = false,
  prefix = "",
  index = 0,
  staticValue,
  decimalPlaces,
}: MetricCardProps) {
  const { secondsSinceMidnight, isLoaded } = useGlobalTick();
  const [isHovered, setIsHovered] = useState(false);

  // Calculate value from shared tick (or use static value)
  const value = staticValue !== undefined ? staticValue : secondsSinceMidnight * ratePerSecond;

  // Staggered animation delay for the breathing dot (0.5s increments)
  const breatheDelay = `${index * 0.5}s`;

  // Format value based on options
  let formattedValue: string;
  if (staticValue !== undefined && useAbbreviated) {
    formattedValue = formatNumber(staticValue);
  } else if (decimalPlaces !== undefined) {
    formattedValue = value.toFixed(decimalPlaces);
  } else if (useAbbreviated) {
    formattedValue = formatNumber(value);
  } else {
    formattedValue = Math.floor(value).toLocaleString();
  }
  const displayValue = prefix ? `${prefix}${formattedValue}` : formattedValue;
  
  // Calculate rate per minute for trend display (handles up to trillions)
  const ratePerMinute = ratePerSecond * 60;
  const formattedRate = ratePerMinute >= 1000000000000
    ? `${(ratePerMinute / 1000000000000).toFixed(1)}T`
    : ratePerMinute >= 1000000000 
      ? `${(ratePerMinute / 1000000000).toFixed(1)}B`
      : ratePerMinute >= 1000000 
        ? `${(ratePerMinute / 1000000).toFixed(1)}M`
        : ratePerMinute >= 1000 
          ? `${(ratePerMinute / 1000).toFixed(1)}K`
          : ratePerMinute >= 1 
            ? Math.floor(ratePerMinute).toLocaleString()
            : ratePerMinute.toFixed(2);
  const trendDisplay = prefix ? `${prefix}${formattedRate}` : formattedRate;
  
  // Determine trend direction and color
  const isIncrease = ratePerSecond > 0;
  const trendColor = isIncrease 
    ? 'rgba(120,255,170,0.8)' 
    : 'rgba(255,140,140,0.8)';
  const trendArrow = isIncrease ? '▲' : '▼';
  
  // Generate text shadow glow based on accent color
  const textShadow = `0 0 10px ${color}, 0 0 40px ${color}4d`;
  
  // Accent tint for card background
  const accentTint = `linear-gradient(135deg, ${color}14 0%, transparent 60%)`;
  const hoverAccentTint = `linear-gradient(135deg, ${color}28 0%, transparent 60%)`;
  
  // Generate hover glow based on accent color
  const hoverGlow = `0 0 40px ${color}26`;

  return (
    <div 
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 hover:-translate-y-1"
      style={{
        alignSelf: 'stretch',
        height: '100%',
        background: `${accentTint}, linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(10,15,30,0.98) 100%)`,
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 0 20px rgba(255,255,255,0.03), 0 12px 40px rgba(0,0,0,0.5)',
        transition: 'box-shadow 0.3s ease, background 0.3s ease, border 0.3s ease',
      }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        e.currentTarget.style.background = `${hoverAccentTint}, linear-gradient(180deg, rgba(20,30,50,0.95) 0%, rgba(12,18,35,0.98) 100%)`;
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.25)';
        e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.2), inset 0 0 20px rgba(255,255,255,0.05), 0 16px 48px rgba(0,0,0,0.6), ${hoverGlow}`;
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        e.currentTarget.style.background = `${accentTint}, linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(10,15,30,0.98) 100%)`;
        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)';
        e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 0 20px rgba(255,255,255,0.03), 0 12px 40px rgba(0,0,0,0.5)';
      }}
    >
      {/* TOP: Status dot with slow breathing animation */}
      <div className="flex-shrink-0">
        <div
          className="rounded-full"
          style={{ 
            width: 10,
            height: 10,
            backgroundColor: color,
            color: color,
            animation: 'breathe 4s ease-in-out infinite',
            animationDelay: breatheDelay,
          }}
        />
      </div>
      
      {/* MIDDLE: Metric value + delta row */}
      <div className="flex-shrink-0 relative">
        {/* Number - static display, no animations */}
        <div
          className="metric-value font-mono font-semibold text-[clamp(14px,4vw,20px)]"
          style={{ 
            color, 
            textShadow,
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
            letterSpacing: '0.02em',
            opacity: isLoaded ? 1 : 0,
            lineHeight: 1.2,
            textAlign: 'center',
          }}
          suppressHydrationWarning
        >
          {displayValue}
        </div>
        
        {/* Trend indicator - hidden by default, shown on hover with 200ms fade */}
        <div 
          className="mt-1 flex items-center justify-center gap-1 font-mono text-[11px] md:text-[12px]"
          style={{ 
            color: trendColor,
            opacity: isHovered ? 0.6 : 0,
            transition: 'opacity 200ms ease',
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
            letterSpacing: '0.02em',
          }}
        >
          <span>{trendArrow}</span>
          <span>+{trendDisplay} / min</span>
        </div>
      </div>
      
      {/* BOTTOM: Label - fixed height area, 2 lines max */}
      <div
        className="flex-shrink-0 text-[10px] sm:text-[11px] md:text-[12px] font-medium uppercase leading-tight tracking-wider text-[#94a3b8]"
        style={{ minHeight: '30px', textAlign: 'center' }}
      >
        {label}
      </div>
    </div>
  );
});
