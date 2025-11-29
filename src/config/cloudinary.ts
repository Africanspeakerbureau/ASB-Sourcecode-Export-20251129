export const CLOUDINARY = {
  cloudName:
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "dimtwmk1v", // keep your actual value
  uploadPreset:
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "unsigned_speaker_upload",
};
