import React from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

type Props = {
  onUpload: (file: { url: string; filename: string }) => void;
  children: React.ReactElement;
  onUploadingChange?: (uploading: boolean) => void;
};

// Uploads a file to Cloudinary and returns { url, filename }
export default function UploadWidget({ onUpload, children, onUploadingChange }: Props) {
  const openNative = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        onUploadingChange?.(true);
        const uploaded = await uploadToCloudinary(file);
        onUpload(uploaded);
      } catch (e) {
        console.error("Upload failed", e);
      } finally {
        onUploadingChange?.(false);
      }
    };
    input.click();
  };

  return React.cloneElement(children, { onClick: openNative });
}
