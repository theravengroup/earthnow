import { describe, it, expect } from "vitest";
import { formatNumber } from "@/lib/format";

describe("formatNumber", () => {
  it("formats trillions", () => {
    expect(formatNumber(1_500_000_000_000)).toBe("1.50T");
    expect(formatNumber(2_000_000_000_000)).toBe("2.00T");
  });

  it("formats billions", () => {
    expect(formatNumber(8_100_000_000)).toBe("8.10B");
    expect(formatNumber(1_000_000_000)).toBe("1.00B");
  });

  it("formats millions", () => {
    expect(formatNumber(3_500_000)).toBe("3.50M");
    expect(formatNumber(1_000_000)).toBe("1.00M");
  });

  it("formats thousands", () => {
    expect(formatNumber(25_000)).toBe("25.0K");
    expect(formatNumber(1_000)).toBe("1.0K");
  });

  it("formats small numbers without abbreviation", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(42)).toBe("42");
    expect(formatNumber(0)).toBe("0");
  });

  it("floors fractional small numbers", () => {
    expect(formatNumber(42.7)).toBe("42");
  });

  it("handles negative numbers using absolute value for thresholds", () => {
    // formatNumber uses Math.abs for threshold checks
    expect(formatNumber(-5_000_000)).toBe("-5.00M");
  });
});
