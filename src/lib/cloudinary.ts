export async function uploadToCloudinary(
  file: File
): Promise<{ url: string; filename: string }> {
  const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET);
  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const json = await res.json();
  return {
    url: json.secure_url as string,
    filename: file.name || json.original_filename,
  };
}

