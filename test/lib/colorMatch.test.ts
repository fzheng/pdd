import { describe, it, expect } from "vitest";
import {
  preparePalette,
  prepareFromColors,
  findNearestColor,
} from "@/lib/colorMatch";
import { testPalette, RED, BLUE, WHITE, BLACK } from "../fixtures";

describe("preparePalette / prepareFromColors", () => {
  it("preserves palette order", () => {
    const p = preparePalette(testPalette);
    expect(p.colors).toHaveLength(testPalette.colors.length);
    expect(p.colors[0].id).toBe(testPalette.colors[0].id);
  });

  it("stores one Lab value per color", () => {
    const p = preparePalette(testPalette);
    expect(p.labValues).toHaveLength(p.colors.length);
    for (const lab of p.labValues) {
      expect(Number.isFinite(lab.L)).toBe(true);
    }
  });

  it("prepareFromColors works with an arbitrary subset", () => {
    const p = prepareFromColors([RED, BLUE]);
    expect(p.colors.map((c) => c.id)).toEqual(["r", "b"]);
    expect(p.labValues).toHaveLength(2);
  });
});

describe("findNearestColor", () => {
  const prepared = preparePalette(testPalette);

  it.each([
    ["rgb-euclidean", 250, 5, 5, "r"],
    ["cielab-euclidean", 250, 5, 5, "r"],
    ["ciede2000", 250, 5, 5, "r"],
    ["rgb-euclidean", 5, 250, 5, "g"],
    ["cielab-euclidean", 5, 250, 5, "g"],
    ["ciede2000", 5, 250, 5, "g"],
    ["rgb-euclidean", 5, 5, 250, "b"],
    ["rgb-euclidean", 250, 250, 250, "w"],
    ["rgb-euclidean", 5, 5, 5, "bk"],
  ] as const)(
    "with %s finds nearest to (%i,%i,%i) → %s",
    (algo, r, g, b, expectedId) => {
      expect(findNearestColor(r, g, b, prepared, algo).id).toBe(expectedId);
    },
  );

  it("clamps out-of-range inputs gracefully (Lab path)", () => {
    const c = findNearestColor(-10, 400, 128, prepared, "cielab-euclidean");
    expect(c).toBeDefined();
    // Should round / clamp internally; green-ish should win
    expect(["g", "w", "gy"]).toContain(c.id);
  });

  it("returns a deterministic first-match when multiple colors tie", () => {
    const same = prepareFromColors([WHITE, WHITE, BLACK]);
    // The first WHITE in the array should be returned (bestIndex starts at 0)
    const nearest = findNearestColor(255, 255, 255, same, "rgb-euclidean");
    expect(nearest).toBe(same.colors[0]);
  });
});
