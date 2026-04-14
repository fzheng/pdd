"use client";

import { useEffect, useRef, useState } from "react";
import { BeadPattern } from "@/types";
import { renderPatternToCanvas } from "@/lib/renderPattern";
import { useI18n } from "@/i18n/I18nProvider";

interface ComparisonSliderProps {
  imageFile: File | null;
  pattern: BeadPattern | null;
}

export default function ComparisonSlider({
  imageFile,
  pattern,
}: ComparisonSliderProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const patternCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [sliderPct, setSliderPct] = useState(50);

  useEffect(() => {
    if (!imageFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImgUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    const canvas = patternCanvasRef.current;
    if (!canvas || !pattern || !containerRef.current) return;
    const containerW = containerRef.current.clientWidth;
    const cs = Math.max(4, Math.floor(containerW / pattern.width));
    canvas.width = pattern.width * cs;
    canvas.height = pattern.height * cs;
    const ctx = canvas.getContext("2d")!;
    renderPatternToCanvas(ctx, pattern, {
      cellSize: cs,
      showGridLines: false,
      showColorCodes: false,
    });
  }, [pattern]);

  if (!imageFile || !pattern) return null;

  return (
    <div className="bg-white rounded-3xl border-4 border-purple-200 p-4 shadow-lg">
      <h3 className="text-sm font-bold text-purple-500 mb-2 flex items-center gap-1">
        🔀 {t("preview.comparison")}
      </h3>
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl select-none"
        style={{ aspectRatio: `${pattern.width} / ${pattern.height}` }}
      >
        {imgUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgUrl}
            alt="original"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        )}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPct}%` }}
        >
          <canvas
            ref={patternCanvasRef}
            className="w-full h-full"
            style={{
              imageRendering: "pixelated",
              // Keep aspect by filling full comparison area (it's already pattern aspect)
              width: `${100 / (sliderPct / 100)}%`,
              maxWidth: "none",
              objectFit: "cover",
            }}
          />
        </div>
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_4px_rgba(0,0,0,0.4)] pointer-events-none"
          style={{ left: `${sliderPct}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-purple-400 shadow flex items-center justify-center text-xs">
            ↔️
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={sliderPct}
          onChange={(e) => setSliderPct(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>
    </div>
  );
}
