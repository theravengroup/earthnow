"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIntro } from "./cinematic-intro";

const STORAGE_KEY = "earthnow-ambient-audio";

export function AmbientAudio() {
  const { revealPhase } = useIntro();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);
  const engineRef = useRef<typeof import("@/lib/ambient-engine") | null>(null);
  const initedRef = useRef(false);

  // Reset prompt state when intro replays (revealPhase goes back to "hidden")
  useEffect(() => {
    if (revealPhase === "hidden") {
      setPromptDismissed(false);
      setShowPrompt(false);
    }
  }, [revealPhase]);

  // Show the floating prompt once reveal sequence reaches "content" phase
  useEffect(() => {
    if (promptDismissed) return;
    if (revealPhase !== "content") return;
    const timer = setTimeout(() => setShowPrompt(true), 1500);
    return () => clearTimeout(timer);
  }, [revealPhase, promptDismissed]);

  const loadEngine = useCallback(async () => {
    if (!engineRef.current) {
      engineRef.current = await import("@/lib/ambient-engine");
    }
    return engineRef.current;
  }, []);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    setPromptDismissed(true);
  }, []);

  const toggle = useCallback(async () => {
    const engine = await loadEngine();

    if (!initedRef.current) {
      await engine.initAmbient();
      initedRef.current = true;
    }

    if (engine.isPlaying()) {
      engine.fadeOut(3000);
      setIsPlaying(false);
      localStorage.setItem(STORAGE_KEY, "off");
    } else {
      engine.fadeIn(4000);
      setIsPlaying(true);
      localStorage.setItem(STORAGE_KEY, "on");
    }

    // Dismiss the prompt if it's still showing
    dismissPrompt();
  }, [loadEngine, dismissPrompt]);

  const handlePromptYes = useCallback(async () => {
    dismissPrompt();
    const engine = await loadEngine();
    if (!initedRef.current) {
      await engine.initAmbient();
      initedRef.current = true;
    }
    engine.fadeIn(4000);
    setIsPlaying(true);
    localStorage.setItem(STORAGE_KEY, "on");
  }, [loadEngine, dismissPrompt]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="relative flex items-center">
      {/* Floating prompt — stays until user clicks Listen or X */}
      <AnimatePresence>
        {showPrompt && !promptDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute top-full mt-5 flex flex-col items-end"
            style={{ zIndex: 1001, right: "-4px" }}
          >
            {/* Curved arrow pointing up at the speaker icon */}
            <svg
              width="24"
              height="18"
              viewBox="0 0 24 18"
              fill="none"
              className="-mb-1 mr-[2px]"
            >
              <path
                d="M9 6 L12 2 L15 6"
                stroke="#14b8a6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M12 2 C12 10, 8 14, 2 16"
                stroke="#14b8a6"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            {/* Pill with X dismiss */}
            <div className="flex items-center gap-0 rounded-full" style={{ background: "#14b8a6" }}>
              <button
                onClick={handlePromptYes}
                className="cursor-pointer whitespace-nowrap rounded-l-full font-serif text-[15px] tracking-wide text-white transition-opacity duration-300 hover:opacity-80"
                style={{ padding: "8px 4px 8px 20px" }}
              >
                Listen to Earth?
              </button>
              <button
                onClick={dismissPrompt}
                aria-label="Dismiss"
                className="cursor-pointer rounded-r-full text-white/60 transition-colors duration-200 hover:text-white"
                style={{ padding: "8px 12px 8px 4px" }}
              >
                <X style={{ width: "14px", height: "14px" }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speaker icon */}
      <button
        onClick={toggle}
        aria-label={isPlaying ? "Mute ambient audio" : "Play ambient audio"}
        className="group relative flex items-center justify-center rounded-full transition-all duration-300"
        style={{
          width: "32px",
          height: "32px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {isPlaying ? (
          <Volume2
            className="transition-colors duration-200"
            style={{ color: "#14b8a6", width: "17px", height: "17px" }}
          />
        ) : (
          <VolumeX
            className="transition-colors duration-200"
            style={{ color: "#64748b", width: "17px", height: "17px" }}
          />
        )}

        {/* Subtle pulse ring when playing */}
        {isPlaying && (
          <span
            className="absolute inset-0 animate-ping rounded-full"
            style={{
              background: "rgba(20,184,166,0.15)",
              animationDuration: "3s",
            }}
          />
        )}
      </button>
    </div>
  );
}
