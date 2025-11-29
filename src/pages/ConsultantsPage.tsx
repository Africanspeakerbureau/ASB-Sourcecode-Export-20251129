import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { fetchConsultants, fetchConsultantsByIds, fetchConsultantsLanding } from '@/api/consultants'
import { lazyImgProps } from '@/lib/img'
import { AsbConsultantRecord, AsbConsultantsLandingRecord } from '@/types/consultants'

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

function getEmbedFriendlyUrl(url?: string): string {
  if (!url) return ''

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      const id = parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop()
      return id ? `https://www.youtube.com/embed/${id}` : url
    }

    if (host.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : url
    }

    return url
  } catch (error) {
    console.warn('Invalid hero video URL', url, error)
    return url || ''
  }
}

function splitLines(value?: string): string[] {
  return (value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function dedupeRecords(records: AsbConsultantRecord[]): AsbConsultantRecord[] {
  const seen = new Set<string>()
  const list: AsbConsultantRecord[] = []
  records.forEach((rec) => {
    if (rec?.id && !seen.has(rec.id)) {
      seen.add(rec.id)
      list.push(rec)
    }
  })
  return list
}

function FeaturedConsultantCard({
  consultant,
  onClick,
}: {
  consultant: AsbConsultantRecord
  onClick: (slug?: string) => void
}) {
  const fullName = consultant.fields['Full Name'] || 'Consultant'
  const title = consultant.fields['Professional Title']
  const location = consultant.fields['Location']
  const country = consultant.fields['Country']
  const feeBand = consultant.fields['Fee Range General']
  const slug = consultant.fields['Slug']
  const expertise = consultant.fields['Expertise Areas'] || []
  const portrait = firstAttachmentUrl(consultant.fields['Profile Image']) ||
    firstAttachmentUrl(consultant.fields['Hero Image'])

  const expertiseLine = expertise.join(', ')
  const metaLine = [location, country].filter(Boolean).join(' • ')

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(slug)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(slug)}
      className="group flex cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {portrait && (
        <div className="overflow-hidden rounded-xl bg-slate-100">
          <img
            src={portrait}
            alt={fullName}
            className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            {...lazyImgProps}
          />
        </div>
      )}
      <div className="mt-4 space-y-2">
        <h3 className="text-xl font-semibold text-slate-900">{fullName}</h3>
        {title && <p className="text-sm text-slate-600">{title}</p>}
        {(metaLine || feeBand) && (
          <p className="text-sm font-medium text-slate-500">{[metaLine, feeBand].filter(Boolean).join(' • ')}</p>
        )}
        {expertiseLine && <p className="text-sm text-slate-600">{expertiseLine}</p>}
      </div>
    </div>
  )
}

function ConsultantListRow({ consultant, onClick }: { consultant: AsbConsultantRecord; onClick: (slug?: string) => void }) {
  const fullName = consultant.fields['Full Name'] || 'Consultant'
  const title = consultant.fields['Professional Title']
  const location = consultant.fields['Location']
  const country = consultant.fields['Country']
  const company = consultant.fields['Company / Firm']
  const expertise = consultant.fields['Expertise Areas'] || []
  const availability = consultant.fields['Availability Window']
  const feeBand = consultant.fields['Fee Range General']
  const slug = consultant.fields['Slug']
  const portrait = firstAttachmentUrl(consultant.fields['Profile Image']) ||
    firstAttachmentUrl(consultant.fields['Hero Image'])

  const expertiseLine = expertise.slice(0, 3).join(', ')
  const subline = [location, country, company].filter(Boolean).join(' • ')

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(slug)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(slug)}
      className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100">
        {portrait ? (
          <img src={portrait} alt={fullName} className="h-full w-full object-cover" {...lazyImgProps} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">{fullName.charAt(0)}</div>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-lg font-semibold text-slate-900">
          {fullName}
          {title && <span className="text-slate-500"> · {title}</span>}
        </p>
        {subline && <p className="text-sm text-slate-600">{subline}</p>}
        {expertiseLine && <p className="text-sm text-slate-500">{expertiseLine}</p>}
      </div>
      <div className="flex flex-col items-end gap-2 text-right">
        {availability && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{availability}</span>}
        {feeBand && <span className="text-sm font-semibold text-slate-900">{feeBand}</span>}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClick(slug)
          }}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition group-hover:bg-blue-700"
        >
          View profile →
        </button>
      </div>
    </div>
  )
}

