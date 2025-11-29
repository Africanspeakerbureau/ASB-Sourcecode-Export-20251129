import { useEffect, useMemo, useState } from "react";
import { fetchAllVideos, Video } from "./videos.data";
import VideoPlayer from "./VideoPlayer";
import { slugify } from "../../lib/slug";

type FormatFilter = "All" | Video["type"];
type TopicFilter = "All" | string;
type SpeakerFilter = "All" | string;

function titleCase(s?: string) {
  if (!s) return "";
  return s.replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();
}

export default function VideosLandingPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [q, setQ] = useState("");
  const [fmt, setFmt] = useState<FormatFilter>("All");
  const [topic, setTopic] = useState<TopicFilter>("All");
  const [speaker, setSpeaker] = useState<SpeakerFilter>("All");

  useEffect(() => { fetchAllVideos().then(setVideos); }, []);

  const featured = useMemo(() => {
    return videos.find(v => v.featured) ?? videos.find(v => v.type === "Full Interview") ?? videos[0];
  }, [videos]);

  const aboutText =
    featured?.seriesAbout ??
    "Real Conversations With Africa’s Builders And Bridge-Makers. Watch Full Interviews, Practical Highlights, And Shareable Reels.";

  const speakers = useMemo(() => {
    const map = new Map<string, string>();
    videos.forEach(v => {
      const slug = (v.speakerSlug ?? "").trim();
      if (!slug) return;
      const label = v.speakerName || titleCase(slug);
      map.set(slug, label);
    });
    return Array.from(map.entries()).map(([slug, label]) => ({ slug, label }));
  }, [videos]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    videos.forEach(v => (v.topics ?? []).forEach(t => set.add(String(t))));
    return Array.from(set).sort();
  }, [videos]);

  const filtered = useMemo(() => {
    return videos.filter(v => {
      if (fmt !== "All" && v.type !== fmt) return false;
      if (topic !== "All" && !(v.topics ?? []).includes(topic)) return false;
      if (speaker !== "All" && (v.speakerSlug ?? "").toLowerCase() !== speaker.toLowerCase()) return false;
      if (q.trim()) {
        const hay = `${v.title} ${v.speakerName} ${v.speakerSlug} ${(v.topics ?? []).join(" ")}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [videos, fmt, topic, speaker, q]);

  const fullInterviewsAll = useMemo(
    () => filtered.filter(v => v.type === "Full Interview"),
    [filtered]
  );

  const fullInterviews = useMemo(
    () => fullInterviewsAll.filter(v => v.id !== featured?.id),
    [fullInterviewsAll, featured]
  );
  const [highlightCount, setHighlightCount] = useState(6);
  const [reelCount, setReelCount] = useState(15);

  useEffect(() => {
    setHighlightCount(6);
    setReelCount(15);
  }, [fmt, topic, speaker, q, videos.length]);

  const highlights = filtered.filter(v => v.type === "Highlight");
  const reels = filtered.filter(v => v.type === "Vertical Reel");
  const oneOnOnes = filtered.filter(v => v.aspect === "1:1");

  const getInterviewHref = (video: Video) => {
    const slug = video.speakerSlug || slugify(video.speakerName || "");
    return slug ? `#/interviews/${encodeURIComponent(slug)}` : "#/interviews";
  };

  return (
    <>
      {/* Soft-blue hero, centered */}
      <section className="border-b border-[#E6ECF5] bg-[#F5F8FF]">
        <div className="mx-auto max-w-[1100px] px-6 py-12 text-center md:py-16">
          <div className="inline-flex rounded-full border border-[#D8E2F0] bg-white/70 px-3 py-1 text-[11px] font-medium tracking-wide text-[#0B2A4A]">
            ASB Originals
          </div>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-[#0B2A4A] md:text-5xl">
            ASB Interview Series
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-[17px] leading-7 text-[#4B5563]">
            Authentic African Voices In Long-Form Conversations.
          </p>
        </div>
      </section>

      {/* Main content (narrower width for elegance) */}
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        {/* Featured full interview + About */}
        {featured && (
          <section className="mb-10 grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-7">
              <VideoPlayer youtubeId={featured.youtubeId} url={featured.sourceUrl} title={featured.title} />
              <h3 className="mt-3 text-lg font-semibold text-[#0B2A4A]">{featured.title}</h3>
              <a
                href={`#/book-a-speaker?speaker=${encodeURIComponent(featured?.speakerName || "ASB Speaker")}&source=interviews-landing&video=${encodeURIComponent(featured?.title || "")}`}
                className="mt-3 inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-4 py-2 text-white hover:bg-[#1E4FD6]"
              >
                Request Dates & Fees
              </a>
            </div>
            <aside className="col-span-12 lg:col-span-5">
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_0_0_#EEF2F7]">
                <h4 className="text-sm font-semibold text-[#0B2A4A]">About The Series</h4>
                <p className="mt-2 text-[15px] leading-6 text-[#6B7280]">{aboutText}</p>
              </div>
            </aside>
          </section>
        )}

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-12">
          <input
            className="col-span-12 md:col-span-5 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C7DBFF]"
            placeholder="Search speakers or topics"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <select
            className="col-span-6 md:col-span-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C7DBFF]"
            value={topic}
            onChange={e => setTopic(e.target.value as TopicFilter)}
          >
            <option value="All">All Topics</option>
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            className="col-span-6 md:col-span-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C7DBFF]"
            value={fmt}
            onChange={e => setFmt(e.target.value as FormatFilter)}
          >
            <option>All</option>
            <option>Full Interview</option>
            <option>Highlight</option>
            <option>Vertical Reel</option>
          </select>
          <select
            className="col-span-12 md:col-span-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C7DBFF]"
            value={speaker}
            onChange={e => setSpeaker(e.target.value as SpeakerFilter)}
          >
            <option value="All">All Speakers</option>
            {speakers.map(s => <option key={s.slug} value={s.slug}>{s.label}</option>)}
          </select>
        </div>

        {/* Full Interviews (excluding the featured) */}
        <section className="pb-2">
          <h2 className="text-xl font-bold text-[#0B2A4A]">Full Interviews</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fullInterviews.map(v => (
              <a
                key={v.id}
                href={getInterviewHref(v)}
                className="block rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_1px_0_0_#EEF2F7] hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#F6F8FC]">
                  <VideoPlayer youtubeId={v.youtubeId} url={v.sourceUrl} title={v.title} />
                </div>
                <div className="mt-3 text-sm font-semibold text-[#0B2A4A]">{v.title}</div>
              </a>
            ))}
            {fullInterviews.length === 0 && (
              <div className="text-sm text-[#6B7280]">No additional full interviews match your filters.</div>
            )}
          </div>
        </section>

        {/* Highlights */}
        <section className="py-6">
          <h2 className="text-xl font-bold text-[#0B2A4A]">Highlights (16:9)</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.slice(0, highlightCount).map(v => (
              <a key={v.id} href={getInterviewHref(v)} className="block rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_1px_0_0_#EEF2F7] hover:shadow-md">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#F6F8FC]">
                  <VideoPlayer youtubeId={v.youtubeId} url={v.sourceUrl} title={v.title} />
                </div>
                <div className="mt-3 text-sm font-semibold text-[#0B2A4A]">{v.title}</div>
              </a>
            ))}
            {highlights.length === 0 && <div className="text-sm text-[#6B7280]">No highlights match your filters.</div>}
          </div>
          {highlightCount < highlights.length && (
            <div className="mt-6 flex justify-center">
              <button
                className="rounded-full bg-[#0B2A4A] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#0f3a6a]"
                onClick={() => setHighlightCount(count => Math.min(highlights.length, count + 6))}
              >
                Load More
              </button>
            </div>
          )}
        </section>

        {/* One-on-one conversations */}
        <section className="py-6">
          <h2 className="text-xl font-bold text-[#0B2A4A]">One-on-One Conversations (1:1)</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {oneOnOnes.map(v => (
              <a key={v.id} href={getInterviewHref(v)} className="block rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_1px_0_0_#EEF2F7] hover:shadow-md">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F6F8FC]">
                  <VideoPlayer youtubeId={v.youtubeId} url={v.sourceUrl} title={v.title} aspect="1:1" />
                </div>
                <div className="mt-3 text-sm font-semibold text-[#0B2A4A]">{v.title}</div>
              </a>
            ))}
            {oneOnOnes.length === 0 && <div className="text-sm text-[#6B7280]">No one-on-one videos match your filters.</div>}
          </div>
        </section>

        {/* Vertical reels */}
        <section className="py-6">
          <h2 className="text-xl font-bold text-[#0B2A4A]">Vertical Reels (9:16)</h2>
          <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {reels.slice(0, reelCount).map(v => (
              <a key={v.id} href={getInterviewHref(v)} className="rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-[0_1px_0_0_#EEF2F7] hover:shadow-md">
                <VideoPlayer youtubeId={v.youtubeId} url={v.sourceUrl} title={v.title} aspect="9:16" />
                <div className="mt-2 text-xs font-medium text-[#0B2A4A] line-clamp-2">{v.title}</div>
              </a>
            ))}
            {reels.length === 0 && <div className="text-sm text-[#6B7280]">No reels match your filters.</div>}
          </div>
          {reelCount < reels.length && (
            <div className="mt-6 flex justify-center">
              <button
                className="rounded-full bg-[#0B2A4A] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#0f3a6a]"
                onClick={() => setReelCount(count => Math.min(reels.length, count + 5))}
              >
                Load More
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
