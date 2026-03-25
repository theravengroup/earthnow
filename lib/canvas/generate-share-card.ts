// Canvas utility for drawing rounded rectangles
export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Format large numbers with abbreviations
export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return Math.floor(num).toLocaleString();
}

// Format time as mm:ss or hh:mm:ss
export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format time for display with unit
export function formatTimeWithUnit(seconds: number): { value: string; unit: string } {
  if (seconds < 60) return { value: seconds.toString(), unit: seconds === 1 ? 'second' : 'seconds' };
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return { value: mins.toString(), unit: mins === 1 ? 'minute' : 'minutes' };
  }
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return { value: `${hrs}:${mins.toString().padStart(2, '0')}`, unit: 'hours' };
}

// Per-second rates for share card stats
export const PER_SECOND_RATES = {
  births: 4.4,                    // 380,000/day
  deaths: 1.8,                    // 155,000/day
  co2: 1337,                      // 115M tonnes/day = ~1337 kg/s
  treesLost: 0.23,                // 20,000 ha/day ≈ 0.23 ha/s
  energyUsed: 18287,              // 1,580,000,000 MWh/day
  waterUsed: 4340000,             // 375B L/day global
  googleSearches: 98380,          // 8.5B/day
  mealsWasted: 38194,             // 3.3M tonnes × 1000 meals/tonne/day
  photosTaken: 54398,             // 4.7B/day
};

export type ShareMomentState = 'idle' | 'generating' | 'success' | 'error';
