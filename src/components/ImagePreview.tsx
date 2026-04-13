"use client";

import { useEffect, useState } from "react";

interface ImagePreviewProps {
  imageFile: File | null;
}

export default function ImagePreview({ imageFile }: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Original Image</h3>
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Uploaded preview"
          className="max-h-[400px] w-full object-contain rounded"
        />
      ) : (
        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
          Upload an image to get started
        </div>
      )}
    </div>
  );
}
