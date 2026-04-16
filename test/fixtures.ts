/**
 * Shared fixtures for tests. Keeping these here (rather than re-declaring
 * them in each file) makes tests shorter and lets us change the shape of
 * a BeadColor / BeadPattern in one place.
 */

import { BeadColor, BeadPalette, BeadPattern, PatternCell } from "@/types";
import { buildPatternFromCells } from "@/lib/pipeline";

export function color(
  id: string,
  hex: string,
  r: number,
  g: number,
  b: number,
  name = id,
): BeadColor {
  return { id, name, brand: "Test", sku: id.toUpperCase(), hex, rgb: [r, g, b] };
}

export const WHITE = color("w", "#FFFFFF", 255, 255, 255, "White");
export const BLACK = color("bk", "#000000", 0, 0, 0, "Black");
export const RED = color("r", "#FF0000", 255, 0, 0, "Red");
export const GREEN = color("g", "#00FF00", 0, 255, 0, "Green");
export const BLUE = color("b", "#0000FF", 0, 0, 255, "Blue");
export const GREY = color("gy", "#808080", 128, 128, 128, "Grey");

/** Small primary-colours palette for deterministic tests. */
export const testPalette: BeadPalette = {
  brand: "Test",
  colors: [WHITE, BLACK, RED, GREEN, BLUE, GREY],
};

/** Build a BeadPattern from a 2D array of colors. */
export function patternFrom(rows: BeadColor[][]): BeadPattern {
  return buildPatternFromCells(rows);
}

/** Flatten `rows` for quick equality checks on test output. */
export function cellIds(pattern: BeadPattern): string[][] {
  return pattern.cells.map((row: PatternCell[]) => row.map((c) => c.beadColor.id));
}
