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
      className="fixed inset-0 z-50 bg-ink/55 backdrop-blur-[3px] flex items-center justify-center p-4 animate-reveal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card p-5 sm:p-6 max-w-5xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 gap-3">
          <span className="display text-[1.35rem] text-ink leading-none">
            {t("preview.comparison")}
          </span>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-paper-2 flex items-center justify-center transition-colors"
            aria-label={t("common.close")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-[16px] select-none"
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
            className="absolute top-0 bottom-0 w-[2px] bg-paper pointer-events-none"
            style={{ left: `${sliderPct}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-paper shadow-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M10 6l-5 6 5 6M14 6l5 6-5 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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

        <p className="text-[0.82rem] text-ink-soft text-center mt-4">
          {t("compare.hint")}
        </p>
      </div>
    </div>
  );
}
