import { PipelineSettings, BeadPattern, PatternCell, BeadColor } from "@/types";
import { downsampleImage } from "./imageUtils";
import { preparePalette, findNearestColor } from "./colorMatch";
import { applyFloydSteinbergDithering } from "./dithering";

/** Run the complete image-to-bead-pattern pipeline */
export function generatePattern(
  img: HTMLImageElement,
  settings: PipelineSettings,
): BeadPattern {
  const { gridWidth, gridHeight, palette, algorithm, ditheringEnabled } = settings;

  // 1. Downsample image to grid dimensions
  const pixelData = downsampleImage(img, gridWidth, gridHeight);

  // 2. Prepare palette (precompute Lab values)
  const prepared = preparePalette(palette);

  // 3. Quantize colors
  let matchedColors: BeadColor[][];
  if (ditheringEnabled) {
    matchedColors = applyFloydSteinbergDithering(pixelData, prepared, algorithm);
  } else {
    matchedColors = [];
    for (let y = 0; y < gridHeight; y++) {
      matchedColors[y] = [];
      for (let x = 0; x < gridWidth; x++) {
        const [r, g, b] = pixelData[y][x];
        matchedColors[y][x] = findNearestColor(r, g, b, prepared, algorithm);
      }
    }
  }

  // 4. Build pattern cells and color counts
  const cells: PatternCell[][] = [];
  const colorCounts = new Map<string, { color: BeadColor; count: number }>();

  for (let y = 0; y < gridHeight; y++) {
    cells[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      const beadColor = matchedColors[y][x];
      cells[y][x] = { row: y, col: x, beadColor };

      const existing = colorCounts.get(beadColor.id);
      if (existing) {
        existing.count++;
      } else {
        colorCounts.set(beadColor.id, { color: beadColor, count: 1 });
      }
    }
  }

  return { width: gridWidth, height: gridHeight, cells, colorCounts };
}
