import { defineConfig, devices } from "@playwright/test";

// Door 3 (exercise-guides): Playwright proves only what jsdom cannot see - applied CSS, layout
// and colour scheme. Everything else stays in Vitest (`pnpm test`).
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: { baseURL: "http://localhost:5173", timezoneId: "America/Sao_Paulo", locale: "pt-BR" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: { command: "pnpm dev --port 5173 --strictPort", url: "http://localhost:5173", reuseExistingServer: !process.env.CI },
});
