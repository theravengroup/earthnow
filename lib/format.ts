// Format large numbers with abbreviations (K, M, B, T)
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
