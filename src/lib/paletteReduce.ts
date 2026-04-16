import { BeadColor, BeadPalette, LabColor } from "@/types";
import { rgbToLab } from "./colorConvert";

/**
 * Select the N best-matching bead colors from the palette for this specific image.
 * Uses k-means clustering on the image's pixel colors in Lab space, then picks
 * the palette color closest to each cluster center. This gives dramatically
 * better results than naive nearest-neighbor over the full palette when the
 * user wants fewer colors.
 */
export function selectBestPaletteSubset(
  pixels: [number, number, number][][],
  palette: BeadPalette,
  maxColors: number,
): BeadColor[] {
  if (maxColors >= palette.colors.length) return palette.colors;

  // Collect all image pixel Lab values
  const labPixels: LabColor[] = [];
  for (const row of pixels) {
    for (const [r, g, b] of row) {
      labPixels.push(rgbToLab(r, g, b));
    }
  }

  // Run k-means with k=maxColors (up to ~12 iterations is sufficient for small k)
  const k = maxColors;
  const centers = initCentersKMeansPP(labPixels, k);
  const assignments = new Uint32Array(labPixels.length);

  for (let iter = 0; iter < 12; iter++) {
    let changed = false;
    // Assignment step
    for (let i = 0; i < labPixels.length; i++) {
      let bestDist = Infinity;
      let bestIdx = 0;
      for (let c = 0; c < k; c++) {
        const d = labDistSq(labPixels[i], centers[c]);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = c;
        }
      }
      if (assignments[i] !== bestIdx) {
        assignments[i] = bestIdx;
        changed = true;
      }
    }
    if (!changed && iter > 0) break;

    // Update step
    const sums: number[][] = Array.from({ length: k }, () => [0, 0, 0, 0]);
    for (let i = 0; i < labPixels.length; i++) {
      const a = assignments[i];
      sums[a][0] += labPixels[i].L;
      sums[a][1] += labPixels[i].a;
      sums[a][2] += labPixels[i].b;
      sums[a][3]++;
    }
    for (let c = 0; c < k; c++) {
      if (sums[c][3] > 0) {
        centers[c] = {
          L: sums[c][0] / sums[c][3],
          a: sums[c][1] / sums[c][3],
          b: sums[c][2] / sums[c][3],
        };
      }
    }
  }

  // For each center, pick the palette color with minimum Lab distance
  const paletteLabs = palette.colors.map((c) => rgbToLab(c.rgb[0], c.rgb[1], c.rgb[2]));
  const selected = new Map<string, BeadColor>();
  for (const center of centers) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < palette.colors.length; i++) {
      const d = labDistSq(center, paletteLabs[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const c = palette.colors[bestIdx];
    selected.set(c.id, c);
  }

  return Array.from(selected.values());
}

function initCentersKMeansPP(
  labPixels: LabColor[],
  k: number,
): LabColor[] {
  // k-means++ initialization — better than random
  const centers: LabColor[] = [];
  // Pick first center uniformly at random
  centers.push({ ...labPixels[Math.floor(Math.random() * labPixels.length)] });

  while (centers.length < k) {
    // For each pixel, compute squared distance to the nearest existing center
    const distances = new Float64Array(labPixels.length);
    let total = 0;
    for (let i = 0; i < labPixels.length; i++) {
      let best = Infinity;
      for (const c of centers) {
        const d = labDistSq(labPixels[i], c);
        if (d < best) best = d;
      }
      distances[i] = best;
      total += best;
    }
    // Pick next center with probability proportional to squared distance
    if (total === 0) {
      centers.push({ ...labPixels[0] });
      continue;
    }
    let threshold = Math.random() * total;
    let picked = labPixels.length - 1;
    for (let i = 0; i < labPixels.length; i++) {
      threshold -= distances[i];
      if (threshold <= 0) {
        picked = i;
        break;
      }
    }
    centers.push({ ...labPixels[picked] });
  }

  return centers;
}

function labDistSq(a: LabColor, b: LabColor): number {
  const dL = a.L - b.L;
  const da = a.a - b.a;
  const db = a.b - b.b;
  return dL * dL + da * da + db * db;
}
