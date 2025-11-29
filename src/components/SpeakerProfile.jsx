import React, { useMemo, useEffect, useState } from 'react';
import SpeakerCard from './SpeakerCard';
import { listSpeakersAll } from '@/lib/airtable';
import { getAllPublishedSpeakersCached, computeRelatedSpeakers } from '@/lib/speakers';
import VideoEmbed from './VideoEmbed'
import QuickFacts from './QuickFacts'
import InfoCard from './InfoCard'
import RichText from './RichText'
import { getDisplayName } from '@/utils/displayName';
import { FIND_ROUTE, bookUrl } from '@/lib/booking';
import { waLink, waMsgForSpeaker } from '@/lib/whatsapp';
import { lazyImgProps } from '@/lib/img';

function asList(str) {
  if (!str) return []
  return String(str)
    .split(/\r?\n|;|•/g)
    .map(s => s.trim())
    .filter(Boolean)
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-sm text-gray-700 bg-white shadow-sm">
      {children}
    </span>
  )
}


export default function SpeakerProfile({ id, speakers = [] }) {
  useEffect(() => {
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }), 0)
  }, [])

  const speaker = useMemo(() => {
    if (!id) return null
    const needle = decodeURIComponent(id).toLowerCase()
    return (
      speakers.find(s =>
        String(s.id || '').toLowerCase() === needle ||
        String(s.slug || '').toLowerCase() === needle
      ) || null
    )
  }, [id, speakers])

  const [related, setRelated] = useState(null);

  const currentSpeaker = useMemo(() => {
    if (!speaker) return { id: "", slug: "", country: "", languages: [], expertise: [], featured: false };
    return {
      id: speaker.id,
      slug: speaker.slug,
      country: speaker.country || "",
      languages: speaker.languages || speaker.spokenLanguages || [],
      expertise: speaker.expertiseAreas || speaker.expertise || [],
      featured: !!speaker.featured,
    };
  }, [speaker]);

  const statusTags = Array.isArray(speaker?.status) ? speaker.status : []
  const isApproved = statusTags.includes('Approved')
  const isPublished = statusTags.includes('Published on Site')
  const isPreview = isApproved && !isPublished

  useEffect(() => {
    if (!currentSpeaker.id) return
    let alive = true
    ;(async () => {
      try {
        const all = await getAllPublishedSpeakersCached(listSpeakersAll)
        const picks = computeRelatedSpeakers(currentSpeaker, all, 3)
        if (alive) setRelated(picks)
      } catch (e) {
        console.error("Related speakers failed:", e)
        if (alive) setRelated([])
      }
    })()
    return () => { alive = false }
  }, [currentSpeaker])

  useEffect(() => {
    if (isPreview) {
      let meta = document.querySelector('meta[name="robots"]')
      const prev = meta?.content || ''
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = 'robots'
        document.head.appendChild(meta)
      }
      meta.content = 'noindex,nofollow'
      return () => {
        meta && (meta.content = prev)
      }
    }
  }, [isPreview])

  if (!speaker || (!isApproved && !isPublished)) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-xl font-semibold mb-2">Speaker profile uploading…</h1>
        <p className="text-gray-600">
          We couldn’t locate that profile.{' '}
          <a
            className="text-blue-600 underline"
            href={FIND_ROUTE}
          >
            Return to Find Speakers
          </a>.
        </p>
      </main>
    )
  }

  const fullName = getDisplayName(speaker)
  const contactName = `${speaker.title ? `${speaker.title} ` : ''}${speaker.firstName || ''} ${speaker.lastName || ''}`.trim()
  const contactHref = bookUrl(contactName || undefined)
  const topics = asList(speaker.topics || speaker.speakingTopics)
  const hasBulletTopics = topics.length > 1
  const videos = speaker.videos || []
  const expertiseAreas = Array.isArray(speaker.expertiseAreas)
    ? speaker.expertiseAreas
    : Array.isArray(speaker.fields?.['Expertise Areas'])
    ? speaker.fields['Expertise Areas']
    : []

  const shareUrl = `${window.location.origin}/#/speaker/${encodeURIComponent(
    (speaker.slug || speaker.id || '').toLowerCase()
  )}`

  const onShare = async () => {
    try {
      const shareData = {
        title: `${fullName || speaker.professionalTitle || 'ASB Speaker'}`,
        text: 'Check out this speaker from African Speaker Bureau',
        url: shareUrl,
      }
      if (navigator.share) {
        await navigator.share(shareData)
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        alert('Profile link copied to clipboard.')
      } else {
        prompt('Copy this link:', shareUrl)
      }
    } catch (e) {
      console.error('Share failed:', e)
    }
  }

  const whatsappMessage = waMsgForSpeaker(fullName || speaker.firstName || 'this speaker')
  const whatsappHref = waLink(whatsappMessage)
  const whatsappLabelName = speaker.firstName || fullName.split(' ')[0] || 'this speaker'
  const handleWhatsAppClick = () => {
    try {
      window.dataLayer?.push({ event: 'whatsapp_click', campaign: `speaker-${speaker.slug || 'profile'}`, href: whatsappHref })
    } catch {}
    try {
      window.gtag?.('event', 'click', { event_category: 'engagement', event_label: 'whatsapp', value: 1 })
    } catch {}
    try {
      window.fbq?.('trackCustom', 'WhatsAppClick', { campaign: `speaker-${speaker.slug || 'profile'}` })
    } catch {}
  }

  const quickFactsSection = (
    <section id="quick-facts" className="mt-4 lg:mt-0">
      <QuickFacts
        country={speaker.country}
        languages={speaker.languages}
        availability={speaker.travelWillingness}
        feeRange={speaker.feeRangeGeneral}
      />
    </section>
  )

  const expertiseAreasSection =
    expertiseAreas.length > 0 && (
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Expertise Areas</h2>
        <ul className="asb-plainlist mt-2">
          {expertiseAreas.map(tag => (
            <li key={tag} className="asb-plainlist__item">
              {tag}
            </li>
          ))}
        </ul>
      </section>
    )

  const keyMessagesSection =
    speaker.keyMessages && (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Key Messages</h2>
        <p className="text-gray-700 whitespace-pre-line">{speaker.keyMessages}</p>
      </div>
    )

  const whatYoullGetSection =
    (
      speaker.deliveryStyle ||
      speaker.whyListen ||
      speaker.whatAddress ||
      speaker.whatLearn ||
      speaker.whatTakeHome ||
      speaker.benefitsIndividual ||
      speaker.benefitsOrganisation
    ) && (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">What You’ll Get</h2>
        {speaker.deliveryStyle && (
          <>
            <h3 className="font-medium text-gray-900">Delivery Style</h3>
            <p className="text-gray-700 whitespace-pre-line mb-4">{speaker.deliveryStyle}</p>
          </>
        )}
        {speaker.whyListen && (
          <>
            <h3 className="font-medium text-gray-900">Why This Speaker</h3>
            <p className="text-gray-700 whitespace-pre-line mb-4">{speaker.whyListen}</p>
          </>
        )}
        {speaker.whatAddress && (
          <>
            <h3 className="font-medium text-gray-900">What the speeches will address</h3>
            <p className="text-gray-700 whitespace-pre-line mb-4">{speaker.whatAddress}</p>
          </>
        )}
        {speaker.whatLearn && (
          <>
            <h3 className="font-medium text-gray-900">What participants will learn</h3>
            <p className="text-gray-700 whitespace-pre-line mb-4">{speaker.whatLearn}</p>
          </>
        )}
        {speaker.whatTakeHome && (
          <>
            <h3 className="font-medium text-gray-900">What the audience will take home</h3>
            <p className="text-gray-700 whitespace-pre-line mb-4">{speaker.whatTakeHome}</p>
          </>
        )}
        {speaker.benefitsIndividual && (
          <>
            <h3 className="font-medium text-gray-900">Benefits: Individual</h3>
            <p className="text-gray-700 whitespace-pre-line mb-4">{speaker.benefitsIndividual}</p>
          </>
        )}
        {speaker.benefitsOrganisation && (
          <>
            <h3 className="font-medium text-gray-900">Benefits: Organisation</h3>
            <p className="text-gray-700 whitespace-pre-line">{speaker.benefitsOrganisation}</p>
          </>
        )}
      </div>
    )

  const speakingTopicsSection =
    topics.length > 0 && (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Speaking Topics</h2>
        {hasBulletTopics ? (
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            {topics.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">{topics[0]}</p>
        )}
      </div>
    )

  const feeRangesSection = (() => {
    const rows = [
      { label: 'Local', value: speaker.feeRangeLocal },
      { label: 'Continental', value: speaker.feeRangeContinental },
      { label: 'International', value: speaker.feeRangeInternational },
      { label: 'Virtual', value: speaker.feeRangeVirtual },
    ].filter(r => r.value && r.value.trim())
    if (rows.length === 0) return null
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Fee Ranges</h2>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm mt-2">
          {rows.map(r => (
            <React.Fragment key={r.label}>
              <dt className="text-gray-500">{r.label}</dt>
              <dd>{r.value}</dd>
            </React.Fragment>
          ))}
        </dl>
      </section>
    )
  })()

  const aboutSection =
    (speaker.bio || speaker.notableAchievements || speaker.achievements || speaker.education) && (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">About</h2>
        {speaker.bio && (
          <>
            <h3 className="font-medium text-gray-900">Professional Bio</h3>
            <p className="text-gray-700 whitespace-pre-line mb-4">{speaker.bio}</p>
          </>
        )}
        {speaker.notableAchievements && (
          <>
            <h3 className="font-medium text-gray-900">Notable Achievements</h3>
            <p className="text-gray-700 whitespace-pre-line mb-4">{speaker.notableAchievements}</p>
          </>
        )}
        {speaker.achievements && (
          <>
            <h3 className="font-medium text-gray-900">Further Achievements</h3>
            <p className="text-gray-700 whitespace-pre-line mb-4">{speaker.achievements}</p>
          </>
        )}
        {speaker.education && (
          <>
            <h3 className="font-medium text-gray-900">Education</h3>
            <p className="text-gray-700 whitespace-pre-line">{speaker.education}</p>
          </>
        )}
      </div>
    )

  const audienceContextSection = (() => {
    const audience = Array.isArray(speaker.targetAudience)
      ? speaker.targetAudience
      : []
    const context = Array.isArray(speaker.deliveryContext)
      ? speaker.deliveryContext
      : []
    if (!audience.length && !context.length) return null
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-semibold">Audience & Context</h2>
        {audience.length > 0 && (
          <div className="mt-2">
            <h3 className="font-medium text-gray-900">Ideal Audience</h3>
            <ul className="asb-plainlist mt-1">
              {audience.map(a => (
                <li key={a} className="asb-plainlist__item">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
        {context.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-gray-900">Context</h3>
            <ul className="asb-plainlist mt-1">
              {context.map(c => (
                <li key={c} className="asb-plainlist__item">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    )
  })()

  const speechDetailsSection =
    speaker.speechesDetailed && (
      <InfoCard
        title="Speech Details"
        subtitle="Want more detail on this speaker’s talks? Here you go."
      >
        <RichText html={speaker.speechesDetailed} />
      </InfoCard>
    )

  const videosSection =
    videos.length > 0 && (
      <section id="videos" className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Videos</h2>
        <div className="video-grid">
          {videos.map((url, i) => (
            <VideoEmbed
              key={i}
              url={url}
              title={`Video ${i + 1} — ${fullName}`}
            />
          ))}
        </div>
      </section>
    )

  const relatedSection =
    related === null ? (
      <section className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Related speakers</h2>
        <div className="grid md:grid-cols-3 gap-4 opacity-60">
          <div className="rounded-xl border p-6">Card placeholder</div>
          <div className="rounded-xl border p-6">Card placeholder</div>
          <div className="rounded-xl border p-6">Card placeholder</div>
        </div>
      </section>
    ) : related.length > 0 ? (
      <section className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Related speakers</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {related.map(s => (
            <SpeakerCard
              key={s.id}
              speaker={{
                ...s,
                name: getDisplayName(s),
                spokenLanguages: s.languages,
                expertiseAreas: s.expertise,
              }}
              variant="compact"
            />
          ))}
        </div>
      </section>
    ) : null

  return (
    <>
      {isApproved && !isPublished && (
        <div className="bg-yellow-100 text-yellow-800 text-center py-2 text-sm">
          Preview — this profile is approved but not yet published on the site.
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 pb-24">
      {speaker.headerUrl && (
        <div className="relative w-full overflow-hidden rounded-3xl">
          <img
            src={speaker.headerUrl}
            alt={speaker.fullName || fullName || ''}
            className="w-full h-[280px] sm:h-[300px] md:h-[340px] lg:h-[380px] xl:h-[420px] object-cover"
            loading="eager"
          />
        </div>
      )}
      <div className="max-w-6xl mx-auto mt-8 md:mt-12">
        {isPreview && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-amber-900 text-sm">
            <strong>Preview:</strong> this profile is approved but not yet published on the site.
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-4">
          {speaker.photoUrl ? (
            <img
              className="w-32 h-32 rounded-2xl object-cover"
              src={speaker.photoUrl}
              alt={fullName}
              width={128}
              height={128}
              {...lazyImgProps}
            />
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-gray-100 grid place-content-center text-gray-400 text-sm">No image</div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{fullName}</h1>
            {speaker.professionalTitle && (
              <p className="mt-1 text-base md:text-lg text-slate-600">{speaker.professionalTitle}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {speaker.languages?.length > 0 && <Chip>{speaker.languages.join(', ')}</Chip>}
              {speaker.country && <Chip>{speaker.country}</Chip>}
              {speaker.travelWillingness && <Chip>{speaker.travelWillingness}</Chip>}
              {speaker.feeRangeGeneral && <Chip>{speaker.feeRangeGeneral}</Chip>}
            </div>

            <div className="mt-4 mb-2 sm:mb-0 flex flex-wrap gap-3">
              <a
                href={contactHref}
                className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
              >
                Book {speaker.firstName}
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="whatsapp"
                data-campaign={`speaker-${speaker.slug || 'profile'}`}
                className="inline-flex items-center rounded-xl bg-[#25D366] px-4 py-2 font-semibold text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                onClick={handleWhatsAppClick}
              >
                WhatsApp {whatsappLabelName}
              </a>
              {isApproved && speaker.slackUrl && (
                <a
                  href={speaker.slackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
                >
                  Join on Slack
                </a>
              )}
              <button
                type="button"
                className="inline-flex items-center rounded-xl border px-4 py-2 text-gray-800 bg-white shadow-sm"
                onClick={onShare}
              >
                Share profile
              </button>
              <a
                href={FIND_ROUTE}
                className="inline-flex items-center rounded-xl border px-4 py-2 text-gray-800 bg-white shadow-sm"
              >
                Back to search
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE — single column in the exact order Jay wants */}
      <div className="lg:hidden space-y-6 mt-6">
        {quickFactsSection}
        {expertiseAreasSection}
        {keyMessagesSection}
        {whatYoullGetSection}
        {speakingTopicsSection}
        {feeRangesSection}
        {aboutSection}
        {audienceContextSection}
        {speechDetailsSection}
        {videosSection}
        {relatedSection}
      </div>

      {/* DESKTOP — original two-column grid, untouched */}
      <div className="hidden lg:grid grid-cols-12 gap-8 mt-6">
        <div className="col-span-8 space-y-6">
          {keyMessagesSection}
          {whatYoullGetSection}
          {speakingTopicsSection}
          {aboutSection}
          {speechDetailsSection}
          {videosSection}
          {relatedSection}
        </div>
        <aside className="col-span-4 space-y-6">
          {quickFactsSection}
          {expertiseAreasSection}
          {audienceContextSection}
          {feeRangesSection}
        </aside>
        </div>
      </div>
    </>
  )
}
