import { useEffect, useMemo, useState } from "react";
import { fetchAllVideos, Video } from "../videos/videos.data";
import VideoPlayer from "../videos/VideoPlayer";
import { slugify } from "../../lib/slug";

function sortFullInterviews(list: Video[]) {
  const rank = (n?: number) => (typeof n === "number" ? n : 9_999);
  const d = (s?: string) => (s ? new Date(s).getTime() : 0);
  return list
    .filter(v => v.type === "Full Interview")
    .sort((a, b) => rank(a.order) - rank(b.order) || d(b.publishDate) - d(a.publishDate));
}

function titleCase(s?: string) {
  if (!s) return "";
  return s.replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();
}

export default function HomeInterviewsSection() {
  const [videos, setVideos] = useState<Video[]>([]);
  useEffect(() => { fetchAllVideos().then(setVideos); }, []);

  const picks = useMemo(() => sortFullInterviews(videos).slice(0, 2), [videos]);

  if (picks.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1100px] px-6 py-12">
        {/* Centered header */}
        <header className="mb-6 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0B2A4A]">
            Interviews With Our Speakers
          </h2>
          <p className="mx-auto mt-1 max-w-2xl text-[15px] leading-6 text-[#6B7280]">
            One-On-One Conversations That Reveal The Person Behind The Keynote.
            Watch Full Interviews, Then Explore Each Speaker’s Profile.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {picks.map(v => {
            const speakerLabel = v.speakerName || titleCase(v.speakerSlug);
            const slug = v.speakerSlug || slugify(v.speakerName || "");
            const interviewHref = slug ? `#/interviews/${encodeURIComponent(slug)}` : "#/interviews";
            const profileHref = slug ? `#/speaker/${encodeURIComponent(slug)}` : "#/find-speakers";
            return (
              <div key={v.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_1px_0_0_#EEF2F7]">
                <a href={interviewHref} className="block">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#F6F8FC]">
                    <VideoPlayer youtubeId={v.youtubeId} url={v.sourceUrl} title={v.title} />
                  </div>
                </a>

                {/* Title + speaker name */}
                <div className="mt-3 text-sm font-semibold text-[#0B2A4A]">{v.title}</div>
                <div className="mt-1 text-xs text-[#6B7280]">{speakerLabel}</div>

                {/* Actions */}
                <div className="mt-3 flex items-center gap-2">
                  <a
                    href={interviewHref}
                    className="inline-flex items-center rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#0B2A4A] hover:bg-[#F8FAFF]"
                  >
                    Watch Interview
                  </a>
                  <a
                    href={profileHref}
                    className="inline-flex items-center rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#0B2A4A] hover:bg-[#F8FAFF]"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Centered button */}
        <div className="mt-6 text-center">
          <a
            href="#/interviews"
            className="inline-flex items-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#0B2A4A] hover:bg-[#F8FAFF]"
          >
            View All Interviews
          </a>
        </div>
      </div>
    </section>
  );
}
