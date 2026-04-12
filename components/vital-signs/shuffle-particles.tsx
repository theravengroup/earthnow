"use client";

import { useEffect, useState, useMemo } from "react";

interface Particle {
  id: number;
  x: number; // start % from left
  y: number; // start % from top
  dx: number; // travel X (px)
  dy: number; // travel Y (px)
  size: number;
  color: string;
  delay: number; // stagger ms
  duration: number; // ms
}

const PARTICLE_COLORS = [
  "rgba(20,184,166,0.9)",  // teal
  "rgba(56,189,248,0.8)",  // sky blue
  "rgba(120,255,170,0.7)", // green glow
  "rgba(255,255,255,0.6)", // white
  "rgba(168,85,247,0.5)",  // purple accent
  "rgba(251,191,36,0.5)",  // amber accent
];

const PARTICLE_COUNT = 48;

function generateParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 120;
    particles.push({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 4,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      delay: Math.random() * 150,
      duration: 600 + Math.random() * 600,
    });
  }
  return particles;
}

export function ShuffleParticles({ triggerKey }: { triggerKey: number }) {
  const [active, setActive] = useState(false);
  const particles = useMemo(() => generateParticles(), [triggerKey]);

  useEffect(() => {
    if (triggerKey === 0) return;
    setActive(true);
    const timer = setTimeout(() => setActive(false), 1400);
    return () => clearTimeout(timer);
  }, [triggerKey]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={`${triggerKey}-${p.id}`}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animation: `shuffle-particle ${p.duration}ms ease-out ${p.delay}ms forwards`,
            ['--dx' as string]: `${p.dx}px`,
            ['--dy' as string]: `${p.dy}px`,
          }}
        />
      ))}
    </div>
  );
}
