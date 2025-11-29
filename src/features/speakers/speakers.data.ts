import type { Speaker } from "../../types/speaker";
import { airtableQuery } from "../../services/airtable";
import { normalizeSpeaker } from "../../lib/normalizeSpeaker";
import { slugify } from "../../lib/slug";

const SPEAKERS_TABLE =
  import.meta.env.VITE_AT_SPEAKERS_TABLE ??
  import.meta.env.VITE_AIRTABLE_TABLE_SPEAKERS ??
  import.meta.env.VITE_AIRTABLE_SPEAKER_TABLE ??
  "Speakers";

function mapSpeaker(row: any): Speaker {
  const fields = row?.fields ?? row ?? {};
  const record = {
    id: row?.id ?? fields.id,
    fields,
  };
  const normalized = normalizeSpeaker(record) as Speaker;

  const slugCandidate =
    normalized.slug ||
    fields["Slug Override"] ||
    fields["Slug"] ||
    fields["Slug Formula"] ||
    "";

  const slugSource = slugCandidate
    ? String(slugCandidate)
    : slugify(String(fields["Full Name"] ?? fields["Name"] ?? normalized.id ?? ""));

  const slug = slugSource.trim().toLowerCase();

  const name =
    normalized.name ||
    fields["Full Name"] ||
    fields["Name"] ||
    [normalized.firstName, normalized.lastName].filter(Boolean).join(" ") ||
    "";

  const notableAchievements =
    fields["Notable Achievements"] ??
    (normalized as any).notableAchievements ??
    "";

  return {
    ...normalized,
    id: normalized.id || row?.id || fields.id || slug || "",
    slug,
    name,
    fields,
    notableAchievements,
  };
}

const escapeFormulaValue = (value: string) => value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

/** Fetch a single speaker row directly from Airtable using the slug column. */
export async function fetchSpeakerBySlugRemote(slug: string): Promise<Speaker | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const formula = `LOWER({Slug})='${escapeFormulaValue(normalized)}'`;

  const rows = await airtableQuery(SPEAKERS_TABLE, {
    filterByFormula: formula,
    maxRecords: 1,
  });

  const hit = rows?.[0];
  return hit ? mapSpeaker(hit) : null;
}
