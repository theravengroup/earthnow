"use client";

import { useState, useEffect, useRef } from "react";
import { useGlobalTick } from "@/hooks/use-global-tick";

// Planetary Balance Indicator - summary index of human activity vs Earth systems
export function PlanetaryBalanceIndicator() {
  const { tick, isLoaded } = useGlobalTick();
  const [score, setScore] = useState(63); // Base score representing current planetary state
  const [displayScore, setDisplayScore] = useState(63);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevTickRef = useRef(tick);
  
  // Simulate slight score fluctuation based on shared global tick
  useEffect(() => {
    if (!isLoaded || tick === prevTickRef.current) return;
    prevTickRef.current = tick;
    
    // Small random fluctuation between -0.02 and +0.01 per second
    // Net negative drift represents ongoing environmental pressure
    setScore((prev) => {
      const delta = (Math.random() * 0.03) - 0.02;
      const newScore = Math.max(0, Math.min(100, prev + delta));
      return newScore;
    });
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 250);
  }, [tick, isLoaded]);
  
  // Smooth animation for display score
  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      setDisplayScore((prev) => prev + (score - prev) * 0.1);
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [score]);
  
  // Determine color based on score
  const getColor = (s: number) => {
    if (s >= 70) return '#22c55e'; // Green - balanced
    if (s >= 40) return '#f59e0b'; // Yellow/amber - moderate stress
    return '#ef4444'; // Red - high stress
  };
  
  const color = getColor(displayScore);
  const percentage = displayScore;
  
  // Status label
  const getStatus = (s: number) => {
    if (s >= 70) return 'Balanced';
    if (s >= 50) return 'Moderate Stress';
    if (s >= 30) return 'Elevated Stress';
    return 'Critical';
  };
  
  return (
    <div 
      className="relative mb-16 rounded-3xl px-8 py-10"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="mb-1 font-serif text-xl font-semibold text-white md:text-2xl">
          Planetary Balance
        </h3>
        <p className="text-[13px] text-[#64748b] md:text-[14px]">
          Human activity vs Earth systems
        </p>
      </div>
      
      {/* Balance Meter */}
      <div className="mx-auto max-w-xl">
        {/* Track */}
        <div 
          className="relative h-4 overflow-hidden rounded-full md:h-5"
          style={{
            background: 'rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {/* Filled bar */}
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${color}cc 0%, ${color} 100%)`,
              boxShadow: `0 0 20px ${color}66, inset 0 1px 0 rgba(255,255,255,0.3)`,
              transition: 'width 0.5s ease, background 0.5s ease, box-shadow 0.5s ease',
            }}
          />
          
          {/* Pulse glow on update */}
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, transparent 70%, ${color}44 100%)`,
              opacity: isPulsing ? 1 : 0,
              transition: 'opacity 0.25s ease',
            }}
          />
        </div>
        
        {/* Score display */}
        <div className="mt-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 font-mono text-[13px] md:text-[14px]"
            style={{ color: '#64748b' }}
          >
            <span 
              style={{ 
                color,
                opacity: isPulsing ? 1 : 0.9,
                transition: 'opacity 0.25s ease',
              }}
            >
              {Math.round(displayScore)}
            </span>
            <span>/ 100</span>
            <span className="ml-1 text-[#475569]">Planetary Balance</span>
          </div>
          
          <div 
            className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wider md:text-[14px]"
            style={{ color }}
          >
            <span 
              className="h-2 w-2 rounded-full"
              style={{ 
                backgroundColor: color,
                boxShadow: isPulsing ? `0 0 8px ${color}` : 'none',
                transition: 'box-shadow 0.25s ease',
              }}
            />
            {getStatus(displayScore)}
          </div>
        </div>
      </div>
    </div>
  );
}
