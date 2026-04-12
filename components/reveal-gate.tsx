"use client";

import React from "react";
import { useIntro, type RevealPhase } from "@/components/cinematic-intro";

// Wrapper that reads reveal phase from inside the CinematicIntroWrapper provider
// and applies cinematic fade/slide transitions to its children
export function RevealGate({ phase, children, style }: {
  phase: "globe" | "navbar" | "content";
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const { revealPhase } = useIntro();
  const phaseOrder: RevealPhase[] = ["hidden", "globe", "navbar", "content"];
  const currentIdx = phaseOrder.indexOf(revealPhase);
  const targetIdx = phaseOrder.indexOf(phase);
  const visible = currentIdx >= targetIdx;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 1s ease, transform 1s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Wrapper specifically for the globe — scale-up + fade
export function GlobeRevealGate({ children }: { children: React.ReactNode }) {
  const { revealPhase } = useIntro();
  const visible = revealPhase !== "hidden";
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.95)",
        transition: "opacity 1.5s ease, transform 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}
