// Format large numbers with abbreviations (K, M, B, T).
// K at 1 decimal; M/B/T at 2 decimals. Fallback is locale-formatted int.
export function formatNumber(num: number): string {
  const absNum = Math.floor(Math.abs(num));

  if (absNum >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(2) + "T";
  }
  if (absNum >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + "B";
  }
  if (absNum >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + "M";
  }
  if (absNum >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return Math.floor(num).toLocaleString();
}

// K/M/B/T abbreviation with uniform decimal places (default 1). Use when
// the caller needs a tighter/looser abbreviation than formatNumber's
// K-at-1 / M+-at-2 default.
export function formatAbbreviated(num: number, decimals = 1): string {
  if (num >= 1e12) return (num / 1e12).toFixed(decimals) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(decimals) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(decimals) + "K";
  return Math.floor(num).toLocaleString();
}

// Plain comma-separated number with optional decimals. Use when abbreviation
// (K/M/B/T) is NOT wanted — e.g. live-ticking counters where every digit
// matters visually.
export function formatWithCommas(num: number, decimals = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
