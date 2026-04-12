"use client";

import { useState, useEffect, useCallback, createContext, useContext, useMemo } from "react";

// Reveal phases after intro completes — drives the cinematic sequenced load
export type RevealPhase = "hidden" | "globe" | "navbar" | "content";

// Context for managing intro replay and reveal sequencing from anywhere in the app
interface IntroContextType {
  showReplayLink: boolean;
  triggerReplay: () => void;
  revealPhase: RevealPhase;
}

const IntroContext = createContext<IntroContextType>({
  showReplayLink: false,
  triggerReplay: () => {},
  revealPhase: "hidden",
});

export function useIntro() {
  return useContext(IntroContext);
}

const STORAGE_KEY = "earthnow-intro-seen";
const SHOWN_STATS_KEY = "earthnow_shown_stats";

// Pool of 40 rotating stats - numbers marked with *asterisks* will be rendered in teal Space Mono
const STAT_POOL = [
  "*4.6* people were just born. Somewhere, *1.8* just died.",
  "*38,461* kilograms of CO₂ just entered the atmosphere.",
  "Right now, *12,500* planes are in the air above you.",
  "*8.1 billion* people are sharing this planet. Right now.",
  "In the last second, humanity used *3.8 million* liters of water.",
  "A child was just born into poverty. Another just got their first smartphone.",
  "The ocean absorbed *900 tonnes* of CO₂ since you started reading this.",
  "*$6.8 billion* will be spent on military operations today.",
  "Since midnight, *75,000 acres* of forest have been cut down.",
  "Somewhere right now, someone is seeing the stars for the first time.",
  "There are more devices connected to the internet than people on Earth.",
  "*4.4 billion* photos will be taken today. Almost none will be remembered.",
  "Earth is traveling through space at *67,000 miles per hour*. You don't feel a thing.",
  "Every second, *6,000* tweets are posted. Most will never be read.",
  "*200* species moved closer to extinction today.",
  "The sun will deliver *470 exajoules* of energy to Earth today. We'll capture less than *1%*.",
  "Right now, *2.2 billion* people don't have safe drinking water.",
  "A glacier just lost another *800 tonnes* of ice.",
  "Today, the world will spend *$1.2 billion* on ice cream — and *$2 billion* on weapons.",
  "*10.4 million* cigarettes will be smoked today.",
  "By the time you finish reading this, *12 hectares* of forest will be gone.",
  "There are *40 million* people in modern slavery right now.",
  "In the next *60 seconds*, *120 million* emails will be sent.",
  "The internet is consuming *$10 million* in electricity while you read this.",
  "*1 in 9* people on Earth went to bed hungry last night.",
  "*500 hours* of video were just uploaded to YouTube in the last minute.",
  "Right now, *1.4 billion* people have no reliable electricity.",
  "Today, humanity will produce enough food to feed *10 billion* — and waste a third of it.",
  "The average person will scroll *300 feet* of content on their phone today.",
  "A baby born right now will share the planet with *10 billion* people by the time they're *60*.",
  "Right now, *3.5 billion* people live on less than *$5.50* a day.",
  "The Amazon rainforest produced *6 billion tonnes* of oxygen today. We're cutting it down.",
  "Somewhere, a teacher just changed a life. It won't make the news.",
  "*130 million* Google searches happened in the last minute. Yours wasn't one of them.",
  "The world's data will grow by *2.5 quintillion* bytes today.",
  "Every hour, *1,500 acres* of productive farmland become desert.",
  "Right now, half a million people are airborne. Most are staring at screens.",
  "Someone just discovered they're going to be a parent. The planet barely noticed.",
  "Since you opened this page, the Earth moved *1,800 miles* through space.",
  "This morning, *48* animal species woke up with fewer members than yesterday.",
];

