"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { PipelineSettings, BeadColor } from "@/types";
import { perlerPalette } from "@/data/perlerPalette";
import { loadImage, suggestGridSize } from "@/lib/imageUtils";
import { generatePattern, setCellColor, replaceColor } from "@/lib/pipeline";
import {
  PatternHistory,
  emptyHistory,
  pushPattern,
  undo,
  redo,
  canUndo,
  canRedo,
} from "@/lib/history";
import ImageUploader from "@/components/ImageUploader";
import ControlPanel from "@/components/ControlPanel";
import ImagePreview from "@/components/ImagePreview";
import BeadPatternView from "@/components/BeadPattern";
import BeadInventory from "@/components/BeadInventory";
import ComparisonSlider from "@/components/ComparisonSlider";
import ExportPanel from "@/components/ExportPanel";
import EditorToolbar, { EditMode } from "@/components/EditorToolbar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/I18nProvider";

const defaultSettings: PipelineSettings = {
  gridWidth: 58,
  gridHeight: 58,
  palette: perlerPalette,
  algorithm: "ciede2000",
  dithering: "none",
  maxColors: 0,
  mirror: false,
  saturation: 1.05,
};

export default function Home() {
  const { t } = useI18n();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<PipelineSettings>(defaultSettings);
  const [history, setHistory] = useState<PatternHistory>(emptyHistory());
  const [isProcessing, setIsProcessing] = useState(false);

  const [editMode, setEditMode] = useState<EditMode>("none");
  const [activeColor, setActiveColor] = useState<BeadColor | null>(null);

  const pattern = history.present;

  const handleImageSelected = useCallback(async (file: File) => {
    setImageFile(file);
    const img = await loadImage(file);
    setImageElement(img);
    setHistory(emptyHistory());
    setEditMode("none");
    setActiveColor(null);
    // Auto-adjust grid to preserve image aspect ratio
    const suggested = suggestGridSize(img, 58);
    setSettings((s) => ({ ...s, gridWidth: suggested.width, gridHeight: suggested.height }));
  }, []);

  const handleGenerate = useCallback(() => {
    if (!imageElement) return;
    setIsProcessing(true);
    requestAnimationFrame(() => {
      try {
        const result = generatePattern(imageElement, settings);
        setHistory((h) => pushPattern(h, result));
      } finally {
        setIsProcessing(false);
      }
    });
  }, [imageElement, settings]);

  const handleCellClick = useCallback(
    (row: number, col: number, existing: BeadColor) => {
      if (!pattern) return;

      if (editMode === "brush") {
        if (!activeColor) {
          setActiveColor(existing);
          return;
        }
        if (existing.id === activeColor.id) return;
        const next = setCellColor(pattern, row, col, activeColor);
        setHistory((h) => pushPattern(h, next));
        return;
      }

      if (editMode === "replace") {
        if (!activeColor) {
          setActiveColor(existing);
          return;
        }
        if (existing.id === activeColor.id) return;
        const next = replaceColor(pattern, existing.id, activeColor);
        setHistory((h) => pushPattern(h, next));
        return;
      }
    },
    [pattern, editMode, activeColor],
  );

  const handleUndo = useCallback(() => setHistory((h) => undo(h)), []);
  const handleRedo = useCallback(() => setHistory((h) => redo(h)), []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo, handleRedo]);

  const headerEmojis = useMemo(() => ["🧸", "🌈", "🎨", "✨", "🍬", "🐻"], []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b-2 border-pink-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-pink-600 leading-tight">
              {t("app.title")}
            </h1>
            <p className="text-xs sm:text-sm text-purple-400 -mt-0.5">
              {t("app.tagline")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-1 text-lg">
              {headerEmojis.map((e, i) => (
                <span key={i} className="animate-bounce-slow" style={{ animationDelay: `${i * 0.15}s` }}>
                  {e}
                </span>
              ))}
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <ImageUploader onImageSelected={handleImageSelected} />

        <ControlPanel
          settings={settings}
          onSettingsChange={setSettings}
          onGenerate={handleGenerate}
          isProcessing={isProcessing}
          hasImage={!!imageElement}
        />

        {pattern && (
          <EditorToolbar
            mode={editMode}
            onModeChange={(m) => {
              setEditMode(m);
              if (m === "none") setActiveColor(null);
            }}
            activeColor={activeColor}
            canUndo={canUndo(history)}
            canRedo={canRedo(history)}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ImagePreview imageFile={imageFile} />
          <BeadPatternView
            pattern={pattern}
            editMode={editMode}
            activeColor={activeColor}
            onCellClick={handleCellClick}
          />
        </div>

        <ComparisonSlider imageFile={imageFile} pattern={pattern} />

        <ExportPanel pattern={pattern} />

        <BeadInventory
          pattern={pattern}
          onPickColor={
            editMode !== "none"
              ? (c) => setActiveColor(c)
              : undefined
          }
          activeColorId={activeColor?.id}
        />

        <footer className="text-center text-xs text-purple-400 py-6">
          {t("footer.madeWith")} 🌸
        </footer>
      </main>
    </div>
  );
}
