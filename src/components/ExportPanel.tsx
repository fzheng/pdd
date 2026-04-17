"use client";

import { useState } from "react";
import { BeadPattern } from "@/types";
import { exportPatternAsPng } from "@/lib/exportPng";
import { exportPatternAsPdf, PdfLabels } from "@/lib/exportPdf";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedColorName } from "@/i18n/colorNames";

const PEGBOARD = 29;

interface ExportPanelProps {
  pattern: BeadPattern | null;
}

export default function ExportPanel({ pattern }: ExportPanelProps) {
  const { t, locale } = useI18n();
  const [cellSizeMm, setCellSizeMm] = useState(5);
  const [splitByPegboard, setSplitByPegboard] = useState(false);
  const [showColorCodes, setShowColorCodes] = useState(true);
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
        splitByPegboard,
        showColorCodes,
        nameForColor: (c) => localizedColorName(c.name, locale),
        labels,
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="card p-5 sm:p-6 flex flex-col lg:flex-row lg:items-end gap-5 lg:gap-8">
      <div className="flex-1 flex flex-col gap-2.5">
        <label className="flex items-center gap-3 cursor-pointer select-none min-h-[44px] px-3 rounded-xl hover:bg-paper-2 transition-colors">
          <input
            type="checkbox"
            checked={showColorCodes}
            onChange={(e) => setShowColorCodes(e.target.checked)}
            className="riso"
          />
          <span className="text-[0.9rem] text-ink">{t("export.showCodes")}</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer select-none min-h-[44px] px-3 rounded-xl hover:bg-paper-2 transition-colors">
          <input
            type="checkbox"
            checked={splitByPegboard}
            onChange={(e) => setSplitByPegboard(e.target.checked)}
            className="riso"
          />
          <span className="text-[0.9rem] text-ink">
            {t("export.splitByPegboard")}
          </span>
        </label>

        {splitByPegboard && (
          <div className="flex items-center gap-3 px-3 pt-1 animate-reveal">
            <span className="text-[0.78rem] text-ink-soft min-w-[110px]">
              {t("export.cellSize")}
            </span>
            <input
              type="range"
              min={2}
              max={10}
              step={0.5}
              value={cellSizeMm}
              onChange={(e) => setCellSizeMm(parseFloat(e.target.value))}
              className="riso flex-1"
              aria-label={t("export.cellSize")}
            />
            <span className="font-mono text-[0.78rem] text-ink tabular-nums min-w-[48px] text-right">
              {cellSizeMm.toFixed(1)} mm
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 lg:min-w-[260px]">
        <button
          onClick={doPng}
          disabled={busy !== null}
          className="btn btn-ghost flex-1 justify-center"
        >
          {busy === "png" ? (
            <>
              <Spinner />
              {t("export.generating")}
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3v12m0 0l-5-5m5 5l5-5M5 21h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("export.png")}
            </>
          )}
        </button>

        <button
          onClick={doPdf}
          disabled={busy !== null}
          className="btn btn-ink flex-1 justify-center"
        >
          {busy === "pdf" ? (
            <>
              <Spinner />
              {t("export.generating")}
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {t("export.pdf")}
            </>
          )}
        </button>
      </div>
    </section>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path
        d="M21 12a9 9 0 00-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
