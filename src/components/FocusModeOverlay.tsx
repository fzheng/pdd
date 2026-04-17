"use client";

import { useEffect, useRef, useState } from "react";
import { BeadColor, BeadPattern } from "@/types";
import { BeadShape } from "@/lib/renderPattern";
import { useI18n } from "@/i18n/I18nProvider";
import PatternCanvas from "@/components/PatternCanvas";
import FocusToolbar from "@/components/FocusToolbar";
import ColorPickerSheet from "@/components/ColorPickerSheet";

type EditMode = "none" | "brush" | "replace";

interface FocusModeOverlayProps {
  open: boolean;
  pattern: BeadPattern;
  editMode: EditMode;
  onEditModeChange: (m: EditMode) => void;
  activeColor: BeadColor | null;
  onPickColor: (c: BeadColor) => void;
  onCellClick: (row: number, col: number, existing: BeadColor) => void;
  shape: BeadShape;
  onShapeChange: (s: BeadShape) => void;
  showLabels: boolean;
  onShowLabelsChange: (v: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExit: () => void;
}

/**
 * Viewport-covering focus mode. Mounts only when `open`. Body scroll
 * is locked while the overlay is mounted; restored on unmount. Esc
 * closes the picker first if it's open, then the overlay.
 */
export default function FocusModeOverlay({
  open,
  pattern,
  editMode,
  onEditModeChange,
  activeColor,
  onPickColor,
  onCellClick,
  shape,
  onShapeChange,
  showLabels,
  onShowLabelsChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExit,
}: FocusModeOverlayProps) {
  const { t } = useI18n();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [viewport, setViewport] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const previousOverflow = useRef<string>("");

  useEffect(() => {
    if (!open) return;
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow.current;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const measure = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (pickerOpen) return; // Sheet's own handler handles its close.
      onExit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, pickerOpen, onExit]);

  if (!open) return null;

  const availW = Math.max(240, viewport.w - 48);
  const availH = Math.max(240, viewport.h - 160);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("focus.title")}
      className="fixed inset-0 z-[70] bg-paper-2 animate-reveal"
    >
      <div className="absolute top-5 left-5 font-mono text-[0.72rem] text-ink-soft tabular-nums">
        {pattern.width} × {pattern.height}
      </div>

      <button
        type="button"
        onClick={onExit}
        aria-label={t("focus.exit")}
        title={t("focus.exit")}
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-paper border border-[color:var(--hairline)] hover:bg-paper-2 flex items-center justify-center shadow-sm transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M6 18L18 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div
        className="absolute"
        style={{
          top: 56,
          left: 24,
          right: 24,
          bottom: 104,
        }}
      >
        <PatternCanvas
          pattern={pattern}
          shape={shape}
          showLabels={showLabels}
          editMode={editMode}
          activeColor={activeColor}
          onCellClick={onCellClick}
          maxCellSize={48}
          minCellSizeWithLabels={18}
          viewportW={availW}
          viewportH={availH}
        />
      </div>

      <FocusToolbar
        editMode={editMode}
        onEditModeChange={onEditModeChange}
        shape={shape}
        onShapeChange={onShapeChange}
        showLabels={showLabels}
        onShowLabelsChange={onShowLabelsChange}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        activeColor={activeColor}
        onOpenColorPicker={() => setPickerOpen(true)}
      />

      <ColorPickerSheet
        open={pickerOpen}
        pattern={pattern}
        activeColor={activeColor}
        onPick={(c) => {
          onPickColor(c);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
