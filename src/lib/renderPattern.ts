import { BeadPattern } from "@/types";

export type BeadShape = "circle" | "square";

export interface RenderOptions {
  cellSize: number;
  shape?: BeadShape;
  showGridLines?: boolean;
  showColorCodes?: boolean;
  /** Background fill between beads (when shape = "circle") */
  background?: string;
}

/** Render a BeadPattern onto an HTML Canvas */
export function renderPatternToCanvas(
  ctx: CanvasRenderingContext2D,
  pattern: BeadPattern,
  options: RenderOptions,
): void {
  const {
    cellSize,
    shape = "circle",
    showGridLines = false,
    showColorCodes = false,
    background = "#FFFFFF",
  } = options;
  const { width, height, cells } = pattern;

  // Fill canvas background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width * cellSize, height * cellSize);

  if (shape === "circle") {
    // Draw beads as circles with a slight gap between (looks like real beads)
    const radius = cellSize * 0.45;
    const half = cellSize / 2;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = cells[y][x];
        const cx = x * cellSize + half;
        const cy = y * cellSize + half;

        ctx.fillStyle = cell.beadColor.hex;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle bead rim for depth
        if (cellSize >= 8) {
          ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
          ctx.lineWidth = Math.max(0.5, cellSize * 0.04);
          ctx.stroke();

          // Tiny highlight dot (gives a glossy plastic look)
          const [r, g, b] = cell.beadColor.rgb;
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          ctx.fillStyle =
            luma > 200 ? "rgba(0, 0, 0, 0.07)" : "rgba(255, 255, 255, 0.35)";
          ctx.beginPath();
          ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }

        if (showColorCodes && cellSize >= 18) {
          drawLabel(ctx, cell.beadColor.sku, cell.beadColor.rgb, cx, cy, cellSize);
        }
      }
    }
  } else {
    // Square (classic grid) style
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = cells[y][x];
        const px = x * cellSize;
        const py = y * cellSize;

        ctx.fillStyle = cell.beadColor.hex;
        ctx.fillRect(px, py, cellSize, cellSize);

        if (showGridLines) {
          ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
          ctx.lineWidth = 0.5;
          ctx.strokeRect(px, py, cellSize, cellSize);
        }

        if (showColorCodes && cellSize >= 14) {
          drawLabel(
            ctx,
            cell.beadColor.sku,
            cell.beadColor.rgb,
            px + cellSize / 2,
            py + cellSize / 2,
            cellSize,
          );
        }
      }
    }
  }

  // Pegboard section lines every 29 cells (helps counting across boards)
  if (showGridLines || shape === "circle") {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = Math.max(1, cellSize * 0.08);
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

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  rgb: [number, number, number],
  cx: number,
  cy: number,
  cellSize: number,
): void {
  const [r, g, b] = rgb;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  ctx.fillStyle = luma > 140 ? "#000000" : "#FFFFFF";
  ctx.font = `${Math.max(7, cellSize * 0.38)}px ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = text.slice(-3);
  ctx.fillText(label, cx, cy);
}
