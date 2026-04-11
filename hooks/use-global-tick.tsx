"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

// Get seconds since local midnight (user's timezone)
export function getSecondsSinceLocalMidnight(): number {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  return (hours * 3600) + (minutes * 60) + seconds;
}

// ============================================
// GLOBAL TICK SYSTEM
// Single shared timer for all 60+ counters
// ============================================
interface GlobalTickContextType {
  secondsSinceMidnight: number;
  isLoaded: boolean;
  tick: number; // Increments each second for pulse animations
}

const GlobalTickContext = createContext<GlobalTickContextType>({
  secondsSinceMidnight: 0,
  isLoaded: false,
  tick: 0,
});

// Provider component that manages the single shared timer
export function GlobalTickProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GlobalTickContextType>({
    secondsSinceMidnight: 0,
    isLoaded: false,
    tick: 0,
  });
  
  // Store interval ID in ref to ensure proper cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    // Double requestAnimationFrame ensures hydration is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const initialSeconds = getSecondsSinceLocalMidnight();
        setState({
          secondsSinceMidnight: initialSeconds,
          isLoaded: true,
          tick: 0,
        });

        // Single interval for ALL counters - stored in ref for cleanup
        intervalRef.current = setInterval(() => {
          setState((prev) => ({
            secondsSinceMidnight: prev.secondsSinceMidnight + 1,
            isLoaded: true,
            tick: prev.tick + 1,
          }));
        }, 1000);
      });
    });
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return (
    <GlobalTickContext.Provider value={state}>
      {children}
    </GlobalTickContext.Provider>
  );
}

// Hook for components to subscribe to the global tick
export function useGlobalTick() {
  return useContext(GlobalTickContext);
}
