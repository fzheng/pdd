"use client";

import { useRef, useEffect, MouseEvent, useState, useCallback } from "react";
import { BeadPattern as BeadPatternType, BeadColor } from "@/types";
import { renderPatternToCanvas, BeadShape } from "@/lib/renderPattern";
import { useI18n } from "@/i18n/I18nProvider";

interface BeadPatternProps {
  pattern: BeadPatternType | null;
  editMode?: "none" | "brush" | "replace";
  activeColor?: BeadColor | null;
  onCellClick?: (row: number, col: number, existingColor: BeadColor) => void;
  /**
   * Fires when the user triggers generation from the empty-state CTA.
   * When provided (and `canGenerate` is true) the placeholder shown
   * before the first pattern becomes a big click-to-generate button.
   */
  onGenerate?: () => void;
  /** True when an image is cropped and ready to generate. */
  canGenerate?: boolean;
  /** True while pipeline is running — disables the CTA and shows a spinner. */
  isProcessing?: boolean;
}

/**
 * Main bead-pattern viewer. Renders the pattern to a canvas (via the shared
 * `renderPatternToCanvas`), supports brush/replace click edits, and shows a
 * floating tooltip with the bead SKU when hovering over a cell.
 *
 * When SKU labels are toggled on, the cell size is clamped up so each label
 * is actually legible — the canvas becomes larger than the container and is
 * scrolled, rather than rendering labels into unreadable sub-pixel blobs.
 */
