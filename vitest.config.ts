import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Dates are local calendar dates (door 5). Running in UTC-3 makes a UTC slip visible.
process.env.TZ = "America/Sao_Paulo";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
