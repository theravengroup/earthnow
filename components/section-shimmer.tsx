"use client";

import { useEffect, useId, useRef } from "react";

interface SectionShimmerProps {
  tone?: "teal" | "amber" | "violet";
  height?: number;
}

export function SectionShimmer({ tone = "teal", height = 72 }: SectionShimmerProps) {
  const rawId = useId();
  const filterId = `heat-shimmer-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleAnimRef = useRef<SVGAnimateElement>(null);
  const freqAnimRef = useRef<SVGAnimateElement>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !playedRef.current) {
          playedRef.current = true;
          try {
            scaleAnimRef.current?.beginElement();
            freqAnimRef.current?.beginElement();
          } catch {
            // SMIL not supported — idle gradient still reads as a boundary
          }
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rgb =
    tone === "teal"
      ? "20,184,166"
      : tone === "amber"
        ? "245,158,11"
        : "139,92,246";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none relative w-full overflow-hidden"
      style={{ height }}
    >
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-10%" y="-50%" width="120%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.5"
              numOctaves="2"
              seed="7"
            >
              <animate
                ref={freqAnimRef}
                attributeName="baseFrequency"
                values="0.012 0.4; 0.03 0.8; 0.012 0.4"
                dur="0.2s"
                repeatCount="1"
                begin="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="0">
              <animate
                ref={scaleAnimRef}
                attributeName="scale"
                values="0; 8; 3; 0"
                dur="0.2s"
                repeatCount="1"
                begin="indefinite"
              />
            </feDisplacementMap>
          </filter>
        </defs>
      </svg>

      <div className="absolute inset-0" style={{ filter: `url(#${filterId})` }}>
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
          style={{
            height: "1px",
            background: `linear-gradient(to right, transparent 0%, rgba(${rgb},0.12) 25%, rgba(${rgb},0.32) 50%, rgba(${rgb},0.12) 75%, transparent 100%)`,
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "60%",
            height: "100%",
            background: `radial-gradient(ellipse at center, rgba(${rgb},0.05) 0%, transparent 65%)`,
          }}
        />
      </div>
    </div>
  );
}
