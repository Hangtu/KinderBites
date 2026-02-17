"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { getSignedUploadUrl } from "@/actions/storage";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset loop if needed
    setIsUploading(true);

    try {
      // 1. Get Signed URL
      const { success, signedUrl, publicUrl, error } = await getSignedUploadUrl({
        type: file.type,
        size: file.size,
      });

      if (!success || !signedUrl) {
        throw new Error(error || "Failed to get upload permission");
      }

      // 2. Upload to R2
      const response = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload image to storage");
      }

      // 3. Update State
      setPreview(publicUrl!);
      onChange(publicUrl!);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const onRemove = () => {
    setPreview(null);
    onChange("");
  };

  return (
    <div className="flex flex-col gap-4">
      {preview ? (
        <div className="relative aspect-video w-full max-w-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full max-w-sm aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                <p className="text-sm text-gray-500">Subiendo...</p>
              </>
            ) : (
              <>
                <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors mb-2" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Click para subir</span>
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP (Max 5MB)</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            disabled={disabled || isUploading}
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}
