import React from "react";
import { UploadPublic } from "@/components/upload/UploadPublic.jsx";
import { lazyImgProps } from "@/lib/img";

export default function ImageUploadField({
  label = "Image",
  value,
  onChange,
  help = "JPG/PNG, max 5MB",
}) {
  const valueUrl = Array.isArray(value) && value.length ? value[0].url : undefined;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full text-left font-medium text-slate-800">{label}</div>
      {valueUrl ? (
        <img
          src={valueUrl}
          alt="Uploaded"
          className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200"
          width={64}
          height={64}
          {...lazyImgProps}
        />
      ) : (
        <div className="h-16 w-16 rounded-lg bg-slate-100 ring-1 ring-slate-200" />
      )}
      <UploadPublic
        accept="image/*"
        clientAllowedFormats={["jpg", "jpeg", "png"]}
        maxSizeMB={5}
        buttonClassName="px-4 py-2 rounded-lg bg-black text-white hover:bg-black/80"
        onUploaded={info => {
          const { secure_url, original_filename, bytes, resource_type, format } = info;
          const attachment = [{
            url: secure_url,
            filename: `${original_filename}.${format ?? ""}`.replace(/\.$/, ""),
            type: resource_type === "image" ? "image/*" : "application/octet-stream",
            size: bytes,
          }];
          onChange(attachment);
        }}
      />
      <div className="text-xs text-slate-500">{help}</div>
      {valueUrl && <div className="text-xs text-emerald-600 font-medium">Uploaded ✓</div>}
    </div>
  );
}
