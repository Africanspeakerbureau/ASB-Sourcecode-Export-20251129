import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { fetchConsultantBySlug } from '@/api/consultants'
import { lazyImgProps } from '@/lib/img'
import { AsbConsultantRecord } from '@/types/consultants'
import VideoCard from '@/features/videos/VideoCard'
import { Video, fetchAllVideos } from '@/features/videos/videos.data'

function upsertMeta(name: string, content: string) {
  if (typeof document === 'undefined' || !content) return
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function firstAttachmentUrl(files?: any[]): string {
  if (!Array.isArray(files) || !files.length) return ''
  const file = files[0]
  return file?.url || file?.thumbnails?.large?.url || file?.thumbnails?.small?.url || ''
}

function splitLines(value?: string): string[] {
  return (value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function splitParagraphs(value?: string): string[] {
  return (value || '')
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function attachmentsToLinks(files?: any[]) {
  if (!Array.isArray(files)) return [] as { name: string; url: string }[]
  return files
    .map((file) => ({
      name: file?.filename || file?.name || 'Download',
      url: file?.url || '',
    }))
    .filter((item) => item.url)
}

function StatCard({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <div className="text-2xl font-semibold text-slate-900">{value || '—'}</div>
      <div className="mt-1 text-sm text-slate-600">{label}</div>
    </div>
  )
}

export default function ConsultantProfilePage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const [consultant, setConsultant] = useState<AsbConsultantRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'expertise' | 'services' | 'cases' | 'media' | 'documents' | 'contact'>('overview')
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([])

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[consultants] route slug', slug)
  }, [slug])

  useEffect(() => {
    let active = true
    setLoading(true)
    ;(async () => {
      try {
        const record = await fetchConsultantBySlug(slug)
        if (!active) return
        setConsultant(record)
      } catch (error) {
        console.error('Failed to load consultant profile', error)
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    if (!consultant) return
    const name = consultant.fields['Full Name'] || 'Consultant'
    const title = consultant.fields['SEO Title Override'] || `${name} – ASB Consultants`
    const description =
      consultant.fields['SEO Description'] || consultant.fields['About'] || consultant.fields['Services Overview'] || ''
    document.title = title
    if (description) upsertMeta('description', description.slice(0, 160))
  }, [consultant])

  useEffect(() => {
    let active = true
    const related = consultant?.fields['Related Videos'] || []
    if (!related.length) {
      setRelatedVideos([])
      return undefined
    }

    ;(async () => {
      try {
        const videos = await fetchAllVideos()
        if (!active) return
        const lookups = new Set(related.map((item) => String(item).toLowerCase()))
        const matches = videos.filter(
          (video) => lookups.has((video.id || '').toLowerCase()) || lookups.has((video.title || '').toLowerCase()),
        )
        setRelatedVideos(matches)
      } catch (error) {
        console.error('Failed to load related videos', error)
      }
    })()

    return () => {
      active = false
    }
  }, [consultant])

  const heroImage = useMemo(() => {
    return firstAttachmentUrl(consultant?.fields['Hero Image']) || firstAttachmentUrl(consultant?.fields['Profile Image'])
  }, [consultant])

  if (loading) {
    return (
      <main className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center text-slate-700">Loading consultant…</div>
      </main>
    )
  }

  if (!loading && !consultant) {
    return (
      <main className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Consultant not found</h1>
          <p className="mt-3 text-base text-slate-600">We couldn’t find this consultant profile.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/consultants')}
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Back to directory
            </button>
          </div>
        </div>
      </main>
    )
  }

  const name = consultant?.fields['Full Name'] || ''
  const subtitle = consultant?.fields['Professional Title']
  const location = consultant?.fields['Location']
  const worksAcross = consultant?.fields['Works Across Regions'] || []
  const availabilityBadge = consultant?.fields['Availability Badge']
  const modeBadge = consultant?.fields['Mode Badge']
  const positioningBadge = consultant?.fields['Positioning Badge']
  const engagementLength = consultant?.fields['Typical Engagement Length']
  const feeBand = consultant?.fields['Fee Range General']
  const dayRate = consultant?.fields['Consulting Day Rate Local']
  const travelRegions = consultant?.fields['Travel Regions'] || []
  const clearances = consultant?.fields['Clearances']
  const idealAudience = consultant?.fields['Ideal Audience'] || []
  const contextTags = consultant?.fields['Context Tags'] || []
  const availabilityWindow = consultant?.fields['Availability Window']
  const availabilityNotes = consultant?.fields['Availability Notes']
  const regionsServed = consultant?.fields['Works Across Regions'] || []
  const about = consultant?.fields['About']
  const yearsConsulting = consultant?.fields['Years Consulting']
  const countriesWorked = consultant?.fields['Countries Worked']
  const flagshipOutcome = consultant?.fields['Flagship Outcome']
  const expertiseAreas = consultant?.fields['Expertise Areas'] || []
  const industries = consultant?.fields['Industries'] || []
  const tools = consultant?.fields['Tools & Methods'] || []
  const services = consultant?.fields['Services Overview']
  const caseStudies = consultant?.fields['Case Studies Summary']
  const heroVideo = consultant?.fields['Hero Video URL']

  const servicesList = splitLines(services)
  const caseStudyBlocks = splitParagraphs(caseStudies)

  const cvLinks = attachmentsToLinks(consultant?.fields['CV Attachment'])
  const casePackLinks = attachmentsToLinks(consultant?.fields['Case Pack Attachment'])
  const otherDocs = attachmentsToLinks(consultant?.fields['Other Documents'])

  const mailtoBase = 'info@africanspeakerbureau.com'
  const contactSubject = encodeURIComponent(`Consultant enquiry – ${name}`)

  return (
    <main className="bg-white">
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 md:grid-cols-2 md:px-10 md:py-16">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">ASB Consultants</p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-5xl">{name}</h1>
            {subtitle && <p className="text-lg text-slate-700 md:text-xl">{subtitle}</p>}
            {(location || worksAcross.length) && (
              <p className="text-sm font-medium text-slate-600">
                {[location, worksAcross.length ? `Works across ${worksAcross.join(', ')}` : ''].filter(Boolean).join(' · ')}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {availabilityBadge && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{availabilityBadge}</span>}
              {modeBadge && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{modeBadge}</span>}
              {positioningBadge && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{positioningBadge}</span>}
              {engagementLength && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{engagementLength}</span>}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-xl">
            {heroVideo ? (
              <div className="aspect-video w-full">
                <iframe
                  src={heroVideo}
                  title={name}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : heroImage ? (
              <img src={heroImage} alt={name} className="h-full w-full object-cover" {...lazyImgProps} />
            ) : (
              <div className="aspect-video w-full bg-slate-200" />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <div className="grid gap-10 md:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              {(
                [
                  ['overview', 'Overview'],
                  ['expertise', 'Expertise'],
                  ['services', 'Services'],
                  ['cases', 'Case Studies'],
                  ['media', 'Media'],
                  ['documents', 'Documents'],
                  ['contact', 'Contact'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-slate-900">About</h2>
                {about ? (
                  <p className="text-base leading-relaxed text-slate-700 whitespace-pre-line">{about}</p>
                ) : (
                  <p className="text-base text-slate-600">Profile summary coming soon.</p>
                )}
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Years consulting" value={yearsConsulting != null ? yearsConsulting : '—'} />
                  <StatCard label="Countries worked" value={countriesWorked != null ? countriesWorked : '—'} />
                  <StatCard label="Flagship outcome" value={flagshipOutcome || '—'} />
                </div>
              </div>
            )}

            {activeTab === 'expertise' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Expertise areas</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {expertiseAreas.length ? (
                      expertiseAreas.map((item) => (
                        <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                          {item}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-600">Expertise areas coming soon.</p>
                    )}
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Industries</h4>
                    {industries.length ? (
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        {industries.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" aria-hidden />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-slate-600">Industry focus coming soon.</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">Tools & methods</h4>
                    {tools.length ? (
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        {tools.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" aria-hidden />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-slate-600">Tools and methods coming soon.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Services</h3>
                {servicesList.length ? (
                  <ul className="space-y-2 text-base text-slate-700">
                    {servicesList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" aria-hidden />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : services ? (
                  <p className="text-base leading-relaxed text-slate-700 whitespace-pre-line">{services}</p>
                ) : (
                  <p className="text-base text-slate-600">Service overview coming soon.</p>
                )}
              </div>
            )}

            {activeTab === 'cases' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Case studies</h3>
                {caseStudyBlocks.length ? (
                  <div className="space-y-4">
                    {caseStudyBlocks.map((block, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-base leading-relaxed text-slate-700 whitespace-pre-line">{block}</p>
                      </div>
                    ))}
                  </div>
                ) : caseStudies ? (
                  <p className="text-base leading-relaxed text-slate-700 whitespace-pre-line">{caseStudies}</p>
                ) : (
                  <p className="text-base text-slate-600">Case studies will be added soon.</p>
                )}
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Media</h3>
                {relatedVideos.length ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {relatedVideos.map((video) => (
                      <VideoCard
                        key={video.id}
                        title={video.title}
                        youtubeId={video.youtubeId}
                        url={video.sourceUrl}
                        meta={[video.platform, video.type].filter(Boolean).join(' • ')}
                        thumb={video.thumbnailUrl}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-slate-600">Related media will appear here.</p>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Documents</h3>
                {[{ label: 'CV', items: cvLinks }, { label: 'Case pack', items: casePackLinks }, { label: 'Other documents', items: otherDocs }]
                  .filter((group) => group.items.length)
                  .map((group) => (
                    <div key={group.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h4 className="text-sm font-semibold text-slate-900">{group.label}</h4>
                      <ul className="mt-2 space-y-2 text-sm text-blue-700">
                        {group.items.map((item) => (
                          <li key={item.url}>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                {!cvLinks.length && !casePackLinks.length && !otherDocs.length && (
                  <p className="text-base text-slate-600">Downloads will be added soon.</p>
                )}
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Book this consultant</h3>
                <p className="text-base text-slate-700">
                  Share a few details about your requirements and the ASB team will follow up quickly.
                </p>
                <button
                  type="button"
                  onClick={() => window.open(`mailto:${mailtoBase}?subject=${contactSubject}`, '_blank')}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Email the ASB team
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Quick facts</h3>
              <dl className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <dt className="font-semibold text-slate-900">Fee band</dt>
                  <dd className="text-right">{feeBand || 'On request'}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="font-semibold text-slate-900">Day rate</dt>
                  <dd className="text-right">{dayRate || 'On request'}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="font-semibold text-slate-900">Travel</dt>
                  <dd className="text-right">{travelRegions.length ? travelRegions.join(', ') : 'By arrangement'}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="font-semibold text-slate-900">Clearances</dt>
                  <dd className="text-right">{clearances || 'TBC'}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Audience & Context</h3>
              {idealAudience.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-semibold text-slate-800">Ideal audience</p>
                  <div className="flex flex-wrap gap-2">
                    {idealAudience.map((item) => (
                      <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {contextTags.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-800">Context tags</p>
                  <div className="flex flex-wrap gap-2">
                    {contextTags.map((item) => (
                      <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {!idealAudience.length && !contextTags.length && (
                <p className="mt-2 text-sm text-slate-600">Audience information coming soon.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Availability</h3>
              <p className="mt-2 text-sm font-semibold text-emerald-700">{availabilityWindow || 'Availability on request'}</p>
              {availabilityNotes && <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{availabilityNotes}</p>}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Regions served</h3>
              {regionsServed.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {regionsServed.map((item) => (
                    <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">Regional coverage coming soon.</p>
              )}
            </div>

            {(cvLinks.length || casePackLinks.length || otherDocs.length) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Downloads</h3>
                <ul className="mt-3 space-y-2 text-sm text-blue-700">
                  {cvLinks.length > 0 && (
                    <li>
                      <a
                        href={cvLinks[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold hover:underline"
                      >
                        Download CV
                      </a>
                    </li>
                  )}
                  {casePackLinks.length > 0 ? (
                    <li>
                      <a href={casePackLinks[0].url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                        Request detailed case pack
                      </a>
                    </li>
                  ) : (
                    <li>
                      <a
                        href={`mailto:${mailtoBase}?subject=${encodeURIComponent(`Consultant case pack request – ${name}`)}`}
                        className="font-semibold text-slate-800 hover:underline"
                      >
                        Request detailed case pack
                      </a>
                    </li>
                  )}
                  {otherDocs.map((doc) => (
                    <li key={doc.url}>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {doc.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}