// Get a stat index that hasn't been shown yet (no-repeat-until-exhausted logic)
function getNextStatIndex(): number {
  let shownIndices: number[] = [];
  
  try {
    const stored = sessionStorage.getItem(SHOWN_STATS_KEY);
    if (stored) {
      shownIndices = JSON.parse(stored);
    }
  } catch {
    // sessionStorage not available or corrupted, start fresh
    shownIndices = [];
  }
  
  // Get indices that haven't been shown yet
  const allIndices = Array.from({ length: STAT_POOL.length }, (_, i) => i);
  const remainingIndices = allIndices.filter(i => !shownIndices.includes(i));
  
  // If all stats have been shown, clear the list and start fresh
  if (remainingIndices.length === 0) {
    shownIndices = [];
    // Pick from full pool
    const pickedIndex = Math.floor(Math.random() * STAT_POOL.length);
    try {
      sessionStorage.setItem(SHOWN_STATS_KEY, JSON.stringify([pickedIndex]));
    } catch {
      // Ignore storage errors
    }
    return pickedIndex;
  }
  
  // Pick randomly from remaining unshown stats
  const pickedIndex = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
  
  // Add to shown list and save
  shownIndices.push(pickedIndex);
  try {
    sessionStorage.setItem(SHOWN_STATS_KEY, JSON.stringify(shownIndices));
  } catch {
    // Ignore storage errors
  }
  
  return pickedIndex;
}

// Parse stat string and render with highlighted numbers (with separate animation)
function renderStatWithHighlights(statText: string): React.ReactNode {
  const parts = statText.split(/(\*[^*]+\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      const number = part.slice(1, -1);
      return (
        <span
          key={index}
          className="stat-number"
          style={{
            color: "#2dd4bf",
            fontFamily: "'Space Mono', ui-monospace, monospace",
            fontStyle: "normal",
            display: "inline-block",
          }}
        >
          {number}
        </span>
      );
    }
    return (
      <span key={index} style={{ color: "rgba(255,255,255,0.9)" }}>
        {part}
      </span>
    );
  });
}

const TITLE_LETTERS = ["E", "A", "R", "T", "H", "N", "O", "W"];

