import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchAcademyCourseBySlug } from '@/api/academy'
import { AcademyCourseRecord } from '@/types/academy'
import { lazyImgProps } from '@/lib/img'

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

function formatPrice(course: AcademyCourseRecord | null): string {
  if (!course) return ''
  const price = course.fields['Price From']
  if (price == null) return 'Pricing on request'
  const currency = course.fields['Currency'] || 'USD'
  const rounded = Math.round(price)
  return `From ${currency} ${rounded.toLocaleString()}`
}

export default function AcademyCoursePage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState<AcademyCourseRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const record = await fetchAcademyCourseBySlug(slug)
        if (!active) return
        setCourse(record)
      } catch (error) {
        console.error('Failed to load academy course', error)
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [slug])

  const heroImage = useMemo(() => {
    return (
      firstAttachmentUrl(course?.fields['Hero Image']) ||
      firstAttachmentUrl(course?.fields['Thumbnail Image']) ||
      ''
    )
  }, [course])

  useEffect(() => {
    if (!course) return
    const title = course.fields['SEO Title Override'] || `${course.fields['Course Name'] || 'Course'} – ASB Academy`
    const descSource =
      course.fields['SEO Description'] ||
      course.fields['Short Description'] ||
      course.fields['Long Description'] ||
      ''
    const description = descSource.slice(0, 160)
    document.title = title
    if (description) upsertMeta('description', description)
  }, [course])

  const metaLine = useMemo(() => {
    const category = course?.fields['Category']
    const type = course?.fields['Course Type']
    const level = course?.fields['Level']
    const duration = course?.fields['Duration']
    return [category, type, level, duration].filter(Boolean).join(' • ')
  }, [course])

  const outcomes = splitLines(course?.fields['Key Outcomes'])
  const topics = splitLines(course?.fields['Key Topics'])
  const priceText = formatPrice(course)

  const handlePrimaryCta = () => {
    const externalUrl = course?.fields['External Course URL']
    const email = course?.fields['External Enquiry Email']
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener')
      return
    }
    if (email) {
      window.location.href = `mailto:${email}`
      return
    }
    const section = document.getElementById('course-details')
    if (section) section.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <main className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center text-slate-700">Loading course…</div>
      </main>
    )
  }

  if (!loading && !course) {
    return (
      <main className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Course not found</h1>
          <p className="mt-3 text-base text-slate-600">We couldn’t find this Academy course.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/academy')}
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Back to Academy
            </button>
          </div>
        </div>
      </main>
    )
  }

  const title = course?.fields['Course Name'] || ''
  const tagline = course?.fields['Short Tagline']
  const audience = course?.fields['Ideal Audience']
  const description = course?.fields['Long Description']
  const formatDetails = course?.fields['Format Details']
  const deliveryMode = course?.fields['Delivery Mode']
  const language = course?.fields['Language']
  const region = course?.fields['Primary Region']
  const tags = course?.fields['Tags'] || []

  return (
    <main className="bg-white">
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 md:grid-cols-2 md:px-10 md:py-16">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">ASB Academy</p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-5xl">{title}</h1>
            {tagline && <p className="text-lg text-slate-700 md:text-xl">{tagline}</p>}
            {metaLine && <p className="text-sm font-semibold text-slate-600">{metaLine}</p>}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Enquire about this course
              </button>
              {course?.fields['External Course URL'] && (
                <a
                  href={course.fields['External Course URL']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-700 underline underline-offset-4"
                >
                  View course site
                </a>
              )}
            </div>
          </div>
          {heroImage && (
            <div className="overflow-hidden rounded-3xl bg-slate-100 shadow-xl">
              <img src={heroImage} alt="" className="h-full w-full object-cover" {...lazyImgProps} />
            </div>
          )}
        </div>
      </section>

      <section id="course-details" className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <div className="grid gap-10 md:grid-cols-[2fr,1fr]">
          <div className="space-y-10">
            {description && (
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-slate-900">About this course</h2>
                <p className="text-base leading-relaxed text-slate-700 whitespace-pre-line">{description}</p>
              </div>
            )}

            {outcomes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900">What participants will learn</h3>
                <ul className="space-y-2 text-base text-slate-700">
                  {outcomes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" aria-hidden />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {topics.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900">Key topics & modules</h3>
                <ul className="space-y-2 text-base text-slate-700">
                  {topics.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" aria-hidden />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {audience && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900">Ideal audience</h3>
                <p className="text-base leading-relaxed text-slate-700 whitespace-pre-line">{audience}</p>
              </div>
            )}
          </div>

          <aside className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Format & logistics</h3>
            <dl className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold text-slate-900">Duration</dt>
                <dd className="text-right">{course?.fields['Duration'] || 'TBC'}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold text-slate-900">Delivery mode</dt>
                <dd className="text-right">{deliveryMode || 'TBC'}</dd>
              </div>
              {formatDetails && (
                <div className="flex items-start justify-between gap-4">
                  <dt className="font-semibold text-slate-900">Format details</dt>
                  <dd className="max-w-[260px] text-right leading-relaxed">{formatDetails}</dd>
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold text-slate-900">Language</dt>
                <dd className="text-right">{language || 'TBC'}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold text-slate-900">Primary region</dt>
                <dd className="text-right">{region || 'TBC'}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="font-semibold text-slate-900">Pricing</dt>
                <dd className="text-right font-semibold text-slate-900">{priceText}</dd>
              </div>
            </dl>
            {course?.fields['Lead Instructor (Speaker)']?.length ? (
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Lead instructor(s)</h4>
                <p className="mt-2 text-sm text-slate-700">Instructor details will be added soon.</p>
              </div>
            ) : null}
            {course?.fields['Supporting Instructors']?.length ? (
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Supporting instructors</h4>
                <p className="mt-2 text-sm text-slate-700">Supporting faculty information coming soon.</p>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  )
}
