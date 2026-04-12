"use client";

import { useState, useEffect } from "react";

// Isolated countdown component — ticks every second without re-rendering the parent
export function ShuffleCountdown({ interval }: { interval: number }) {
  const [countdown, setCountdown] = useState(interval);
  useEffect(() => {
    setCountdown(interval);
    const tick = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? interval : prev - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [interval]);

  return (
    <div className="mt-8 flex flex-col items-center gap-2.5" suppressHydrationWarning>
      {/* Progress bar — wider and taller for visibility */}
      <div className="overflow-hidden rounded-full" style={{ width: 180, height: 4, background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${(countdown / interval) * 100}%`,
            background: 'linear-gradient(90deg, rgba(20,184,166,0.6), #14b8a6)',
            transition: 'width 1s linear',
            boxShadow: '0 0 8px rgba(20,184,166,0.4)',
          }}
          suppressHydrationWarning
        />
      </div>
      <span className="font-mono text-[13px]" style={{ color: 'rgba(148,163,184,0.85)', letterSpacing: '0.04em' }} suppressHydrationWarning>
        new signals in {countdown}s
      </span>
    </div>
  );
}
