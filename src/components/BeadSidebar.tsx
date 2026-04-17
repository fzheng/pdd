"use client";

import { useEffect, useState } from "react";
import { BeadColor, BeadPattern } from "@/types";
import { EditMode } from "@/components/EditorToolbar";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedColorName } from "@/i18n/colorNames";
import ColorTile from "@/components/ColorTile";

interface BeadSidebarProps {
  pattern: BeadPattern | null;
  mode: EditMode;
  onModeChange: (mode: EditMode) => void;
  activeColor: BeadColor | null;
  onPickColor: (c: BeadColor) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  /** When true, the drawer is forced closed and the handle hides. */
  forceClosed?: boolean;
}

/**
 * Right-side drawer — the color inventory + edit tools. Closed by default
 * with a quiet floating handle; opens into a calm panel on top of content.
 */
export default function BeadSidebar({
  pattern,
  mode,
  onModeChange,
  activeColor,
  onPickColor,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  forceClosed = false,
}: BeadSidebarProps) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Sync local `open` with parent-controlled `forceClosed`. The lint rule
  // flags setState-in-effect as a smell, but this IS the synchronization
  // point: a parent signal has to drive a local drawer state that the
  // user can also flip on their own.
  useEffect(() => {
    if (forceClosed && open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    }
  }, [forceClosed, open]);

  if (!pattern) return null;

  const entries = Array.from(pattern.colorCounts.values()).sort(
    (a, b) => b.count - a.count,
  );
  const total = entries.reduce((s, e) => s + e.count, 0);

  return (
    <>
      {/* Floating handle */}
      {!open && !forceClosed && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 px-3 py-4 rounded-full bg-ink text-paper shadow-lg hover:scale-[1.04] transition-transform"
          title={t("sidebar.expand")}
          aria-label={t("sidebar.expand")}
        >
          <span
            aria-hidden
            className="grid grid-cols-2 grid-rows-2 gap-[2px] w-5 h-5"
          >
            <span className="rounded-full bg-coral" />
            <span className="rounded-full bg-butter" />
            <span className="rounded-full bg-lime" />
            <span className="rounded-full bg-plum" />
          </span>
          <span className="text-[0.7rem] font-mono tabular-nums">
            {entries.length}
          </span>
        </button>
      )}

      {/* Dim scrim */}
      {open && !forceClosed && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-[2px]"
        />
      )}

      {/* Drawer panel */}
      <aside
        className={`fixed right-0 top-0 h-full z-50 w-[92vw] sm:w-[24rem] bg-paper border-l border-[color:var(--hairline)] shadow-2xl flex flex-col transition-transform duration-200 ease-out ${
          open && !forceClosed
            ? "translate-x-0"
            : "translate-x-full pointer-events-none"
        }`}
        aria-hidden={!open || forceClosed}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--hairline)]">
          <div className="leading-tight">
            <span className="block display text-[1.15rem] text-ink">
              {t("inventory.title")}
            </span>
            <span className="block text-[0.78rem] text-ink-soft">
              {t("inventory.colors", { n: entries.length })} ·{" "}
              {t("inventory.beadsTotal", { n: total })}
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-10 h-10 rounded-full hover:bg-paper-2 flex items-center justify-center transition-colors"
            title={t("sidebar.collapse")}
            aria-label={t("sidebar.collapse")}
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
        </div>

        {/* Edit tools */}
        <div className="p-4 border-b border-[color:var(--hairline)] space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <ToolButton
              active={mode === "brush"}
              onClick={() => onModeChange(mode === "brush" ? "none" : "brush")}
              label={t("editor.brush")}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M4 20l6-2 9-9a2.8 2.8 0 00-4-4l-9 9-2 6z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <ToolButton
              active={mode === "replace"}
              onClick={() =>
                onModeChange(mode === "replace" ? "none" : "replace")
              }
              label={t("editor.replace")}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                  <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M11 8h5M8 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="btn btn-ghost flex-1 justify-center text-[0.82rem] min-h-0 h-9"
            >
              ↶ {t("editor.undo")}
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="btn btn-ghost flex-1 justify-center text-[0.82rem] min-h-0 h-9"
            >
              ↷ {t("editor.redo")}
            </button>
          </div>

          {mode !== "none" && (
            <div className="flex items-center gap-2 text-[0.82rem] bg-paper-2 rounded-xl px-3 py-2 min-h-[44px]">
              {activeColor ? (
                <>
                  <span
                    className="w-5 h-5 rounded-full shrink-0"
                    style={{
                      backgroundColor: activeColor.hex,
                      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
                    }}
                  />
                  <span className="font-medium truncate">
                    {localizedColorName(activeColor.name, locale)}
                  </span>
                  <span className="font-mono text-ink-soft ml-auto text-[0.75rem]">
                    {activeColor.sku}
                  </span>
                </>
              ) : (
                <span className="text-ink-soft text-[0.8rem]">
                  {mode === "brush"
                    ? t("editor.pickColor")
                    : t("editor.replacePrompt")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Color list */}
        <div className="overflow-auto p-2 flex-1">
          <ul className="space-y-1">
            {entries.map(({ color, count }) => (
              <li key={color.id}>
                <ColorTile
                  color={color}
                  count={count}
                  variant="row"
                  active={color.id === activeColor?.id}
                  onSelect={mode !== "none" ? onPickColor : undefined}
                />
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}

function ToolButton({
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
      className={`btn ${active ? "btn-ink" : "btn-ghost"} justify-center w-full min-h-0 h-10 text-[0.85rem]`}
    >
      {icon}
      {label}
    </button>
  );
}
