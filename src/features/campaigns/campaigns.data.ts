export type AirtableRecord = {
  id: string;
  get(field: string): unknown;
};

export type Campaign = {
  id: string;
  slug: string;
  title: string;
  heroHeadline?: string;
  heroSubline?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  whyText?: string; // Airtable “Why Text” (Rich text/Markdown)
};

export function mapCampaign(record: AirtableRecord): Campaign {
  return {
    id: record.id,
    slug: (record.get("Slug") as string) ?? "",
    title: (record.get("Title") as string) ?? "",
    heroHeadline: (record.get("Hero Headline") as string) ?? "",
    heroSubline: (record.get("Hero Sub-line") as string) ?? "",
    primaryCtaLabel: (record.get("Primary CTA Label") as string) ?? "",
    primaryCtaUrl: (record.get("Primary CTA URL") as string) ?? "",
    utmSource: (record.get("UTM Source Default") as string) ?? "",
    utmMedium: (record.get("UTM Medium Default") as string) ?? "",
    whyText: (record.get("Why Text") as string) ?? "",
  };
}

export function createRecordAdapter(
  record: { id: string; fields?: Record<string, unknown> | undefined }
): AirtableRecord {
  return {
    id: record.id,
    get(field: string) {
      return record.fields?.[field];
    },
  };
}
