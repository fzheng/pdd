import { jsPDF } from "jspdf";
import { BeadPattern, PatternCell } from "@/types";

const PEGBOARD = 29;

export interface PdfExportOptions {
  cellSizeMm: number; // 0.1 – 10
  fileName: string;
  title?: string;
  showColorCodes?: boolean;
}

/**
 * Export a bead pattern as a multi-page A4 PDF with:
 * - Cover page with overview + shopping list
 * - One page per 29×29 pegboard section with alignment info
 */
export function exportPatternAsPdf(
  pattern: BeadPattern,
  options: PdfExportOptions,
): void {
  const { cellSizeMm, fileName, title, showColorCodes = true } = options;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 12;

  // Cover / overview page
  renderCoverPage(doc, pattern, title ?? fileName, margin, pageW, pageH);

  // Pegboard section pages
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
): void {
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, margin, (y += 8));

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  y += 6;
  doc.text(`Size: ${pattern.width} × ${pattern.height} beads`, margin, y);

  const total = Array.from(pattern.colorCounts.values()).reduce(
    (s, e) => s + e.count,
    0,
  );
  y += 5;
  doc.text(
    `Total beads: ${total}   Colors: ${pattern.colorCounts.size}`,
    margin,
    y,
  );

  const colsOfBoards = Math.ceil(pattern.width / PEGBOARD);
  const rowsOfBoards = Math.ceil(pattern.height / PEGBOARD);
  y += 5;
  doc.text(
    `Pegboards (${PEGBOARD}×${PEGBOARD}): ${colsOfBoards} × ${rowsOfBoards}`,
    margin,
    y,
  );
  doc.setTextColor(0);

  // Preview thumbnail (max ~80mm wide)
  y += 6;
  const previewMaxW = Math.min(pageW - 2 * margin, 80);
  const previewCellPx = 4;
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = pattern.width * previewCellPx;
  thumbCanvas.height = pattern.height * previewCellPx;
  const tctx = thumbCanvas.getContext("2d")!;
  for (let row = 0; row < pattern.height; row++) {
    for (let col = 0; col < pattern.width; col++) {
      tctx.fillStyle = pattern.cells[row][col].beadColor.hex;
      tctx.fillRect(
        col * previewCellPx,
        row * previewCellPx,
        previewCellPx,
        previewCellPx,
      );
    }
  }
  const dataUrl = thumbCanvas.toDataURL("image/png");
  const ratio = pattern.height / pattern.width;
  const previewH = previewMaxW * ratio;
  doc.addImage(dataUrl, "PNG", margin, y, previewMaxW, previewH);

  // Shopping list
  y += previewH + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Shopping List", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  y += 5;

  const entries = Array.from(pattern.colorCounts.values()).sort(
    (a, b) => b.count - a.count,
  );

  const col1X = margin;
  const col2X = margin + 10;
  const col3X = margin + 45;
  const col4X = margin + 75;
  const col5X = pageW - margin - 15;

  doc.setTextColor(100);
  doc.text("Swatch", col1X, y);
  doc.text("Name", col2X, y);
  doc.text("SKU", col3X, y);
  doc.text("Brand", col4X, y);
  doc.text("Count", col5X, y, { align: "right" });
  doc.setTextColor(0);
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

    doc.setFontSize(9);
    doc.text(color.name, col2X, y);
    doc.setFont("courier", "normal");
    doc.text(color.sku, col3X, y);
    doc.setFont("helvetica", "normal");
    doc.text(color.brand, col4X, y);
    doc.setFont("courier", "normal");
    doc.text(String(count), col5X, y, { align: "right" });
    doc.setFont("helvetica", "normal");

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
): void {
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(
    `Board ${boardRow + 1}-${boardCol + 1} of ${totalBoardRows}×${totalBoardCols}`,
    margin,
    y + 5,
  );
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  const x0 = boardCol * PEGBOARD;
  const y0 = boardRow * PEGBOARD;
  const x1 = Math.min(x0 + PEGBOARD, pattern.width);
  const y1 = Math.min(y0 + PEGBOARD, pattern.height);
  doc.text(
    `Bead range: columns ${x0 + 1}–${x1}, rows ${y0 + 1}–${y1}`,
    margin,
    y,
  );
  doc.setTextColor(0);
  y += 4;

  // Scale cell to fit page if cellSizeMm too big
  const usableW = pageW - 2 * margin;
  const usableH = pageH - y - margin;
  const maxCellW = usableW / PEGBOARD;
  const maxCellH = usableH / PEGBOARD;
  const cs = Math.min(cellSizeMm, maxCellW, maxCellH);

  const gridW = cs * PEGBOARD;
  const gridH = cs * PEGBOARD;
  const startX = margin;
  const startY = y;

  // Draw cells
  for (let row = 0; row < PEGBOARD; row++) {
    for (let col = 0; col < PEGBOARD; col++) {
      const px = startX + col * cs;
      const py = startY + row * cs;
      const gx = x0 + col;
      const gy = y0 + row;

      if (gx >= pattern.width || gy >= pattern.height) {
        // Empty cell beyond pattern bounds
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
        doc.setTextColor(luma > 128 ? 0 : 255);
        doc.setFontSize(Math.max(4, cs * 1.8));
        const label = cell.beadColor.sku.replace(/^[A-Z]+/, "").slice(-3);
        doc.text(label, px + cs / 2, py + cs / 2 + 0.3, {
          align: "center",
          baseline: "middle",
        });
      }
    }
  }

  // Edge labels (column/row numbers)
  doc.setTextColor(120);
  doc.setFontSize(6);
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
    doc.text("→", startX + gridW + 2, startY + gridH / 2);
  }
  if (boardCol > 0) {
    doc.text("←", startX - 4, startY + gridH / 2);
  }
  if (boardRow + 1 < totalBoardRows) {
    doc.text("↓", startX + gridW / 2, startY + gridH + 4);
  }
  if (boardRow > 0) {
    doc.text("↑", startX + gridW / 2, startY - 2);
  }
  doc.setTextColor(0);
}
