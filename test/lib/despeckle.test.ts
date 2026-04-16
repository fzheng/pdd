import { describe, it, expect } from "vitest";
import { despecklePattern } from "@/lib/despeckle";
import { patternFrom, cellIds, WHITE, RED, BLACK } from "../fixtures";

/**
 * Background = most common bead color in the pattern. The despeckle
 * algorithm only removes small non-background components that are
 * *completely surrounded* by the exterior (wraparound) background set.
 */
describe("despecklePattern", () => {
  it("threshold <= 0 is a no-op", () => {
    const p = patternFrom([
      [WHITE, WHITE, RED],
      [WHITE, WHITE, WHITE],
      [WHITE, WHITE, WHITE],
    ]);
    expect(despecklePattern(p, { threshold: 0 })).toBe(p);
  });

  it("removes a single stray bead in an all-exterior region", () => {
    const p = patternFrom([
      [WHITE, WHITE, WHITE, WHITE],
      [WHITE, RED, WHITE, WHITE],
      [WHITE, WHITE, WHITE, WHITE],
      [WHITE, WHITE, WHITE, WHITE],
    ]);
    const cleaned = despecklePattern(p, { threshold: 3 });
    expect(cellIds(cleaned)).toEqual([
      ["w", "w", "w", "w"],
      ["w", "w", "w", "w"],
      ["w", "w", "w", "w"],
      ["w", "w", "w", "w"],
    ]);
  });

  it("preserves components at or above the size threshold", () => {
    const p = patternFrom([
      [WHITE, WHITE, WHITE, WHITE],
      [WHITE, RED, RED, WHITE],
      [WHITE, RED, RED, WHITE],
      [WHITE, WHITE, WHITE, WHITE],
    ]);
    // 4-cell red square is ≥ threshold 4 → kept
    const cleaned = despecklePattern(p, { threshold: 4 });
    expect(cleaned.colorCounts.get("r")?.count).toBe(4);
  });

  it("does NOT remove an 'eye' component adjacent to the main subject", () => {
    // Outer frame of RED (acts as subject), with a small BLACK "eye"
    // touching the red — should be preserved.
    const p = patternFrom([
      [WHITE, WHITE, WHITE, WHITE, WHITE],
      [WHITE, RED, RED, RED, WHITE],
      [WHITE, RED, BLACK, RED, WHITE],
      [WHITE, RED, RED, RED, WHITE],
      [WHITE, WHITE, WHITE, WHITE, WHITE],
    ]);
    const cleaned = despecklePattern(p, { threshold: 3 });
    expect(cleaned.colorCounts.get("bk")?.count).toBe(1);
  });

  it("returns the input unchanged when the pattern has no cells", () => {
    const empty = patternFrom([]);
    expect(despecklePattern(empty, { threshold: 5 })).toBe(empty);
  });

  it("handles a case where the whole pattern is background", () => {
    const p = patternFrom([
      [WHITE, WHITE],
      [WHITE, WHITE],
    ]);
    const cleaned = despecklePattern(p, { threshold: 4 });
    expect(cellIds(cleaned)).toEqual(cellIds(p));
  });
});
