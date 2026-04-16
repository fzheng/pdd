import { jsPDF } from "jspdf";
import { BeadColor, BeadPattern, PatternCell } from "@/types";
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
  cellSizeMm: number; // 0.1 – 10 — only used when splitByPegboard is true
  fileName: string;
  title?: string;
  showColorCodes?: boolean;
  /**
   * If true, emits one page per 29×29 pegboard section (for physical
   * assembly). If false (default), renders the entire pattern on a single
   * fit-to-page diagram.
   */
  splitByPegboard?: boolean;
  /**
   * Optional callback that localizes a bead-color name for display in the
   * shopping list. Falls back to `color.name` when omitted.
   */
  nameForColor?: (color: BeadColor) => string;
  labels: PdfLabels;
}

/**
 * Export a bead pattern as a multi-page A4 PDF.
 *
 * - Cover page: overview + shopping list.
 * - If `splitByPegboard` is true: one page per 29×29 pegboard section with
 *   alignment info (useful for physical assembly on standard pegboards).
 * - Otherwise: one page containing the full pattern, auto-scaled to fit A4.
 *
 * All human-readable text uses the provided `labels` so the PDF matches
 * the app's current locale (including CJK via canvas-rendered text).
 */
export function exportPatternAsPdf(
  pattern: BeadPattern,
  options: PdfExportOptions,
): void {
  const {
    cellSizeMm,
    fileName,
    title,
    showColorCodes = true,
    splitByPegboard = false,
    nameForColor = (c) => c.name,
    labels,
  } = options;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 12;

  renderCoverPage(
    doc,
    pattern,
    title ?? fileName,
    margin,
    pageW,
    pageH,
    labels,
    splitByPegboard,
    nameForColor,
  );

  if (splitByPegboard) {
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
  } else {
    doc.addPage();
    renderSinglePatternPage(
      doc,
      pattern,
      margin,
      pageW,
      pageH,
      showColorCodes,
      labels,
    );
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
  showPegboardCount: boolean,
  nameForColor: (c: BeadColor) => string,
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

  if (showPegboardCount) {
    drawText(doc, labels.pegboards, margin, y, {
      fontSizePt: 10,
      color: [100, 100, 100],
    });
    y += 5;
  }
  y += 1;

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

    drawText(doc, nameForColor(color), col2X, y, { fontSizePt: 9 });
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

      if (showColorCodes && cs >= 3) {
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        const textColor: [number, number, number] = luma > 140 ? [0, 0, 0] : [255, 255, 255];
        doc.setFont("helvetica", "normal");
        doc.setFontSize(Math.max(4, cs * 1.6));
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        // Strip every non-digit from the SKU so brands that use mixed
        // alphanumeric codes ("P245", "H045B") still render a clean number.
        const digits = cell.beadColor.sku.replace(/[^0-9]/g, "");
        const label = cs < 4 ? digits.slice(-2) : digits.slice(-3);
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

/**
 * Render the complete pattern on a single A4 page, auto-scaled to fit.
 * Includes row/column edge labels and 29-cell pegboard dividers so users
 * can still cross-reference against physical boards if they want to.
 */
function renderSinglePatternPage(
  doc: jsPDF,
  pattern: BeadPattern,
  margin: number,
  pageW: number,
  pageH: number,
  showColorCodes: boolean,
  labels: PdfLabels,
): void {
  let y = margin + 5;

  drawText(doc, labels.size, margin, y, { fontSizePt: 12, bold: true });
  y += 7;

  const edgeLabelPad = 4;
  const usableW = pageW - 2 * margin - edgeLabelPad;
  const usableH = pageH - y - margin - edgeLabelPad;
  const cs = Math.min(usableW / pattern.width, usableH / pattern.height);

  const gridW = cs * pattern.width;
  const gridH = cs * pattern.height;
  const startX = margin + edgeLabelPad;
  const startY = y + edgeLabelPad;

  for (let row = 0; row < pattern.height; row++) {
    for (let col = 0; col < pattern.width; col++) {
      const px = startX + col * cs;
      const py = startY + row * cs;
      const cell: PatternCell = pattern.cells[row][col];
      const [r, g, b] = cell.beadColor.rgb;
      doc.setFillColor(r, g, b);
      doc.setDrawColor(200);
      doc.setLineWidth(0.03);
      doc.rect(px, py, cs, cs, "FD");

      // Render the SKU code into each cell so crafters can actually
      // assemble the pattern. The label length adapts to the cell size:
      // below ~3mm (≈58×58 on A4) a 3-digit label wouldn't fit, so we
      // drop to the last 2 digits — still enough for cross-reference
      // against the shopping list on the cover page.
      if (showColorCodes && cs >= 2.0) {
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        const textColor: [number, number, number] =
          luma > 140 ? [0, 0, 0] : [255, 255, 255];
        doc.setFont("helvetica", "normal");
        // Font size in pt: 1mm ≈ 2.83pt. Use ~1.45mm text in a 3mm cell.
        doc.setFontSize(Math.max(3, cs * 1.4));
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        const digits = cell.beadColor.sku.replace(/[^0-9]/g, "");
        const label = cs < 3.2 ? digits.slice(-2) : digits.slice(-3);
        doc.text(label, px + cs / 2, py + cs / 2 + 0.2, {
          align: "center",
          baseline: "middle",
        });
      }
    }
  }

  // 29-bead pegboard dividers (visual reference only)
  doc.setDrawColor(80);
  doc.setLineWidth(0.25);
  for (let x = PEGBOARD; x < pattern.width; x += PEGBOARD) {
    doc.line(startX + x * cs, startY, startX + x * cs, startY + gridH);
  }
  for (let yy = PEGBOARD; yy < pattern.height; yy += PEGBOARD) {
    doc.line(startX, startY + yy * cs, startX + gridW, startY + yy * cs);
  }

  // Edge labels every 5 cells
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.setTextColor(120);
  const labelStep = Math.max(5, Math.round(5 / Math.max(cs, 0.5)) * 5);
  for (let col = 0; col < pattern.width; col += labelStep) {
    doc.text(String(col + 1), startX + col * cs + cs / 2, startY - 1, {
      align: "center",
    });
  }
  for (let row = 0; row < pattern.height; row += labelStep) {
    doc.text(String(row + 1), startX - 1, startY + row * cs + cs / 2, {
      align: "right",
      baseline: "middle",
    });
  }
  doc.setTextColor(0);
}
