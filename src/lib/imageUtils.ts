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
 * Gamma-correct downsampling. We extract pixel data from the source image,
 * convert to linear RGB, average each block of source pixels (box filter),
 * then convert back to sRGB. This preserves luminance correctly — naive
 * sRGB-space averaging darkens colors, especially mid-tones.
 */
export function downsampleImage(
  img: HTMLImageElement,
  gridWidth: number,
  gridHeight: number,
  options: { saturationBoost?: number } = {},
): [number, number, number][][] {
  // First render source at its natural size on a canvas
  const srcCanvas = document.createElement("canvas");
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  srcCanvas.width = srcW;
  srcCanvas.height = srcH;
  const srcCtx = srcCanvas.getContext("2d")!;
  srcCtx.drawImage(img, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, srcW, srcH).data;

  const pixels: [number, number, number][][] = [];

  // Area-averaging box filter in linear RGB
  for (let gy = 0; gy < gridHeight; gy++) {
    pixels[gy] = [];
    const y0 = Math.floor((gy * srcH) / gridHeight);
    const y1 = Math.max(y0 + 1, Math.floor(((gy + 1) * srcH) / gridHeight));

    for (let gx = 0; gx < gridWidth; gx++) {
      const x0 = Math.floor((gx * srcW) / gridWidth);
      const x1 = Math.max(x0 + 1, Math.floor(((gx + 1) * srcW) / gridWidth));

      let sumR = 0, sumG = 0, sumB = 0, count = 0;

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * srcW + x) * 4;
          const a = srcData[i + 3] / 255;
          sumR += srgbToLinear(srcData[i]) * a;
          sumG += srgbToLinear(srcData[i + 1]) * a;
          sumB += srgbToLinear(srcData[i + 2]) * a;
          count += a;
        }
      }

      if (count === 0) count = 1;
      const avgR = sumR / count;
      const avgG = sumG / count;
      const avgB = sumB / count;

      pixels[gy][gx] = [
        linearToSrgb(avgR),
        linearToSrgb(avgG),
        linearToSrgb(avgB),
      ];

      if (options.saturationBoost && options.saturationBoost !== 1) {
        pixels[gy][gx] = applySaturation(pixels[gy][gx], options.saturationBoost);
      }
    }
  }

  return pixels;
}

function applySaturation(
  rgb: [number, number, number],
  factor: number,
): [number, number, number] {
  const [r, g, b] = rgb;
  // Rec. 709 luma
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
