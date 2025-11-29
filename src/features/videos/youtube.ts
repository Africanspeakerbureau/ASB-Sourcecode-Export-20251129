export function youtubeEmbedSrc(youtubeId?: string, url?: string) {
  const id = youtubeId ?? extractYouTubeId(url ?? "");
  if (!id) return;
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function extractYouTubeId(input: string): string | undefined {
  if (!input) return;
  const short = input.match(/youtu\.be\/([\w-]{6,})/i)?.[1];
  const v = input.match(/[?&]v=([\w-]{6,})/i)?.[1];
  const shorts = input.match(/youtube\.com\/shorts\/([\w-]{6,})/i)?.[1];
  return short || v || shorts;
}
