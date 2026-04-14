import { BeadPattern } from "@/types";

export interface RenderOptions {
  cellSize: number;
  showGridLines: boolean;
  showColorCodes: boolean;
}

/** Render a BeadPattern onto an HTML Canvas */
export function renderPatternToCanvas(
  ctx: CanvasRenderingContext2D,
  pattern: BeadPattern,
  options: RenderOptions,
): void {
  const { cellSize, showGridLines, showColorCodes } = options;
  const { width, height, cells } = pattern;

  ctx.clearRect(0, 0, width * cellSize, height * cellSize);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = cells[y][x];
      const px = x * cellSize;
      const py = y * cellSize;

      // Fill bead color
      ctx.fillStyle = cell.beadColor.hex;
      ctx.fillRect(px, py, cellSize, cellSize);

      // Grid lines
      if (showGridLines) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py, cellSize, cellSize);
      }

      // Color code overlay
      if (showColorCodes && cellSize >= 14) {
        const [r, g, b] = cell.beadColor.rgb;
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        ctx.fillStyle = luminance > 128 ? "#000000" : "#FFFFFF";
        ctx.font = `${Math.max(8, cellSize * 0.4)}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Use first 2 chars of SKU
        const label = cell.beadColor.sku.slice(0, 3);
        ctx.fillText(label, px + cellSize / 2, py + cellSize / 2);
      }
    }
  }

  // Pegboard section lines (every 29 cells)
  if (showGridLines) {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 2;
    for (let x = 29; x < width; x += 29) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, height * cellSize);
      ctx.stroke();
    }
    for (let y = 29; y < height; y += 29) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(width * cellSize, y * cellSize);
      ctx.stroke();
    }
  }
}
