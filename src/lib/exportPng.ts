import { BeadPattern } from "@/types";
import { renderPatternToCanvas } from "./renderPattern";

/** Render pattern at a specified cell size and trigger download as PNG */
export function exportPatternAsPng(
  pattern: BeadPattern,
  fileName: string,
  cellSize = 24,
): void {
  const canvas = document.createElement("canvas");
  canvas.width = pattern.width * cellSize;
  canvas.height = pattern.height * cellSize;
  const ctx = canvas.getContext("2d")!;
  renderPatternToCanvas(ctx, pattern, {
    cellSize,
    showGridLines: true,
    showColorCodes: cellSize >= 14,
  });

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
}
