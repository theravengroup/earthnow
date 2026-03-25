// Pre-computed star positions (completely deterministic to avoid hydration mismatch)
const STATIC_STARS: Array<{ x: number; y: number; size: number; dur: number; del: number }> = [
  { x: 12, y: 8, size: 1, dur: 3.2, del: 0.5 }, { x: 87, y: 15, size: 2, dur: 4.1, del: 1.2 },
  { x: 34, y: 23, size: 1, dur: 2.8, del: 2.1 }, { x: 56, y: 5, size: 1, dur: 3.5, del: 0.3 },
  { x: 78, y: 42, size: 2, dur: 4.5, del: 1.8 }, { x: 23, y: 67, size: 1, dur: 3.1, del: 2.5 },
  { x: 91, y: 33, size: 1, dur: 2.9, del: 0.8 }, { x: 45, y: 89, size: 2, dur: 4.2, del: 1.5 },
  { x: 67, y: 56, size: 1, dur: 3.7, del: 2.2 }, { x: 8, y: 45, size: 1, dur: 3.3, del: 0.9 },
  { x: 52, y: 12, size: 2, dur: 4.0, del: 1.1 }, { x: 29, y: 78, size: 1, dur: 2.7, del: 2.8 },
  { x: 83, y: 61, size: 1, dur: 3.6, del: 0.4 }, { x: 16, y: 34, size: 2, dur: 4.3, del: 1.9 },
  { x: 71, y: 87, size: 1, dur: 3.0, del: 2.4 }, { x: 38, y: 51, size: 1, dur: 3.4, del: 0.7 },
  { x: 94, y: 19, size: 2, dur: 4.4, del: 1.3 }, { x: 5, y: 72, size: 1, dur: 2.6, del: 2.9 },
  { x: 61, y: 38, size: 1, dur: 3.8, del: 0.6 }, { x: 42, y: 95, size: 2, dur: 4.1, del: 1.7 },
  { x: 19, y: 16, size: 1, dur: 3.2, del: 2.3 }, { x: 76, y: 74, size: 1, dur: 2.8, del: 0.2 },
  { x: 33, y: 29, size: 2, dur: 4.5, del: 1.4 }, { x: 88, y: 48, size: 1, dur: 3.5, del: 2.6 },
  { x: 14, y: 83, size: 1, dur: 3.1, del: 0.8 }, { x: 59, y: 21, size: 2, dur: 4.0, del: 1.6 },
  { x: 47, y: 63, size: 1, dur: 2.9, del: 2.0 }, { x: 82, y: 7, size: 1, dur: 3.7, del: 0.5 },
  { x: 26, y: 91, size: 2, dur: 4.2, del: 1.2 }, { x: 68, y: 36, size: 1, dur: 3.3, del: 2.7 },
  { x: 3, y: 58, size: 1, dur: 2.7, del: 0.3 }, { x: 54, y: 79, size: 2, dur: 4.3, del: 1.8 },
  { x: 39, y: 11, size: 1, dur: 3.0, del: 2.2 }, { x: 96, y: 67, size: 1, dur: 3.6, del: 0.9 },
  { x: 21, y: 44, size: 2, dur: 4.4, del: 1.5 }, { x: 73, y: 25, size: 1, dur: 2.6, del: 2.4 },
  { x: 11, y: 52, size: 1, dur: 3.4, del: 0.7 }, { x: 64, y: 93, size: 2, dur: 4.1, del: 1.1 },
  { x: 48, y: 31, size: 1, dur: 3.8, del: 2.8 }, { x: 85, y: 69, size: 1, dur: 2.8, del: 0.4 },
  { x: 31, y: 85, size: 2, dur: 4.5, del: 1.9 }, { x: 57, y: 17, size: 1, dur: 3.2, del: 2.5 },
  { x: 79, y: 54, size: 1, dur: 3.5, del: 0.6 }, { x: 7, y: 39, size: 2, dur: 4.0, del: 1.3 },
  { x: 43, y: 76, size: 1, dur: 2.9, del: 2.1 }, { x: 92, y: 13, size: 1, dur: 3.1, del: 0.2 },
  { x: 18, y: 61, size: 2, dur: 4.2, del: 1.7 }, { x: 66, y: 47, size: 1, dur: 3.7, del: 2.9 },
  { x: 35, y: 3, size: 1, dur: 2.7, del: 0.8 }, { x: 89, y: 82, size: 2, dur: 4.3, del: 1.4 },
];

// Star Field Component with individual twinkling stars
export function StarField() {
  return (
    <div className="star-field pointer-events-none" style={{ zIndex: 0 }}>
      {STATIC_STARS.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.dur}s`,
            animationDelay: `${star.del}s`,
          }}
        />
      ))}
    </div>
  );
}
