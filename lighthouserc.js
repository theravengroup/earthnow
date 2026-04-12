module.exports = {
  ci: {
    collect: {
      // Build and serve the production app
      startServerCommand: "npx next start -p 3456",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 30000,
      url: ["http://localhost:3456/"],
      numberOfRuns: 3,
      settings: {
        // Use mobile preset (default) for stricter perf budgets
        preset: "desktop",
        // Throttling for realistic conditions
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        // Performance — warn at 60, fail at 40
        "categories:performance": ["warn", { minScore: 0.6 }],
        // Accessibility — warn at 80, fail at 70
        "categories:accessibility": ["warn", { minScore: 0.8 }],
        // Best practices — warn at 80
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        // SEO — warn at 80
        "categories:seo": ["warn", { minScore: 0.8 }],
        // Core Web Vitals
        "largest-contentful-paint": ["warn", { maxNumericValue: 4000 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.25 }],
        "total-blocking-time": ["warn", { maxNumericValue: 600 }],
      },
    },
    upload: {
      // Store results locally (no external server needed)
      target: "temporary-public-storage",
    },
  },
};
