import VideoPlayer from "./VideoPlayer";
import { lazyImgProps } from "@/lib/img";

type Props = {
  title: string;
  thumb?: string;
  youtubeId?: string;
  url?: string;
  meta?: string;
};

export default function VideoCard({ title, thumb, youtubeId, url, meta }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-white p-3">
      {youtubeId || url ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface">
          <VideoPlayer youtubeId={youtubeId} url={url} title={title} />
        </div>
      ) : thumb ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface">
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover"
            width={1280}
            height={720}
            {...lazyImgProps}
          />
        </div>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface" />
      )}
      <div className="mt-3 text-sm font-semibold">{title}</div>
      {meta && <div className="text-xs text-muted">{meta}</div>}
    </div>
  );
}
