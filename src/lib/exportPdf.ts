import { jsPDF } from "jspdf";
import { BeadPattern, PatternCell } from "@/types";
import { drawText } from "./pdfText";

const PEGBOARD = 29;

export interface PdfLabels {
  /** Pre-interpolated: "Size: 58 × 58 beads" */
  size: string;
  /** Pre-interpolated: "Total beads: 3364" */
  totalBeads: string;
  /** Pre-interpolated: "Colors: 42" */
  colorsCount: string;
  /** Pre-interpolated: "Pegboards (29×29): 2 × 2" */
  pegboards: string;
  shoppingList: string;
  colSwatch: string;
  colName: string;
  colSku: string;
  colBrand: string;
  colCount: string;
  /** Per-page: (boardRow, boardCol, totalRows, totalCols) → e.g. "Board 1-1 of 2×2" */
  boardOf: (r: number, c: number, rows: number, cols: number) => string;
  /** Per-page: (x0, x1, y0, y1) 1-based column/row range for the board */
  beadRange: (x0: number, x1: number, y0: number, y1: number) => string;
  footer: string;
}

export interface PdfExportOptions {
  cellSizeMm: number; // 0.1 – 10
  fileName: string;
  title?: string;
  showColorCodes?: boolean;
  labels: PdfLabels;
}

/**
 * Export a bead pattern as a multi-page A4 PDF with:
 * - Cover page with overview + shopping list
 * - One page per 29×29 pegboard section with alignment info
 *
 * All human-readable text uses the provided `labels` so the PDF matches
 * the app's current locale (including CJK via canvas-rendered text).
 */
export function exportPatternAsPdf(
  pattern: BeadPattern,
  options: PdfExportOptions,
): void {
  const { cellSizeMm, fileName, title, showColorCodes = true, labels } = options;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 12;

  renderCoverPage(doc, pattern, title ?? fileName, margin, pageW, pageH, labels);

  const colsOfBoards = Math.ceil(pattern.width / PEGBOARD);
  const rowsOfBoards = Math.ceil(pattern.height / PEGBOARD);

  for (let br = 0; br < rowsOfBoards; br++) {
    for (let bc = 0; bc < colsOfBoards; bc++) {
      doc.addPage();
      renderPegboardPage(
        doc,
        pattern,
        br,
        bc,
        rowsOfBoards,
        colsOfBoards,
        cellSizeMm,
        margin,
        pageW,
        pageH,
        showColorCodes,
        labels,
      );
    }
  }

  doc.save(fileName);
}

function renderCoverPage(
  doc: jsPDF,
  pattern: BeadPattern,
  title: string,
  margin: number,
  pageW: number,
  pageH: number,
  labels: PdfLabels,
): void {
  let y = margin + 8;

  drawText(doc, title, margin, y, { fontSizePt: 20, bold: true });
  y += 8;

  drawText(doc, labels.size, margin, y, { fontSizePt: 10, color: [100, 100, 100] });
  y += 5;

  drawText(doc, labels.totalBeads, margin, y, {
    fontSizePt: 10,
    color: [100, 100, 100],
  });
  y += 5;

  drawText(doc, labels.colorsCount, margin, y, {
    fontSizePt: 10,
    color: [100, 100, 100],
  });
  y += 5;

  drawText(doc, labels.pegboards, margin, y, {
    fontSizePt: 10,
    color: [100, 100, 100],
  });
  y += 6;

  // Preview thumbnail
  const previewMaxW = Math.min(pageW - 2 * margin, 80);
  const previewCellPx = 4;
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = pattern.width * previewCellPx;
  thumbCanvas.height = pattern.height * previewCellPx;
  const tctx = thumbCanvas.getContext("2d")!;
  tctx.fillStyle = "#FFFFFF";
  tctx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);
  for (let row = 0; row < pattern.height; row++) {
    for (let col = 0; col < pattern.width; col++) {
      tctx.fillStyle = pattern.cells[row][col].beadColor.hex;
      tctx.beginPath();
      tctx.arc(
        col * previewCellPx + previewCellPx / 2,
        row * previewCellPx + previewCellPx / 2,
        previewCellPx * 0.45,
        0,
        Math.PI * 2,
      );
      tctx.fill();
    }
  }
  const dataUrl = thumbCanvas.toDataURL("image/png");
  const ratio = pattern.height / pattern.width;
  const previewH = previewMaxW * ratio;
  doc.addImage(dataUrl, "PNG", margin, y, previewMaxW, previewH);

  // Shopping list
  y += previewH + 8;
  drawText(doc, labels.shoppingList, margin, y, { fontSizePt: 14, bold: true });
  y += 6;

  const entries = Array.from(pattern.colorCounts.values()).sort(
    (a, b) => b.count - a.count,
  );

  const col1X = margin;
  const col2X = margin + 12;
  const col3X = margin + 60;
  const col4X = margin + 95;
  const col5X = pageW - margin;

  drawText(doc, labels.colSwatch, col1X, y, { fontSizePt: 9, color: [100, 100, 100] });
  drawText(doc, labels.colName, col2X, y, { fontSizePt: 9, color: [100, 100, 100] });
  drawText(doc, labels.colSku, col3X, y, { fontSizePt: 9, color: [100, 100, 100] });
  drawText(doc, labels.colBrand, col4X, y, { fontSizePt: 9, color: [100, 100, 100] });
  drawText(doc, labels.colCount, col5X, y, {
    fontSizePt: 9,
    color: [100, 100, 100],
    align: "right",
  });

  y += 1.5;
  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 4;

  for (const { color, count } of entries) {
    if (y > pageH - margin - 8) {
      doc.addPage();
      y = margin;
    }
    const [r, g, b] = color.rgb;
    doc.setFillColor(r, g, b);
    doc.setDrawColor(180);
    doc.rect(col1X, y - 3, 5, 5, "FD");

    drawText(doc, color.name, col2X, y, { fontSizePt: 9 });
    drawText(doc, color.sku, col3X, y, { fontSizePt: 9 });
    drawText(doc, color.brand, col4X, y, { fontSizePt: 9 });
    drawText(doc, String(count), col5X, y, { fontSizePt: 9, align: "right" });

    y += 5;
  }
}

