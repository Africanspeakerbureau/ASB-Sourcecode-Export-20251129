import React, { useEffect, useMemo, useRef } from "react";
import { CLOUDINARY } from "@/config/cloudinary";

export function UploadPublic({
  onUploaded,
  onError,
  clientAllowedFormats = ["jpg", "jpeg", "png"],
  maxSizeMB = 5,
  buttonClassName = "btn btn--dark",
  buttonLabel = "Upload",
}) {
  const widgetRef = useRef(null);
  const onUploadedRef = useRef(onUploaded);
  const onErrorRef = useRef(onError);
  const formatsRef = useRef(clientAllowedFormats);

  useEffect(() => {
    onUploadedRef.current = onUploaded;
  }, [onUploaded]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const formatsKey = useMemo(() => JSON.stringify(clientAllowedFormats ?? []), [clientAllowedFormats]);

  useEffect(() => {
    formatsRef.current = clientAllowedFormats;
  }, [clientAllowedFormats, formatsKey]);

  useEffect(() => {
    if (window.cloudinary) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUDINARY.cloudName,
          uploadPreset: CLOUDINARY.uploadPreset,
          sources: ["local", "url", "camera"],
          multiple: false,
          clientAllowedFormats: formatsRef.current ?? [],
          maxFileSize: maxSizeMB * 1024 * 1024,
          folder: "speakers",
        },
        (error, result) => {
          if (error) {
            onErrorRef.current?.(error);
          } else if (result && result.event === "success") {
            onUploadedRef.current?.(result.info);
          }
        }
      );
    }

    return () => {
      if (widgetRef.current?.close) {
        widgetRef.current.close();
      }
      widgetRef.current = null;
    };
  }, [formatsKey, maxSizeMB]);

  const open = () => {
    if (widgetRef.current) widgetRef.current.open();
  };

  return (
    <button type="button" className={buttonClassName} onClick={open}>
      {buttonLabel}
    </button>
  );
}

export default UploadPublic;