function CinematicIntro({ onComplete, replayKey }: { onComplete: () => void; replayKey: number }) {
  const [phase, setPhase] = useState<"title" | "stat" | "fadeout" | "hidden">("title");
  const [isDismissing, setIsDismissing] = useState(false);

  // Select a stat using no-repeat-until-exhausted logic on mount/replay
  const selectedStat = useMemo(() => {
    const index = getNextStatIndex();
    return STAT_POOL[index];
  }, [replayKey]);

  // Phase timing
  useEffect(() => {
    setPhase("title");
    setIsDismissing(false);

    // 3.5s: Title fades out, transition to stat phase
    const phase1Timer = setTimeout(() => {
      setPhase("stat");
    }, 3500);

    // 7s: Stat fades out
    const phase2Timer = setTimeout(() => {
      if (!isDismissing) {
        setPhase("fadeout");
      }
    }, 7000);

    // 8.3s: Overlay fully hidden and unmounted
    const completeTimer = setTimeout(() => {
      if (!isDismissing) {
        setPhase("hidden");
        localStorage.setItem(STORAGE_KEY, "true");
        onComplete();
      }
    }, 8300);

    return () => {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, replayKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSkip = useCallback(() => {
    if (isDismissing) return;
    setIsDismissing(true);
    setPhase("fadeout");
    setTimeout(() => {
      setPhase("hidden");
      localStorage.setItem(STORAGE_KEY, "true");
      onComplete();
    }, 800);
  }, [isDismissing, onComplete]);

  return (
    <div
      key={replayKey}
      className={`intro-overlay ${phase === "fadeout" ? "intro-overlay-fadeout" : ""} ${phase === "hidden" ? "intro-overlay-hidden" : ""}`}
    >
      {/* CSS Keyframes for all animations */}
      <style jsx global>{`
        /* ========================================
           OVERLAY STYLES
           ======================================== */
        .intro-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #0a0e17;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .intro-overlay-fadeout {
          animation: overlayFadeOut 0.8s ease-in-out 0.5s forwards;
          pointer-events: none;
        }
        
        .intro-overlay-hidden {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        
        @keyframes overlayFadeOut {
          from { opacity: 1; visibility: visible; }
          to { opacity: 0; visibility: hidden; }
        }
        
        /* ========================================
           LETTER-BY-LETTER TITLE REVEAL
           ======================================== */
        .title-letter {
          display: inline-block;
          opacity: 0;
          transform: rotateX(90deg) translateY(30px);
          filter: blur(8px);
          animation: letterReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes letterReveal {
          to {
            opacity: 1;
            transform: rotateX(0deg) translateY(0);
            filter: blur(0);
          }
        }
        
        /* Letter stagger delays: E=0, A=80, R=160, T=240, H=320, N=400, O=480, W=560ms */
        .title-letter:nth-child(1) { animation-delay: 0ms; }
        .title-letter:nth-child(2) { animation-delay: 80ms; }
        .title-letter:nth-child(3) { animation-delay: 160ms; }
        .title-letter:nth-child(4) { animation-delay: 240ms; }
        .title-letter:nth-child(5) { animation-delay: 320ms; }
        .title-letter:nth-child(6) { animation-delay: 400ms; }
        .title-letter:nth-child(7) { animation-delay: 480ms; }
        .title-letter:nth-child(8) { animation-delay: 560ms; }
        
        /* ========================================
           TITLE GLOW PULSE (after letters land ~1.2s)
           ======================================== */
        .title-container {
          display: flex;
          justify-content: center;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 8vw;
          font-weight: 700;
          letter-spacing: 0.3em;
          color: white;
          perspective: 1000px;
          animation: titleGlowPulse 0.8s ease-out 1.2s forwards;
        }
        
        @keyframes titleGlowPulse {
          from {
            text-shadow: 0 0 0px transparent;
          }
          to {
            text-shadow: 0 0 60px rgba(45,212,191,0.4), 0 0 120px rgba(45,212,191,0.15);
          }
        }
        
        /* ========================================
           LIGHT SWEEP EFFECT (after glow, ~2s)
           ======================================== */
        .title-sweep-wrapper {
          position: relative;
        }
        
        .title-sweep-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.3) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          background-position: -200% 0;
          -webkit-mask: linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0);
          -webkit-mask-clip: text;
          mask-clip: text;
          animation: lightSweep 1s ease-in-out 2s forwards;
          pointer-events: none;
        }
        
        @keyframes lightSweep {
          from { background-position: -200% 0; }
          to { background-position: 200% 0; }
        }
        
        /* ========================================
           SUBTITLE FADE IN (1.8s)
           ======================================== */
        .intro-subtitle {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 1.2vw;
          letter-spacing: 0.25em;
          color: rgba(255,255,255,0.6);
          margin-top: 24px;
          opacity: 0;
          transform: translateY(10px);
          animation: subtitleFadeIn 0.6s ease-out 1.8s forwards;
        }
        
        @keyframes subtitleFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* ========================================
           TITLE PHASE FADE OUT (at 3.5s, within stat phase)
           ======================================== */
        .title-phase-fadeout {
          animation: titlePhaseFadeOut 0.5s ease-out forwards !important;
        }
        
        .title-phase-fadeout .title-container,
        .title-phase-fadeout .intro-subtitle {
          animation: titlePhaseFadeOut 0.5s ease-out forwards !important;
        }
        
        @keyframes titlePhaseFadeOut {
          to {
            opacity: 0;
            transform: scale(0.97);
          }
        }
        
        /* ========================================
           STAT SENTENCE FADE UP (at 4s = 0.5s after phase change)
           ======================================== */
        .intro-stat {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-size: 2.8vw;
          line-height: 1.5;
          text-align: center;
          max-width: 900px;
          padding: 0 48px;
          opacity: 0;
          transform: translateY(40px);
          filter: blur(4px);
          animation: statFadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
        }
        
        @keyframes statFadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        
        /* Teal numbers animate separately, 0.3s after text starts (0.8s total delay) */
        .stat-number {
          opacity: 0;
          transform: scale(1.1);
          animation: statNumberPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.8s forwards;
        }
        
        @keyframes statNumberPop {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* ========================================
           STAT FADE OUT (at 7s = 3.5s after phase change)
           ======================================== */
        .stat-fadeout .intro-stat {
          animation: statFadeOut 0.5s ease-out forwards !important;
        }
        
        .stat-fadeout .intro-stat .stat-number {
          animation: statFadeOut 0.5s ease-out forwards !important;
        }
        
        @keyframes statFadeOut {
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
        
        /* ========================================
           SKIP BUTTON
           ======================================== */
        .skip-button {
          position: fixed;
          bottom: 24px;
          right: 32px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          background: none;
          border: none;
          cursor: pointer;
          z-index: 10000;
          transition: color 0.2s ease;
        }
        
        .skip-button:hover {
          color: rgba(255, 255, 255, 0.7);
        }
        
        /* ========================================
           LOADING BAR — fills across intro duration
           ======================================== */
        .intro-loading-bar {
          width: 0%;
          animation: loadingBarFill 7.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes loadingBarFill {
          0%   { width: 0%; }
          40%  { width: 35%; }
          70%  { width: 65%; }
          90%  { width: 85%; }
          100% { width: 100%; }
        }

        /* ========================================
           RESPONSIVE
           ======================================== */
        @media (max-width: 768px) {
          .title-container {
            font-size: 12vw;
            letter-spacing: 0.15em;
          }
          .intro-subtitle {
            font-size: 2.5vw;
          }
          .intro-stat {
            font-size: 5vw;
            padding: 0 24px;
          }
        }
      `}</style>

      {/* Phase 1: Title with letter-by-letter reveal (0-3.5s) */}
      {phase === "title" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="title-sweep-wrapper">
            <h1 className="title-container">
              {TITLE_LETTERS.map((letter, i) => (
                <span key={i} className="title-letter">
                  {letter}
                </span>
              ))}
            </h1>
          </div>
          <p className="intro-subtitle">THE PLANET IN REAL TIME</p>
        </div>
      )}

      {/* Phase 2: Stat sentence with fade-up (3.5s-7s) */}
      {phase === "stat" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p className="intro-stat">{renderStatWithHighlights(selectedStat)}</p>
        </div>
      )}

      {/* Cinematic loading bar — visible line at bottom, fills over the intro duration */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(320px, 60vw)",
          height: "3px",
          borderRadius: "2px",
          zIndex: 10001,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          className="intro-loading-bar"
          style={{
            height: "100%",
            borderRadius: "2px",
            background: "linear-gradient(90deg, #14b8a6, #2dd4bf, #14b8a6)",
            boxShadow: "0 0 16px rgba(20,184,166,0.6), 0 0 4px rgba(20,184,166,0.8)",
          }}
        />
      </div>

      {/* Skip button */}
      {phase !== "fadeout" && (
        <button onClick={handleSkip} className="skip-button">
          Skip
        </button>
      )}
    </div>
  );
}

// Wrapper component that handles first-visit logic and post-intro reveal sequencing
export function CinematicIntroWrapper({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [showReplayLink, setShowReplayLink] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [revealPhase, setRevealPhase] = useState<RevealPhase>("hidden");

  useEffect(() => {
    setMounted(true);
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) {
      setShowReplayLink(true);
      setIntroComplete(true);
      // Returning visitor — skip the sequence, everything visible immediately
      setRevealPhase("content");
    } else {
      setShowIntro(true);
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
    setShowReplayLink(true);

    // Cinematic reveal sequence after intro overlay fades:
    // Phase 1: Globe visible (immediate — it was rendering behind the overlay)
    setRevealPhase("globe");

    // Phase 2: Navbar slides in after 1.5s
    setTimeout(() => setRevealPhase("navbar"), 1500);

    // Phase 3: Content fades in after 3s (audio prompt triggers from here too)
    setTimeout(() => setRevealPhase("content"), 3000);
  }, []);

  const handleReplay = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setShowReplayLink(false);
    setIntroComplete(false);
    setRevealPhase("hidden");
    setReplayKey((prev) => prev + 1);
    setShowIntro(true);
  }, []);

  // Dark overlay until mounted to prevent flash
  if (!mounted) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#0a0e17",
        }}
      />
    );
  }

  return (
    <IntroContext.Provider value={{ showReplayLink, triggerReplay: handleReplay, revealPhase }}>
      {children}
      {/* Always render the intro overlay - it uses visibility:hidden when complete to avoid reflow */}
      {showIntro && (
        <CinematicIntro onComplete={handleIntroComplete} replayKey={replayKey} />
      )}
    </IntroContext.Provider>
  );
}

// Replay link component to be placed in hero section
// Uses visibility:hidden instead of conditional render to prevent layout shift
export function ReplayIntroLink() {
  const { showReplayLink, triggerReplay } = useIntro();

  return (
    <button
      onClick={triggerReplay}
      style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.4)",
        background: "none",
        border: "none",
        cursor: showReplayLink ? "pointer" : "default",
        marginTop: 24,
        transition: "color 0.2s ease, opacity 0.3s ease",
        opacity: showReplayLink ? 1 : 0,
        visibility: showReplayLink ? "visible" : "hidden",
        pointerEvents: showReplayLink ? "auto" : "none",
      }}
      onMouseEnter={(e) => showReplayLink && (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
      onMouseLeave={(e) => showReplayLink && (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
      tabIndex={showReplayLink ? 0 : -1}
      aria-hidden={!showReplayLink}
    >
      Replay Intro
    </button>
  );
}
