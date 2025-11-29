export type AttachmentLike =
  | { url?: string; secure_url?: string; filename?: string; original_filename?: string; format?: string | null }
  | string
  | null
  | undefined;

export function toAirtableAttachments(input: AttachmentLike | AttachmentLike[]) {
  // undefined -> do not include field in PATCH (user didn't touch it)
  if (typeof input === 'undefined') return undefined;

  const norm = (x: AttachmentLike) => {
    if (!x) return null;

    if (typeof x === 'string') return { url: x };

    const url = x.secure_url || x.url;
    const filename =
      x.filename ||
      (x.original_filename
        ? `${x.original_filename}${x.format ? `.${x.format}` : ''}`
        : undefined);

    return url ? { url, ...(filename ? { filename } : {}) } : null;
  };

  const arr = Array.isArray(input) ? input : [input];
  const cleaned = arr.map(norm).filter(Boolean) as Array<{ url: string; filename?: string }>;

  // Airtable expects an array (empty array clears the field)
  return cleaned;
}

