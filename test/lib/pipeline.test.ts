import { describe, it, expect } from "vitest";
import {
  buildPatternFromCells,
  setCellColor,
  replaceColor,
  mirrorPattern,
} from "@/lib/pipeline";
import {
  WHITE,
  BLACK,
  RED,
  GREEN,
  BLUE,
  patternFrom,
  cellIds,
} from "../fixtures";

describe("buildPatternFromCells", () => {
  it("derives width/height from the 2D array", () => {
    const p = patternFrom([
      [WHITE, BLACK, RED],
      [GREEN, BLUE, WHITE],
    ]);
    expect(p.width).toBe(3);
    expect(p.height).toBe(2);
  });

  it("tallies color counts correctly", () => {
    const p = patternFrom([
      [WHITE, WHITE, BLACK],
      [BLACK, WHITE, BLACK],
    ]);
    expect(p.colorCounts.get("w")?.count).toBe(3);
    expect(p.colorCounts.get("bk")?.count).toBe(3);
  });

  it("handles empty rows gracefully", () => {
    const p = buildPatternFromCells([]);
    expect(p.width).toBe(0);
    expect(p.height).toBe(0);
    expect(p.colorCounts.size).toBe(0);
  });

  it("each cell's (row, col) matches its position", () => {
    const p = patternFrom([
      [WHITE, BLACK],
      [RED, GREEN],
    ]);
    expect(p.cells[0][0].row).toBe(0);
    expect(p.cells[0][0].col).toBe(0);
    expect(p.cells[1][1].row).toBe(1);
    expect(p.cells[1][1].col).toBe(1);
  });
});

describe("setCellColor", () => {
  it("replaces only the target cell", () => {
    const p = patternFrom([
      [WHITE, WHITE],
      [WHITE, WHITE],
    ]);
    const next = setCellColor(p, 1, 0, RED);
    expect(cellIds(next)).toEqual([
      ["w", "w"],
      ["r", "w"],
    ]);
  });

  it("updates color counts", () => {
    const p = patternFrom([[WHITE, WHITE]]);
    const next = setCellColor(p, 0, 0, BLACK);
    expect(next.colorCounts.get("w")?.count).toBe(1);
    expect(next.colorCounts.get("bk")?.count).toBe(1);
  });

  it("is a pure function (doesn't mutate input)", () => {
    const p = patternFrom([[WHITE]]);
    setCellColor(p, 0, 0, RED);
    expect(p.cells[0][0].beadColor.id).toBe("w");
  });
});

describe("replaceColor", () => {
  it("replaces ALL cells with matching source id", () => {
    const p = patternFrom([
      [WHITE, BLACK],
      [WHITE, RED],
    ]);
    const next = replaceColor(p, "w", GREEN);
    expect(cellIds(next)).toEqual([
      ["g", "bk"],
      ["g", "r"],
    ]);
  });

  it("drops the source color from counts after full replacement", () => {
    const p = patternFrom([[WHITE, WHITE, WHITE]]);
    const next = replaceColor(p, "w", BLUE);
    expect(next.colorCounts.has("w")).toBe(false);
    expect(next.colorCounts.get("b")?.count).toBe(3);
  });

  it("is a no-op when no cell has the source color", () => {
    const p = patternFrom([[WHITE, BLACK]]);
    const next = replaceColor(p, "nonexistent", RED);
    expect(cellIds(next)).toEqual(cellIds(p));
  });
});

describe("mirrorPattern", () => {
  it("reverses each row horizontally", () => {
    const p = patternFrom([
      [WHITE, BLACK, RED],
      [GREEN, BLUE, WHITE],
    ]);
    const mirrored = mirrorPattern(p);
    expect(cellIds(mirrored)).toEqual([
      ["r", "bk", "w"],
      ["w", "b", "g"],
    ]);
  });

  it("preserves dimensions and color counts", () => {
    const p = patternFrom([[WHITE, BLACK, BLACK]]);
    const m = mirrorPattern(p);
    expect(m.width).toBe(p.width);
    expect(m.colorCounts.get("bk")?.count).toBe(2);
  });

  it("double-mirror is identity", () => {
    const p = patternFrom([
      [WHITE, BLACK, RED, GREEN],
      [BLUE, WHITE, BLACK, RED],
    ]);
    const back = mirrorPattern(mirrorPattern(p));
    expect(cellIds(back)).toEqual(cellIds(p));
  });
});
