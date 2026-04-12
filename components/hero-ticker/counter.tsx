"use client";

import React from "react";
import { useGlobalTick } from "@/hooks/use-global-tick";
import { formatNumber } from "@/lib/format";

// Counter Component for the Hero Ticker bar
// Uses shared global tick for efficient timer management
export function Counter({
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
