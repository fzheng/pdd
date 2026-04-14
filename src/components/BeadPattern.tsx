"use client";

import { useRef, useEffect } from "react";
import { BeadPattern as BeadPatternType } from "@/types";
import { renderPatternToCanvas } from "@/lib/renderPattern";

interface BeadPatternProps {
  pattern: BeadPatternType | null;
}

export default function BeadPattern({ pattern }: BeadPatternProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pattern) return;

    // Compute cell size based on container width
    const containerWidth = containerRef.current?.clientWidth ?? 600;
    const maxCellSize = Math.floor((containerWidth - 32) / pattern.width);
    const cellSize = Math.max(8, Math.min(30, maxCellSize));

    canvas.width = pattern.width * cellSize;
    canvas.height = pattern.height * cellSize;

    const ctx = canvas.getContext("2d")!;
    renderPatternToCanvas(ctx, pattern, {
      cellSize,
      showGridLines: true,
      showColorCodes: cellSize >= 14,
    });
  }, [pattern]);

  return (
    <div ref={containerRef} className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Bead Pattern</h3>
      {pattern ? (
        <div className="overflow-auto max-h-[500px]">
          <canvas ref={canvasRef} className="rounded" />
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
          Pattern will appear here
        </div>
      )}
    </div>
  );
}
