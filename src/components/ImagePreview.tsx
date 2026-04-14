"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

interface ImagePreviewProps {
  imageFile: File | null;
}

export default function ImagePreview({ imageFile }: ImagePreviewProps) {
  const { t } = useI18n();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  return (
    <div className="bg-white rounded-3xl border-4 border-sky-200 p-4 shadow-lg">
      <h3 className="text-sm font-bold text-sky-500 mb-2 flex items-center gap-1">
        📸 {t("preview.original")}
      </h3>
      {previewUrl ? (
        <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="max-h-[400px] w-full object-contain rounded-xl"
          />
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl">
          {t("preview.uploadPrompt")}
        </div>
      )}
    </div>
  );
}
