"use client";

import { BeadColor } from "@/types";
import { useI18n } from "@/i18n/I18nProvider";

export type EditMode = "none" | "brush" | "replace";

interface EditorToolbarProps {
  mode: EditMode;
  onModeChange: (mode: EditMode) => void;
  activeColor: BeadColor | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export default function EditorToolbar({
  mode,
  onModeChange,
  activeColor,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: EditorToolbarProps) {
  const { t } = useI18n();

  return (
    <div className="bg-white rounded-3xl border-4 border-orange-200 p-4 shadow-lg flex flex-wrap items-center gap-3">
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

      {mode !== "none" && (
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-orange-50 rounded-full px-3 py-1.5">
          {activeColor ? (
            <>
              <span
                className="w-5 h-5 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: activeColor.hex }}
              />
              <span className="font-medium">{activeColor.name}</span>
              <span className="font-mono text-gray-400">{activeColor.sku}</span>
            </>
          ) : (
            <span>{mode === "brush" ? t("editor.pickColor") : t("editor.replacePrompt")}</span>
          )}
        </div>
      )}

      <div className="ml-auto flex gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="px-3 py-1.5 text-sm font-bold text-orange-600 bg-orange-50 rounded-full hover:bg-orange-100 disabled:opacity-40 transition-colors"
        >
          ↶ {t("editor.undo")}
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="px-3 py-1.5 text-sm font-bold text-orange-600 bg-orange-50 rounded-full hover:bg-orange-100 disabled:opacity-40 transition-colors"
        >
          ↷ {t("editor.redo")}
        </button>
      </div>
    </div>
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
      className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
        active
          ? "bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-md scale-105"
          : "bg-orange-50 text-orange-600 hover:bg-orange-100"
      }`}
    >
      <span className="mr-1">{emoji}</span>
      {label}
    </button>
  );
}
