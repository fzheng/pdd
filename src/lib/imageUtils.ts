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
 *   - Composites the source onto an opaque background color before averaging
 *     (defaults to white). This flattens transparent PNGs to a clean solid
 *     background and prevents anti-aliased edge pixels from producing noise
 *     in mostly-transparent blocks.
 *   - Snaps near-white pixels to pure white (prevents JPEG grey tint from
 *     stealing matches to pale-grey palette entries)
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
  } = {},
): [number, number, number][][] {
  const srcCanvas = document.createElement("canvas");
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  srcCanvas.width = srcW;
  srcCanvas.height = srcH;
  const srcCtx = srcCanvas.getContext("2d")!;

  // Fill opaque background, then composite the image on top. After this,
  // every pixel in the canvas has alpha=255. Transparent regions of the
  // source become the chosen background color (default white), and
  // semi-transparent anti-aliased edges blend against it smoothly.
  const [bgR, bgG, bgB] = options.backgroundColor ?? [255, 255, 255];
  srcCtx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
  srcCtx.fillRect(0, 0, srcW, srcH);
  srcCtx.drawImage(img, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, srcW, srcH).data;

  const snap = options.snapExtremes ?? true;
  const pixels: [number, number, number][][] = [];

  for (let gy = 0; gy < gridHeight; gy++) {
    pixels[gy] = [];
    const y0 = Math.floor((gy * srcH) / gridHeight);
    const y1 = Math.max(y0 + 1, Math.floor(((gy + 1) * srcH) / gridHeight));

    for (let gx = 0; gx < gridWidth; gx++) {
      const x0 = Math.floor((gx * srcW) / gridWidth);
      const x1 = Math.max(x0 + 1, Math.floor(((gx + 1) * srcW) / gridWidth));

      // Box-filter average in linear RGB. All source pixels are opaque now
      // thanks to the background fill above, so every pixel contributes
      // equally (no alpha weighting needed — it would all be 1.0).
      let sumR = 0, sumG = 0, sumB = 0, count = 0;

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * srcW + x) * 4;
          sumR += srgbToLinear(srcData[i]);
          sumG += srgbToLinear(srcData[i + 1]);
          sumB += srgbToLinear(srcData[i + 2]);
          count++;
        }
      }

      if (count === 0) count = 1;
      let r = linearToSrgb(sumR / count);
      let g = linearToSrgb(sumG / count);
      let b = linearToSrgb(sumB / count);

      // Snap near-white / near-black pixels that are close to neutral.
      // This prevents a JPEG background that reads as (248, 249, 247)
      // from matching to a pale-grey palette entry instead of pure white.
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
