import { srgbToLinear, linearToSrgb } from "./colorConvert";

/** Load an image file into an HTMLImageElement */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/**
 * Gamma-correct downsampling. Averages source pixel blocks in linear RGB
 * (not sRGB!) which preserves luminance correctly. Also:
 *   - Composites the source onto an opaque background color (default white)
 *     so transparent PNGs produce a clean uniform background
 *   - Uses the ORIGINAL alpha channel to detect "mostly transparent" blocks
 *     and forces them to the background color. Without this step, the wide
 *     anti-aliasing halo around a transparent PNG's subject bleeds into
 *     scattered pale-pink / pale-grey beads because the composited color
 *     is a faintly tinted near-white that matches ambiguous palette entries.
 *   - Snaps near-white pixels to pure white
 *   - Snaps near-black pixels to pure black
 *   - Optional saturation boost for more vivid bead output
 */
export function downsampleImage(
  img: HTMLImageElement,
  gridWidth: number,
  gridHeight: number,
  options: {
    saturationBoost?: number;
    snapExtremes?: boolean;
    /** Background color for transparent source pixels. Defaults to white. */
    backgroundColor?: [number, number, number];
    /**
     * If a block's mean source alpha is below this fraction, force it to
     * the background color. 0 disables the check; 0.5 means blocks that
     * were more than half-transparent become uniform background.
     */
    alphaThreshold?: number;
  } = {},
): [number, number, number][][] {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const [bgR, bgG, bgB] = options.backgroundColor ?? [255, 255, 255];
  const alphaThreshold = options.alphaThreshold ?? 0.5;

  // Canvas 1: composite onto opaque background for color data.
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = srcW;
  colorCanvas.height = srcH;
  const colorCtx = colorCanvas.getContext("2d")!;
  colorCtx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
  colorCtx.fillRect(0, 0, srcW, srcH);
  colorCtx.drawImage(img, 0, 0);
  const colorData = colorCtx.getImageData(0, 0, srcW, srcH).data;

  // Canvas 2: raw draw to preserve original alpha channel for classification.
  const alphaCanvas = document.createElement("canvas");
  alphaCanvas.width = srcW;
  alphaCanvas.height = srcH;
  const alphaCtx = alphaCanvas.getContext("2d")!;
  alphaCtx.drawImage(img, 0, 0);
  const alphaData = alphaCtx.getImageData(0, 0, srcW, srcH).data;

  const snap = options.snapExtremes ?? true;
  const pixels: [number, number, number][][] = [];

  for (let gy = 0; gy < gridHeight; gy++) {
    pixels[gy] = [];
    const y0 = Math.floor((gy * srcH) / gridHeight);
    const y1 = Math.max(y0 + 1, Math.floor(((gy + 1) * srcH) / gridHeight));

    for (let gx = 0; gx < gridWidth; gx++) {
      const x0 = Math.floor((gx * srcW) / gridWidth);
      const x1 = Math.max(x0 + 1, Math.floor(((gx + 1) * srcW) / gridWidth));

      // First pass: measure the block's opacity from the source alpha.
      let sumAlpha = 0;
      let pxCount = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * srcW + x) * 4;
          sumAlpha += alphaData[i + 3];
          pxCount++;
        }
      }
      const meanAlpha = pxCount === 0 ? 0 : sumAlpha / (pxCount * 255);

      // Mostly-transparent blocks snap straight to the background color.
      // Skips color averaging entirely — no halo from faint edge pixels.
      if (alphaThreshold > 0 && meanAlpha < alphaThreshold) {
        pixels[gy][gx] = [bgR, bgG, bgB];
        continue;
      }

      // Second pass: gamma-correct box-filter average in linear RGB
      // over the composited (opaque) color data.
      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * srcW + x) * 4;
          sumR += srgbToLinear(colorData[i]);
          sumG += srgbToLinear(colorData[i + 1]);
          sumB += srgbToLinear(colorData[i + 2]);
          count++;
        }
      }

      if (count === 0) count = 1;
      let r = linearToSrgb(sumR / count);
      let g = linearToSrgb(sumG / count);
      let b = linearToSrgb(sumB / count);

      // Snap near-white / near-black pixels that are close to neutral.
      if (snap) {
        const mn = Math.min(r, g, b);
        const mx = Math.max(r, g, b);
        const chroma = mx - mn;
        if (mn >= 240 && chroma <= 12) {
          r = g = b = 255;
        } else if (mx <= 15 && chroma <= 12) {
          r = g = b = 0;
        }
      }

      if (options.saturationBoost && options.saturationBoost !== 1) {
        [r, g, b] = applySaturation([r, g, b], options.saturationBoost);
      }

      pixels[gy][gx] = [r, g, b];
    }
  }

  return pixels;
}

function applySaturation(
  rgb: [number, number, number],
  factor: number,
): [number, number, number] {
  const [r, g, b] = rgb;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return [
    clamp(luma + (r - luma) * factor),
    clamp(luma + (g - luma) * factor),
    clamp(luma + (b - luma) * factor),
  ];
}

function clamp(v: number): number {
  return Math.round(Math.max(0, Math.min(255, v)));
}

/** Mirror pixel grid horizontally (for ironing prep) */
export function mirrorPixelGrid(
  pixels: [number, number, number][][],
): [number, number, number][][] {
  return pixels.map((row) => [...row].reverse());
}

/**
 * Suggest a grid size that preserves the image's aspect ratio,
 * using the given short-side target. Clamped to [5, 200].
 */
export function suggestGridSize(
  img: HTMLImageElement,
  shortSideTarget = 58,
): { width: number; height: number } {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (w <= 0 || h <= 0) {
    return { width: shortSideTarget, height: shortSideTarget };
  }
  let width: number, height: number;
  if (w <= h) {
    width = shortSideTarget;
    height = Math.round((shortSideTarget * h) / w);
  } else {
    height = shortSideTarget;
    width = Math.round((shortSideTarget * w) / h);
  }
  width = Math.max(5, Math.min(200, width));
  height = Math.max(5, Math.min(200, height));
  return { width, height };
}
