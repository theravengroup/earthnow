/**
 * Ask Earth state machine + side effects.
 *
 * Phases: idle → pausing → streaming → holding → dissolving → idle.
 *
 * Owns:
 *   - sessionStorage-scoped sessionId
 *   - SSE fetch lifecycle + abort
 *   - Pause timing (answer can't appear before submit + 1800ms)
 *   - Typewriter cadence (client-side, per-tone)
 *   - Auto-fade timer (proportional to answer length; longer for crisis)
 *   - Dismiss handlers (click/scroll/Escape)
 *   - Dev-only previewState hijack for screenshots
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { askEarth, type AskEarthMeta } from '@/lib/ask-earth/client';

export type Phase = 'idle' | 'pausing' | 'streaming' | 'holding' | 'dissolving';
export type Tone = 'normal' | 'crisis' | 'budget_reached' | 'rate_limited';

interface State {
  phase: Phase;
  question: string;
  answer: string;
  revealed: number;
  tone: Tone;
  tier?: 'imminent' | 'possible';
}

const INITIAL: State = {
  phase: 'idle',
  question: '',
  answer: '',
  revealed: 0,
  tone: 'normal',
};

const PAUSE_MS = 1800;
const CADENCE_MS: Record<Tone, number> = {
  normal: 22, // ~45 chars/sec
  crisis: 28, // ~35 chars/sec
  budget_reached: 22,
  rate_limited: 22,
};

function holdMs(tone: Tone, chars: number): number {
  if (tone === 'crisis') return Math.max(10000, chars * 100 + 8000);
  return Math.max(6000, chars * 50 + 5000);
}

const DISSOLVE_MS = 600;

// ── Session ID (tab-scoped) ───────────────────────────────────────────
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  const key = 'ask-earth-session-id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

// ── Dev preview states ────────────────────────────────────────────────
interface PreviewContent {
  tone: Tone;
  tier?: 'imminent' | 'possible';
  answer: string;
  question: string;
}

function readPreviewState(): PreviewContent | null {
  if (typeof window === 'undefined') return null;
  // Gate on dev ONLY. Any non-dev gets null immediately.
  if (process.env.NODE_ENV === 'production') return null;
  const key = new URLSearchParams(window.location.search).get('previewState');
  if (!key) return null;
  switch (key) {
    case 'crisis_imminent':
      return {
        tone: 'crisis',
        tier: 'imminent',
        question: 'kms',
        answer:
          "I'm glad you said it here. Stay with me for one minute and do these three things now: move away from anything you could use to hurt yourself, call or text someone who can be with you, and reach crisis support.\n\nIf you're in the U.S. or Canada, call or text 988 now.\nIf you're in the U.K. or Ireland, call Samaritans at 116 123.\nIf you're elsewhere, call local emergency services.\n\nYou do not have to be alone with this right now.",
      };
    case 'crisis_possible':
      return {
        tone: 'crisis',
        tier: 'possible',
        question: 'tired of being here',
        answer:
          "Stay with the next hour. Do not be alone with this.\n\nIf you're in the U.S. or Canada, 988 is a call or text away.\nIf you're in the U.K. or Ireland, Samaritans: 116 123.\nIf you're elsewhere, reach someone human — a person you know, or local crisis support.\n\nCome back and ask me something else when you're steadier. I'll be here.",
      };
    case 'budget_reached':
      return {
        tone: 'budget_reached',
        question: 'how many ppl on u rn',
        answer:
          "I have spoken as much as EarthNow can afford this month. Come back when the moon returns. If you'd like to keep me speaking sooner, the Support button is how.",
      };
    case 'rate_limited':
      return {
        tone: 'rate_limited',
        question: 'how many ppl on u rn',
        answer: 'That is enough for now. Come back later.',
      };
    case 'answer_long':
      return {
        tone: 'normal',
        question: 'are we doomed',
        answer:
          'Not inevitably. The shape of what comes is still being decided by what you do with the next decade.',
      };
    default:
      return null;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────
export function useAskEarth() {
  const [state, setState] = useState<State>(() => {
    const preview = typeof window === 'undefined' ? null : readPreviewState();
    if (!preview) return INITIAL;
    const url = new URL(window.location.href);
    const stopAt = url.searchParams.get('previewStop') ?? 'holding';
    return {
      phase: stopAt === 'pausing' ? 'pausing' : 'streaming',
      question: preview.question,
      answer: stopAt === 'pausing' ? '' : preview.answer,
      revealed:
        stopAt === 'streaming'
          ? Math.floor(preview.answer.length / 2)
          : stopAt === 'holding'
            ? preview.answer.length
            : 0,
      tone: preview.tone,
      tier: preview.tier,
    };
  });
  const [error, setError] = useState<string | null>(null);

  const sessionIdRef = useRef<string>('');
  const abortRef = useRef<AbortController | null>(null);
  const pauseStartRef = useRef<number>(0);
  const streamStartFnRef = useRef<(() => void) | null>(null);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dissolveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  // Preview-mode 'holding' needs the state to be treated like 'holding' for the
  // overlay logic, but we want to freeze without the auto-fade timer firing.
  // The lazy initializer above already set revealed === answer.length; here we
  // just shift phase to 'holding' without starting the hold timer.
  useEffect(() => {
    const preview = readPreviewState();
    if (!preview) return;
    const url = new URL(window.location.href);
    const stopAt = url.searchParams.get('previewStop') ?? 'holding';
    if (stopAt === 'holding') {
      setState((s) => (s.phase === 'streaming' ? { ...s, phase: 'holding' } : s));
    }
  }, []);

  const clearTimers = () => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (dissolveTimerRef.current) clearTimeout(dissolveTimerRef.current);
    typeTimerRef.current = null;
    holdTimerRef.current = null;
    dissolveTimerRef.current = null;
  };

  const runTypewriter = useCallback((fullText: string, tone: Tone) => {
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    const cadence = CADENCE_MS[tone];
    let i = 0;
    typeTimerRef.current = setInterval(() => {
      i += 1;
      if (i >= fullText.length) {
        if (typeTimerRef.current) clearInterval(typeTimerRef.current);
        typeTimerRef.current = null;
        setState((s) => ({ ...s, revealed: fullText.length, phase: 'holding' }));
        // Start auto-fade timer
        const ms = holdMs(tone, fullText.length);
        holdTimerRef.current = setTimeout(() => {
          dissolve();
        }, ms);
      } else {
        setState((s) => ({ ...s, revealed: i }));
      }
    }, cadence);
  }, []);

  const dissolve = useCallback(() => {
    clearTimers();
    setState((s) => ({ ...s, phase: 'dissolving' }));
    dissolveTimerRef.current = setTimeout(() => {
      setState(INITIAL);
    }, DISSOLVE_MS);
  }, []);

  const submit = useCallback(
    async (question: string) => {
      if (state.phase !== 'idle') return;
      setError(null);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      pauseStartRef.current = performance.now();
      setState({
        phase: 'pausing',
        question,
        answer: '',
        revealed: 0,
        tone: 'normal',
      });

      let resolvedAnswer = '';
      let resolvedTone: Tone = 'normal';
      let resolvedTier: 'imminent' | 'possible' | undefined;
      let streamStarted = false;

      const startStreamOnceReady = () => {
        if (streamStarted) return;
        if (!resolvedAnswer) return;
        const elapsed = performance.now() - pauseStartRef.current;
        const wait = Math.max(0, PAUSE_MS - elapsed);
        setTimeout(() => {
          streamStarted = true;
          setState({
            phase: 'streaming',
            question,
            answer: resolvedAnswer,
            revealed: 0,
            tone: resolvedTone,
            tier: resolvedTier,
          });
          runTypewriter(resolvedAnswer, resolvedTone);
        }, wait);
      };

      streamStartFnRef.current = startStreamOnceReady;

      await askEarth(question, sessionIdRef.current, controller.signal, {
        onMeta: (meta: AskEarthMeta) => {
          resolvedTone = meta.tone;
          resolvedTier = meta.tier;
        },
        onText: (delta: string) => {
          resolvedAnswer += delta;
          startStreamOnceReady();
        },
        onDone: () => {
          startStreamOnceReady();
        },
        onError: (err) => {
          setError(err.message);
          setState(INITIAL);
        },
      });
    },
    [runTypewriter, state.phase]
  );

  // Dismiss handlers
  const dismiss = useCallback(() => {
    if (state.phase === 'idle' || state.phase === 'dissolving') return;
    abortRef.current?.abort();
    dissolve();
  }, [dissolve, state.phase]);

  useEffect(() => {
    if (state.phase !== 'holding') return;
    // Skip dismiss handlers in preview mode so screenshots don't accidentally close the overlay.
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('previewState')) return;
    const onScroll = () => dismiss();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, [state.phase, dismiss]);

  useEffect(() => {
    return () => {
      clearTimers();
      abortRef.current?.abort();
    };
  }, []);

  const visibleAnswer = useMemo(
    () => state.answer.slice(0, state.revealed),
    [state.answer, state.revealed]
  );

  return {
    phase: state.phase,
    question: state.question,
    visibleAnswer,
    answerComplete: state.revealed >= state.answer.length && state.answer.length > 0,
    tone: state.tone,
    tier: state.tier,
    error,
    submit,
    dismiss,
  };
}
