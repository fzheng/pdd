import { describe, it, expect, vi } from "vitest";
import { generatePattern } from "@/lib/pipeline";
import { testPalette } from "../fixtures";
import { PipelineSettings } from "@/types";

/**
 * End-to-end smoke test for `generatePattern`. Wires downsample → dither →
 * palette-reduce → despeckle together and asserts the expected shape of the
 * result. Kept intentionally small: unit tests cover the individual stages
 * in more depth.
 */
describe("generatePattern (integration)", () => {
  function stubCanvas(pixels: [number, number, number, number][][]) {
    const h = pixels.length;
    const w = pixels[0].length;
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
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      fillStyle: "",
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data })),
    } as unknown as CanvasRenderingContext2D);
  }

  function makeImg(w: number, h: number): HTMLImageElement {
    const img = new Image();
    Object.defineProperty(img, "naturalWidth", { value: w });
    Object.defineProperty(img, "naturalHeight", { value: h });
    return img;
  }

  function baseSettings(): PipelineSettings {
    return {
      gridSize: 4,
      palette: testPalette,
      algorithm: "rgb-euclidean",
      dithering: "none",
      maxColors: 0,
      mirror: false,
      saturation: 1,
      despeckle: 0,
    };
  }

  it("produces a gridSize × gridSize output with the palette's colors", () => {
    // 8×8 source, each pixel red → downsamples to 4×4 of red beads
    stubCanvas(
      Array.from({ length: 8 }, () =>
        Array.from({ length: 8 }, (): [number, number, number, number] => [255, 0, 0, 255]),
      ),
    );
    const pattern = generatePattern(makeImg(8, 8), baseSettings());
    expect(pattern.width).toBe(4);
    expect(pattern.height).toBe(4);
    for (const row of pattern.cells) {
      for (const cell of row) {
        expect(cell.beadColor.id).toBe("r");
      }
    }
  });

  it("mirror=true flips the output horizontally", () => {
    // Half red, half blue — mirror should swap left/right
    stubCanvas(
      Array.from({ length: 8 }, () =>
        Array.from({ length: 8 }, (_, x): [number, number, number, number] =>
          x < 4 ? [255, 0, 0, 255] : [0, 0, 255, 255],
        ),
      ),
    );
    const pattern = generatePattern(makeImg(8, 8), {
      ...baseSettings(),
      mirror: true,
    });
    // After mirroring, the left half should now be blue
    expect(pattern.cells[0][0].beadColor.id).toBe("b");
    expect(pattern.cells[0][3].beadColor.id).toBe("r");
  });

  it("honors maxColors by reducing the palette via k-means", () => {
    // All red image — only one color actually needed
    stubCanvas(
      Array.from({ length: 4 }, () =>
        Array.from({ length: 4 }, (): [number, number, number, number] => [255, 0, 0, 255]),
      ),
    );
    const pattern = generatePattern(makeImg(4, 4), {
      ...baseSettings(),
      maxColors: 1,
    });
    expect(pattern.colorCounts.size).toBe(1);
  });
});
