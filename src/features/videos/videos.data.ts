import { airtableQuery } from "../../services/airtable";
import { slugify } from "../../lib/slug";
import { getDisplayName } from "@/utils/displayName";

export type VideoType = "Full Interview" | "Highlight" | "Vertical Reel";
export type Aspect = "16:9" | "9:16" | "1:1";

export interface Video {
  id: string;
  title: string;
  type: VideoType;
  aspect: Aspect;
  platform: "YouTube" | "Instagram" | "TikTok" | "Other";
  youtubeId?: string;
  sourceUrl?: string;
  durationSec?: number;
  publishDate?: string;
  speakerSlug?: string;
  speakerName?: string;
  speakerRecordId?: string;
  speakerTitle?: string;
  speakerFirstName?: string;
  speakerLastName?: string;
  thumbnailUrl?: string;
  order?: number;
  status?: string;
  featured?: boolean;
  seriesAbout?: string;
  topics?: string[]; // multi-select
}

const TABLE = import.meta.env.VITE_AT_VIDEOS_TABLE ?? "Videos";
const SPEAKERS_TABLE =
  import.meta.env.VITE_AT_SPEAKERS_TABLE ??
  import.meta.env.VITE_AIRTABLE_TABLE_SPEAKERS ??
  import.meta.env.VITE_AIRTABLE_SPEAKER_TABLE ??
  "Speaker Applications";

// accept either {id,fields:{}} or plain objects
type Raw = any;
const F = (r: Raw) => (r?.fields ? r.fields : r);

const looksLikeRecordId = (value?: string) =>
  typeof value === "string" && /^[a-z]{3}[a-z0-9]{14,}$/i.test(value);

function extractRecordId(...values: any[]): string | undefined {
  for (const value of values) {
    if (!value) continue;
    if (Array.isArray(value)) {
      const found = extractRecordId(...value);
      if (found) return found;
      continue;
    }
    if (typeof value === "string" && looksLikeRecordId(value)) return value;
    if (typeof value === "object") {
      const candidate = (value as any).id ?? (value as any).recordId ?? (value as any).record;
      if (typeof candidate === "string" && looksLikeRecordId(candidate)) return candidate;
    }
  }
  return undefined;
}

function firstString(value: any): string | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const res = firstString(item);
      if (res) return res;
    }
    return undefined;
  }
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const name = (value as any).name ?? (value as any).value;
    if (typeof name === "string") return name;
  }
  return undefined;
}

