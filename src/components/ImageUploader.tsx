"use client";

import { useRef, useState, DragEvent } from "react";
import { useI18n } from "@/i18n/I18nProvider";

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
}

/**
 * First-run state — one short headline, one generous drop zone. No copy
 * crowding, no tape-label chatter, no textures. The surface is the
 * invitation.
 */
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
    <section className="max-w-[880px] mx-auto w-full pt-6 sm:pt-10 animate-reveal">
      {/* Quiet, short headline — that's all */}
      <h1 className="display text-[2.5rem] sm:text-[3.5rem] leading-[0.95] text-ink text-center tracking-[-0.03em]">
        A photo,<span className="display-italic text-coral"> beaded.</span>
      </h1>

      {/* Generous drop-zone */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
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
        className={`group mt-8 sm:mt-10 card cursor-pointer select-none flex flex-col items-center justify-center text-center p-10 sm:p-14 transition-all ${
          isDragging ? "border-ink bg-paper-2" : "hover:bg-paper-2"
        }`}
      >
        <div
          aria-hidden
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full grid grid-cols-2 grid-rows-2 gap-1.5 p-2 bg-paper-2 transition-transform ${
            isDragging ? "scale-110 rotate-6" : "group-hover:rotate-6"
          }`}
        >
          <span className="rounded-full bg-coral" />
          <span className="rounded-full bg-butter" />
          <span className="rounded-full bg-blue" />
          <span className="rounded-full bg-lime" />
        </div>

        {fileName ? (
          <>
            <p className="mt-6 display text-[1.4rem] sm:text-[1.6rem] leading-tight text-ink max-w-[28ch] truncate">
              {fileName}
            </p>
            <p className="mt-2 text-[0.9rem] text-ink-soft">
              {t("upload.replace")}
            </p>
          </>
        ) : (
          <>
            <p className="mt-6 display text-[1.4rem] sm:text-[1.7rem] leading-tight text-ink max-w-[22ch]">
              {t("upload.drop")}
            </p>
            <p className="mt-3 text-[0.85rem] text-ink-soft">
              {t("upload.formats")}
            </p>
          </>
        )}

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
      </div>
    </section>
  );
}
