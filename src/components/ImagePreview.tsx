"use client";

import { useRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";

interface ImagePreviewProps {
  /** Object URL of the cropped source image; null when nothing is uploaded. */
  imageUrl: string | null;
  /** Whether the pattern has been generated — enables the compare action. */
  canCompare: boolean;
  /** Fired when the user clicks the thumbnail to open the compare modal. */
  onOpenCompare: () => void;
  /** Swap-image handler — triggers a new file pick. */
  onSwapImage?: (file: File) => void;
}

/**
 * Compact thumbnail of the user's cropped source image.
 *
 * Once a pattern is generated, clicking the thumbnail opens the
 * before/after comparison modal. The compare affordance is rendered
 * **persistently** as a pill overlaying the image — earlier iterations
 * used hover-only, but users reported they never knew the thumbnail
 * was clickable until they happened to mouse over it.
 */
export default function ImagePreview({
  imageUrl,
  canCompare,
  onOpenCompare,
  onSwapImage,
}: ImagePreviewProps) {
  const { t } = useI18n();
  const swapRef = useRef<HTMLInputElement>(null);

  function handleSwap(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      onSwapImage?.(file);
    }
    e.target.value = "";
  }

  return (
    <div className="bg-white rounded-3xl border-4 border-sky-200 p-3 shadow-lg">
      <h3 className="text-xs font-bold text-sky-500 mb-2 flex items-center gap-1">
        📸 {t("preview.original")}
      </h3>
      {imageUrl ? (
        <>
          <button
            type="button"
            onClick={canCompare ? onOpenCompare : undefined}
            disabled={!canCompare}
            className={`relative group block w-full rounded-2xl overflow-hidden bg-gradient-to-br from-sky-50 to-cyan-50 ${
              canCompare ? "cursor-pointer" : "cursor-default"
            }`}
            title={canCompare ? t("preview.openCompare") : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Cropped preview"
              className="w-full aspect-square object-cover"
            />
            {canCompare && (
              <>
                <span className="absolute left-1/2 bottom-2 -translate-x-1/2 text-[11px] font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-2.5 py-1 flex items-center gap-1 shadow-lg whitespace-nowrap animate-pulse-slow">
                  🔀 {t("preview.openCompare")}
                </span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </>
            )}
          </button>

          {onSwapImage && (
            <>
              <input
                ref={swapRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleSwap}
              />
              <button
                type="button"
                onClick={() => swapRef.current?.click()}
                className="mt-2 w-full py-1.5 text-xs font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-full border border-pink-200 transition-colors"
              >
                📷 {t("upload.swap")}
              </button>
            </>
          )}
        </>
      ) : (
        <div className="aspect-square flex items-center justify-center text-gray-400 text-xs text-center bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-3">
          {t("preview.uploadPrompt")}
        </div>
      )}
    </div>
  );
}
