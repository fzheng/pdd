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
 * Downsample an image to target grid dimensions using an offscreen canvas.
 * Returns a 2D array of [r, g, b] pixel values.
 */
export function downsampleImage(
  img: HTMLImageElement,
  gridWidth: number,
  gridHeight: number,
): [number, number, number][][] {
  const canvas = document.createElement("canvas");
  canvas.width = gridWidth;
  canvas.height = gridHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, gridWidth, gridHeight);

  const imageData = ctx.getImageData(0, 0, gridWidth, gridHeight);
  const data = imageData.data;
  const pixels: [number, number, number][][] = [];

  for (let y = 0; y < gridHeight; y++) {
    pixels[y] = [];
    for (let x = 0; x < gridWidth; x++) {
      const i = (y * gridWidth + x) * 4;
      pixels[y][x] = [data[i], data[i + 1], data[i + 2]];
    }
  }

  return pixels;
}