export default function BeadPattern({
  pattern,
  editMode = "none",
  activeColor,
  onCellClick,
  onGenerate,
  canGenerate = false,
  isProcessing = false,
}: BeadPatternProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cellSizeRef = useRef(16);

  const [shape, setShape] = useState<BeadShape>("circle");
  const [showLabels, setShowLabels] = useState(false);
  // Tracked in state (not a ref) so the tooltip positioning code can read it
  // during render without tripping the react-hooks/refs lint rule.
  const [containerWidth, setContainerWidth] = useState(0);
  // Incremented on window-resize so the canvas re-layout effect reruns.
  const [resizeTick, setResizeTick] = useState(0);
  const [hover, setHover] = useState<{
    color: BeadColor;
    row: number;
    col: number;
    x: number;
    y: number;
  } | null>(null);

  // Keep the canvas size in sync with the viewport. The cell size is picked
  // to fit **both** dimensions — container width AND available viewport
  // height — so a 58×58 pattern stops scrolling on a typical laptop screen.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setResizeTick((t) => t + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // (Re)render the canvas whenever inputs change. Cell size is clamped to
  // whichever viewport dimension is the binding constraint.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !pattern || !container) return;

    const cw = container.clientWidth;
    setContainerWidth(cw);

    // Reserve space below the top of this container for the card header,
    // page footer, and a small visual breathing room. Measured empirically:
    // ~40px is enough to guarantee no scroll on typical laptop heights.
    const rect = container.getBoundingClientRect();
    const availH = Math.max(240, window.innerHeight - rect.top - 40);

    // Card has p-4 (16px each side) plus the inner bg-gradient panel's p-2,
    // ~40px vertical reserved for the shape/labels toolbar inside the card.
    const innerW = cw - 16;
    const innerH = availH - 80;

    const maxByW = Math.floor(innerW / pattern.width);
    const maxByH = Math.floor(innerH / pattern.height);
    let cs = Math.max(4, Math.min(maxByW, maxByH, 32));
    // Labels need ≥14px to render readable SKU tails — if the pattern is
    // dense enough that this overflows the viewport, the container's
    // overflow-auto takes over (by design: legible > no-scroll in this case).
    if (showLabels) cs = Math.max(cs, 14);
    cellSizeRef.current = cs;

    canvas.width = pattern.width * cs;
    canvas.height = pattern.height * cs;

    const ctx = canvas.getContext("2d")!;
    renderPatternToCanvas(ctx, pattern, {
      cellSize: cs,
      shape,
      showGridLines: shape === "square",
      showColorCodes: showLabels,
      background: "#FFFFFF",
    });
  }, [pattern, shape, showLabels, resizeTick]);

  /** Convert a mouse event's viewport coords into a (row, col) cell index. */
  const getCellAt = useCallback(
    (e: MouseEvent<HTMLCanvasElement>): { row: number; col: number } | null => {
      if (!pattern) return null;
      const rect = e.currentTarget.getBoundingClientRect();
      const scaleX = e.currentTarget.width / rect.width;
      const scaleY = e.currentTarget.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const cs = cellSizeRef.current;
      const col = Math.floor(x / cs);
      const row = Math.floor(y / cs);
      if (col < 0 || col >= pattern.width || row < 0 || row >= pattern.height) {
        return null;
      }
      return { row, col };
    },
    [pattern],
  );

  function handleClick(e: MouseEvent<HTMLCanvasElement>) {
    if (!pattern || editMode === "none" || !onCellClick) return;
    const hit = getCellAt(e);
    if (!hit) return;
    onCellClick(hit.row, hit.col, pattern.cells[hit.row][hit.col].beadColor);
  }

  function handleMove(e: MouseEvent<HTMLCanvasElement>) {
    if (!pattern) return;
    const hit = getCellAt(e);
    if (!hit) {
      setHover(null);
      return;
    }
    const color = pattern.cells[hit.row][hit.col].beadColor;
    // Position relative to the scroll container so the tooltip travels with
    // the cursor even inside an overflow-scroll parent.
    const contRect = containerRef.current?.getBoundingClientRect();
    const px = contRect ? e.clientX - contRect.left : e.clientX;
    const py = contRect ? e.clientY - contRect.top : e.clientY;
    setHover({ color, row: hit.row, col: hit.col, x: px, y: py });
  }

  function handleLeave() {
    setHover(null);
  }

  const cursor =
    editMode === "brush"
      ? activeColor
        ? "cell"
        : "not-allowed"
      : editMode === "replace"
        ? "pointer"
        : "crosshair";

  return (
    <div
      ref={containerRef}
      className="relative bg-white rounded-3xl border-4 border-pink-200 p-4 shadow-lg"
    >
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <h3 className="text-sm font-bold text-pink-500 flex items-center gap-1">
          🎨 {t("preview.pattern")}
        </h3>
        {pattern && (
          <div className="flex items-center gap-2 text-xs">
            <div className="inline-flex rounded-full bg-pink-50 p-0.5">
              <button
                onClick={() => setShape("circle")}
                className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                  shape === "circle"
                    ? "bg-pink-400 text-white shadow"
                    : "text-pink-500 hover:bg-pink-100"
                }`}
                title={t("preview.shape.circle")}
              >
                ⚪ {t("preview.shape.circle")}
              </button>
              <button
                onClick={() => setShape("square")}
                className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                  shape === "square"
                    ? "bg-pink-400 text-white shadow"
                    : "text-pink-500 hover:bg-pink-100"
                }`}
                title={t("preview.shape.square")}
              >
                ⬜ {t("preview.shape.square")}
              </button>
            </div>
            <label className="flex items-center gap-1 text-pink-500 font-bold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-pink-400"
              />
              {t("preview.labels")}
            </label>
          </div>
        )}
      </div>

      {pattern ? (
        <div className="overflow-auto rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 p-2">
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ cursor, imageRendering: "auto" }}
            className="rounded-xl"
          />
        </div>
      ) : canGenerate && onGenerate ? (
        // Ready-to-generate state: the placeholder *is* the generate
        // action, because a passive "pattern will appear here" hint left
        // users hunting for the tiny button tucked into the controls bar.
        <button
          type="button"
          onClick={onGenerate}
          disabled={isProcessing}
          className="group aspect-square w-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 transition-colors disabled:cursor-wait"
        >
          <span
            className={`px-8 py-4 text-white text-lg font-extrabold rounded-full shadow-xl transition-transform bg-gradient-to-r from-pink-400 to-purple-400 ${
              isProcessing
                ? "opacity-80"
                : "group-hover:scale-105 group-active:scale-95 animate-pulse-slow"
            }`}
          >
            {isProcessing ? t("controls.generating") : t("controls.generate")}
          </span>
        </button>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl">
          {t("preview.patternPrompt")}
        </div>
      )}

      {/* Hover tooltip — shows the bead's SKU so users can cross-reference
          against the inventory without clicking. */}
      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-gray-900/90 text-white px-2 py-1 text-xs font-mono shadow-lg whitespace-nowrap"
          style={{
            left: Math.min(hover.x + 14, (containerWidth || 9999) - 120),
            top: Math.max(hover.y - 28, 4),
          }}
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-white/40 mr-1.5 align-middle"
            style={{ backgroundColor: hover.color.hex }}
          />
          {hover.color.sku}
        </div>
      )}
    </div>
  );
}
