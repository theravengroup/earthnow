'use client';

import { useState, useRef, useEffect } from 'react';

interface AskEarthInputProps {
  disabled?: boolean;
  onSubmit: (question: string) => void;
}

const MAX_CHARS = 500;
const COUNTER_REVEAL_AT = 400;

/**
 * Glass-pill input with embedded globe + iridescent rotating halo.
 * At-rest ("Moment 1") treatment for Ask Earth.
 */
export function AskEarthInput({ disabled, onSubmit }: AskEarthInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Refocus if disabled toggles off (overlay dismissed and user returns)
  useEffect(() => {
    if (!disabled && document.activeElement === document.body) {
      // no auto-focus — quiet arrival posture
    }
  }, [disabled]);

  const trimmed = value.trim();
  const canSubmit = !disabled && trimmed.length > 0 && trimmed.length <= MAX_CHARS;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;
    onSubmit(trimmed);
    setValue('');
  };

  const showCounter = value.length >= COUNTER_REVEAL_AT;

  return (
    <div className="relative mx-auto w-full max-w-[560px] px-5">
      <form onSubmit={handleSubmit} aria-busy={disabled || undefined}>
        {/* Outer halo wrapper — houses the rotating iridescent ring.
            Must match the pill's height exactly so the ::before halo traces
            the pill's rounded-full shape instead of stretching taller. */}
        <div
          className="ask-earth-halo relative"
          style={{ isolation: 'isolate', height: 76 }}
        >
          {/* Pill — glass surface that sits ABOVE the halo */}
          <div
            className="ask-earth-pill absolute inset-0 flex items-center gap-4 overflow-hidden rounded-full pl-3 pr-6"
            style={{
              background: 'rgba(14, 20, 32, 0.55)',
              backdropFilter: 'blur(14px) saturate(120%)',
              WebkitBackdropFilter: 'blur(14px) saturate(120%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Embedded globe on the left — static circle with cyan-blue luminance.
                Layered: earth-day.jpg as continent detail, overlaid with a cyan/blue
                radial gradient so the palette reads iridescent rather than photo-real. */}
            <div
              className="ask-earth-globe shrink-0 relative"
              aria-hidden="true"
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow:
                  '0 0 16px 2px rgba(56, 189, 248, 0.55), 0 0 32px 6px rgba(139, 92, 246, 0.30), inset 0 0 18px rgba(168, 85, 247, 0.35)',
              }}
            >
              {/* Base Earth texture — continents still recognizable */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: "url('/earth-day.jpg')",
                  backgroundSize: '180% 100%',
                  backgroundPosition: '25% 50%',
                  filter: 'saturate(0.55) brightness(0.9)',
                }}
              />
              {/* Cyan tint overlay — gives the globe its iridescent palette */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at 35% 30%, rgba(103, 232, 249, 0.75) 0%, rgba(59, 130, 246, 0.55) 40%, rgba(168, 85, 247, 0.60) 75%, rgba(59, 130, 246, 0.75) 100%)',
                  mixBlendMode: 'color',
                }}
              />
              {/* Bright highlight — luminous top-left spec */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at 30% 25%, rgba(186, 230, 253, 0.45) 0%, transparent 45%)',
                  mixBlendMode: 'screen',
                }}
              />
            </div>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value.slice(0, MAX_CHARS))}
              disabled={disabled}
              placeholder="Ask the Earth a question…"
              enterKeyHint="send"
              maxLength={MAX_CHARS}
              aria-label="Ask Earth a question"
              className="ask-earth-textfield min-w-0 flex-1 bg-transparent text-[18px] text-white placeholder:text-[rgba(203,213,225,0.55)] focus:outline-none disabled:opacity-60"
              style={{
                fontFamily: 'var(--font-sans), Outfit, sans-serif',
                letterSpacing: '0.005em',
              }}
            />
          </div>

          {/* Visually-hidden submit — preserves form submit for screen readers */}
          <button
            type="submit"
            disabled={!canSubmit}
            aria-label="Ask Earth"
            className="sr-only"
          >
            Ask Earth
          </button>
        </div>

        {/* Character counter — below the pill, past 80% of cap only */}
        <div
          className="mt-3 text-center font-mono text-[11px] tabular-nums transition-opacity duration-300"
          style={{
            color:
              value.length >= MAX_CHARS
                ? '#f59e0b'
                : 'rgba(148,163,184,0.4)',
            opacity: showCounter ? 1 : 0,
          }}
          aria-hidden={!showCounter}
        >
          {value.length} / {MAX_CHARS}
        </div>
      </form>
    </div>
  );
}
