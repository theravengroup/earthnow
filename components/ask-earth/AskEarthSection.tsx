'use client';

import { useAskEarth } from '@/hooks/use-ask-earth';
import { AskEarthInput } from './AskEarthInput';
import { AskEarthOverlay } from './AskEarthOverlay';

/**
 * Page-level wrapper. Owns no state beyond what the hook provides.
 * Placement: dropped into app/page.tsx after "The planet doesn't pause."
 */
export function AskEarthSection() {
  const {
    phase,
    question,
    visibleAnswer,
    answerComplete,
    tone,
    error,
    submit,
    dismiss,
  } = useAskEarth();

  return (
    <section
      className="relative px-6 pb-24 pt-16 md:pb-32 md:pt-20"
      style={{ background: '#070b11' }}
      aria-label="Ask Earth"
    >
      <AskEarthInput disabled={phase !== 'idle'} onSubmit={submit} />

      {error && (
        <p
          className="mx-auto mt-4 max-w-xl text-center font-mono text-[12px]"
          style={{ color: 'rgba(239,68,68,0.8)' }}
          role="alert"
        >
          {error}
        </p>
      )}

      <AskEarthOverlay
        phase={phase}
        question={question}
        visibleAnswer={visibleAnswer}
        answerComplete={answerComplete}
        tone={tone}
        onDismiss={dismiss}
      />
    </section>
  );
}
