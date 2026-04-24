"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { timelineEvents, type TimelineEvent } from "@/app/timeline/page";

// Parse a TimelineEvent year string into a numeric year, or null for BCE/
// unparseable entries. Handles "1969", "~1969", "2010", etc.
function parseYear(yearStr: string): number | null {
  if (yearStr.includes("BCE")) return null;
  const num = parseInt(yearStr.replace(/^~/, ""), 10);
  return Number.isFinite(num) ? num : null;
}

// Consistent category → color map for ribbon dots and the tooltip card.
// Chosen for perceptual distinctiveness against the dark background.
const CATEGORY_COLOR: Record<string, string> = {
  Environment: "#22c55e", // green
  Science: "#38bdf8", // sky blue
  Technology: "#a78bfa", // violet
  Social: "#f59e0b", // amber
  Culture: "#f472b6", // rose
  Exploration: "#fb923c", // orange
  Space: "#06b6d4", // cyan
  Health: "#ef4444", // red
};

function colorFor(category: string): string {
  return CATEGORY_COLOR[category] ?? "rgba(255,255,255,0.7)";
}

interface PositionedEvent extends TimelineEvent {
  numericYear: number;
  leftPct: number;
}

interface LifetimeTimelineProps {
  birthYear: number;
}

export function LifetimeTimeline({ birthYear }: LifetimeTimelineProps) {
  const currentYear = new Date().getFullYear();
  const yearsAlive = Math.max(1, currentYear - birthYear);

  const events: PositionedEvent[] = useMemo(() => {
    return timelineEvents
      .map((e) => {
        const numericYear = parseYear(e.year);
        if (numericYear === null) return null;
        if (numericYear < birthYear || numericYear > currentYear) return null;
        const leftPct =
          ((numericYear - birthYear) / yearsAlive) * 100;
        return { ...e, numericYear, leftPct };
      })
      .filter((e): e is PositionedEvent => e !== null)
      .sort((a, b) => a.numericYear - b.numericYear);
  }, [birthYear, currentYear, yearsAlive]);

  // Default to a mid-lifetime event so the initial card isn't the very first
  // or last dot — gives the user something in the middle to read.
  const defaultIdx = Math.min(events.length - 1, Math.floor(events.length / 2));
  const [focusedIdx, setFocusedIdx] = useState(defaultIdx);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Scrub animation on first scroll-into-view: playhead sweeps L→R, cycling
  // the focused card through each event. Stops on first user interaction.
  const ribbonRef = useRef<HTMLDivElement>(null);
  const [playheadPct, setPlayheadPct] = useState<number | null>(null);

  useEffect(() => {
    if (events.length === 0) return;
    const ribbon = ribbonRef.current;
    if (!ribbon) return;

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (cancelled) return;
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        // Scrub duration scales gently with event count so dense lifetimes
        // still feel deliberate rather than frantic.
        const duration = Math.min(4200, 1600 + events.length * 60);
        const start = performance.now();

        const tick = (now: number) => {
          if (cancelled || hasUserInteracted) {
            setPlayheadPct(null);
            return;
          }
          const t = Math.min(1, (now - start) / duration);
          setPlayheadPct(t * 100);
          // Advance focused card as playhead passes each event
          let passedIdx = 0;
          for (let i = 0; i < events.length; i++) {
            if (events[i].leftPct <= t * 100) passedIdx = i;
            else break;
          }
          setFocusedIdx(passedIdx);
          if (t < 1) {
            requestAnimationFrame(tick);
          } else {
            setPlayheadPct(null);
          }
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    observer.observe(ribbon);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [events, hasUserInteracted]);

  if (events.length === 0) {
    return null;
  }

  const focused = events[focusedIdx];

  const handleEventFocus = useCallback((idx: number) => {
    setHasUserInteracted(true);
    setFocusedIdx(idx);
    setPlayheadPct(null);
  }, []);

  // Drag-to-scrub: on mobile especially, dense decades are impossible to tap
  // precisely. Dragging along the ribbon updates the focused event in real
  // time — finger slides = scrubber. Nearest-neighbor by leftPct. Works with
  // mouse too for desktop parity.
  const scrubToClientX = useCallback((clientX: number) => {
    const ribbon = ribbonRef.current;
    if (!ribbon) return;
    const rect = ribbon.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    let nearest = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < events.length; i++) {
      const d = Math.abs(events[i].leftPct - pct);
      if (d < nearestDist) {
        nearest = i;
        nearestDist = d;
      }
    }
    handleEventFocus(nearest);
  }, [events, handleEventFocus]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button / touch / pen
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    setIsScrubbing(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    scrubToClientX(e.clientX);
  }, [scrubToClientX]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    scrubToClientX(e.clientX);
  }, [isScrubbing, scrubToClientX]);

  const handlePointerEnd = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setIsScrubbing(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
      className="my-12 w-full"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-2 text-center">
          <p className="text-[12px] font-medium uppercase tracking-widest text-[#14b8a6]">
            Your lifetime on Earth
          </p>
          <h3 className="mt-2 font-serif text-[22px] leading-tight text-white sm:text-[26px] md:text-[30px]">
            {events.length} moments that reshaped the planet while you&rsquo;ve
            been alive.
          </h3>
          {/* Hint sits above the ribbon so users see the instruction before
              trying to interact. Device-aware copy — no "Hover" on touch. */}
          <p className="mt-3 text-center text-[12px] text-[#cbd5e1]">
            <span className="pointer-coarse:hidden">
              Hover any dot &mdash; or drag along the ribbon &mdash; to scrub through.
            </span>
            <span className="pointer-fine:hidden">
              Tap any dot &mdash; or drag your finger along the ribbon &mdash; to scrub through.
            </span>
          </p>
        </div>

        {/* Ribbon. touch-action: pan-y lets vertical page scroll pass through
            while horizontal drags become scrub gestures handled by JS. */}
        <div
          ref={ribbonRef}
          className="relative mt-8 select-none"
          role="list"
          aria-label={`${events.length} planetary events during your lifetime`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          style={{ touchAction: 'pan-y', cursor: isScrubbing ? 'grabbing' : 'grab' }}
        >
          {/* Axis */}
          <div
            className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2"
            style={{
              background:
                "linear-gradient(to right, rgba(20,184,166,0.1) 0%, rgba(20,184,166,0.6) 50%, rgba(20,184,166,0.1) 100%)",
            }}
          />

          {/* Decade tick marks (every 10 years) */}
          {Array.from({ length: Math.floor(yearsAlive / 10) + 1 }).map(
            (_, i) => {
              const year = birthYear + i * 10;
              if (year > currentYear) return null;
              const pct = ((year - birthYear) / yearsAlive) * 100;
              return (
                <div
                  key={year}
                  className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pct}%` }}
                >
                  <div
                    className="h-3 w-px"
                    style={{ background: "rgba(255,255,255,0.25)" }}
                  />
                </div>
              );
            },
          )}

          {/* Scrub playhead */}
          {playheadPct !== null && (
            <div
              className="pointer-events-none absolute top-1/2 h-5 w-[2px] -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${playheadPct}%`,
                background: "rgba(20,184,166,0.9)",
                boxShadow: "0 0 14px rgba(20,184,166,0.8)",
              }}
            />
          )}

          {/* Event dots. Each button is a 32px transparent hit target so
              fingers can land precisely even in dense decades; the visible
              dot is an 8px child centered inside. */}
          <div className="relative h-16">
            {events.map((event, idx) => {
              const isFocused = idx === focusedIdx;
              const color = colorFor(event.category);
              const dotSize = isFocused ? 14 : 8;
              return (
                <button
                  key={`${event.numericYear}-${event.title}`}
                  type="button"
                  role="listitem"
                  onMouseEnter={() => handleEventFocus(idx)}
                  onFocus={() => handleEventFocus(idx)}
                  onClick={() => handleEventFocus(idx)}
                  aria-label={`${event.numericYear}: ${event.title}`}
                  className="flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  style={{
                    position: "absolute",
                    left: `${event.leftPct}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 32,
                    height: 32,
                    background: "transparent",
                    padding: 0,
                    border: "none",
                    zIndex: isFocused ? 3 : 2,
                    cursor: "pointer",
                  }}
                >
                  <span
                    aria-hidden
                    className="block rounded-full transition-[width,height,box-shadow] duration-200"
                    style={{
                      width: dotSize,
                      height: dotSize,
                      background: color,
                      boxShadow: isFocused
                        ? `0 0 16px ${color}, 0 0 4px ${color}`
                        : `0 0 6px ${color}88`,
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Year endcaps */}
          <div className="mt-2 flex justify-between font-mono text-[12px] text-[#94a3b8]">
            <span>{birthYear}</span>
            <span>{currentYear}</span>
          </div>
        </div>

        {/* Focused event card — keyed so content cross-fades on change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${focused.numericYear}-${focused.title}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mx-auto mt-8 max-w-2xl rounded-xl p-5 text-left"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderLeft: `3px solid ${colorFor(focused.category)}`,
            }}
          >
            <div className="flex items-baseline gap-3">
              <span
                className="font-mono text-[14px] font-semibold tabular-nums"
                style={{ color: colorFor(focused.category) }}
              >
                {focused.numericYear}
              </span>
              <span
                className="text-[10px] font-medium uppercase tracking-widest"
                style={{
                  color: "rgba(148,163,184,0.7)",
                }}
              >
                {focused.category} · {focused.era}
              </span>
              <span className="ml-auto text-[11px] tabular-nums text-[#94a3b8]">
                age {focused.numericYear - birthYear}
              </span>
            </div>
            <h4 className="mt-2 font-serif text-[18px] font-semibold leading-tight text-white sm:text-[20px]">
              {focused.title}
            </h4>
            <p className="mt-2 text-[14px] leading-relaxed text-[#cbd5e1]">
              {focused.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
