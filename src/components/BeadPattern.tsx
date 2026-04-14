"use client";

import { useRef, useEffect, MouseEvent } from "react";
import { BeadPattern as BeadPatternType, BeadColor } from "@/types";
import { renderPatternToCanvas } from "@/lib/renderPattern";
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pattern) return;

    const containerWidth = containerRef.current?.clientWidth ?? 600;
    const maxCellSize = Math.floor((containerWidth - 16) / pattern.width);
    const cs = Math.max(6, Math.min(30, maxCellSize));
    cellSizeRef.current = cs;

    canvas.width = pattern.width * cs;
    canvas.height = pattern.height * cs;

    const ctx = canvas.getContext("2d")!;
    renderPatternToCanvas(ctx, pattern, {
      cellSize: cs,
      showGridLines: true,
      showColorCodes: cs >= 14,
    });
  }, [pattern]);

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
      <h3 className="text-sm font-bold text-pink-500 mb-2 flex items-center gap-1">
        🎨 {t("preview.pattern")}
      </h3>
      {pattern ? (
        <div className="overflow-auto max-h-[500px] rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 p-2">
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            style={{ cursor, imageRendering: "pixelated" }}
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
