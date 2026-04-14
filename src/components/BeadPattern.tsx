"use client";

import { useRef, useEffect, MouseEvent, useState } from "react";
import { BeadPattern as BeadPatternType, BeadColor } from "@/types";
import { renderPatternToCanvas, BeadShape } from "@/lib/renderPattern";
import { useI18n } from "@/i18n/I18nProvider";

interface BeadPatternProps {
  pattern: BeadPatternType | null;
  editMode?: "none" | "brush" | "replace";
  activeColor?: BeadColor | null;
  onCellClick?: (row: number, col: number, existingColor: BeadColor) => void;
}

export default function BeadPattern({
  pattern,
  editMode = "none",
  activeColor,
  onCellClick,
}: BeadPatternProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cellSizeRef = useRef(16);

  const [shape, setShape] = useState<BeadShape>("circle");
  const [showLabels, setShowLabels] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pattern) return;

    const containerWidth = containerRef.current?.clientWidth ?? 600;
    const maxCellSize = Math.floor((containerWidth - 16) / pattern.width);
    const cs = Math.max(6, Math.min(32, maxCellSize));
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
  }, [pattern, shape, showLabels]);

  function handleClick(e: MouseEvent<HTMLCanvasElement>) {
    if (!pattern || editMode === "none" || !onCellClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const cs = cellSizeRef.current;
    const col = Math.floor(x / cs);
    const row = Math.floor(y / cs);
    if (col < 0 || col >= pattern.width || row < 0 || row >= pattern.height) return;
    onCellClick(row, col, pattern.cells[row][col].beadColor);
  }

  const cursor =
    editMode === "brush"
      ? activeColor
        ? "cell"
        : "not-allowed"
      : editMode === "replace"
        ? "pointer"
        : "default";

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-3xl border-4 border-pink-200 p-4 shadow-lg"
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
        <div className="overflow-auto max-h-[600px] rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 p-2">
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            style={{ cursor, imageRendering: "auto" }}
            className="rounded-xl"
          />
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl">
          {t("preview.patternPrompt")}
        </div>
      )}
    </div>
  );
}
