import { defineConfig } from "@playwright/test";

const baseURL = "http://localhost:5174";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL,
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command:
      "npm run dev -- --mode e2e --host localhost --port 5174 --strictPort",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120000,
  },
});