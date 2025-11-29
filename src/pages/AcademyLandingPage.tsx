import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAcademyCourses, fetchAcademyLanding } from '@/api/academy'
import { AcademyCourseRecord, AcademyLandingRecord } from '@/types/academy'
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

function sortCourses(records: AcademyCourseRecord[]): AcademyCourseRecord[] {
  return [...records].sort((a, b) => {
    const orderA = a.fields['Display Order']
    const orderB = b.fields['Display Order']
    if (orderA != null && orderB != null && orderA !== orderB) return orderA - orderB
    if (orderA != null && orderB == null) return -1
    if (orderA == null && orderB != null) return 1
    const nameA = a.fields['Course Name'] || ''
    const nameB = b.fields['Course Name'] || ''
    return nameA.localeCompare(nameB)
  })
}

function CourseCard({ course, variant = 'grid' }: { course: AcademyCourseRecord; variant?: 'grid' | 'featured' }) {
  const navigate = useNavigate()
  const slug = course.fields['Slug']
  const thumbnail = firstAttachmentUrl(course.fields['Thumbnail Image']) || firstAttachmentUrl(course.fields['Hero Image'])
  const level = course.fields['Level']
  const type = course.fields['Course Type']
  const category = course.fields['Category']
  const tagline = course.fields['Short Tagline']
  const title = course.fields['Course Name'] || 'Untitled course'

  const metaLine = [category, type, level].filter(Boolean).join(' • ')

  const handleClick = () => {
    if (slug) navigate(`/academy/${slug}`)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      className={`group relative flex h-full cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        variant === 'featured' ? 'md:flex-row md:items-center md:gap-6' : ''
      }`}
    >
      {thumbnail && (
        <div className={`overflow-hidden rounded-xl bg-slate-100 ${variant === 'featured' ? 'h-40 w-full md:h-32 md:w-40' : 'aspect-[4/3] w-full'}`}>
          <img
            src={thumbnail}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            {...lazyImgProps}
          />
        </div>
      )}

      <div className={`${variant === 'featured' ? 'mt-4 flex-1 md:mt-0' : 'mt-4 flex-1 space-y-3'}`}>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-700">
          {category && <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{category}</span>}
          {course.fields['Featured on Academy'] && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Featured</span>}
        </div>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        {tagline && <p className="text-sm text-slate-600">{tagline}</p>}
        {metaLine && <p className="text-sm font-medium text-slate-500">{metaLine}</p>}
      </div>
    </div>
  )
}