export default function ConsultantsPage() {
  const navigate = useNavigate()
  const [landing, setLanding] = useState<AsbConsultantsLandingRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [availability, setAvailability] = useState('')
  const [feeBand, setFeeBand] = useState('')
  const [pageData, setPageData] = useState<Record<number, AsbConsultantRecord[]>>({})
  const [pageOffsets, setPageOffsets] = useState<(string | undefined)[]>([undefined])
  const [pageNextOffsets, setPageNextOffsets] = useState<(string | undefined)[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [allConsultants, setAllConsultants] = useState<AsbConsultantRecord[]>([])
  const [featuredConsultants, setFeaturedConsultants] = useState<AsbConsultantRecord[]>([])

  const currentRecords = pageData[pageIndex] || []

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [landingRecord] = await Promise.all([fetchConsultantsLanding()])
        if (!active) return
        setLanding(landingRecord)
      } catch (error) {
        console.error('Failed to load consultants landing', error)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setPageIndex(0)
    setPageData({})
    setPageOffsets([undefined])
    setPageNextOffsets([])
    ;(async () => {
      try {
        const response = await fetchConsultants({ country: country || undefined, availability: availability || undefined, feeBand: feeBand || undefined })
        if (!active) return
        setPageData({ 0: response.records })
        setAllConsultants((prev) => dedupeRecords([...(prev || []), ...response.records]))
        setPageOffsets([undefined, response.offset])
        setPageNextOffsets([response.offset])
      } catch (error) {
        console.error('Failed to load consultants', error)
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [country, availability, feeBand])

  useEffect(() => {
    const title =
      landing?.fields['SEO Title Override'] ||
      'Consultants & Advisors – African Speaker Bureau'
    const description =
      landing?.fields['SEO Description'] ||
      (landing?.fields['Hero Intro Text'] || '').slice(0, 160)
    document.title = title
    if (description) upsertMeta('description', description)
  }, [landing])

  useEffect(() => {
    let active = true
    const ids = landing?.fields['Featured Consultants'] || []
    if (!ids.length) {
      setFeaturedConsultants([])
      return
    }

    const existing = allConsultants.filter((rec) => ids.includes(rec.id))
    const missingIds = ids.filter((id) => !existing.find((rec) => rec.id === id))

    if (!missingIds.length) {
      const ordered = ids
        .map((id) => existing.find((rec) => rec.id === id))
        .filter((rec): rec is AsbConsultantRecord => Boolean(rec))
      setFeaturedConsultants(ordered)
      return
    }

    ;(async () => {
      try {
        const fetched = await fetchConsultantsByIds(missingIds)
        if (!active) return
        const combined = dedupeRecords([...existing, ...fetched])
        setAllConsultants((prev) => dedupeRecords([...(prev || []), ...fetched]))
        const ordered = ids
          .map((id) => combined.find((rec) => rec.id === id))
          .filter((rec): rec is AsbConsultantRecord => Boolean(rec))
        setFeaturedConsultants(ordered)
      } catch (error) {
        console.error('Failed to load featured consultants', error)
      }
    })()

    return () => {
      active = false
    }
  }, [landing, allConsultants])

  const filteredRecords = useMemo(() => {
    if (!search) return currentRecords
    const term = search.toLowerCase()
    return currentRecords.filter((rec) => {
      const fields = rec.fields
      const haystack = [
        fields['Full Name'],
        fields['Professional Title'],
        fields['Company / Firm'],
        ...(fields['Expertise Areas'] || []),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [currentRecords, search])

  const countryOptions = useMemo(() => {
    const set = new Set<string>()
    allConsultants.forEach((rec) => {
      if (rec.fields['Country']) set.add(rec.fields['Country'] as string)
    })
    return Array.from(set).sort()
  }, [allConsultants])

  const availabilityOptions = useMemo(() => {
    const set = new Set<string>()
    allConsultants.forEach((rec) => {
      if (rec.fields['Availability Window']) set.add(rec.fields['Availability Window'] as string)
    })
    return Array.from(set).sort()
  }, [allConsultants])

  const feeBandOptions = useMemo(() => {
    const set = new Set<string>()
    allConsultants.forEach((rec) => {
      if (rec.fields['Fee Range General']) set.add(rec.fields['Fee Range General'] as string)
    })
    return Array.from(set).sort()
  }, [allConsultants])

  const handleNavigate = useCallback(
    (slug?: string) => {
      if (!slug) return
      navigate(`/consultants/${slug}`)
    },
    [navigate],
  )

  const handleHeroPrimaryCta = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, target?: string) => {
      if (!target) return
      if (target.startsWith('#')) {
        event.preventDefault()
        const el = document.querySelector(target)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    },
    [],
  )

  const handleNextPage = () => {
    const nextPage = pageIndex + 1
    if (pageData[nextPage]) {
      setPageIndex(nextPage)
      return
    }
    const offset = pageOffsets[nextPage]
    if (!offset) return
    setLoading(true)
    ;(async () => {
      try {
        const response = await fetchConsultants({
          country: country || undefined,
          availability: availability || undefined,
          feeBand: feeBand || undefined,
          offset,
        })
        setPageData((prev) => ({ ...prev, [nextPage]: response.records }))
        setAllConsultants((prev) => dedupeRecords([...(prev || []), ...response.records]))
        setPageOffsets((prev) => {
          const next = [...prev]
          next[nextPage + 1] = response.offset
          return next
        })
        setPageNextOffsets((prev) => {
          const next = [...prev]
          next[nextPage] = response.offset
          return next
        })
        setPageIndex(nextPage)
      } catch (error) {
        console.error('Failed to load next page', error)
      } finally {
        setLoading(false)
      }
    })()
  }

  const handlePrevPage = () => {
    if (pageIndex === 0) return
    setPageIndex((prev) => Math.max(0, prev - 1))
  }

  const heroImage = firstAttachmentUrl(landing?.fields['Hero Image'])
  const heroVideo = getEmbedFriendlyUrl(landing?.fields['Hero Video URL'])
  const heroBullets = splitLines(landing?.fields['Highlight Bullets'])

  const showNext = !!pageNextOffsets[pageIndex]

  return (
    <main className="bg-white">
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 md:grid-cols-2 md:px-10 md:py-16">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Consultants & Advisors</p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-5xl">
              {landing?.fields['Hero Heading'] || 'ASB Consultants'}
            </h1>
            {landing?.fields['Hero Subheading'] && (
              <p className="text-lg text-slate-700 md:text-xl">{landing.fields['Hero Subheading']}</p>
            )}
            {landing?.fields['Hero Intro Text'] && (
              <p className="max-w-2xl text-base leading-relaxed text-slate-600">{landing.fields['Hero Intro Text']}</p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              {landing?.fields['Hero Primary CTA Label'] && landing.fields['Hero Primary CTA Target'] && (
                <a
                  href={landing.fields['Hero Primary CTA Target']}
                  onClick={(e) => handleHeroPrimaryCta(e, landing.fields['Hero Primary CTA Target'])}
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {landing.fields['Hero Primary CTA Label']}
                </a>
              )}
              {landing?.fields['Hero Secondary CTA Label'] && landing.fields['Hero Secondary CTA URL'] && (
                <a
                  href={landing.fields['Hero Secondary CTA URL']}
                  className="text-sm font-semibold text-blue-700 underline underline-offset-4"
                >
                  {landing.fields['Hero Secondary CTA Label']}
                </a>
              )}
              <a
                href="/#/apply-consultant-v1"
                className="inline-flex items-center justify-center rounded-full border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Join as Consultant
              </a>
            </div>
            {heroBullets.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {heroBullets.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" aria-hidden />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-xl">
            {heroVideo ? (
              <div className="aspect-video w-full">
                <iframe
                  src={heroVideo}
                  title={landing?.fields['Hero Heading'] || 'Consultants'}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : heroImage ? (
              <img src={heroImage} alt={landing?.fields['Hero Heading'] || 'Consultants'} className="h-full w-full object-cover" {...lazyImgProps} />
            ) : (
              <div className="aspect-video w-full bg-slate-200" />
            )}
          </div>
        </div>
      </section>

      {featuredConsultants.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12 md:px-10">
          <div className="flex items-center justify-between gap-4 pb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Featured</p>
              <h2 className="text-2xl font-semibold text-slate-900">Highlighted consultants</h2>
            </div>
            <p className="text-sm text-slate-600">Curated picks from the ASB team</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredConsultants.map((consultant) => (
              <FeaturedConsultantCard key={consultant.id} consultant={consultant} onClick={handleNavigate} />
            ))}
          </div>
        </section>
      )}

      <section id="consultants-list" className="mx-auto max-w-6xl px-6 pb-16 pt-4 md:px-10">
        <div className="flex items-center justify-between gap-4 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Directory</p>
            <h2 className="text-2xl font-semibold text-slate-900">Consultants & Advisors</h2>
          </div>
          {loading ? (
            <span className="text-sm text-slate-600">Loading…</span>
          ) : (
            <span className="text-sm text-slate-600">{currentRecords.length} consultants</span>
          )}
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Search</label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, title, company"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All</option>
              {countryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All</option>
              {availabilityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Fee band</label>
            <select
              value={feeBand}
              onChange={(e) => setFeeBand(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All</option>
              {feeBandOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="opacity-60">
            <label className="text-sm font-semibold text-slate-700">More filters</label>
            <div className="mt-2 flex h-[38px] items-center rounded-xl border border-dashed border-slate-300 px-3 text-sm text-slate-500">
              Coming soon
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading && currentRecords.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">Loading consultants…</div>
          ) : null}
          {!loading && filteredRecords.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">
              No consultants match these filters yet.
            </div>
          ) : (
            filteredRecords.map((consultant) => (
              <ConsultantListRow key={consultant.id} consultant={consultant} onClick={handleNavigate} />
            ))
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={pageIndex === 0}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Previous
          </button>
          <div className="text-sm text-slate-600">Page {pageIndex + 1}</div>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={!showNext}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </section>
    </main>
  )
}
