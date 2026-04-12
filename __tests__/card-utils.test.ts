import { describe, it, expect } from "vitest";
import { formatCardValue, formatRatePerMinute } from "@/lib/card-utils";

describe("formatCardValue", () => {
  it("formats with abbreviation when staticValue + useAbbreviated", () => {
    expect(formatCardValue(0, { staticValue: 700_000_000, useAbbreviated: true })).toBe("700.00M");
  });

  it("formats with decimal places", () => {
    expect(formatCardValue(3.14159, { decimalPlaces: 2 })).toBe("3.14");
    expect(formatCardValue(100.5, { decimalPlaces: 0 })).toBe("101");
  });

  it("formats abbreviated dynamic values", () => {
    expect(formatCardValue(5_000_000, { useAbbreviated: true })).toBe("5.00M");
  });

  it("formats plain numbers with locale separators", () => {
    expect(formatCardValue(12345.7, {})).toBe("12,345");
  });

  it("prepends prefix", () => {
    expect(formatCardValue(5000, { prefix: "$" })).toBe("$5,000");
    expect(formatCardValue(5_000_000, { prefix: "$", useAbbreviated: true })).toBe("$5.00M");
  });

  it("handles zero", () => {
    expect(formatCardValue(0, {})).toBe("0");
  });
});

describe("formatRatePerMinute", () => {
  it("formats trillions per minute", () => {
    // 20B/sec = 1.2T/min
    expect(formatRatePerMinute(20_000_000_000)).toBe("1.2T");
  });

  it("formats billions per minute", () => {
    // 100M/sec = 6B/min
    expect(formatRatePerMinute(100_000_000)).toBe("6.0B");
  });

  it("formats millions per minute", () => {
    // 100K/sec = 6M/min
    expect(formatRatePerMinute(100_000)).toBe("6.0M");
  });

  it("formats thousands per minute", () => {
    // 1000/sec = 60K/min
    expect(formatRatePerMinute(1000)).toBe("60.0K");
  });

  it("formats small whole rates", () => {
    // 4.4/sec = 264/min
    expect(formatRatePerMinute(4.4)).toBe("264");
  });

  it("formats sub-1 rates with decimals", () => {
    // 0.01/sec = 0.6/min
    expect(formatRatePerMinute(0.01)).toBe("0.60");
  });

  it("prepends prefix", () => {
    expect(formatRatePerMinute(1000, "$")).toBe("$60.0K");
  });
});
