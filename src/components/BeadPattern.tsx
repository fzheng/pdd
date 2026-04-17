"use client";

import { useState } from "react";
import { BeadPattern as BeadPatternType, BeadColor } from "@/types";
import { BeadShape } from "@/lib/renderPattern";
import { useI18n } from "@/i18n/I18nProvider";
import PatternCanvas from "@/components/PatternCanvas";

interface BeadPatternProps {
  pattern: BeadPatternType | null;
  editMode?: "none" | "brush" | "replace";
  activeColor?: BeadColor | null;
  onCellClick?: (row: number, col: number, existingColor: BeadColor) => void;
  onGenerate?: () => void;
  canGenerate?: boolean;
  isProcessing?: boolean;
}

/**
 * Pattern viewer — a calm paper plane with the bead canvas. Shape toggle
 * and SKU label toggle sit in the header as quiet segmented controls.
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
  const [shape, setShape] = useState<BeadShape>("circle");
  const [showLabels, setShowLabels] = useState(false);

  return (
    <section className="card p-4 sm:p-5 relative">
      {pattern && (
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <span className="font-mono text-[0.72rem] text-ink-soft tabular-nums">
            {pattern.width} × {pattern.height}
          </span>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-full bg-paper-2 p-1">
              <SegmentToggle
                active={shape === "circle"}
                onClick={() => setShape("circle")}
                label={t("preview.shape.circle")}
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
                  </svg>
                }
              />
              <SegmentToggle
                active={shape === "square"}
                onClick={() => setShape("square")}
                label={t("preview.shape.square")}
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="5" y="5" width="14" height="14" stroke="currentColor" strokeWidth="2" />
                  </svg>
                }
              />
            </div>

            <label className="inline-flex items-center gap-2 h-9 px-3 rounded-full border border-[color:var(--hairline)] cursor-pointer select-none hover:bg-paper-2 transition-colors">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="riso"
              />
              <span className="text-[0.8rem] text-ink">
                {t("preview.labels")}
              </span>
            </label>
          </div>
        </div>
      )}

      {pattern ? (
        <div className="overflow-auto rounded-[16px] bg-paper-2 p-3 min-h-[240px]">
          <PatternCanvas
            pattern={pattern}
            shape={shape}
            showLabels={showLabels}
            editMode={editMode}
            activeColor={activeColor ?? null}
            onCellClick={onCellClick}
            maxCellSize={32}
          />
        </div>
      ) : canGenerate && onGenerate ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={isProcessing}
          className="group relative aspect-square w-full rounded-[16px] bg-paper-2 overflow-hidden flex items-center justify-center disabled:cursor-wait transition-colors hover:bg-paper-3/40"
        >
          <span
            className={`btn btn-coral display text-[1.1rem] sm:text-[1.2rem] px-7 py-3.5 tracking-[-0.01em] ${
              isProcessing ? "opacity-80" : ""
            }`}
          >
            {isProcessing ? (
              <>
                <Spinner />
                {t("controls.generating")}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 3l2 6h6l-5 4 2 6-5-3.5-5 3.5 2-6-5-4h6z"
                    fill="currentColor"
                  />
                </svg>
                {t("controls.generate")}
              </>
            )}
          </span>
        </button>
      ) : (
        <div className="min-h-[260px] flex items-center justify-center text-center text-ink-soft bg-paper-2 rounded-[16px] p-8">
          <span className="display-italic text-[1.3rem] sm:text-[1.5rem]">
            {t("preview.patternPrompt")}
          </span>
        </div>
      )}
    </section>
  );
}

function SegmentToggle({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 h-8 px-3 text-[0.78rem] font-medium rounded-full transition-colors ${
        active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
      }`}
    >
      {icon}
      {label}
    </button>
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
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
