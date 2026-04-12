import { describe, it, expect } from "vitest";
import {
  vitalSignsRow1,
  vitalSignsRow2,
  vitalSignsRow3,
  vitalSignsRow4,
  vitalSignsRow5,
  AI_TOKENS_PER_DAY,
  AI_TOKENS_PER_SECOND,
} from "@/lib/data/vital-signs";
import { CIVILIZATION_SIGNAL_POOL } from "@/lib/data/civilization-signals";
import { heroTickerPairings } from "@/lib/data/hero-ticker";

describe("vital-signs data integrity", () => {
  const allRows = [
    ...vitalSignsRow1,
    ...vitalSignsRow2,
    ...vitalSignsRow3,
    ...vitalSignsRow4,
    ...vitalSignsRow5,
  ];

  it("all metrics have required fields", () => {
    for (const metric of allRows) {
      expect(metric.color, `${metric.label} missing color`).toBeTruthy();
      expect(metric.label, "missing label").toBeTruthy();
      expect(typeof metric.ratePerSecond).toBe("number");
    }
  });

  it("all colors are valid hex", () => {
    for (const metric of allRows) {
      expect(metric.color, `${metric.label} has invalid color`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("AI tokens constants are consistent", () => {
    expect(AI_TOKENS_PER_DAY).toBe(85_000_000_000);
    expect(AI_TOKENS_PER_SECOND).toBeCloseTo(AI_TOKENS_PER_DAY / 86400, 0);
  });

  it("no duplicate labels within a row", () => {
    const rows = [vitalSignsRow1, vitalSignsRow2, vitalSignsRow3, vitalSignsRow4, vitalSignsRow5];
    for (const row of rows) {
      const labels = row.map((m) => m.label);
      expect(new Set(labels).size, `duplicate label in row`).toBe(labels.length);
    }
  });
});

describe("civilization-signals data integrity", () => {
  it("pool is non-empty", () => {
    expect(CIVILIZATION_SIGNAL_POOL.length).toBeGreaterThan(0);
  });

  it("all signals have required fields", () => {
    for (const signal of CIVILIZATION_SIGNAL_POOL) {
      expect(signal.label, "missing label").toBeTruthy();
      expect(signal.color, `${signal.label} missing color`).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(typeof signal.ratePerSecond, `${signal.label} ratePerSecond`).toBe("number");
      expect(["hero", "standard"], `${signal.label} invalid tier`).toContain(signal.tier);
      expect(["positive", "challenging", "neutral"], `${signal.label} invalid sentiment`).toContain(signal.sentiment);
    }
  });

  it("has both positive and challenging signals", () => {
    const sentiments = new Set(CIVILIZATION_SIGNAL_POOL.map((s) => s.sentiment));
    expect(sentiments.has("positive")).toBe(true);
    expect(sentiments.has("challenging")).toBe(true);
  });

  it("has both hero and standard tiers", () => {
    const tiers = new Set(CIVILIZATION_SIGNAL_POOL.map((s) => s.tier));
    expect(tiers.has("hero")).toBe(true);
    expect(tiers.has("standard")).toBe(true);
  });
});

describe("hero-ticker data integrity", () => {
  it("has at least 10 pairings", () => {
    expect(heroTickerPairings.length).toBeGreaterThanOrEqual(10);
  });

  it("all pairings have left and right items", () => {
    for (const pairing of heroTickerPairings) {
      expect(pairing.left.label, "left missing label").toBeTruthy();
      expect(pairing.left.dailyTotal, `${pairing.left.label} missing dailyTotal`).toBeDefined();
      expect(pairing.left.color, `${pairing.left.label} missing color`).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(pairing.right.label, "right missing label").toBeTruthy();
      expect(pairing.right.dailyTotal, `${pairing.right.label} missing dailyTotal`).toBeDefined();
      expect(pairing.right.color, `${pairing.right.label} missing color`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("all dailyTotals are positive", () => {
    for (const pairing of heroTickerPairings) {
      expect(pairing.left.dailyTotal, pairing.left.label).toBeGreaterThan(0);
      expect(pairing.right.dailyTotal, pairing.right.label).toBeGreaterThan(0);
    }
  });

  it("all icons are non-empty strings", () => {
    for (const pairing of heroTickerPairings) {
      expect(pairing.left.icon, `${pairing.left.label} missing icon`).toBeTruthy();
      expect(pairing.right.icon, `${pairing.right.label} missing icon`).toBeTruthy();
    }
  });

  it("baseValue items have small dailyTotals (incremental rate)", () => {
    for (const pairing of heroTickerPairings) {
      for (const item of [pairing.left, pairing.right]) {
        if (item.baseValue !== undefined) {
          // Items with baseValue are cumulative — dailyTotal is the daily increment, not the total
          expect(item.dailyTotal, `${item.label} daily increment should be small relative to base`).toBeLessThan(item.baseValue);
        }
      }
    }
  });
});
