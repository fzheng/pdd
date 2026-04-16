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
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl p-5 shadow-2xl max-w-[460px] w-full border-4 border-pink-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold text-pink-600">
            ✂️ {t("crop.title")}
          </h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-500 font-bold text-lg flex items-center justify-center"
            aria-label={t("common.close")}
          >
            ×
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-3">{t("crop.hint")}</p>

        <div
          className="relative mx-auto overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 select-none touch-none"
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
          {/* 3×3 grid overlay for composition */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 border-2 border-white/80 rounded-2xl" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs font-bold text-pink-500">🔍</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
            className="flex-1 accent-pink-400"
          />
          <span className="text-xs font-mono text-gray-500 w-10 text-right">
            {zoom.toFixed(2)}×
          </span>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={busy}
            className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-pink-400 to-purple-400 rounded-full shadow hover:shadow-lg disabled:opacity-50"
          >
            {busy ? t("common.working") : t("crop.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
