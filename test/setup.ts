import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Auto-unmount React trees between tests so DOM queries are deterministic.
afterEach(() => {
  cleanup();
});

// jsdom's localStorage occasionally fails in component-heavy tests; use a
// minimal in-memory shim that's deterministic and always available.
const store = new Map<string, string>();
const ls = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => {
    store.set(k, String(v));
  },
  removeItem: (k: string) => {
    store.delete(k);
  },
  clear: () => store.clear(),
  key: (i: number) => Array.from(store.keys())[i] ?? null,
  get length() {
    return store.size;
  },
};
Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: ls,
});

// Some components hand a blob URL to <img>; jsdom doesn't implement
// createObjectURL/revokeObjectURL by default.
if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn(() => "blob:mock");
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = vi.fn();
}
