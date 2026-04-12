import { describe, it, expect } from "vitest";
import { formatLargeNumber, formatTime, formatTimeWithUnit, PER_SECOND_RATES } from "@/lib/canvas/generate-share-card";

describe("formatLargeNumber", () => {
  it("formats billions", () => {
    expect(formatLargeNumber(8_100_000_000)).toBe("8.1B");
  });

  it("formats millions", () => {
    expect(formatLargeNumber(3_500_000)).toBe("3.5M");
  });

  it("formats thousands", () => {
    expect(formatLargeNumber(25_000)).toBe("25.0K");
  });

  it("formats small numbers", () => {
    expect(formatLargeNumber(500)).toBe("500");
  });
});

describe("formatTime", () => {
  it("formats seconds only", () => {
    expect(formatTime(45)).toBe("0:45");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(125)).toBe("2:05");
  });

  it("formats hours, minutes, and seconds", () => {
    expect(formatTime(3665)).toBe("1:01:05");
  });

  it("handles zero", () => {
    expect(formatTime(0)).toBe("0:00");
  });
});

describe("formatTimeWithUnit", () => {
  it("returns seconds for < 60s", () => {
    expect(formatTimeWithUnit(30)).toEqual({ value: "30", unit: "seconds" });
  });

  it("returns singular second", () => {
    expect(formatTimeWithUnit(1)).toEqual({ value: "1", unit: "second" });
  });

  it("returns minutes for < 3600s", () => {
    expect(formatTimeWithUnit(120)).toEqual({ value: "2", unit: "minutes" });
  });

  it("returns singular minute", () => {
    expect(formatTimeWithUnit(60)).toEqual({ value: "1", unit: "minute" });
  });

  it("returns hours for >= 3600s", () => {
    expect(formatTimeWithUnit(3665)).toEqual({ value: "1:01", unit: "hours" });
  });
});

describe("PER_SECOND_RATES", () => {
  it("has all required rate keys", () => {
    expect(PER_SECOND_RATES).toHaveProperty("births");
    expect(PER_SECOND_RATES).toHaveProperty("deaths");
    expect(PER_SECOND_RATES).toHaveProperty("co2");
    expect(PER_SECOND_RATES).toHaveProperty("treesLost");
    expect(PER_SECOND_RATES).toHaveProperty("energyUsed");
  });

  it("all rates are positive numbers", () => {
    for (const [key, value] of Object.entries(PER_SECOND_RATES)) {
      expect(value, `${key} should be positive`).toBeGreaterThan(0);
    }
  });
});
