"use client";

import {
  useRef,
  useEffect,
  MouseEvent,
  useState,
  useCallback,
} from "react";
import { BeadPattern as BeadPatternType, BeadColor } from "@/types";
import { renderPatternToCanvas, BeadShape } from "@/lib/renderPattern";

interface PatternCanvasProps {
  pattern: BeadPatternType;
  shape: BeadShape;
  showLabels: boolean;
  editMode: "none" | "brush" | "replace";
  activeColor: BeadColor | null;
  onCellClick?: (row: number, col: number, existingColor: BeadColor) => void;
  /** Max cell size in px (cap). Card view passes 32, focus mode passes 48. */
  maxCellSize: number;
  /** Minimum cell size when labels are on. Card view: 14, focus mode: 18. */
  minCellSizeWithLabels?: number;
  /** Explicit viewport size overrides; focus mode passes window-sized values. */
  viewportW?: number;
  viewportH?: number;
  /** Canvas background color (hex). Defaults to the paper token. */
  background?: string;
}

/**
 * Pure canvas renderer for a bead pattern. Owns cell-size calculation,
 * `renderPatternToCanvas` invocation, brush/replace cell-click dispatch,
 * and the hover tooltip. The surrounding chrome (header, Focus button,
 * toolbars) lives in each consumer.
 */
export default function PatternCanvas({
  pattern,
  shape,
  showLabels,
  editMode,
  activeColor,
  onCellClick,
  maxCellSize,
  minCellSizeWithLabels = 14,
  viewportW,
  viewportH,
  background = "#FAF6EF",
}: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cellSizeRef = useRef(16);
  const [resizeTick, setResizeTick] = useState(0);
  const [wrapperWidth, setWrapperWidth] = useState(0);
  const [hover, setHover] = useState<{
    color: BeadColor;
    row: number;
    col: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setResizeTick((t) => t + 1);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const containerW =
      viewportW ?? Math.max(240, wrapper.clientWidth - 24);
    setWrapperWidth(wrapper.clientWidth);
    let availH: number;
    if (viewportH !== undefined) {
      availH = viewportH;
    } else {
      const rect = wrapper.getBoundingClientRect();
      availH = Math.max(240, window.innerHeight - rect.top - 40);
    }
    const innerH = availH - 120;

    const maxByW = Math.floor(containerW / pattern.width);
    const maxByH = Math.floor(innerH / pattern.height);
    let cs = Math.max(4, Math.min(maxByW, maxByH, maxCellSize));
    if (showLabels) cs = Math.max(cs, minCellSizeWithLabels);
    cellSizeRef.current = cs;

    canvas.width = pattern.width * cs;
    canvas.height = pattern.height * cs;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderPatternToCanvas(ctx, pattern, {
      cellSize: cs,
      shape,
      showGridLines: shape === "square",
      showColorCodes: showLabels,
      background,
    });
  }, [
    pattern,
    shape,
    showLabels,
    maxCellSize,
    minCellSizeWithLabels,
    viewportW,
    viewportH,
    background,
    resizeTick,
  ]);

  const getCellAt = useCallback(
    (e: MouseEvent<HTMLCanvasElement>): { row: number; col: number } | null => {
      const rect = e.currentTarget.getBoundingClientRect();
      const scaleX = e.currentTarget.width / rect.width;
      const scaleY = e.currentTarget.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const cs = cellSizeRef.current;
      const col = Math.floor(x / cs);
      const row = Math.floor(y / cs);
      if (
        col < 0 ||
        col >= pattern.width ||
        row < 0 ||
        row >= pattern.height
      ) {
        return null;
      }
      return { row, col };
    },
    [pattern],
  );

  function handleClick(e: MouseEvent<HTMLCanvasElement>) {
    if (editMode === "none" || !onCellClick) return;
    const hit = getCellAt(e);
    if (!hit) return;
    onCellClick(hit.row, hit.col, pattern.cells[hit.row][hit.col].beadColor);
  }

  function handleMove(e: MouseEvent<HTMLCanvasElement>) {
    const hit = getCellAt(e);
    if (!hit) {
      setHover(null);
      return;
    }
    const color = pattern.cells[hit.row][hit.col].beadColor;
    const wrapRect = wrapperRef.current?.getBoundingClientRect();
    const px = wrapRect ? e.clientX - wrapRect.left : e.clientX;
    const py = wrapRect ? e.clientY - wrapRect.top : e.clientY;
    setHover({ color, row: hit.row, col: hit.col, x: px, y: py });
  }

  function handleLeave() {
    setHover(null);
  }

  const cursor =
    editMode === "brush"
      ? activeColor
        ? "cell"
        : "not-allowed"
      : editMode === "replace"
        ? "pointer"
        : "crosshair";

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full flex items-center justify-center overflow-auto"
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ cursor, imageRendering: "auto" }}
        className="rounded-md block"
      />
      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-md bg-ink text-paper px-2 py-1 text-[0.72rem] font-mono whitespace-nowrap shadow-lg"
          style={{
            left: Math.min(
              hover.x + 14,
              (wrapperWidth || 9999) - 120,
            ),
            top: Math.max(hover.y - 30, 4),
          }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
            style={{ backgroundColor: hover.color.hex }}
          />
          {hover.color.sku}
        </div>
      )}
    </div>
  );
}
