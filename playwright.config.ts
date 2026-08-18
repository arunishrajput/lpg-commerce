import { defineConfig } from "@playwright/test";

// E2E tests need a running dev server against a seeded database, and
// browser binaries (`npx playwright install`) — neither is available in
// the sandbox this project was authored in. This config, and the spec in
// tests/e2e, are written to run correctly in a normal environment.
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
