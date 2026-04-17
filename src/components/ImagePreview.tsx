"use client";

import { useRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";

interface ImagePreviewProps {
  imageUrl: string | null;
  canCompare: boolean;
  onOpenCompare: () => void;
  onSwapImage?: (file: File) => void;
}

/**
 * Source-image card. The thumbnail itself is the compare trigger when a
 * pattern exists; the swap-image button sits underneath.
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
    <aside className="card p-3 flex flex-col gap-3">
      {imageUrl ? (
        <>
          <button
            type="button"
            onClick={canCompare ? onOpenCompare : undefined}
            disabled={!canCompare}
            className={`group relative block w-full rounded-[16px] overflow-hidden bg-paper-2 ${
              canCompare ? "cursor-pointer" : "cursor-default"
            }`}
            title={canCompare ? t("preview.openCompare") : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={t("preview.altSource")}
              className="block w-full aspect-square object-cover transition-transform group-hover:scale-[1.02]"
            />
            {canCompare && (
              <span className="absolute left-2 right-2 bottom-2 flex items-center justify-center gap-1.5 text-[0.72rem] font-semibold text-paper bg-ink/85 backdrop-blur rounded-full px-2 py-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="3" y="4" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="2" />
                  <rect x="14" y="4" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="2" />
                </svg>
                {t("preview.openCompare")}
              </span>
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
                className="btn btn-ghost w-full justify-center text-[0.82rem]"
              >
                {t("upload.swap")}
              </button>
            </>
          )}
        </>
      ) : (
        <div className="aspect-square flex items-center justify-center text-center text-[0.85rem] text-ink-soft bg-paper-2 rounded-[16px] p-4">
          {t("preview.uploadPrompt")}
        </div>
      )}
    </aside>
  );
}
