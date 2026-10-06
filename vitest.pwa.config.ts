import { defineConfig } from "vitest/config";

// Asserts the built output in dist/ - run after `pnpm build`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/pwa/**/*.test.ts"],
  },
});
