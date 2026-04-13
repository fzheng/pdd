"use client";

import { useState } from "react";
import { PipelineSettings, BeadPattern as BeadPatternType } from "@/types";
import { perlerPalette } from "@/data/perlerPalette";
import { loadImage } from "@/lib/imageUtils";
import { generatePattern } from "@/lib/pipeline";
import ImageUploader from "@/components/ImageUploader";
import ControlPanel from "@/components/ControlPanel";
import ImagePreview from "@/components/ImagePreview";
import BeadPatternView from "@/components/BeadPattern";
import BeadInventory from "@/components/BeadInventory";

const defaultSettings: PipelineSettings = {
  gridWidth: 29,
  gridHeight: 29,
  palette: perlerPalette,
  algorithm: "rgb-euclidean",
  ditheringEnabled: false,
};

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [settings, setSettings] = useState<PipelineSettings>(defaultSettings);
  const [pattern, setPattern] = useState<BeadPatternType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleImageSelected(file: File) {
    setImageFile(file);
    const img = await loadImage(file);
    setImageElement(img);
    setPattern(null);
  }

  function handleGenerate() {
    if (!imageElement) return;
    setIsProcessing(true);
    // Use requestAnimationFrame to let the UI update before blocking
    requestAnimationFrame(() => {
      const result = generatePattern(imageElement, settings);
      setPattern(result);
      setIsProcessing(false);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Perler Bead Pattern Generator
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Convert images into perler bead patterns
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <ImageUploader onImageSelected={handleImageSelected} />

        <ControlPanel
          settings={settings}
          onSettingsChange={setSettings}
          onGenerate={handleGenerate}
          isProcessing={isProcessing}
          hasImage={!!imageElement}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImagePreview imageFile={imageFile} />
          <BeadPatternView pattern={pattern} />
        </div>

        <BeadInventory pattern={pattern} />
      </main>
    </div>
  );
}
