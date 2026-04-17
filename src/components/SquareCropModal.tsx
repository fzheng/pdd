"use client";

import { useEffect, useRef, useState } from "react";
import { cropImageToSquare } from "@/lib/imageUtils";
import { useI18n } from "@/i18n/I18nProvider";

interface SquareCropModalProps {
  file: File | null;
  onConfirm: (cropped: HTMLImageElement, srcSize: number) => void;
  onCancel: () => void;
}

const VIEWPORT = 380;

export default function SquareCropModal({
  file,
  onConfirm,
  onCancel,
}: SquareCropModalProps) {
  const { t } = useI18n();
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) {
      setSrcUrl(null);
      setImg(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrcUrl(url);
    const el = new Image();
    el.onload = () => setImg(el);
    el.src = url;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  if (!file || !srcUrl || !img) return null;

  // Base scale: "cover" — shorter side of source fills the viewport
  const baseScale = VIEWPORT / Math.min(img.naturalWidth, img.naturalHeight);
  const scale = baseScale * zoom;
  const displayedW = img.naturalWidth * scale;
  const displayedH = img.naturalHeight * scale;
  const maxOffX = Math.max(0, (displayedW - VIEWPORT) / 2);
  const maxOffY = Math.max(0, (displayedH - VIEWPORT) / 2);

  function clampOffset(x: number, y: number) {
    return {
      x: Math.max(-maxOffX, Math.min(maxOffX, x)),
      y: Math.max(-maxOffY, Math.min(maxOffY, y)),
    };
  }

  function handlePointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.sx;
    const dy = e.clientY - dragRef.current.sy;
    setOffset(clampOffset(dragRef.current.ox + dx, dragRef.current.oy + dy));
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleZoomChange(z: number) {
    setZoom(z);
    if (!img) return;
    // Re-clamp pan under new zoom
    const newBase = VIEWPORT / Math.min(img.naturalWidth, img.naturalHeight);
    const newScale = newBase * z;
    const newMaxX = Math.max(0, (img.naturalWidth * newScale - VIEWPORT) / 2);
    const newMaxY = Math.max(0, (img.naturalHeight * newScale - VIEWPORT) / 2);
    setOffset((o) => ({
      x: Math.max(-newMaxX, Math.min(newMaxX, o.x)),
      y: Math.max(-newMaxY, Math.min(newMaxY, o.y)),
    }));
  }

  async function handleConfirm() {
    if (!img) return;
    setBusy(true);
    try {
      // Convert viewport crop into source-pixel coordinates
      const srcViewportSize = VIEWPORT / scale;
      const srcCx = img.naturalWidth / 2 - offset.x / scale;
      const srcCy = img.naturalHeight / 2 - offset.y / scale;
      const srcX = srcCx - srcViewportSize / 2;
      const srcY = srcCy - srcViewportSize / 2;
      const cropped = await cropImageToSquare(img, srcX, srcY, srcViewportSize);
      onConfirm(cropped, srcViewportSize);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[3px] flex items-center justify-center p-4 animate-reveal"
      role="dialog"
      aria-modal="true"
    >
      <div className="card p-5 sm:p-6 max-w-[460px] w-full">
        <div className="flex items-center justify-between mb-3 gap-3">
          <span className="display text-[1.35rem] text-ink leading-none">
            {t("crop.title")}
          </span>
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-full hover:bg-paper-2 flex items-center justify-center transition-colors"
            aria-label={t("common.close")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className="text-[0.82rem] text-ink-soft mb-4">
          {t("crop.hint")}
        </p>

        <div
          className="relative mx-auto overflow-hidden rounded-[16px] bg-paper-2 select-none touch-none"
          style={{ width: VIEWPORT, height: VIEWPORT }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={srcUrl}
            alt=""
            draggable={false}
            className="absolute top-1/2 left-1/2 pointer-events-none max-w-none"
            style={{
              width: displayedW,
              height: displayedH,
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              cursor: "grab",
            }}
          />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 ring-1 ring-paper/60 rounded-[16px]" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-paper/40" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-paper/40" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-paper/40" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-paper/40" />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
            className="riso flex-1"
            aria-label="Zoom"
          />
          <span className="font-mono text-[0.78rem] text-ink tabular-nums min-w-[54px] text-right">
            {zoom.toFixed(2)}×
          </span>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="btn btn-ghost">
            {t("common.cancel")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="btn btn-ink"
          >
            {busy ? t("common.working") : t("crop.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
