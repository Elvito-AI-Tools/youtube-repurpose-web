"use client";

import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  name: string;
  maxImages?: number;
}

export default function ImageUploader({ name, maxImages = 6 }: ImageUploaderProps) {
  const { setValue, watch } = useFormContext();
  const images = watch(name) || [];

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...images];
      acceptedFiles.forEach((file) => {
        if (newFiles.length < maxImages) {
          newFiles.push(file);
        }
      });
      setValue(name, newFiles, { shouldValidate: true });
    },
    [images, setValue, name, maxImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: maxImages,
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setValue(name, newImages, { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="rounded-full bg-primary/10 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
              <line x1="16" x2="22" y1="5" y2="5" />
              <line x1="19" x2="19" y1="2" y2="8" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <p className="text-sm font-medium">
            Drag & drop car images here, or click to select
          </p>
          <p className="text-xs text-gray-500">
            Upload up to {maxImages} images (JPEG, PNG, GIF)
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((file: File, index: number) => (
            <div key={index} className="relative group aspect-square">
              <div className="w-full h-full rounded-md overflow-hidden border">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Car image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 