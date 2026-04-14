import { PipelineSettings, BeadPattern, PatternCell, BeadColor } from "@/types";
import { downsampleImage, mirrorPixelGrid } from "./imageUtils";
import { preparePalette, prepareFromColors, findNearestColor } from "./colorMatch";
import { applyDithering } from "./dithering";
import { selectBestPaletteSubset } from "./paletteReduce";

/** Build a pattern from a 2D grid of matched bead colors. */
export function buildPatternFromCells(
  matched: BeadColor[][],
): BeadPattern {
  const height = matched.length;
  const width = matched[0]?.length ?? 0;
  const cells: PatternCell[][] = [];
  const colorCounts = new Map<string, { color: BeadColor; count: number }>();

  for (let y = 0; y < height; y++) {
    cells[y] = [];
    for (let x = 0; x < width; x++) {
      const beadColor = matched[y][x];
      cells[y][x] = { row: y, col: x, beadColor };
      const existing = colorCounts.get(beadColor.id);
      if (existing) existing.count++;
      else colorCounts.set(beadColor.id, { color: beadColor, count: 1 });
    }
  }

  return { width, height, cells, colorCounts };
}

/** Run the complete image-to-bead-pattern pipeline */
export function generatePattern(
  img: HTMLImageElement,
  settings: PipelineSettings,
): BeadPattern {
  const {
    gridWidth,
    gridHeight,
    palette,
    algorithm,
    dithering,
    maxColors,
    mirror,
    saturation,
  } = settings;

  // 1. Downsample image (gamma-correct, optional saturation)
  let pixelData = downsampleImage(img, gridWidth, gridHeight, {
    saturationBoost: saturation,
  });
  if (mirror) pixelData = mirrorPixelGrid(pixelData);

  // 2. Optionally reduce palette via k-means on this image
  const activeColors =
    maxColors > 0 && maxColors < palette.colors.length
      ? selectBestPaletteSubset(pixelData, palette, maxColors)
      : palette.colors;

  // 3. Prepare palette (precompute Lab values)
  const prepared =
    activeColors === palette.colors
      ? preparePalette(palette)
      : prepareFromColors(activeColors);

  // 4. Quantize (dithering or nearest-neighbor)
  const matched = applyDithering(pixelData, prepared, algorithm, dithering);

  // 5. Build result
  return buildPatternFromCells(matched);
}

/** Replace all cells of one color with another and rebuild counts */
export function replaceColor(
  pattern: BeadPattern,
  fromId: string,
  to: BeadColor,
): BeadPattern {
  const newCells: BeadColor[][] = pattern.cells.map((row) =>
    row.map((cell) => (cell.beadColor.id === fromId ? to : cell.beadColor)),
  );
  return buildPatternFromCells(newCells);
}

/** Set a single cell's color and rebuild counts */
export function setCellColor(
  pattern: BeadPattern,
  row: number,
  col: number,
  color: BeadColor,
): BeadPattern {
  const newCells: BeadColor[][] = pattern.cells.map((r, y) =>
    r.map((cell, x) => (y === row && x === col ? color : cell.beadColor)),
  );
  return buildPatternFromCells(newCells);
}

/** Mirror the pattern horizontally */
export function mirrorPattern(pattern: BeadPattern): BeadPattern {
  const newCells: BeadColor[][] = pattern.cells.map((row) =>
    [...row].reverse().map((c) => c.beadColor),
  );
  return buildPatternFromCells(newCells);
}

// Re-export for convenience
export { findNearestColor, preparePalette };
