"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Mouse } from "lucide-react";
import { useGlobalTick } from "@/hooks/use-global-tick";
import { MetricCard } from "@/components/vital-signs/metric-card";
import { ExpandToggleLink } from "@/components/interactive-link";

// Vital Signs Pulse Glow - synchronized heartbeat effect using shared global tick
export function VitalSignsPulseGlow() {
  const { tick, isLoaded } = useGlobalTick();
  const [isPulsing, setIsPulsing] = useState(false);
  const prevTickRef = useRef(tick);

  useEffect(() => {
    if (!isLoaded || tick === prevTickRef.current) return;
    prevTickRef.current = tick;
    
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 250);
  }, [tick, isLoaded]);

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        width: '80%',
        height: '60%',
        background: 'radial-gradient(ellipse at center, rgba(20,184,166,0.03) 0%, rgba(20,184,166,0.008) 35%, transparent 60%)',
        opacity: isPulsing ? 1 : 0.4,
        transform: `translate(-50%, -50%) scale(${isPulsing ? 1.02 : 1})`,
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    />
  );
}

// Row Header Component for cinematic chapter titles
export function RowHeader({ 
  title, 
  subtitle, 
  accentColor 
}: { 
  title: string; 
  subtitle: string; 
  accentColor: string; 
}) {
  return (
    <div className="mb-6">
      {/* Gradient line */}
      <div 
        className="mb-3 h-[2px] w-[120px]"
        style={{
          background: `linear-gradient(to right, ${accentColor}, transparent)`,
        }}
      />
      {/* Title */}
      <h3 className="font-serif text-[20px] font-semibold text-white">
        {title}
      </h3>
      {/* Subtitle */}
      <p className="mt-1 text-[13px] font-light italic text-[#64748b]">
        {subtitle}
      </p>
      {/* Hover hint - desktop only */}
      <p className="mt-2 hidden items-center gap-1.5 text-[13px] italic text-[rgba(255,255,255,0.6)] md:flex" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <span>🖱️</span>
        <Mouse className="h-3 w-3" style={{ color: 'rgba(255,255,255,0.6)' }} />
        Hover over any signal to see its per-minute rate
      </p>
    </div>
  );
}

interface ExpandableSystemSectionProps {
  title: string;
  subtitle: string;
  accentColor: string;
  backgroundGradient: string;
  metrics: Array<{
    color: string;
    label: string;
    ratePerSecond: number;
    useAbbreviated?: boolean;
    prefix?: string;
    staticValue?: number;
    decimalPlaces?: number;
  }>;
  systemStatus?: "stable" | "increasing" | "critical";
  defaultVisibleCount?: number;
}

