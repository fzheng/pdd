import { describe, it, expect, vi } from "vitest";
import {
  downsampleImage,
  mirrorPixelGrid,
  loadImage,
  cropImageToSquare,
} from "@/lib/imageUtils";

/**
 * jsdom doesn't implement a real canvas; we stub just enough for the
 * downsampleImage code paths. Each test installs its own fake.
 */
type Rgba = [number, number, number, number];

function stubCanvasWith(pixels: Rgba[][]) {
  const h = pixels.length;
  const w = pixels[0]?.length ?? 0;

  // Flat RGBA buffer
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      data[i] = pixels[y][x][0];
      data[i + 1] = pixels[y][x][1];
      data[i + 2] = pixels[y][x][2];
      data[i + 3] = pixels[y][x][3];
    }
  }

  const ctxMock = {
    fillStyle: "",
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data })),
  };

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    ctxMock as unknown as CanvasRenderingContext2D,
  );
}

function makeImg(w: number, h: number): HTMLImageElement {
  // jsdom doesn't set naturalWidth/Height automatically; define them.
  const img = new Image();
  Object.defineProperty(img, "naturalWidth", { value: w });
  Object.defineProperty(img, "naturalHeight", { value: h });
  return img;
}

describe("downsampleImage", () => {
  it("averages a uniform image to its uniform color", () => {
    const w = 4;
    const h = 4;
    const pixels: Rgba[][] = Array.from({ length: h }, () =>
      Array.from({ length: w }, (): Rgba => [200, 100, 50, 255]),
    );
    stubCanvasWith(pixels);
    const out = downsampleImage(makeImg(w, h), 2, 2, { snapExtremes: false });
    expect(out).toHaveLength(2);
    expect(out[0]).toHaveLength(2);
    const [r, g, b] = out[0][0];
    expect(r).toBeGreaterThan(195);
    expect(r).toBeLessThanOrEqual(200);
    expect(g).toBeGreaterThan(95);
    expect(b).toBeGreaterThan(48);
  });

  it("forces mostly-transparent blocks to the background color", () => {
    // 2x2 source, fully transparent
    const pixels: Rgba[][] = [
      [
        [255, 0, 0, 0],
        [255, 0, 0, 0],
      ],
      [
        [255, 0, 0, 0],
        [255, 0, 0, 0],
      ],
    ];
    stubCanvasWith(pixels);
    const out = downsampleImage(makeImg(2, 2), 1, 1, {
      backgroundColor: [10, 20, 30],
    });
    expect(out[0][0]).toEqual([10, 20, 30]);
  });

  it("snaps near-white to pure white when snapExtremes is on", () => {
    const pixels: Rgba[][] = [[[250, 251, 252, 255]]];
    stubCanvasWith(pixels);
    const out = downsampleImage(makeImg(1, 1), 1, 1, { snapExtremes: true });
    expect(out[0][0]).toEqual([255, 255, 255]);
  });

  it("applies a saturation boost", () => {
    const pixels: Rgba[][] = [[[200, 100, 100, 255]]];
    stubCanvasWith(pixels);
    const out = downsampleImage(makeImg(1, 1), 1, 1, {
      snapExtremes: false,
      saturationBoost: 1.5,
    });
    const [r, g, b] = out[0][0];
    // saturating around its own luma — red should end up further from g/b
    expect(r - Math.max(g, b)).toBeGreaterThan(100);
  });
});

describe("mirrorPixelGrid", () => {
  it("reverses each row horizontally", () => {
    const grid: [number, number, number][][] = [
      [
        [1, 1, 1],
        [2, 2, 2],
        [3, 3, 3],
      ],
    ];
    expect(mirrorPixelGrid(grid)).toEqual([
      [
        [3, 3, 3],
        [2, 2, 2],
        [1, 1, 1],
      ],
    ]);
  });
});

describe("loadImage", () => {
  it("resolves with an HTMLImageElement once onload fires", async () => {
    // Patch the prototype to auto-fire onload synchronously.
    const origSrc = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      "src",
    );
    Object.defineProperty(HTMLImageElement.prototype, "src", {
      configurable: true,
      set(this: HTMLImageElement) {
        // simulate successful async load
        setTimeout(() => this.onload?.(new Event("load")), 0);
      },
    });
    const file = new File(["x"], "x.png", { type: "image/png" });
    const img = await loadImage(file);
    expect(img).toBeInstanceOf(HTMLImageElement);
    if (origSrc) {
      Object.defineProperty(HTMLImageElement.prototype, "src", origSrc);
    }
  });
});

describe("cropImageToSquare", () => {
  it("returns a new HTMLImageElement once the cropped canvas loads", async () => {
    // Stub: canvas context + a predictable dataURL.
    const ctxMock = {
      fillStyle: "",
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      ctxMock as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/png;base64,iVBORw0KGgo=",
    );
    // Intercept src assignment to fire onload immediately.
    const origSrc = Object.getOwnPropertyDescriptor(
      HTMLImageElement.prototype,
      "src",
    );
    Object.defineProperty(HTMLImageElement.prototype, "src", {
      configurable: true,
      set(this: HTMLImageElement) {
        setTimeout(() => this.onload?.(new Event("load")), 0);
      },
    });

    const src = makeImg(100, 100);
    const out = await cropImageToSquare(src, 10, 10, 50);
    expect(out).toBeInstanceOf(HTMLImageElement);
    expect(ctxMock.drawImage).toHaveBeenCalledWith(src, 10, 10, 50, 50, 0, 0, 50, 50);

    if (origSrc) {
      Object.defineProperty(HTMLImageElement.prototype, "src", origSrc);
    }
  });
});
