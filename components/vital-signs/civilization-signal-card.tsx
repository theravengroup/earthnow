"use client";

import React, { useState } from "react";
import { useGlobalTick } from "@/hooks/use-global-tick";
import { useCardIllumination } from "@/hooks/use-card-illumination";
import { formatCardValue, formatRatePerMinute } from "@/lib/card-utils";

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
  sentiment?: 'positive' | 'challenging' | 'neutral';
  shufflePhase?: 'idle' | 'fading-out' | 'fading-in';
  totalCards?: number;
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
  sentiment,
  shufflePhase = 'idle',
  totalCards = 16,
}: CivilizationSignalCardProps) {
  const { secondsSinceMidnight, isLoaded } = useGlobalTick();
  const [isHovered, setIsHovered] = useState(false);
  const { isPoweredOn, cardRef } = useCardIllumination(index);

  // Calculate value from shared tick (or use static value)
  const value = staticValue !== undefined ? staticValue : secondsSinceMidnight * ratePerSecond;

  // Staggered animation delay for the breathing dot (0.5s increments)
  const breatheDelay = `${index * 0.5}s`;

  // Format value and rate for display
  const displayValue = formatCardValue(value, { staticValue, useAbbreviated, decimalPlaces, prefix });
  const trendDisplay = staticRateDisplay || formatRatePerMinute(ratePerSecond, prefix);
  
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
  const sentimentBorder = sentiment === 'positive' ? '#14b8a6' : sentiment === 'challenging' ? '#ef4444' : '#768a9e';

  // Accent tint for card background - slightly more visible
  const accentTint = `linear-gradient(135deg, ${color}1a 0%, transparent 60%)`;
  const hoverAccentTint = `linear-gradient(135deg, ${color}30 0%, transparent 60%)`;
  const hoverGlow = `0 0 50px ${color}30`;

  // Shuffle animation: staggered fade-out (L→R) and fade-in (R→L)
  // Cap total stagger to 300ms across all cards
  const MAX_STAGGER_TOTAL = 300;
  const cardCount = Math.max(totalCards, 1);
  const STAGGER_MS = Math.min(20, Math.floor(MAX_STAGGER_TOTAL / cardCount));
  const isFadingOut = shufflePhase === 'fading-out';
  const isFadingIn = shufflePhase === 'fading-in';
  const isAnimating = isFadingOut || isFadingIn;

  // Clamp index to valid range [0, cardCount-1]
  const safeIndex = Math.min(index, cardCount - 1);

  // L→R stagger for fade-out, R→L stagger for fade-in
  const staggerDelay = isFadingOut
    ? safeIndex * STAGGER_MS
    : isFadingIn
      ? (cardCount - 1 - safeIndex) * STAGGER_MS
      : 0;

  const shuffleOpacity = isFadingOut ? 0 : isFadingIn ? 1 : 1;
  const shuffleTransform = isFadingOut ? 'translateY(-8px)' : 'translateY(0px)';
  const shuffleFilter = isFadingOut ? 'blur(4px)' : 'blur(0px)';

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-sm p-7"
      style={{
        height: '100%',
        borderStyle: 'solid',
        borderTopWidth: 2,
        borderTopColor: isPoweredOn ? sentimentBorder : 'rgba(255,255,255,0.04)',
        borderRightWidth: 1,
        borderRightColor: isPoweredOn ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
        borderBottomWidth: 1,
        borderBottomColor: isPoweredOn ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
        borderLeftWidth: 1,
        borderLeftColor: isPoweredOn ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
        background: isPoweredOn
          ? `${accentTint}, linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(10,15,30,0.98) 100%)`
          : 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(6,9,18,0.98) 100%)',
        boxShadow: isPoweredOn
          ? `inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 24px rgba(255,255,255,0.04), 0 16px 48px rgba(0,0,0,0.5), 0 0 30px ${color}15`
          : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.4)',
        opacity: isAnimating ? shuffleOpacity : (isPoweredOn ? 1 : 0.35),
        transform: isAnimating ? shuffleTransform : undefined,
        filter: isAnimating ? shuffleFilter : (isPoweredOn ? 'brightness(1) saturate(1)' : 'brightness(0.6) saturate(0.2)'),
        transition: isAnimating
          ? `opacity 0.6s ease ${staggerDelay}ms, transform 0.6s ease ${staggerDelay}ms, filter 0.6s ease ${staggerDelay}ms, box-shadow 0.3s ease, background 0.3s ease, border-top-color 0.3s ease, border-right-color 0.3s ease, border-bottom-color 0.3s ease, border-left-color 0.3s ease`
          : 'box-shadow 0.8s ease, background 0.8s ease, border-top-color 0.8s ease, border-right-color 0.8s ease, border-bottom-color 0.8s ease, border-left-color 0.8s ease, opacity 0.8s ease, filter 0.8s ease',
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') {
          setIsHovered(true);
          e.currentTarget.style.background = `${hoverAccentTint}, linear-gradient(180deg, rgba(20,30,50,0.95) 0%, rgba(12,18,35,0.98) 100%)`;
          e.currentTarget.style.borderRightColor = `rgba(255,255,255,0.28)`;
          e.currentTarget.style.borderBottomColor = `rgba(255,255,255,0.28)`;
          e.currentTarget.style.borderLeftColor = `rgba(255,255,255,0.28)`;
          e.currentTarget.style.borderTopColor = sentimentBorder;
          e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 24px rgba(255,255,255,0.06), 0 20px 56px rgba(0,0,0,0.6), ${hoverGlow}`;
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') {
          setIsHovered(false);
          e.currentTarget.style.background = `${accentTint}, linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(10,15,30,0.98) 100%)`;
          e.currentTarget.style.borderRightColor = `rgba(255,255,255,0.18)`;
          e.currentTarget.style.borderBottomColor = `rgba(255,255,255,0.18)`;
          e.currentTarget.style.borderLeftColor = `rgba(255,255,255,0.18)`;
          e.currentTarget.style.borderTopColor = sentimentBorder;
          e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 24px rgba(255,255,255,0.04), 0 16px 48px rgba(0,0,0,0.5), 0 0 30px ${color}15`;
        }
      }}
      onClick={() => setIsHovered(prev => !prev)}
    >
      {/* HUD corner brackets */}
      {/* Top-left */}
      <div className="pointer-events-none absolute left-0 top-0" style={{
        width: 18, height: 18,
        borderTop: `1.5px solid ${isPoweredOn ? displayColor : 'rgba(255,255,255,0.1)'}`,
        borderLeft: `1.5px solid ${isPoweredOn ? displayColor : 'rgba(255,255,255,0.1)'}`,
        opacity: isPoweredOn ? 0.7 : 0.3,
        transition: 'border-color 0.8s ease, opacity 0.8s ease',
      }} />
      {/* Top-right */}
      <div className="pointer-events-none absolute right-0 top-0" style={{
        width: 18, height: 18,
        borderTop: `1.5px solid ${isPoweredOn ? displayColor : 'rgba(255,255,255,0.1)'}`,
        borderRight: `1.5px solid ${isPoweredOn ? displayColor : 'rgba(255,255,255,0.1)'}`,
        opacity: isPoweredOn ? 0.7 : 0.3,
        transition: 'border-color 0.8s ease, opacity 0.8s ease',
      }} />
      {/* Bottom-right */}
      <div className="pointer-events-none absolute bottom-0 right-0" style={{
        width: 18, height: 18,
        borderBottom: `1.5px solid ${isPoweredOn ? displayColor : 'rgba(255,255,255,0.1)'}`,
        borderRight: `1.5px solid ${isPoweredOn ? displayColor : 'rgba(255,255,255,0.1)'}`,
        opacity: isPoweredOn ? 0.7 : 0.3,
        transition: 'border-color 0.8s ease, opacity 0.8s ease',
      }} />

      {/* Colored dot with breathing animation */}
      <div
        className="absolute left-4 top-4 rounded-full"
        style={{ 
          width: 10,
          height: 10,
          backgroundColor: color,
          color: color,
          animationName: isPoweredOn ? 'breathe' : 'none',
          animationDuration: '4s',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: breatheDelay,
          opacity: isPoweredOn ? 1 : 0.3,
          transition: 'opacity 0.8s ease',
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
        className="mt-1.5 font-mono text-[11px] leading-tight md:text-[14px]"
        style={{
          color: 'rgba(120,255,170,0.8)',
          opacity: isHovered ? 0.8 : 0,
          transition: 'opacity 0.3s ease',
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum"',
          letterSpacing: '0.02em',
          minHeight: 18,
        }}
      >
        ▲ +{trendDisplay} / min
      </div>
      
      {/* Label - slightly larger */}
      <div className="mt-2.5 text-[9px] md:text-[11px] font-medium uppercase tracking-wider leading-tight text-[#94a3b8]">
        {label}
      </div>
    </div>
  );
});
CivilizationSignalCard.displayName = 'CivilizationSignalCard';
