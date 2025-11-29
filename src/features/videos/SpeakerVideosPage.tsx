import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchSpeakerVideos, Video } from "./videos.data";
import { slugify } from "../../lib/slug";
import VideoPlayer from "./VideoPlayer";

function titleCase(s = "") {
  return s
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

export default function SpeakerVideosPage() {
  const { speakerSlug = "" } = useParams<{ speakerSlug: string }>();
  const [full, setFull] = useState<Video | undefined>();
  const [highlights, setHighlights] = useState<Video[]>([]);
  const [reels, setReels] = useState<Video[]>([]);

  const speakerDisplay = full?.speakerName || titleCase(speakerSlug);
  const profileSlug = full?.speakerSlug || slugify(speakerDisplay);
  const baseBookUrl = `#/book-a-speaker?speaker=${encodeURIComponent(speakerDisplay)}&source=interviews`;
  const bookUrl = full?.title ? `${baseBookUrl}&video=${encodeURIComponent(full.title)}` : baseBookUrl;

  useEffect(() => {
    if (!speakerSlug) return;
    fetchSpeakerVideos(speakerSlug)
      .then(({ full, highlights, reels }) => {
        setFull(full);
        setHighlights(highlights);
        setReels(reels);
      })
      .catch((err) => {
        console.error("Failed to load speaker videos", err);
        setFull(undefined);
        setHighlights([]);
        setReels([]);
      });
  }, [speakerSlug]);

  return (
    <main className="mx-auto max-w-[1280px] px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy">
          {speakerDisplay} — Interview Series
        </h1>
      </header>

      {/* Full interview */}
      {full && (
        <section className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8">
            <VideoPlayer youtubeId={full.youtubeId} url={full.sourceUrl} title={full.title} />
            <h3 className="mt-3 text-lg font-semibold">{full.title}</h3>
          </div>
          <aside className="col-span-12 lg:col-span-4">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 text-center shadow-[0_1px_0_0_#EEF2F7]">
              <h4 className="text-base font-semibold text-[#0B2A4A]">Book {speakerDisplay}</h4>

              <a
                href={bookUrl}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#2563EB] px-4 py-2 text-white hover:bg-[#1E4FD6]"
              >
                Request Dates & Fees
              </a>

              <a
                href={`#/speaker/${profileSlug}`}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-[#0B2A4A] hover:bg-[#F8FAFF]"
              >
                View Full Profile
              </a>
            </div>
          </aside>
        </section>
      )}

      {/* Highlights */}
      <section className="py-8">
        <h2 className="text-xl font-bold">Highlights (16:9)</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((v) => (
            <div key={v.id} className="rounded-2xl border border-border bg-white p-3">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface">
                <VideoPlayer youtubeId={v.youtubeId} url={v.sourceUrl} title={v.title} />
              </div>
              <div className="mt-3 text-sm font-semibold">{v.title}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-6">
        <h2 className="text-xl font-bold">Vertical Reels (9:16)</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {reels.map(v => (
            <div key={v.id} className="w-[220px] shrink-0 rounded-2xl border border-border bg-white p-2">
              <VideoPlayer youtubeId={v.youtubeId} url={v.sourceUrl} title={v.title} aspect="9:16" />
              <div className="mt-2 text-xs font-medium line-clamp-2">{v.title}</div>
            </div>
          ))}
          {reels.length === 0 && <div className="text-sm text-muted">No reels yet for this speaker.</div>}
        </div>
      </section>
    </main>
  );
}
