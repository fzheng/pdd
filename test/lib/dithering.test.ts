import { describe, it, expect } from "vitest";
import { applyDithering } from "@/lib/dithering";
import { preparePalette } from "@/lib/colorMatch";
import { testPalette } from "../fixtures";

/**
 * Dithering rounds each pixel to its nearest palette color and propagates
 * the quantization error. The smoke tests below verify the plumbing rather
 * than the aesthetic output of each kernel.
 */
describe("applyDithering", () => {
  const prepared = preparePalette(testPalette);

  it("none — nearest-neighbor only", () => {
    const pixels: [number, number, number][][] = [
      [[250, 10, 5]],
      [[5, 250, 10]],
    ];
    const out = applyDithering(pixels, prepared, "rgb-euclidean", "none");
    expect(out).toHaveLength(2);
    expect(out[0][0].id).toBe("r");
    expect(out[1][0].id).toBe("g");
  });

  it.each([
    "floyd-steinberg",
    "atkinson",
    "stucki",
    "burkes",
    "sierra",
  ] as const)("kernel %s produces a same-shape palette-valid grid", (kernel) => {
    const pixels: [number, number, number][][] = Array.from(
      { length: 5 },
      () => Array.from({ length: 5 }, (): [number, number, number] => [128, 128, 128]),
    );
    const out = applyDithering(pixels, prepared, "rgb-euclidean", kernel);
    expect(out.length).toBe(5);
    expect(out[0].length).toBe(5);
    const paletteIds = new Set(prepared.colors.map((c) => c.id));
    for (const row of out) {
      for (const c of row) {
        expect(paletteIds.has(c.id)).toBe(true);
      }
    }
  });

  it("is deterministic (same input → same output)", () => {
    const pixels: [number, number, number][][] = [
      [
        [200, 100, 50],
        [100, 200, 50],
      ],
      [
        [50, 100, 200],
        [200, 200, 200],
      ],
    ];
    const a = applyDithering(pixels, prepared, "ciede2000", "floyd-steinberg");
    const b = applyDithering(pixels, prepared, "ciede2000", "floyd-steinberg");
    expect(a.map((r) => r.map((c) => c.id))).toEqual(
      b.map((r) => r.map((c) => c.id)),
    );
  });
});
