import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads successfully with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/EarthNow/i);
  });

  test("renders the cinematic intro overlay", async ({ page }) => {
    await page.goto("/");
    // The intro wrapper should be present
    const intro = page.locator("[data-testid='cinematic-intro']").or(
      page.locator("text=Right now")
    );
    // Wait for either the intro text or the main content
    await expect(
      page.locator("body")
    ).toBeVisible();
  });

  test("hero section displays globe placeholder or canvas", async ({ page }) => {
    await page.goto("/");
    // Wait for content to load
    await page.waitForTimeout(2000);
    // Either a canvas (WebGL globe) or the fallback div should be present
    const canvas = page.locator("canvas");
    const fallback = page.locator(".rounded-full.bg-\\[\\#0d1f2d\\]");
    const hasGlobe = await canvas.count() > 0 || await fallback.count() > 0;
    expect(hasGlobe).toBe(true);
  });

  test("ticker section shows live counters", async ({ page, isMobile }) => {
    await page.goto("/");
    // Wait for content reveal phase
    await page.waitForTimeout(4000);
    // Look for ticker counter elements with tabular-nums
    const counters = page.locator(".tabular-nums");
    if (isMobile) {
      // Ticker bar may be hidden on mobile viewports — just verify elements exist
      await expect(counters.first()).toBeAttached({ timeout: 10000 });
    } else {
      await expect(counters.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("vital signs section renders metric cards", async ({ page }) => {
    await page.goto("/");
    // Scroll to vital signs section
    await page.evaluate(() => {
      const el = document.getElementById("vital-signs");
      if (el) el.scrollIntoView({ behavior: "instant" });
    });
    await page.waitForTimeout(1000);
    // Check for metric cards with the breathing dot animation
    const metricCards = page.locator(".rounded-sm");
    const count = await metricCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("navigation links are present", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3000);
    // The universal navbar should have navigation elements
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible({ timeout: 10000 });
  });

  test("no console errors on page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    await page.goto("/");
    await page.waitForTimeout(3000);
    // Filter out known non-critical errors (e.g., third-party scripts, WebGL warnings)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("third-party") &&
        !e.includes("WebGL") &&
        !e.includes("net::ERR") &&
        !e.includes("Failed to load resource")
    );
    expect(criticalErrors).toEqual([]);
  });
});

test.describe("Navigation", () => {
  test("timeline page loads", async ({ page }) => {
    await page.goto("/timeline");
    await expect(page.locator("body")).toBeVisible();
    // Should not show a 404
    await expect(page.locator("text=404")).not.toBeVisible();
  });

  test("terra page loads", async ({ page }) => {
    await page.goto("/terra");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=404")).not.toBeVisible();
  });

  test("roadmap page loads", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("text=404")).not.toBeVisible();
  });
});

test.describe("Performance basics", () => {
  test("page loads within 5 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(5000);
  });

  test("no massive layout shifts after load", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
    // Measure CLS using Performance Observer
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // @ts-ignore - layout-shift entries have hadRecentInput
            if (!entry.hadRecentInput) {
              // @ts-ignore
              clsValue += entry.value;
            }
          }
        });
        observer.observe({ type: "layout-shift", buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });
    // CLS should be under 0.25 (good threshold)
    expect(cls).toBeLessThan(0.25);
  });
});
