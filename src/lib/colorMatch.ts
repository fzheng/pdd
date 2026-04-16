import { BeadColor, BeadPalette, ColorMatchAlgorithm, LabColor } from "@/types";
import { rgbToLab, ciede2000 } from "./colorConvert";

/** Precomputed palette with Lab values */
export interface PreparedPalette {
  colors: BeadColor[];
  labValues: LabColor[];
}

export function preparePalette(palette: BeadPalette): PreparedPalette {
  return {
    colors: palette.colors,
    labValues: palette.colors.map((c) => rgbToLab(c.rgb[0], c.rgb[1], c.rgb[2])),
  };
}

/** Prepare from an arbitrary list of bead colors (used after palette reduction) */
export function prepareFromColors(colors: BeadColor[]): PreparedPalette {
  return {
    colors,
    labValues: colors.map((c) => rgbToLab(c.rgb[0], c.rgb[1], c.rgb[2])),
  };
}

export function findNearestColor(
  r: number,
  g: number,
  b: number,
  prepared: PreparedPalette,
  algorithm: ColorMatchAlgorithm,
): BeadColor {
  let bestIndex = 0;
  let bestDist = Infinity;

  if (algorithm === "rgb-euclidean") {
    for (let i = 0; i < prepared.colors.length; i++) {
      const c = prepared.colors[i].rgb;
      const dr = r - c[0];
      const dg = g - c[1];
      const db = b - c[2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }
    return prepared.colors[bestIndex];
  }

  // Lab-based algorithms share conversion
  const lab = rgbToLab(
    Math.round(Math.max(0, Math.min(255, r))),
    Math.round(Math.max(0, Math.min(255, g))),
    Math.round(Math.max(0, Math.min(255, b))),
  );

  if (algorithm === "cielab-euclidean") {
    for (let i = 0; i < prepared.colors.length; i++) {
      const pl = prepared.labValues[i];
      const dL = lab.L - pl.L;
      const da = lab.a - pl.a;
      const db = lab.b - pl.b;
      const dist = dL * dL + da * da + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }
  } else {
    // ciede2000 — slowest but most perceptually accurate
    for (let i = 0; i < prepared.colors.length; i++) {
      const dist = ciede2000(lab, prepared.labValues[i]);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }
  }

  return prepared.colors[bestIndex];
}
