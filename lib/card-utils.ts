import { formatNumber } from "@/lib/format";

/** Format a metric value for card display */
export function formatCardValue(
  value: number,
  opts: {
    staticValue?: number;
    useAbbreviated?: boolean;
    decimalPlaces?: number;
    prefix?: string;
  }
): string {
  const { staticValue, useAbbreviated, decimalPlaces, prefix = "" } = opts;
  let formatted: string;
  if (staticValue !== undefined && useAbbreviated) {
    formatted = formatNumber(staticValue);
  } else if (decimalPlaces !== undefined) {
    formatted = value.toFixed(decimalPlaces);
  } else if (useAbbreviated) {
    formatted = formatNumber(value);
  } else {
    formatted = Math.floor(value).toLocaleString();
  }
  return prefix ? `${prefix}${formatted}` : formatted;
}

/** Format rate-per-second as a human-readable "/min" display */
export function formatRatePerMinute(
  ratePerSecond: number,
  prefix = ""
): string {
  const rpm = ratePerSecond * 60;
  const formatted =
    rpm >= 1_000_000_000_000
      ? `${(rpm / 1_000_000_000_000).toFixed(1)}T`
      : rpm >= 1_000_000_000
        ? `${(rpm / 1_000_000_000).toFixed(1)}B`
        : rpm >= 1_000_000
          ? `${(rpm / 1_000_000).toFixed(1)}M`
          : rpm >= 1_000
            ? `${(rpm / 1_000).toFixed(1)}K`
            : rpm >= 1
              ? Math.floor(rpm).toLocaleString()
              : rpm.toFixed(2);
  return prefix ? `${prefix}${formatted}` : formatted;
}