// Expandable System Section Component for Vital Signs
export function ExpandableSystemSection({
  title,
  subtitle,
  accentColor,
  backgroundGradient,
  metrics,
  systemStatus,
  defaultVisibleCount = 5,
}: ExpandableSystemSectionProps) {
  const { tick, isLoaded } = useGlobalTick();
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusPulse, setStatusPulse] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Shuffle metrics once on mount for visual variety
  const shuffledMetrics = useMemo(() => {
    const arr = [...metrics];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);
  
  // Mobile detection for responsive visible count
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  
  // Mobile shows 4 cards (clean 2x2), desktop shows defaultVisibleCount
  const effectiveVisibleCount = isMobile ? 4 : defaultVisibleCount;
  
  // Status pulse animation using shared global tick (toggles every 2 ticks)
  useEffect(() => {
    if (!isLoaded) return;
    // Toggle every 2 seconds (2 ticks)
    if (tick % 2 === 0) {
      setStatusPulse(prev => !prev);
    }
  }, [tick, isLoaded]);
  
  // Split metrics into visible and expanded
  const visibleMetrics = shuffledMetrics.slice(0, effectiveVisibleCount);
  const expandedMetrics = shuffledMetrics.slice(effectiveVisibleCount);
  const hasMoreMetrics = expandedMetrics.length > 0;
  
  // Status display configuration
  const statusConfig: Record<string, { icon: string; label: string; color: string }> = {
    increasing: { icon: '▲', label: 'Increasing', color: '#f59e0b' },
    stable: { icon: '●', label: 'Stable', color: 'rgba(255,255,255,0.7)' },
    decreasing: { icon: '▼', label: 'Decreasing', color: '#22c55e' },
    critical: { icon: '◆', label: 'Critical', color: '#ef4444' },
  };
  const status = systemStatus ? statusConfig[systemStatus] : statusConfig.stable;
  
  return (
    <div 
      className="vital-signs-section relative mt-[60px] sm:mt-[100px] first:mt-0 rounded-3xl px-3 py-8 sm:px-6 sm:py-12"
      style={{ background: backgroundGradient }}
    >
      {/* Section Header with Status Indicator */}
      <div className="mb-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 
              className="font-serif text-[28px] font-semibold md:text-[32px]"
              style={{ 
                color: 'rgba(255,255,255,0.95)',
                textShadow: `0 0 40px ${accentColor}30`,
              }}
            >
              {title}
            </h3>
            <p 
              className="mt-2 text-[14px] md:text-[15px]"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              {subtitle}
            </p>
            {/* Header baseline rule */}
            <div 
              className="mt-3"
              style={{
                width: '120px',
                height: '1px',
                background: 'rgba(255,255,255,0.15)',
              }}
            />
            {/* Hover hint - desktop only */}
            <p className="mt-3 hidden items-center gap-1.5 text-[13px] italic md:flex" style={{ fontFamily: 'Outfit, sans-serif', color: 'rgba(255, 255, 255, 0.75)' }}>
              <Mouse className="h-3 w-3" style={{ color: 'rgba(255, 255, 255, 0.75)' }} />
              Hover over any signal to see its per-minute rate
            </p>
          </div>
          {/* Status Indicator */}
          <div 
            className="flex shrink-0 items-center gap-2 pt-2 font-mono text-[13px] tracking-wider md:text-[14px]"
            style={{ 
              color: status.color,
              opacity: statusPulse ? 1 : 0.7,
              transition: 'opacity 0.25s ease',
            }}
          >
            <span 
              style={{ 
                display: 'inline-block',
                transform: statusPulse && systemStatus === 'increasing' ? 'translateY(-1px)' : 'translateY(0)',
                transition: 'transform 0.2s ease',
              }}
            >
              {status.icon}
            </span>
            <span>{status.label}</span>
          </div>
        </div>
      </div>
      
      {/* Default visible metrics - always rendered */}
      <div className="vital-signs-grid">
        {visibleMetrics.map((metric, idx) => (
          <MetricCard
            key={metric.label}
            color={metric.color}
            label={metric.label}
            ratePerSecond={metric.ratePerSecond}
            useAbbreviated={metric.useAbbreviated}
            prefix={metric.prefix}
            index={idx}
            staticValue={metric.staticValue}
            decimalPlaces={metric.decimalPlaces}
          />
        ))}
      </div>
      
      {/* Expanded metrics */}
      {hasMoreMetrics && (
        <div
          style={{
            maxHeight: isExpanded ? '4000px' : '0px',
            opacity: isExpanded ? 1 : 0,
            marginTop: isExpanded ? '16px' : '0px',
            overflow: 'hidden',
            transition: isExpanded
              ? 'max-height 0.6s ease, opacity 0.3s ease 0.1s, margin-top 0.3s ease'
              : 'max-height 0.3s ease, opacity 0.2s ease, margin-top 0.3s ease',
          }}
        >
          <div className="vital-signs-grid">
            {expandedMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 16 }}
                transition={{ duration: 0.35, delay: isExpanded ? index * 0.03 : 0, ease: 'easeOut' }}
              >
                <MetricCard
                  color={metric.color}
                  label={metric.label}
                  ratePerSecond={metric.ratePerSecond}
                  useAbbreviated={metric.useAbbreviated}
                  prefix={metric.prefix}
                  index={visibleMetrics.length + index}
                  staticValue={metric.staticValue}
                  decimalPlaces={metric.decimalPlaces}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Expand/Collapse link - always visible if there are more metrics */}
      {hasMoreMetrics && (
        <ExpandToggleLink
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          expandedLabel="Show Fewer Signals"
          collapsedLabel="Show More Signals"
        />
      )}
    </div>
  );
}
