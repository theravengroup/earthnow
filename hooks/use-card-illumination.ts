import { useState, useRef, useEffect } from "react";

/**
 * Scroll-triggered "power on" — element illuminates when it enters the viewport.
 * Staggered by index (120ms per card) for a cascading reveal effect.
 */
export function useCardIllumination(index: number) {
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const delay = index * 120;
            setTimeout(() => setIsPoweredOn(true), delay);
            observer.disconnect();
            return;
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 80px 0px" }
    );
    const raf = requestAnimationFrame(() => observer.observe(el));
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [index]);

  return { isPoweredOn, cardRef };
}
