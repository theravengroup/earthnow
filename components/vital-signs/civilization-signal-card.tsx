"use client";

import React, { useState } from "react";
import { useGlobalTick } from "@/hooks/use-global-tick";
import { formatNumber } from "@/lib/format";

interface CivilizationSignalCardProps {
  color: string;
  label: string;
  ratePerSecond: number;
  useAbbreviated?: boolean;
  prefix?: string;
  index?: number;
  staticValue?: number;
  decimalPlaces?: number;
  staticRateDisplay?: string;
  isWide?: boolean;
  context?: string;
  sentiment?: 'positive' | 'challenging' | 'neutral';
}

// Civilization Signal Card - larger and more prominent than regular MetricCard
// Uses shared global tick for efficient timer management
export const CivilizationSignalCard = React.memo(function CivilizationSignalCard({
  color,
  label,
  ratePerSecond,
  useAbbreviated = false,
  prefix = "",
  index = 0,
  staticValue,
  decimalPlaces,
  staticRateDisplay,
  isWide = false,
  context,
  sentiment,
}: CivilizationSignalCardProps) {
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
  // Use static rate display if provided
  let trendDisplay: string;
  if (staticRateDisplay) {
    trendDisplay = staticRateDisplay;
  } else {
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
    trendDisplay = prefix ? `${prefix}${formattedRate}` : formattedRate;
  }
  
  // Brighten dark colors for legibility against dark backgrounds
  const brightenColor = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Perceived brightness (ITU-R BT.601)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness >= 100) return hex;
    // Lighten by scaling toward white
    const factor = 100 / Math.max(brightness, 1);
    const clamp = (v: number) => Math.min(255, Math.round(v * factor));
    return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
  };
  const displayColor = brightenColor(color);

  // Enhanced text shadow glow for visibility
  const textShadow = `0 0 20px ${displayColor}, 0 0 60px ${displayColor}4d`;
  
  // Sentiment top border color
  const sentimentBorder = sentiment === 'positive' ? '#14b8a6' : sentiment === 'challenging' ? '#ef4444' : '#64748b';

  // Accent tint for card background - slightly more visible
  const accentTint = `linear-gradient(135deg, ${color}1a 0%, transparent 60%)`;
  const hoverAccentTint = `linear-gradient(135deg, ${color}30 0%, transparent 60%)`;
  const hoverGlow = `0 0 50px ${color}30`;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-7 hover:-translate-y-1"
      style={{
        height: '100%',
        borderTop: `2px solid ${sentimentBorder}`,
        background: `${accentTint}, linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)`,
        border: `1px solid rgba(255,255,255,0.18)`,
        borderTopColor: sentimentBorder,
        borderTopWidth: 2,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 24px rgba(255,255,255,0.04), 0 16px 48px rgba(0,0,0,0.5), 0 0 30px ${color}15`,
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        transition: 'box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease',
      }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        e.currentTarget.style.background = `${hoverAccentTint}, linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)`;
        e.currentTarget.style.borderColor = `rgba(255,255,255,0.28)`;
        e.currentTarget.style.borderTopColor = sentimentBorder;
        e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 24px rgba(255,255,255,0.06), 0 20px 56px rgba(0,0,0,0.6), ${hoverGlow}`;
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        e.currentTarget.style.background = `${accentTint}, linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)`;
        e.currentTarget.style.borderColor = `rgba(255,255,255,0.18)`;
        e.currentTarget.style.borderTopColor = sentimentBorder;
        e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 24px rgba(255,255,255,0.04), 0 16px 48px rgba(0,0,0,0.5), 0 0 30px ${color}15`;
      }}
      onClick={() => setIsHovered(prev => !prev)}
    >
      {/* Colored dot with breathing animation */}
      <div
        className="absolute left-4 top-4 rounded-full"
        style={{ 
          width: 10,
          height: 10,
          backgroundColor: color,
          color: color,
          animation: 'breathe 4s ease-in-out infinite',
          animationDelay: breatheDelay,
        }}
      />
      
      {/* Number - static, no animations */}
      <div className="mt-5">
        <div
          className="font-mono font-semibold"
          style={{
            color: displayColor,
            textShadow,
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: '"tnum"',
            letterSpacing: '0.02em',
            opacity: isLoaded ? 1 : 0,
            fontSize: 'clamp(16px, 4vw, 28px)',
          }}
          suppressHydrationWarning
        >
          {displayValue}
        </div>
      </div>
      
      {/* Trend indicator - hidden by default, visible on hover/tap */}
      <div 
        className="mt-1.5 flex items-center gap-1 font-mono text-[13px] md:text-[14px]"
        style={{ 
          color: 'rgba(120,255,170,0.8)',
          opacity: isHovered ? 0.8 : 0,
          transition: 'opacity 0.3s ease',
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
          letterSpacing: '0.02em',
          height: 20,
        }}
      >
        <span>▲</span>
        <span>+{trendDisplay} / min</span>
      </div>
      
      {/* Label - slightly larger */}
      <div className="mt-2.5 text-[9px] md:text-[11px] font-medium uppercase tracking-wider leading-tight text-[#94a3b8]">
        {label}
      </div>
      {isWide && context && (
        <div className="mt-1.5 text-[10px] italic leading-snug text-[#64748b]">
          {context}
        </div>
      )}
    </div>
  );
});
CivilizationSignalCard.displayName = 'CivilizationSignalCard';
