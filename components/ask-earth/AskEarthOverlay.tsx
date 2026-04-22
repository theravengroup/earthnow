'use client';

import { X } from 'lucide-react';
import type { Phase, Tone } from '@/hooks/use-ask-earth';

interface AskEarthOverlayProps {
  phase: Phase;
  question: string;
  visibleAnswer: string;
  answerComplete: boolean;
  tone: Tone;
  onDismiss: () => void;
}

// Tone → accent color for horizon line + ambient glow
function accentColor(tone: Tone): string {
  if (tone === 'crisis') return '#e6e1d7'; // candle ivory
  if (tone === 'budget_reached' || tone === 'rate_limited') return '#94a3b8';
  return '#14b8a6';
}

export function AskEarthOverlay({
  phase,
  question,
  visibleAnswer,
  answerComplete,
  tone,
  onDismiss,
}: AskEarthOverlayProps) {
  const active = phase !== 'idle';
  const accent = accentColor(tone);

  // Visibility flags — CSS transitions handle the fade
  const showQuestion = active;
  const showHorizon = phase === 'pausing';
  const showAnswer = phase === 'streaming' || phase === 'holding' || phase === 'dissolving';
  const showHint = phase === 'holding' && answerComplete;
  const dissolving = phase === 'dissolving';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[900] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Earth's answer"
      style={{
        opacity: active && !dissolving ? 1 : 0,
        transition: 'opacity 600ms ease-out',
        pointerEvents: active && !dissolving ? 'auto' : 'none',
      }}
      onClick={phase === 'holding' ? onDismiss : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(6,9,15,0.78) 0%, rgba(6,9,15,0.95) 100%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2"
        style={{
          width: '900px',
          height: '900px',
          marginLeft: '-450px',
          marginTop: '-450px',
          background: `radial-gradient(circle, ${accent}22 0%, ${accent}08 35%, transparent 65%)`,
          opacity: 0.9,
        }}
      />

      {/* ── Content stack ── */}
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center">
        {/* Question (italicized quoted speech) */}
        <p
          className="font-serif italic"
          style={{
            color: 'rgba(148,163,184,0.75)',
            fontSize: 'clamp(18px, 2.5vw, 22px)',
            letterSpacing: '0.01em',
            maxWidth: '720px',
            opacity: showQuestion ? 1 : 0,
            transform: showQuestion ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 600ms ease-out 150ms, transform 600ms ease-out 150ms',
          }}
        >
          “{question}”
        </p>

        {/* Horizon line — pulses gently during pausing, dissolves when answer begins */}
        <div
          className="relative mt-14 h-px"
          style={{
            width: '40%',
            background: `linear-gradient(to right, transparent 0%, ${accent}55 30%, ${accent} 50%, ${accent}55 70%, transparent 100%)`,
            opacity: showHorizon ? 1 : 0,
            transform: showHorizon ? 'scaleX(1)' : 'scaleX(0.2)',
            animation: showHorizon
              ? 'askEarthHorizonPulse 2.4s ease-in-out infinite'
              : 'none',
            transition: 'opacity 500ms ease-out, transform 500ms ease-out',
            transformOrigin: 'center',
          }}
        />

        {/* Earth's answer */}
        <div
          className="mt-10 w-full"
          style={{
            opacity: showAnswer ? 1 : 0,
            transition: 'opacity 500ms ease-out',
          }}
        >
          <p
            className="font-serif whitespace-pre-line"
            style={{
              color: '#f1f5f9',
              fontSize: 'clamp(22px, 3.2vw, 34px)',
              lineHeight: 1.35,
              letterSpacing: '-0.005em',
              maxWidth: '820px',
              margin: '0 auto',
              minHeight: '1.8em',
            }}
          >
            {visibleAnswer}
            {phase === 'streaming' && (
              <span
                aria-hidden="true"
                className="ml-0.5 inline-block align-middle"
                style={{
                  width: '2px',
                  height: '0.9em',
                  background: accent,
                  animation: 'askEarthCursorBlink 1s ease-in-out infinite',
                }}
              />
            )}
          </p>
        </div>

        {/* Tap-anywhere hint — only rendered in holding phase */}
        {showHint && (
          <div
            className="mt-10 font-mono text-[11px] uppercase tracking-[0.25em]"
            style={{ color: 'rgba(148,163,184,0.45)' }}
          >
            tap anywhere to return
          </div>
        )}
      </div>

      {/* Dismiss × — offset LEFT of navbar hamburger so it doesn't collide */}
      {active && !dissolving && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          aria-label="Close Earth's answer"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          style={{
            position: 'absolute',
            top: 20,
            right: 76, // leaves the right-20 slot for the existing hamburger
            background: 'rgba(148,163,184,0.08)',
            border: '1px solid rgba(148,163,184,0.18)',
            color: 'rgba(148,163,184,0.75)',
            zIndex: 1,
          }}
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
