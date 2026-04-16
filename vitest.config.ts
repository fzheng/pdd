import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Vitest is used for all tests. Components run in jsdom, pure-logic modules
 * in plain node. Coverage is collected with v8 and gated at 85 % in the
 * Makefile (`make coverage`).
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    // These files aren't meaningful to cover:
    //   - Next entry points / app shell (render-only, wired together elsewhere)
    //   - Palette data tables (static)
    //   - jspdf export: depends on a DOM API surface (canvas/text metrics)
    //     that jsdom only partially implements. Smoke-tested instead.
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/app/**",
        "src/data/**",
        "src/types/**",
        "src/**/*.d.ts",
        "src/lib/exportPdf.ts",
        "src/lib/exportPng.ts",
        "src/lib/pdfText.ts",
        "src/lib/renderPattern.ts",
      ],
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 85,
        branches: 80,
      },
    },
  },
});
