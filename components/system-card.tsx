"use client";

import React, { useState, useEffect } from "react";
import { Users, Utensils, Zap, Globe, Cpu } from "lucide-react";
import { getSecondsSinceLocalMidnight } from "@/hooks/use-global-tick";
import { formatNumber } from "@/lib/format";

export function SystemCard({
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
export const systemsData = [
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
