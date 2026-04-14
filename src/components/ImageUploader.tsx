"use client";

import { useRef, useState, DragEvent } from "react";
import { useI18n } from "@/i18n/I18nProvider";

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
}

export default function ImageUploader({ onImageSelected }: ImageUploaderProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFile(file: File) {
    if (file.type === "image/jpeg" || file.type === "image/png") {
      setFileName(file.name);
      onImageSelected(file);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div
      className={`rounded-3xl p-8 text-center cursor-pointer transition-all shadow-lg border-4 border-dashed ${
        isDragging
          ? "border-pink-400 bg-pink-100 scale-[1.01]"
          : "border-pink-200 bg-gradient-to-br from-pink-50 to-yellow-50 hover:border-pink-300 hover:bg-pink-50"
      }`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="text-5xl mb-2 animate-bounce-slow">🖼️</div>
      {fileName ? (
        <p className="text-sm text-gray-700">
          <span className="font-bold text-pink-600">{fileName}</span>
          <br />
          <span className="text-xs text-gray-500">{t("upload.replace")}</span>
        </p>
      ) : (
        <>
          <p className="text-sm font-bold text-pink-600 mb-1">
            {t("upload.drop")}
          </p>
          <p className="text-xs text-gray-500">{t("upload.formats")}</p>
        </>
      )}
    </div>
  );
}
