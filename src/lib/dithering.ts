import { BeadColor, ColorMatchAlgorithm } from "@/types";
import { PreparedPalette, findNearestColor } from "./colorMatch";

/**
 * Apply Floyd-Steinberg dithering to a pixel grid.
 * Modifies pixelData in place and returns the matched bead colors.
 */
export function applyFloydSteinbergDithering(
  pixelData: [number, number, number][][],
  prepared: PreparedPalette,
  algorithm: ColorMatchAlgorithm,
): BeadColor[][] {
  const rows = pixelData.length;
  const cols = pixelData[0].length;
  const result: BeadColor[][] = [];

  for (let y = 0; y < rows; y++) {
    result[y] = [];
    for (let x = 0; x < cols; x++) {
      const [r, g, b] = pixelData[y][x];
      const matched = findNearestColor(r, g, b, prepared, algorithm);
      result[y][x] = matched;

      // Compute quantization error
      const errR = r - matched.rgb[0];
      const errG = g - matched.rgb[1];
      const errB = b - matched.rgb[2];

      // Distribute error to neighbors
      if (x + 1 < cols) {
        pixelData[y][x + 1][0] += errR * 7 / 16;
        pixelData[y][x + 1][1] += errG * 7 / 16;
        pixelData[y][x + 1][2] += errB * 7 / 16;
      }
      if (y + 1 < rows) {
        if (x - 1 >= 0) {
          pixelData[y + 1][x - 1][0] += errR * 3 / 16;
          pixelData[y + 1][x - 1][1] += errG * 3 / 16;
          pixelData[y + 1][x - 1][2] += errB * 3 / 16;
        }
        pixelData[y + 1][x][0] += errR * 5 / 16;
        pixelData[y + 1][x][1] += errG * 5 / 16;
        pixelData[y + 1][x][2] += errB * 5 / 16;
        if (x + 1 < cols) {
          pixelData[y + 1][x + 1][0] += errR * 1 / 16;
          pixelData[y + 1][x + 1][1] += errG * 1 / 16;
          pixelData[y + 1][x + 1][2] += errB * 1 / 16;
        }
      }
    }
  }

  return result;
}
