import React, { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { atList, f, and } from "../lib/airtableClient.ts";
import { CampaignWhyText } from "@/features/campaigns/components/CampaignWhyText";
import {
  Campaign,
  createRecordAdapter,
  mapCampaign,
} from "@/features/campaigns/campaigns.data";
import { BOOK_ROUTE, FIND_ROUTE, bookUrl } from "@/lib/booking";
import { lazyImgProps } from "@/lib/img";
import { waLink, waMsgGeneral } from "@/lib/whatsapp";

// Normalise display names to slugs without titles (Dr/Prof/Mr/Ms/Mrs)
function safeSlugFromName(name: string) {
  const cleaned = (name || "")
    .replace(/^(dr|prof|mr|ms|mrs|miss)\.?\s+/i, "")    // strip common honorifics
    .replace(/[^a-z0-9\s-]/gi, "")
    .trim();
  return cleaned
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function mdLite(md: string) {
  if (!md) return "";
  let html = md
    .replace(/^## (.*)$/gm, '<h3 class="text-xl md:text-2xl font-semibold text-slate-900 mb-2">$1</h3>')
    .replace(/_(.*?)_/g, '<em class="not-italic text-slate-600">$1</em>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br/>' );
  return `<p class="mt-3 leading-7 text-slate-800">${html}</p>`;
}

type CampaignRecord = {
  id: string;
  fields: {
    "Campaign Name"?: string;
    Slug?: string;
    "Country (ISO2)"?: string;
    "Hero Headline"?: string;
    "Hero Sub-line"?: string;
    "Why Text"?: string;
    "Primary CTA Label"?: string;
    "Primary CTA URL"?: string;
    "UTM Source Default"?: string;
    "UTM Medium Default"?: string;
    Status?: string;
    [key: string]: unknown;
  };
};

type Speaker = { id: string; fields: {
  "Angle Headline (Country)"?: string;
  "Angle Hook (Country)"?: string;
  "Why Book Now (Country)"?: string;
  "Email Hook (Country)"?: string;
  "Campaign"?: string[];
  "Display Fee (Resolved)"?: string;
  "Fee Band (Country)"?: string;
  "Display Country - Location"?: string;
  "Display Languages"?: string;
  "Formats"?: string[];
  "Industries Focus"?: string[];
  "Image Override"?: { url: string }[];
  "Speaker (L) Profile Image"?: { url: string }[];
  "Speaker (L) Slug"?: string[];
  "Display Heading"?: string;
  "Display Subline"?: string;
  "Order (Effective)"?: number;
  Order?: number;
  "CTA Label"?: string;
  "CTA URL"?: string;
}};

const Section: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) =>
  <section className={`mx-auto w-full max-w-7xl px-6 md:px-8 ${className}`}>{children}</section>;

const PREFILL_ENABLED = true;

const DEFAULT_WHATSAPP_MESSAGE = waMsgGeneral();

type SpeakerCard = {
  id: string;
  displayName: string;
  displaySubline?: string;
  angleHeadline?: string;
  angleHook?: string;
  whyNow?: string;
  displayCountryLocation?: string;
  displayLanguages?: string;
  displayFee?: string;
  industries?: string[];
  formats?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  imageOverride?: string;
  profileImage?: string;
  profileSlug?: string;
};

export default function MicrositeCampaign() {
  const { country = "", slug = "" } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [campaign, setCampaign] = React.useState<Campaign | null>(null);
  const [speakers, setSpeakers] = React.useState<SpeakerCard[]>([]);
  const iso2 = String(country).toUpperCase();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const camp = await atList<CampaignRecord>("Campaigns", {
          filterByFormula: and(f("Status","Live"), f("Country (ISO2)", iso2), f("Slug", String(slug))),
          maxRecords: 1
        });
        const c = camp.records?.[0];
        if (!c) { if (alive) setCampaign(null); setLoading(false); return; }

        // Get records, then filter by linked IDs in JS (reliable)
        const sp = await atList<Speaker>("Campaign Speakers", { pageSize: 50 });
        const all = sp.records || [];
        const filtered = all.filter(r =>
          Array.isArray(r.fields["Campaign"]) && r.fields["Campaign"].includes(c.id)
        );
        const sorted = filtered.sort((a, b) =>
          (a.fields["Order (Effective)"] ?? a.fields.Order ?? 9999) -
          (b.fields["Order (Effective)"] ?? b.fields.Order ?? 9999)
        );
        const mapped = sorted.slice(0, 5).map(r => ({
          id: r.id,
          displayName: r.fields["Display Heading"] || "",
          displaySubline: r.fields["Display Subline"] || "",
          angleHeadline: r.fields["Angle Headline (Country)"] || "",
          angleHook: r.fields["Angle Hook (Country)"] || "",
          whyNow: r.fields["Why Book Now (Country)"] || "",
          displayCountryLocation: r.fields["Display Country - Location"] || "",
          displayLanguages: r.fields["Display Languages"] || "",
          displayFee: r.fields["Display Fee (Resolved)"] || r.fields["Fee Band (Country)"] || "",
          industries: r.fields["Industries Focus"] || [],
          formats: r.fields["Formats"] || [],
          ctaLabel: r.fields["CTA Label"] || "",
          ctaUrl: r.fields["CTA URL"] || "",
          imageOverride: (r.fields["Image Override"] || [])[0]?.url || "",
          profileImage: (r.fields["Speaker (L) Profile Image"] || [])[0]?.url || "",
          profileSlug: (r.fields["Speaker (L) Slug"] || [])[0] || "",
        }));
        if (alive) {
          const mappedCampaign = mapCampaign(
            createRecordAdapter({ id: c.id, fields: c.fields })
          );

          setCampaign(mappedCampaign);
          setSpeakers(mapped);
          setLoading(false);
        }
      } catch (e) {
        console.error(e); if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [iso2, slug]);

  if (!loading && !campaign) return <Navigate to="/not-found" replace />;

  const ctaLabel = campaign?.primaryCtaLabel || "Book a 15-Min Diagnostic";

  const waHref = waLink(DEFAULT_WHATSAPP_MESSAGE);

  return (
    <main className="pb-24">
      {/* HERO (centered) */}
      <div className="bg-[rgb(249,250,255)] border-b border-[rgb(231,233,248)]">
        <Section className="py-12 md:py-16 text-center">
          {campaign?.heroHeadline && (
            <h1 className="text-3xl md:text-5xl font-semibold text-slate-900 mb-4">
              {campaign.heroHeadline} {/* no hard-coded fallback -> no flash */}
            </h1>
          )}
          {campaign?.heroSubline && (
            <div className="text-slate-600 text-lg md:text-xl max-w-3xl leading-relaxed mx-auto space-y-4">
              {campaign.heroSubline
                .split(/\n{2,}/)
                .map((paragraph, idx) => (
                  <p key={idx} className="whitespace-pre-line">
                    {paragraph.trim()}
                  </p>
                ))}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:inline-grid sm:grid-cols-3 justify-center sm:justify-items-center">
            <a
              href={BOOK_ROUTE}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700"
            >
              Book a 15-Min Diagnostic
            </a>

            <a
              href={FIND_ROUTE}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-50"
            >
              View All Speakers
            </a>

            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-[#25D366] px-5 py-3 font-semibold text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Message us on WhatsApp
              </a>
            )}
          </div>

        </Section>
        </div>

      <CampaignWhyText markdown={campaign?.whyText} />

      {/* SPEAKER CARDS */}
      <Section className="space-y-8">
        {speakers.map((s, i) => {
          const left = i % 2 === 0;
          const img = s.imageOverride || s.profileImage || "https://placehold.co/640x400?text=Speaker";

          // Prefer the lookup slug if present; otherwise strip titles and slugify the heading.
          const computedSlug = s.profileSlug && s.profileSlug.trim().length > 0
            ? s.profileSlug
            : safeSlugFromName(s.displayName || "");

          const profile = `/#/speaker/${computedSlug}`;
          const bookingHref = PREFILL_ENABLED && s.displayName
            ? bookUrl(s.displayName)
            : BOOK_ROUTE;

          return (
            <article key={s.id} className="rounded-2xl border border-[rgb(228,232,251)] bg-[rgb(246,248,252)] p-6 md:p-8">
              <div className="grid gap-6 md:gap-8 md:grid-cols-12 items-start">
                {/* IMAGE COLUMN (image → quick facts) */}
                <div className={`md:col-span-4 ${left ? "md:order-1 md:col-start-1" : "md:order-2 md:col-start-9"}`}>
                  <div className="flex flex-col gap-3">
                    <img
                      src={img}
                      alt={s.displayName}
                      className="w-full rounded-xl object-cover object-center aspect-[4/3] md:aspect-[3/2]"
                      width={640}
                      height={480}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      {...lazyImgProps}
                    />

                    {/* QUICK FACTS (desktop + mobile both OK here) */}
                    <div className="rounded-xl bg-white/60 border border-slate-200 p-3">
                      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Quick facts</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {s.displayCountryLocation && <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm">{s.displayCountryLocation}</span>}
                        {s.displayLanguages && <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm">{s.displayLanguages}</span>}
                        {s.displayFee && <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm">{s.displayFee}</span>}
                      </div>
                    </div>

                    <div className="mt-3 flex gap-3">
                      <a
                        href={profile}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 hover:bg-slate-50"
                      >
                        View Profile
                      </a>
                      <a
                        href={bookingHref}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                        data-qa="request-dates-fees"
                      >
                        Request Dates & Fees
                      </a>
                    </div>
                  </div>
                </div>

                {/* TEXT – ~2/3 width */}
                <div className={`md:col-span-8 ${left ? "md:order-2 md:col-start-5" : "md:order-1 md:col-start-1"}`}>
                  <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">{s.displayName}</h2>
                  {s.displaySubline && <p className="text-slate-600 mt-1">{s.displaySubline}</p>}

                  {/* chips (mobile only) */}
                  <div className="flex flex-wrap gap-2 mt-4 md:hidden">
                    {s.displayCountryLocation && <span className="px-3 py-1 rounded-full bg-indigo-50 text-slate-700 text-sm">{s.displayCountryLocation}</span>}
                    {s.displayLanguages && <span className="px-3 py-1 rounded-full bg-indigo-50 text-slate-700 text-sm">{s.displayLanguages}</span>}
                    {s.displayFee && <span className="px-3 py-1 rounded-full bg-indigo-50 text-slate-700 text-sm">{s.displayFee}</span>}
                  </div>

                  {/* ANGLE: headline + hook */}
                  {s.angleHeadline && (
                    <h3 className="mt-4 text-xl md:text-2xl font-semibold text-slate-900">
                      {s.angleHeadline}
                    </h3>
                  )}
                  {s.angleHook && (
                    <p className="mt-2 text-[15px] md:text-base font-medium text-slate-800">
                      {s.angleHook}
                    </p>
                  )}

                  {/* BODY (Why Book Now) – supports simple markdown */}
                  {s.whyNow && (
                    <div className="mt-3" dangerouslySetInnerHTML={{ __html: mdLite(s.whyNow) }} />
                  )}

                  {/* Focus + Formats mini-cards */}
                  {(s.industries?.length || s.formats?.length) ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {!!s.industries?.length && (
                        <div className="rounded-xl bg-white/60 border border-slate-200 p-3">
                          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Audience focus (examples)
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {s.industries.map(ind => (
                              <span key={ind} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm">{ind}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {!!s.formats?.length && (
                        <div className="rounded-xl bg-white/60 border border-slate-200 p-3">
                          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                            Formats (popular options)
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {s.formats.map(f => (
                              <span key={f} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm">{f}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {(s.industries?.length || s.formats?.length) && (
                    <p className="mt-3 text-sm text-slate-500">
                      Other audiences and formats available on request.
                    </p>
                  )}

                </div>
              </div>
            </article>
          );
        })}
      </Section>

      {/* Sticky CTA (mobile-first; harmless on desktop) */}
      {ctaLabel && (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
          <a
            href={BOOK_ROUTE}
            className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-white shadow-lg hover:bg-indigo-700"
          >
            {ctaLabel}
          </a>
        </div>
      )}
    </main>
  );
}
