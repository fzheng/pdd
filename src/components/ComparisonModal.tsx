"use client";

import { useEffect, useRef, useState } from "react";
import { BeadPattern } from "@/types";
import { renderPatternToCanvas } from "@/lib/renderPattern";
import { useI18n } from "@/i18n/I18nProvider";

interface ComparisonModalProps {
  /** The cropped original image displayed as the "before" side. */
  imageUrl: string | null;
  /** The generated bead pattern drawn as the "after" side. */
  pattern: BeadPattern | null;
  /** Whether the modal is open. */
  open: boolean;
  /** Called when the user closes the modal (X button, backdrop, ESC). */
  onClose: () => void;
}

/**
 * Full-screen overlay that lets the user drag a vertical slider left↔right
 * to compare the original photo against the generated bead pattern at the
 * same aspect/crop. The pattern is rendered onto a canvas so identical
 * per-bead rendering logic is used here as in the main view.
 */
export default function ComparisonModal({
  imageUrl,
  pattern,
  open,
  onClose,
}: ComparisonModalProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sliderPct, setSliderPct] = useState(50);

  // ESC-to-close is a standard modal affordance.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Re-render the pattern canvas whenever the pattern changes OR the modal
  // opens (container has size only once mounted).
  useEffect(() => {
    if (!open || !pattern) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const containerW = container.clientWidth;
    const cs = Math.max(4, Math.floor(containerW / pattern.width));
    canvas.width = pattern.width * cs;
    canvas.height = pattern.height * cs;
    const ctx = canvas.getContext("2d")!;
    renderPatternToCanvas(ctx, pattern, {
      cellSize: cs,
      showGridLines: false,
      showColorCodes: false,
    });
  }, [open, pattern]);

  if (!open || !imageUrl || !pattern) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl p-5 shadow-2xl max-w-5xl w-full border-4 border-purple-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold text-purple-600 flex items-center gap-1">
            🔀 {t("preview.comparison")}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-500 font-bold text-lg flex items-center justify-center"
            aria-label={t("common.close")}
          >
            ×
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-2xl select-none"
          style={{ aspectRatio: `${pattern.width} / ${pattern.height}` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPct}%` }}
          >
            <canvas
              ref={canvasRef}
              className="h-full"
              style={{
                imageRendering: "auto",
                width: `${100 / (sliderPct / 100)}%`,
                maxWidth: "none",
              }}
            />
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_4px_rgba(0,0,0,0.4)] pointer-events-none"
            style={{ left: `${sliderPct}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-2 border-purple-400 shadow flex items-center justify-center">
              ↔
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={sliderPct}
            onChange={(e) => setSliderPct(Number(e.target.value))}
            aria-label={t("preview.comparison")}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          />
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          {t("compare.hint")}
        </p>
      </div>
    </div>
  );
}
