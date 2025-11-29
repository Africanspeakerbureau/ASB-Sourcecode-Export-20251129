import { youtubeEmbedSrc } from "./youtube";

export default function VideoPlayer({
  youtubeId,
  url,
  title,
  aspect = "16:9",
}: {
  youtubeId?: string;
  url?: string;
  title?: string;
  aspect?: "16:9" | "9:16" | "1:1";
}) {
  const src = youtubeEmbedSrc(youtubeId, url);
  if (!src) return null;

  const wrapClass =
    aspect === "9:16"
      ? "relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-border bg-surface"
      : aspect === "1:1"
        ? "relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-surface"
        : "relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-surface";

  return (
    <div className={wrapClass}>
      <iframe
        className="absolute inset-0 h-full w-full"
        src={src}
        title={title ?? "Video player"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
