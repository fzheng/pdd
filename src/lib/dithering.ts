import { BeadColor, ColorMatchAlgorithm, DitheringMethod } from "@/types";
import { PreparedPalette, findNearestColor } from "./colorMatch";

type Kernel = {
  /** offsets: [dx, dy, weight]; dy >= 0, if dy==0 then dx > 0 */
  offsets: [number, number, number][];
  divisor: number;
};

const KERNELS: Record<Exclude<DitheringMethod, "none">, Kernel> = {
  "floyd-steinberg": {
    offsets: [
      [1, 0, 7],
      [-1, 1, 3],
      [0, 1, 5],
      [1, 1, 1],
    ],
    divisor: 16,
  },
  atkinson: {
    offsets: [
      [1, 0, 1],
      [2, 0, 1],
      [-1, 1, 1],
      [0, 1, 1],
      [1, 1, 1],
      [0, 2, 1],
    ],
    // Atkinson only distributes 6/8 of the error — contrast boosted
    divisor: 8,
  },
  stucki: {
    offsets: [
      [1, 0, 8],
      [2, 0, 4],
      [-2, 1, 2],
      [-1, 1, 4],
      [0, 1, 8],
      [1, 1, 4],
      [2, 1, 2],
      [-2, 2, 1],
      [-1, 2, 2],
      [0, 2, 4],
      [1, 2, 2],
      [2, 2, 1],
    ],
    divisor: 42,
  },
  burkes: {
    offsets: [
      [1, 0, 8],
      [2, 0, 4],
      [-2, 1, 2],
      [-1, 1, 4],
      [0, 1, 8],
      [1, 1, 4],
      [2, 1, 2],
    ],
    divisor: 32,
  },
  sierra: {
    offsets: [
      [1, 0, 5],
      [2, 0, 3],
      [-2, 1, 2],
      [-1, 1, 4],
      [0, 1, 5],
      [1, 1, 4],
      [2, 1, 2],
      [-1, 2, 2],
      [0, 2, 3],
      [1, 2, 2],
    ],
    divisor: 32,
  },
};

/** Apply dithering (or none) to a pixel grid and return matched bead colors. */
export function applyDithering(
  pixelData: [number, number, number][][],
  prepared: PreparedPalette,
  algorithm: ColorMatchAlgorithm,
  method: DitheringMethod,
): BeadColor[][] {
  const rows = pixelData.length;
  const cols = pixelData[0].length;
  const result: BeadColor[][] = [];

  if (method === "none") {
    for (let y = 0; y < rows; y++) {
      result[y] = [];
      for (let x = 0; x < cols; x++) {
        const [r, g, b] = pixelData[y][x];
        result[y][x] = findNearestColor(r, g, b, prepared, algorithm);
      }
    }
    return result;
  }

  const kernel = KERNELS[method];

  for (let y = 0; y < rows; y++) {
    result[y] = [];
    for (let x = 0; x < cols; x++) {
      const [r, g, b] = pixelData[y][x];
      const matched = findNearestColor(r, g, b, prepared, algorithm);
      result[y][x] = matched;

      const errR = r - matched.rgb[0];
      const errG = g - matched.rgb[1];
      const errB = b - matched.rgb[2];

      for (const [dx, dy, w] of kernel.offsets) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= cols || ny >= rows) continue;
        const scale = w / kernel.divisor;
        pixelData[ny][nx][0] += errR * scale;
        pixelData[ny][nx][1] += errG * scale;
        pixelData[ny][nx][2] += errB * scale;
      }
    }
  }

  return result;
}