function renderPegboardPage(
  doc: jsPDF,
  pattern: BeadPattern,
  boardRow: number,
  boardCol: number,
  totalBoardRows: number,
  totalBoardCols: number,
  cellSizeMm: number,
  margin: number,
  pageW: number,
  pageH: number,
  showColorCodes: boolean,
  labels: PdfLabels,
): void {
  let y = margin + 5;

  const x0 = boardCol * PEGBOARD;
  const y0 = boardRow * PEGBOARD;
  const x1 = Math.min(x0 + PEGBOARD, pattern.width);
  const y1 = Math.min(y0 + PEGBOARD, pattern.height);

  drawText(
    doc,
    labels.boardOf(boardRow, boardCol, totalBoardRows, totalBoardCols),
    margin,
    y,
    { fontSizePt: 14, bold: true },
  );
  y += 6;

  drawText(doc, labels.beadRange(x0, x1, y0, y1), margin, y, {
    fontSizePt: 8,
    color: [120, 120, 120],
  });
  y += 4;

  // Scale cell to fit page
  const usableW = pageW - 2 * margin;
  const usableH = pageH - y - margin;
  const maxCellW = usableW / PEGBOARD;
  const maxCellH = usableH / PEGBOARD;
  const cs = Math.min(cellSizeMm, maxCellW, maxCellH);

  const gridW = cs * PEGBOARD;
  const gridH = cs * PEGBOARD;
  const startX = margin;
  const startY = y;

  // Draw cells as squares with SKU labels (cells need to be printable
  // counting guides — always square for clarity on print)
  for (let row = 0; row < PEGBOARD; row++) {
    for (let col = 0; col < PEGBOARD; col++) {
      const px = startX + col * cs;
      const py = startY + row * cs;
      const gx = x0 + col;
      const gy = y0 + row;

      if (gx >= pattern.width || gy >= pattern.height) {
        doc.setFillColor(245, 245, 245);
        doc.setDrawColor(220);
        doc.rect(px, py, cs, cs, "FD");
        continue;
      }

      const cell: PatternCell = pattern.cells[gy][gx];
      const [r, g, b] = cell.beadColor.rgb;
      doc.setFillColor(r, g, b);
      doc.setDrawColor(180);
      doc.setLineWidth(0.05);
      doc.rect(px, py, cs, cs, "FD");

      if (showColorCodes && cs >= 4) {
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        const textColor: [number, number, number] = luma > 140 ? [0, 0, 0] : [255, 255, 255];
        // SKUs are ASCII — use native doc.text for speed
        doc.setFont("helvetica", "normal");
        doc.setFontSize(Math.max(4, cs * 1.8));
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        const label = cell.beadColor.sku.replace(/^[A-Z]+/, "").slice(-3);
        doc.text(label, px + cs / 2, py + cs / 2 + 0.3, {
          align: "center",
          baseline: "middle",
        });
      }
    }
  }

  // Edge labels (column/row numbers) — ASCII digits, native text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(120);
  for (let col = 0; col < PEGBOARD; col++) {
    const gx = x0 + col;
    if (gx < pattern.width) {
      doc.text(String(gx + 1), startX + col * cs + cs / 2, startY - 1, {
        align: "center",
      });
    }
  }
  for (let row = 0; row < PEGBOARD; row++) {
    const gy = y0 + row;
    if (gy < pattern.height) {
      doc.text(String(gy + 1), startX - 1.5, startY + row * cs + cs / 2, {
        align: "right",
        baseline: "middle",
      });
    }
  }
  doc.setTextColor(0);

  // Alignment arrows
  doc.setFontSize(9);
  doc.setTextColor(150);
  if (boardCol + 1 < totalBoardCols) {
    doc.text(">", startX + gridW + 2, startY + gridH / 2, { baseline: "middle" });
  }
  if (boardCol > 0) {
    doc.text("<", startX - 4, startY + gridH / 2, { baseline: "middle" });
  }
  if (boardRow + 1 < totalBoardRows) {
    doc.text("v", startX + gridW / 2, startY + gridH + 4, { align: "center" });
  }
  if (boardRow > 0) {
    doc.text("^", startX + gridW / 2, startY - 2, { align: "center" });
  }
  doc.setTextColor(0);
}
