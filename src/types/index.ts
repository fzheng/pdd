/** A single bead color in a manufacturer's palette */
export interface BeadColor {
  id: string;
  name: string;
  brand: string;
  sku: string;
  hex: string;
  rgb: [number, number, number];
}

/** A complete bead palette */
export interface BeadPalette {
  brand: string;
  colors: BeadColor[];
}

/** User-selectable color matching algorithm */
export type ColorMatchAlgorithm =
  | "rgb-euclidean"
  | "cielab-euclidean"
  | "ciede2000";

/** User-selectable dithering method */
export type DitheringMethod =
  | "none"
  | "floyd-steinberg"
  | "atkinson"
  | "stucki"
  | "burkes"
  | "sierra";

/** Settings for the processing pipeline */
export interface PipelineSettings {
  gridWidth: number;
  gridHeight: number;
  palette: BeadPalette;
  algorithm: ColorMatchAlgorithm;
  dithering: DitheringMethod;
  /** If > 0, limit palette to best-matching N colors for the image */
  maxColors: number;
  /** Mirror horizontally (prep for ironing) */
  mirror: boolean;
  /** Saturation multiplier (1 = identity) */
  saturation: number;
  /**
   * Background cleanup: remove isolated non-background components smaller
   * than this many cells when they sit entirely in the exterior region.
   * 0 disables.
   */
  despeckle: number;
}

/** A single cell in the output pattern grid */
export interface PatternCell {
  row: number;
  col: number;
  beadColor: BeadColor;
}

/** The complete generated pattern */
export interface BeadPattern {
  width: number;
  height: number;
  cells: PatternCell[][];
  colorCounts: Map<string, { color: BeadColor; count: number }>;
}

/** CIELAB color representation */
export interface LabColor {
  L: number;
  a: number;
  b: number;
}

export type Locale = "zh-CN" | "zh-TW" | "en";
