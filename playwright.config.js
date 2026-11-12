import { defineConfig } from "@playwright/test";

const baseURL = "http://localhost:5174";

export default defineConfig({
  testDir: "./tests",
 use: {
  baseURL,
  browserName: "chromium",
  launchOptions: {
    slowMo: 1500,
  },
},
  webServer: {
    command: "npm run dev -- --port 5174 --strictPort",
    url: baseURL,
    reuseExistingServer: true,
  },
});