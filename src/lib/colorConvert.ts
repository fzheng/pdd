import { LabColor } from "@/types";

// D65 reference white point
const REF_X = 95.047;
const REF_Y = 100.0;
const REF_Z = 108.883;

function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function labF(t: number): number {
  const delta = 6 / 29;
  return t > delta * delta * delta
    ? Math.cbrt(t)
    : t / (3 * delta * delta) + 4 / 29;
}

/** Convert sRGB [0-255] to CIELAB */
export function rgbToLab(r: number, g: number, b: number): LabColor {
  // sRGB to linear RGB
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  // Linear RGB to XYZ (D65)
  const x = (0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb) * 100;
  const y = (0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb) * 100;
  const z = (0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb) * 100;

  // XYZ to CIELAB
  const fx = labF(x / REF_X);
  const fy = labF(y / REF_Y);
  const fz = labF(z / REF_Z);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}
