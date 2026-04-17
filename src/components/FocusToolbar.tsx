"use client";

import { BeadColor } from "@/types";
import { BeadShape } from "@/lib/renderPattern";
import { useI18n } from "@/i18n/I18nProvider";

type EditMode = "none" | "brush" | "replace";

interface FocusToolbarProps {
  editMode: EditMode;
  onEditModeChange: (mode: EditMode) => void;
  shape: BeadShape;
  onShapeChange: (shape: BeadShape) => void;
  showLabels: boolean;
  onShowLabelsChange: (next: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  activeColor: BeadColor | null;
  onOpenColorPicker: () => void;
}

/**
 * Bottom-center pill toolbar for focus mode. Brush/replace, circle/square,
 * labels, undo/redo, active-color chip. Responsive: <640 px drops text
 * labels (icons only) and shrinks the color chip.
 */
export default function FocusToolbar({
  editMode,
  onEditModeChange,
  shape,
  onShapeChange,
  showLabels,
  onShowLabelsChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  activeColor,
  onOpenColorPicker,
}: FocusToolbarProps) {
  const { t } = useI18n();
  return (
    <div
      role="toolbar"
      aria-label={t("focus.title")}
      className="fixed z-[71] bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 bg-paper border border-[color:var(--hairline)] rounded-full shadow-[0_10px_30px_-12px_rgba(27,20,24,0.35)] px-3 sm:px-4 py-2"
    >
      <IconButton
        active={editMode === "brush"}
        onClick={() =>
          onEditModeChange(editMode === "brush" ? "none" : "brush")
        }
        label={t("editor.brush")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 20l6-2 9-9a2.8 2.8 0 00-4-4l-9 9-2 6z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </IconButton>
      <IconButton
        active={editMode === "replace"}
        onClick={() =>
          onEditModeChange(editMode === "replace" ? "none" : "replace")
        }
        label={t("editor.replace")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M11 8h5M8 11v5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </IconButton>

      <Divider />

      <div className="inline-flex rounded-full bg-paper-2 p-1">
        <ShapeToggle
          active={shape === "circle"}
          onClick={() => onShapeChange("circle")}
          label={t("preview.shape.circle")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
          </svg>
        </ShapeToggle>
        <ShapeToggle
          active={shape === "square"}
          onClick={() => onShapeChange("square")}
          label={t("preview.shape.square")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="5" y="5" width="14" height="14" stroke="currentColor" strokeWidth="2" />
          </svg>
        </ShapeToggle>
      </div>

      <label className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-full cursor-pointer select-none hover:bg-paper-2 transition-colors">
        <input
          type="checkbox"
          checked={showLabels}
          onChange={(e) => onShowLabelsChange(e.target.checked)}
          className="riso"
          aria-label={t("preview.labels")}
        />
        <span className="text-[0.8rem] text-ink">
          {t("focus.toolbarLabels")}
        </span>
      </label>
      {/* Icon-only fallback for <640 px */}
      <label className="inline-flex sm:hidden items-center h-9 px-2 rounded-full cursor-pointer select-none hover:bg-paper-2 transition-colors">
        <input
          type="checkbox"
          checked={showLabels}
          onChange={(e) => onShowLabelsChange(e.target.checked)}
          className="riso"
          aria-label={t("preview.labels")}
        />
      </label>

      <Divider />

      <IconButton onClick={onUndo} label={t("editor.undo")} disabled={!canUndo}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M9 14l-5-5 5-5m-5 5h10a6 6 0 010 12H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </IconButton>
      <IconButton onClick={onRedo} label={t("editor.redo")} disabled={!canRedo}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 14l5-5-5-5m5 5H10a6 6 0 000 12h5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </IconButton>

      <Divider />

      <button
        type="button"
        onClick={onOpenColorPicker}
        aria-label={t("editor.pickColor")}
        className="inline-flex items-center gap-2 h-10 px-2 sm:px-3 rounded-full hover:bg-paper-2 transition-colors"
      >
        <span
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full"
          style={{
            backgroundColor: activeColor?.hex ?? "transparent",
            boxShadow: activeColor
              ? "inset 0 0 0 1px rgba(0,0,0,0.1)"
              : "inset 0 0 0 2px var(--hairline)",
          }}
        />
        {activeColor && (
          <span className="hidden sm:inline font-mono text-[0.78rem] text-ink-soft">
            {activeColor.sku}
          </span>
        )}
      </button>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="w-px h-6 bg-[color:var(--hairline)]" />;
}

function IconButton({
  onClick,
  label,
  disabled,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
        active
          ? "bg-ink text-paper"
          : "text-ink hover:bg-paper-2 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      }`}
    >
      {children}
    </button>
  );
}

function ShapeToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 h-8 px-2.5 text-[0.78rem] font-medium rounded-full transition-colors ${
        active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
      }`}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
