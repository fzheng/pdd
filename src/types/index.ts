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
export type ColorMatchAlgorithm = "rgb-euclidean" | "cielab-euclidean";

/** Settings for the processing pipeline */
export interface PipelineSettings {
  gridWidth: number;
  gridHeight: number;
  palette: BeadPalette;
  algorithm: ColorMatchAlgorithm;
  ditheringEnabled: boolean;
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
