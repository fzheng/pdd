"use client";

import { useEffect, useState } from "react";
import { BeadColor, BeadPattern } from "@/types";
import { EditMode } from "@/components/EditorToolbar";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedColorName } from "@/i18n/colorNames";

interface BeadSidebarProps {
  pattern: BeadPattern | null;
  // Edit mode state
  mode: EditMode;
  onModeChange: (mode: EditMode) => void;
  activeColor: BeadColor | null;
  onPickColor: (c: BeadColor) => void;
  // History
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

/**
 * Right-side drawer that surfaces the color inventory and edit tools
 * (brush / replace / undo / redo) in one place, so picking a color to
 * paint or replace with is one click away from the tool that uses it.
 *
 * The drawer is **fixed-positioned** and defaults to collapsed — opening
 * it slides a panel in from the right over the pattern instead of
 * pushing the pattern smaller. This keeps the pattern viewport stable
 * whether or not the inventory is visible.
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
}: BeadSidebarProps) {
  const { t, locale } = useI18n();
  // Closed by default — user opts in when they need the color list.
  const [open, setOpen] = useState(false);

  // ESC-to-close is a standard drawer affordance.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  if (!pattern) return null;

  const entries = Array.from(pattern.colorCounts.values()).sort(
    (a, b) => b.count - a.count,
  );
  const total = entries.reduce((s, e) => s + e.count, 0);

  return (
    <>
      {/* Floating "open inventory" handle — visible whenever the drawer
          is closed. Intentionally loud (gradient background, arrow
          nudges outward on hover, subtle pulse ring) so users discover
          the color list without needing to mouse around the right edge. */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group fixed right-0 top-1/2 -translate-y-1/2 z-30 flex items-stretch shadow-2xl hover:shadow-[0_20px_40px_-8px_rgba(16,185,129,0.45)] transition-shadow"
          title={t("sidebar.expand")}
          aria-label={t("sidebar.expand")}
        >
          <span
            aria-hidden
            className="flex items-center px-2 bg-gradient-to-b from-green-400 to-emerald-500 text-white rounded-l-2xl text-lg font-black animate-pulse-slow"
          >
            ‹
          </span>
          <span className="flex flex-col items-center justify-center gap-1 px-3 py-4 bg-gradient-to-br from-emerald-500 to-green-500 text-white font-bold">
            <span className="text-xl leading-none">🎨</span>
            <span
              className="text-[11px] leading-none tracking-wider"
              style={{ writingMode: "vertical-rl" }}
            >
              {t("sidebar.openColors")}
            </span>
            <span className="text-xs font-mono bg-white/25 rounded-full px-1.5 py-0.5 leading-none">
              {entries.length}
            </span>
          </span>
        </button>
      )}

      {/* The drawer itself — rendered on top of content via fixed
          positioning, so toggling it never reflows the pattern. */}
      <aside
        className={`fixed right-0 top-0 h-full z-40 w-[92vw] sm:w-[22rem] bg-white border-l-4 border-green-200 shadow-2xl flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-green-100">
          <h3 className="text-sm font-bold text-green-600 flex items-center gap-1">
            🎨 {t("inventory.title")}
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full bg-green-50 hover:bg-green-100 text-green-600 font-bold flex items-center justify-center"
            title={t("sidebar.collapse")}
            aria-label={t("sidebar.collapse")}
          >
            ×
          </button>
        </div>

        {/* Edit tools */}
        <div className="p-3 border-b-2 border-green-100 flex flex-wrap gap-2">
          <ToolButton
            active={mode === "brush"}
            onClick={() => onModeChange(mode === "brush" ? "none" : "brush")}
            emoji="🖌️"
            label={t("editor.brush")}
          />
          <ToolButton
            active={mode === "replace"}
            onClick={() => onModeChange(mode === "replace" ? "none" : "replace")}
            emoji="🎯"
            label={t("editor.replace")}
          />
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="ml-auto px-3 py-1.5 text-xs font-bold text-white bg-orange-400 rounded-full hover:bg-orange-500 shadow disabled:opacity-30 disabled:shadow-none transition-colors"
            title={t("editor.undo")}
          >
            ↶ {t("editor.undo")}
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="px-3 py-1.5 text-xs font-bold text-white bg-orange-400 rounded-full hover:bg-orange-500 shadow disabled:opacity-30 disabled:shadow-none transition-colors"
            title={t("editor.redo")}
          >
            ↷ {t("editor.redo")}
          </button>

          {/* Active-color chip — only meaningful when a tool is selected. */}
          {mode !== "none" && (
            <div className="w-full flex items-center gap-2 text-xs text-gray-600 bg-orange-50 rounded-full px-3 py-1.5">
              {activeColor ? (
                <>
                  <span
                    className="w-5 h-5 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: activeColor.hex }}
                  />
                  <span className="font-medium truncate">
                    {localizedColorName(activeColor.name, locale)}
                  </span>
                  <span className="font-mono text-gray-400 ml-auto">
                    {activeColor.sku}
                  </span>
                </>
              ) : (
                <span>
                  {mode === "brush" ? t("editor.pickColor") : t("editor.replacePrompt")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Totals row */}
        <div className="px-4 py-2 text-xs text-gray-500 flex items-center justify-between border-b border-green-100">
          <span className="font-bold text-green-600">
            {t("inventory.colors", { n: entries.length })}
          </span>
          <span className="font-bold text-green-600">
            {t("inventory.beadsTotal", { n: total })}
          </span>
        </div>

        {/* Color list — scrollable region fills remaining drawer height */}
        <div className="overflow-auto p-2 flex-1">
          <table className="w-full text-xs">
            <tbody>
              {entries.map(({ color, count }) => {
                const active = color.id === activeColor?.id;
                const clickable = mode !== "none";
                return (
                  <tr
                    key={color.id}
                    onClick={clickable ? () => onPickColor(color) : undefined}
                    className={`border-b border-green-50 transition-colors ${
                      clickable ? "cursor-pointer hover:bg-green-50" : ""
                    } ${active ? "bg-yellow-100" : ""}`}
                  >
                    <td className="py-1.5 pl-1 pr-2 w-8">
                      <div
                        className={`w-5 h-5 rounded-full border-2 shadow-sm ${
                          active ? "border-pink-500 ring-2 ring-pink-300" : "border-white"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                    </td>
                    <td className="py-1.5 pr-1 text-gray-700 truncate max-w-[110px]">
                      {localizedColorName(color.name, locale)}
                    </td>
                    <td className="py-1.5 pr-1 text-gray-500 font-mono text-[10px]">
                      {color.sku}
                    </td>
                    <td className="py-1.5 pr-1 text-right font-mono text-gray-700">
                      {count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </aside>
    </>
  );
}

function ToolButton({
  active,
  onClick,
  emoji,
  label,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
        active
          ? "bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow"
          : "bg-orange-50 text-orange-600 hover:bg-orange-100"
      }`}
    >
      <span className="mr-1">{emoji}</span>
      {label}
    </button>
  );
}