type SpeakerInfo = {
  id: string;
  slug?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

const escapeFormulaValue = (s: string) => s.replace(/'/g, "\\'");
const speakerCache = new Map<string, SpeakerInfo>();

async function fetchSpeakersByIds(ids: string[]): Promise<SpeakerInfo[]> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return [];

  const missing = unique.filter(id => !speakerCache.has(id));
  if (missing.length) {
    const chunkSize = 15; // stay well within Airtable URL limits
    for (let i = 0; i < missing.length; i += chunkSize) {
      const slice = missing.slice(i, i + chunkSize);
      const formula =
        slice.length === 1
          ? `RECORD_ID()='${escapeFormulaValue(slice[0])}'`
          : `OR(${slice.map(id => `RECORD_ID()='${escapeFormulaValue(id)}'`).join(",")})`;
      const rows = await airtableQuery(SPEAKERS_TABLE, { filterByFormula: formula });
      for (const row of rows ?? []) {
        const f = F(row);
        const id = row?.id ?? f?.id;
        if (!id) continue;

        const title = String(firstString(f?.["Title"]) ?? "").trim();
        const firstName = String(firstString(f?.["First Name"]) ?? firstString(f?.["First name"]) ?? "").trim();
        const lastName = String(firstString(f?.["Last Name"]) ?? firstString(f?.["Last name"]) ?? "").trim();
        const fullName = String(firstString(f?.["Full Name"]) ?? firstString(f?.["Name"]) ?? "").trim();
        const slugField =
          firstString(f?.["Slug Override"]) ??
          firstString(f?.["Slug"]) ??
          firstString(f?.["Slug Formula"]);
        const displayName =
          getDisplayName({ title, firstName, lastName }) ||
          [title, firstName, lastName].filter(Boolean).join(" ") ||
          fullName;

        const slugSource = slugField || fullName || displayName;
        const slug = slugSource ? slugify(String(slugSource)) : undefined;

        speakerCache.set(id, {
          id,
          slug,
          title: title || undefined,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          displayName: displayName?.trim() || undefined,
        });
      }
    }
  }

  return unique
    .map(id => speakerCache.get(id))
    .filter((info): info is SpeakerInfo => Boolean(info));
}

function applySpeakerDetails(videos: Video[], speakers: SpeakerInfo[]) {
  if (!speakers.length) {
    videos.forEach(video => {
      if (video.speakerSlug && looksLikeRecordId(video.speakerSlug)) {
        const fallback = video.speakerName && !looksLikeRecordId(video.speakerName)
          ? video.speakerName
          : "";
        video.speakerSlug = fallback ? slugify(fallback) : undefined;
      }
    });
    return;
  }

  const map = new Map(speakers.map(info => [info.id, info] as const));

  videos.forEach(video => {
    const info = video.speakerRecordId ? map.get(video.speakerRecordId) : undefined;
    if (!info) {
      if (video.speakerSlug && looksLikeRecordId(video.speakerSlug)) {
        const fallback = video.speakerName && !looksLikeRecordId(video.speakerName)
          ? video.speakerName
          : "";
        video.speakerSlug = fallback ? slugify(fallback) : undefined;
      }
      return;
    }

    video.speakerTitle = info.title;
    video.speakerFirstName = info.firstName;
    video.speakerLastName = info.lastName;
    video.speakerName = info.displayName || video.speakerName;

    const slugSource = info.slug || video.speakerSlug;
    const finalSlug = slugSource && !looksLikeRecordId(slugSource)
      ? slugSource
      : slugify(info.displayName || "");
    video.speakerSlug = finalSlug || undefined;
  });
}

function mapRow(r: Raw): Video {
  const f = F(r);
  const displayNameCandidate =
    firstString(f["Speaker Display Name"]) ??
    firstString(f["Speaker Name"]) ??
    firstString(f["Speaker"]);
  const name =
    displayNameCandidate && !looksLikeRecordId(displayNameCandidate)
      ? displayNameCandidate
      : "";

  const slugFromField = firstString(f["Speaker Slug"]) ?? f["Speaker Slug"] ?? "";
  const safeSlug =
    typeof slugFromField === "string" && !looksLikeRecordId(slugFromField)
      ? slugFromField
      : name
      ? slugify(String(name))
      : undefined;

  const speakerRecordId = extractRecordId(
    f["Speaker"],
    f["Speaker Name"],
    f["Speaker Profile"],
    f["Speaker Application"],
    f["Speaker Record"],
    f["Speaker ID"]
  );

  return {
    id: r.id ?? f.id ?? crypto.randomUUID(),
    title: f["Title"],
    type: f["Type"],
    aspect: f["Aspect"] as Aspect,
    platform: f["Platform"],
    youtubeId: f["YouTube ID"],
    sourceUrl: f["Source URL"],
    durationSec: f["Duration (sec)"],
    publishDate: f["Publish Date"],
    speakerSlug: safeSlug,
    speakerName: String(name || "").trim() || undefined,
    speakerRecordId,
    thumbnailUrl: f["Thumbnail URL"],
    order: f["Order"],
    status: f["Status"],
    featured: !!f["Featured"],
    seriesAbout: f["Series About"],
    topics: Array.isArray(f["Topics"]) ? f["Topics"] : undefined,
  };
}

async function selectPublished(): Promise<Video[]> {
  const rows = await airtableQuery(TABLE, {
    sort: [{ field: "Publish Date", direction: "desc" }],
  });
  const all = (rows ?? []).map(mapRow);
  const published = all.filter(v => (v.status ?? "").toLowerCase() === "published");
  const speakerIds = published
    .map(v => v.speakerRecordId)
    .filter((id): id is string => typeof id === "string");
  const speakerInfo = await fetchSpeakersByIds(speakerIds);
  applySpeakerDetails(published, speakerInfo);
  return published;
}

export async function fetchAllVideos(): Promise<Video[]> {
  const list = await selectPublished();
  if (typeof window !== "undefined") console.debug("[Videos] fetched", list.length);
  return list;
}

export async function fetchSpeakerVideos(slug: string) {
  const published = await fetchAllVideos();
  const all = published.filter(
    v =>
      (v.speakerSlug ?? "").toLowerCase() === slug.toLowerCase() ||
      (v.speakerRecordId ?? "").toLowerCase() === slug.toLowerCase()
  );
  const full = all.find(v => v.type === "Full Interview");
  return {
    full,
    highlights: all.filter(v => v.type === "Highlight"),
    reels: all.filter(v => v.type === "Vertical Reel"),
    all,
  };
}
