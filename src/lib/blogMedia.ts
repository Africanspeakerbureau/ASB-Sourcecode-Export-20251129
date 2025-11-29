export function ytIdFromUrl(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.replace('/', '').split(/[?&]/)[0] || null;
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
  } catch {}
  return null;
}
export function ytThumb(url?: string | null) {
  const id = ytIdFromUrl(url || '');
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}
export function pickBlogThumb(rec: any): string | null {
  const urlField = rec['Hero Image URL'];
  if (urlField && String(urlField).startsWith('http')) return urlField as string;

  const att = Array.isArray(rec['Hero Image']) && rec['Hero Image'].length
    ? (rec['Hero Image'][0]?.url || rec['Hero Image'][0]?.thumbnails?.large?.url || rec['Hero Image'][0]?.thumbnails?.small?.url)
    : null;
  if (att) return att;

  if ((rec.Type || '').toLowerCase() === 'video') {
    const thumb = ytThumb(rec['Hero Video URL']);
    if (thumb) return thumb;
  }
  return null;
}
