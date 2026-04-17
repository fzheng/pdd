"use client";

import { useEffect } from "react";
import { BeadColor, BeadPattern } from "@/types";
import { useI18n } from "@/i18n/I18nProvider";
import ColorTile from "@/components/ColorTile";

interface ColorPickerSheetProps {
  open: boolean;
  pattern: BeadPattern;
  activeColor: BeadColor | null;
  onPick: (color: BeadColor) => void;
  onClose: () => void;
}

/**
 * Bottom sheet that slides up over the focus-mode canvas. Renders the
 * pattern's color inventory as a responsive grid of tiles. Esc and
 * scrim-tap close the sheet; tapping a tile fires onPick.
 */
export default function ColorPickerSheet({
  open,
  pattern,
  activeColor,
  onPick,
  onClose,
}: ColorPickerSheetProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const entries = Array.from(pattern.colorCounts.values()).sort(
    (a, b) => b.count - a.count,
  );

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-ink/25 backdrop-blur-[2px] animate-reveal"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("focus.colorPickerTitle")}
        className="fixed left-0 right-0 bottom-0 z-[81] bg-paper rounded-t-[24px] shadow-[0_-8px_24px_-10px_rgba(27,20,24,0.35)] flex flex-col animate-reveal"
        style={{ height: "min(60vh, 560px)" }}
      >
        <header className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--hairline)]">
          <span className="display text-[1.2rem] text-ink">
            {t("focus.colorPickerTitle")}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-paper-2 flex items-center justify-center transition-colors"
            aria-label={t("common.close")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>
        <div className="overflow-auto p-3 flex-1">
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
            }}
          >
            {entries.map(({ color, count }) => (
              <ColorTile
                key={color.id}
                color={color}
                count={count}
                variant="grid"
                active={color.id === activeColor?.id}
                onSelect={onPick}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
