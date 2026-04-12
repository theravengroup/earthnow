/**
 * Floating dust motes — CSS-only atmospheric particles.
 * 18 slowly drifting semi-transparent dots at different speeds,
 * sizes, and opacities to create parallax depth.
 * Pure CSS animations — no JS runtime cost.
 */

const motes = [
  { size: 2, x: 5,  y: 10, dur: 38, delay: 0,   opacity: 0.15, drift: 30  },
  { size: 3, x: 15, y: 80, dur: 44, delay: -12,  opacity: 0.1,  drift: -20 },
  { size: 1, x: 25, y: 30, dur: 52, delay: -5,   opacity: 0.2,  drift: 15  },
  { size: 2, x: 35, y: 60, dur: 36, delay: -20,  opacity: 0.12, drift: -25 },
  { size: 4, x: 45, y: 15, dur: 48, delay: -8,   opacity: 0.07, drift: 35  },
  { size: 2, x: 55, y: 70, dur: 42, delay: -15,  opacity: 0.15, drift: -18 },
  { size: 1, x: 65, y: 40, dur: 56, delay: -3,   opacity: 0.25, drift: 22  },
  { size: 3, x: 75, y: 90, dur: 40, delay: -18,  opacity: 0.08, drift: -30 },
  { size: 2, x: 85, y: 20, dur: 46, delay: -10,  opacity: 0.18, drift: 28  },
  { size: 1, x: 92, y: 55, dur: 50, delay: -22,  opacity: 0.14, drift: -12 },
  { size: 3, x: 10, y: 45, dur: 54, delay: -7,   opacity: 0.06, drift: 20  },
  { size: 2, x: 30, y: 85, dur: 39, delay: -14,  opacity: 0.12, drift: -22 },
  { size: 1, x: 50, y: 5,  dur: 58, delay: -2,   opacity: 0.22, drift: 16  },
  { size: 2, x: 70, y: 50, dur: 43, delay: -16,  opacity: 0.1,  drift: -28 },
  { size: 4, x: 20, y: 65, dur: 47, delay: -9,   opacity: 0.05, drift: 32  },
  { size: 1, x: 60, y: 25, dur: 51, delay: -19,  opacity: 0.2,  drift: -14 },
  { size: 2, x: 80, y: 75, dur: 37, delay: -6,   opacity: 0.13, drift: 24  },
  { size: 3, x: 40, y: 35, dur: 55, delay: -11,  opacity: 0.09, drift: -26 },
];

export function DustMotes() {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 999 }}
      aria-hidden="true"
    >
      {motes.map((m, i) => (
        <div
          key={i}
          className="absolute rounded-full dust-mote"
          style={{
            width: `${m.size}px`,
            height: `${m.size}px`,
            left: `${m.x}%`,
            top: `${m.y}%`,
            background: "rgba(255,255,255,1)",
            opacity: m.opacity,
            animationDuration: `${m.dur}s`,
            animationDelay: `${m.delay}s`,
            // @ts-expect-error CSS custom property for per-mote drift
            "--drift": `${m.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
