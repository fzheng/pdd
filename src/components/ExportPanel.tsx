"use client";

import { useState } from "react";
import { BeadPattern } from "@/types";
import { exportPatternAsPng } from "@/lib/exportPng";
import { exportPatternAsPdf, PdfLabels } from "@/lib/exportPdf";
import { useI18n } from "@/i18n/I18nProvider";

const PEGBOARD = 29;

interface ExportPanelProps {
  pattern: BeadPattern | null;
}

export default function ExportPanel({ pattern }: ExportPanelProps) {
  const { t } = useI18n();
  const [cellSizeMm, setCellSizeMm] = useState(5);
  const [busy, setBusy] = useState<null | "png" | "pdf">(null);

  if (!pattern) return null;

  async function doPng() {
    if (!pattern) return;
    setBusy("png");
    try {
      exportPatternAsPng(
        pattern,
        `bead-pattern-${pattern.width}x${pattern.height}.png`,
        28,
      );
    } finally {
      setBusy(null);
    }
  }

  async function doPdf() {
    if (!pattern) return;
    setBusy("pdf");
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const total = Array.from(pattern.colorCounts.values()).reduce(
        (s, e) => s + e.count,
        0,
      );
      const colsOfBoards = Math.ceil(pattern.width / PEGBOARD);
      const rowsOfBoards = Math.ceil(pattern.height / PEGBOARD);

      const labels: PdfLabels = {
        size: t("pdf.size", { w: pattern.width, h: pattern.height }),
        totalBeads: t("pdf.totalBeads", { n: total }),
        colorsCount: t("pdf.colorsCount", { n: pattern.colorCounts.size }),
        pegboards: t("pdf.pegboards", {
          size: PEGBOARD,
          cols: colsOfBoards,
          rows: rowsOfBoards,
        }),
        shoppingList: t("pdf.shoppingList"),
        colSwatch: t("pdf.col.swatch"),
        colName: t("pdf.col.name"),
        colSku: t("pdf.col.sku"),
        colBrand: t("pdf.col.brand"),
        colCount: t("pdf.col.count"),
        boardOf: (r, c, rows, cols) =>
          t("pdf.boardOf", { r: r + 1, c: c + 1, rows, cols }),
        beadRange: (x0, x1, y0, y1) =>
          t("pdf.beadRange", { x0: x0 + 1, x1, y0: y0 + 1, y1 }),
        footer: t("footer.madeWith"),
      };

      exportPatternAsPdf(pattern, {
        cellSizeMm,
        fileName: `bead-pattern-${pattern.width}x${pattern.height}.pdf`,
        labels,
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="bg-white rounded-3xl border-4 border-blue-200 p-5 shadow-lg flex flex-wrap items-end gap-4">
      <h3 className="text-sm font-bold text-blue-500 w-full flex items-center gap-1">
        💾 {t("export.title")}
      </h3>

      <div>
        <label className="block text-xs font-bold text-blue-500 mb-1">
          {t("export.cellSize")}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={2}
            max={10}
            step={0.5}
            value={cellSizeMm}
            onChange={(e) => setCellSizeMm(parseFloat(e.target.value))}
            className="w-32 accent-blue-400"
          />
          <span className="text-xs font-mono text-gray-500 w-10">
            {cellSizeMm.toFixed(1)}mm
          </span>
        </div>
      </div>

      <button
        onClick={doPng}
        disabled={busy !== null}
        className="px-5 py-2 bg-gradient-to-r from-sky-400 to-blue-400 text-white text-sm font-bold rounded-full shadow hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all"
      >
        {busy === "png" ? t("export.generating") : t("export.png")}
      </button>

      <button
        onClick={doPdf}
        disabled={busy !== null}
        className="px-5 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm font-bold rounded-full shadow hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all"
      >
        {busy === "pdf" ? t("export.generating") : t("export.pdf")}
      </button>
    </div>
  );
}
