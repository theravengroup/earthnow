"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// While You Were Here Section Component
export const WhileYouWereHereSection = React.forwardRef<HTMLDivElement>(function WhileYouWereHereSection(_, forwardedRef) {
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
