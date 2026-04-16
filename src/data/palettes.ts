import { BeadPalette } from "@/types";
import { perlerPalette } from "./perlerPalette";
import { hamaPalette } from "./hamaPalette";
import { artkalPalette } from "./artkalPalette";
import { nabbiPalette } from "./nabbiPalette";
import { mardPalette } from "./mardPalette";

export const allPalettes: BeadPalette[] = [
  perlerPalette,
  hamaPalette,
  artkalPalette,
  nabbiPalette,
  mardPalette,
];

export function getPaletteByBrand(brand: string): BeadPalette {
  return allPalettes.find((p) => p.brand === brand) ?? perlerPalette;
}
