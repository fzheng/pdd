"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PipelineSettings, BeadColor } from "@/types";
import { perlerPalette } from "@/data/perlerPalette";
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
import BeadSidebar from "@/components/BeadSidebar";
import ExportPanel from "@/components/ExportPanel";
import SquareCropModal from "@/components/SquareCropModal";
import ComparisonModal from "@/components/ComparisonModal";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { type EditMode } from "@/components/EditorToolbar";

const defaultSettings: PipelineSettings = {
  gridSize: 58,
  palette: perlerPalette,
  algorithm: "ciede2000",
  dithering: "none",
  maxColors: 0,
  mirror: false,
  saturation: 1.05,
  despeckle: 6,
};

/**
 * Top-level page. Orchestrates:
 *   1) Upload → SquareCropModal (user picks a square crop)
 *   2) Cropped image → ControlPanel settings → Generate pattern
 *   3) Main grid: small thumbnail (click to compare) + large pattern canvas
 *   4) Right sidebar: edit tools + color inventory (collapsible)
 *   5) Export: PNG or PDF (single page, or one-per-pegboard)
 */
export default function Home() {
  // Upload flow: the *pending* file is what the user just selected and
  // hasn't cropped yet. The *cropped* image is the source of truth after
  // the crop modal is confirmed.
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<HTMLImageElement | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);

  const [settings, setSettings] = useState<PipelineSettings>(defaultSettings);
  const [history, setHistory] = useState<PatternHistory>(emptyHistory());
  const [isProcessing, setIsProcessing] = useState(false);

  const [editMode, setEditMode] = useState<EditMode>("none");
  const [activeColor, setActiveColor] = useState<BeadColor | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);

  // True once the user has generated at least once with the current image.
  // After this, any settings change auto-regenerates (debounced) so the
  // user never needs to hunt for a "regenerate" button.
  const hasGeneratedRef = useRef(false);

  const pattern = history.present;

  const handleImageSelected = useCallback((file: File) => {
    setPendingFile(file);
  }, []);

  const handleCropConfirm = useCallback(
    (cropped: HTMLImageElement) => {
      setCroppedImage(cropped);
      setCroppedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return cropped.src;
      });
      setHistory(emptyHistory());
      setEditMode("none");
      setActiveColor(null);
      setPendingFile(null);
      hasGeneratedRef.current = false;
    },
    [],
  );

  const handleCropCancel = useCallback(() => setPendingFile(null), []);

  useEffect(() => {
    return () => {
      if (croppedUrl && croppedUrl.startsWith("blob:")) {
        URL.revokeObjectURL(croppedUrl);
      }
    };
  }, [croppedUrl]);

  // First-run generate (triggered by the big CTA in the empty pattern area).
  const handleGenerate = useCallback(() => {
    if (!croppedImage) return;
    setIsProcessing(true);
    requestAnimationFrame(() => {
      try {
        const result = generatePattern(croppedImage, settings);
        setHistory((h) => pushPattern(h, result));
        hasGeneratedRef.current = true;
      } finally {
        setIsProcessing(false);
      }
    });
  }, [croppedImage, settings]);

  // Live auto-regenerate: after the first generation, any settings tweak
  // (slider drag, palette swap, dithering toggle…) re-runs the pipeline
  // automatically so the canvas updates in near-real-time. Debounced at
  // 200 ms so dragging a slider doesn't freeze the UI.
  useEffect(() => {
    if (!hasGeneratedRef.current || !croppedImage) return;
    const timer = setTimeout(() => {
      setIsProcessing(true);
      requestAnimationFrame(() => {
        try {
          const result = generatePattern(croppedImage, settings);
          setHistory((h) => pushPattern(h, result));
        } finally {
          setIsProcessing(false);
        }
      });
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only fire on settings change
  }, [settings]);

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

  // Keyboard shortcuts: Cmd/Ctrl-Z undo, Cmd/Ctrl-Shift-Z or Cmd/Ctrl-Y redo.
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

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="max-w-[1400px] mx-auto w-full px-5 sm:px-8 py-6 sm:py-10 space-y-8 flex-1">
        {/* Pre-upload hero: editorial intro + drop zone */}
        {!croppedImage && <ImageUploader onImageSelected={handleImageSelected} />}

        {croppedImage && (
          <ControlPanel settings={settings} onSettingsChange={setSettings} />
        )}

        {/* Working grid. iPad-first: single col portrait, two cols landscape+.
            Drawer is fixed-positioned (below) so toggling it never reflows. */}
        {croppedUrl ? (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(180px,220px)_1fr] gap-5 md:gap-6 items-start">
            <ImagePreview
              imageUrl={croppedUrl}
              canCompare={!!pattern}
              onOpenCompare={() => setCompareOpen(true)}
              onSwapImage={handleImageSelected}
            />
            <div className="min-w-0">
              <BeadPatternView
                pattern={pattern}
                editMode={editMode}
                activeColor={activeColor}
                onCellClick={handleCellClick}
                onGenerate={handleGenerate}
                canGenerate={!!croppedImage}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        ) : (
          <BeadPatternView
            pattern={pattern}
            editMode={editMode}
            activeColor={activeColor}
            onCellClick={handleCellClick}
            onGenerate={handleGenerate}
            canGenerate={!!croppedImage}
            isProcessing={isProcessing}
          />
        )}

        <BeadSidebar
          pattern={pattern}
          mode={editMode}
          onModeChange={(m) => {
            setEditMode(m);
            if (m === "none") setActiveColor(null);
          }}
          activeColor={activeColor}
          onPickColor={setActiveColor}
          canUndo={canUndo(history)}
          canRedo={canRedo(history)}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        <ExportPanel pattern={pattern} />
      </main>

      <SiteFooter />

      <SquareCropModal
        file={pendingFile}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
      />
      <ComparisonModal
        imageUrl={croppedUrl}
        pattern={pattern}
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
      />
    </div>
  );
}
