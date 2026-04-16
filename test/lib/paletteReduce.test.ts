import { describe, it, expect, beforeEach } from "vitest";
import { selectBestPaletteSubset } from "@/lib/paletteReduce";
import { testPalette, RED, GREEN, BLUE } from "../fixtures";

describe("selectBestPaletteSubset", () => {
  beforeEach(() => {
    // k-means++ uses Math.random; seed it for determinism.
    let seed = 42;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    Math.random = rng;
  });

  it("returns the full palette when maxColors >= palette size", () => {
    const out = selectBestPaletteSubset([[[100, 100, 100]]], testPalette, 10);
    expect(out).toBe(testPalette.colors);
  });

  it("picks exactly maxColors-or-fewer distinct colors", () => {
    const pixels: [number, number, number][][] = [
      [RED.rgb, RED.rgb, GREEN.rgb],
      [BLUE.rgb, GREEN.rgb, BLUE.rgb],
    ];
    const out = selectBestPaletteSubset(pixels, testPalette, 3);
    expect(out.length).toBeLessThanOrEqual(3);
    expect(new Set(out.map((c) => c.id)).size).toBe(out.length);
  });

  it("prefers R/G/B from the palette when the image is pure R/G/B", () => {
    const pixels: [number, number, number][][] = Array.from(
      { length: 6 },
      (_, y) =>
        Array.from({ length: 6 }, (_, x): [number, number, number] => {
          const mod = (y + x) % 3;
          return mod === 0 ? RED.rgb : mod === 1 ? GREEN.rgb : BLUE.rgb;
        }),
    );
    const out = selectBestPaletteSubset(pixels, testPalette, 3);
    const ids = new Set(out.map((c) => c.id));
    expect(ids.has("r")).toBe(true);
    expect(ids.has("g")).toBe(true);
    expect(ids.has("b")).toBe(true);
  });
});