export default function AcademyLandingPage() {
  const [landing, setLanding] = useState<AcademyLandingRecord | null>(null)
  const [courses, setCourses] = useState<AcademyCourseRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [landingRecord, courseRecords] = await Promise.all([
          fetchAcademyLanding(),
          fetchAcademyCourses(),
        ])
        if (!active) return
        setLanding(landingRecord)
        setCourses(courseRecords)
      } catch (error) {
        console.error('Failed to load academy data', error)
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  const sortedCourses = useMemo(() => sortCourses(courses), [courses])

  const featuredCourseIds = landing?.fields['Featured Courses'] || []
  const featuredCourses = useMemo(() => {
    if (!featuredCourseIds.length) return [] as AcademyCourseRecord[]
    const featured: AcademyCourseRecord[] = []
    featuredCourseIds.forEach((id) => {
      const match = sortedCourses.find((course) => course.id === id)
      if (match) featured.push(match)
    })
    return featured
  }, [featuredCourseIds, sortedCourses])

  const remainingCourses = useMemo(() => {
    if (!featuredCourses.length) return sortedCourses
    const featuredSet = new Set(featuredCourses.map((c) => c.id))
    return sortedCourses.filter((course) => !featuredSet.has(course.id))
  }, [featuredCourses, sortedCourses])

  useEffect(() => {
    const title = landing?.fields['SEO Title Override'] || 'ASB Academy – Courses'
    const description =
      landing?.fields['SEO Description'] || (landing?.fields['Hero Intro Text'] || '').slice(0, 160)
    document.title = title
    if (description) upsertMeta('description', description)
  }, [landing])

  const heroImage = firstAttachmentUrl(landing?.fields['Hero Image'])
  const heroHeading = landing?.fields['Hero Heading'] || 'ASB Academy'
  const heroSubheading = landing?.fields['Hero Subheading'] || 'Leadership learning experiences from ASB'
  const heroIntro = landing?.fields['Hero Intro Text'] ||
    'Curated courses and programmes designed to accelerate leadership, culture, and execution across Africa and beyond.'
  const ctaLabel = landing?.fields['Hero CTA Label'] || 'Explore courses'
  const ctaUrl = landing?.fields['Hero CTA URL'] || '#courses'

  const handleHeroCta = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!landing?.fields['Hero CTA URL']) {
      event.preventDefault()
      const el = document.getElementById('courses')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const introTitle = landing?.fields['Intro Section Title'] || 'How it works'
  const introBody = landing?.fields['Intro Section Body']
  const audienceSummary = landing?.fields['Audience Summary']
  const highlights = splitLines(landing?.fields['Highlight Bullets'])

  return (
    <main className="bg-white">
      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:items-center md:px-10 md:py-16">
          <div className="flex-1 space-y-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">ASB Academy</p>
            <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-5xl">{heroHeading}</h1>
            {heroSubheading && <p className="text-lg text-slate-700 md:text-xl">{heroSubheading}</p>}
            {heroIntro && <p className="max-w-2xl text-base leading-relaxed text-slate-600">{heroIntro}</p>}
            <div className="flex items-center gap-3">
              <a
                href={ctaUrl}
                onClick={handleHeroCta}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {ctaLabel}
              </a>
              <div className="text-sm text-slate-500">Leadership, strategy & future-focused learning</div>
            </div>
          </div>
          {heroImage && (
            <div className="flex-1">
              <div className="overflow-hidden rounded-3xl bg-slate-100 shadow-xl">
                <img
                  src={heroImage}
                  alt=""
                  className="h-full w-full object-cover"
                  {...lazyImgProps}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 md:px-10">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Overview</p>
          <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">{introTitle}</h2>
          {introBody && <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-600">{introBody}</p>}
        </div>
        {(audienceSummary || highlights.length > 0) && (
          <div className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
            {audienceSummary && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Who it’s for</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600 whitespace-pre-line">{audienceSummary}</p>
              </div>
            )}
            {highlights.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900">What you’ll find</h3>
                <ul className="mt-3 space-y-2 text-base text-slate-700">
                  {highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" aria-hidden />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {!loading && !landing && (
        <section className="mx-auto max-w-5xl px-6 py-12 md:px-10">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-700">
            <h2 className="text-2xl font-semibold text-slate-900">ASB Academy</h2>
            <p className="mt-3 text-base text-slate-600">Academy content is being updated. Please check back soon.</p>
          </div>
        </section>
      )}

      {featuredCourses.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
          <div className="flex items-center justify-between gap-4 pb-6">
            <h3 className="text-2xl font-semibold text-slate-900">Featured courses</h3>
            <p className="text-sm text-slate-600">Curated picks from the Academy team</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} variant="featured" />
            ))}
          </div>
        </section>
      )}

      <section id="courses" className="mx-auto max-w-6xl px-6 pb-16 pt-4 md:px-10">
        <div className="flex items-center justify-between gap-4 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">All courses</p>
            <h3 className="text-2xl font-semibold text-slate-900">Explore our programmes</h3>
          </div>
          {courses.length > 0 && <span className="text-sm text-slate-600">{courses.length} courses</span>}
        </div>
        {courses.length === 0 && !loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">
            Courses will be announced soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(featuredCourses.length ? remainingCourses : sortedCourses).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
