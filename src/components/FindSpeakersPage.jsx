import { useEffect, useMemo, useState } from 'react'
import { fetchSpeakersForListing } from '../lib/airtable'
import { getDisplayName } from '@/utils/displayName'
import { lazyImgProps } from '@/lib/img'

// Compact, search-variant card (square image)
function SearchCard({ s }) {
  const cityCountry = [s.location, s.country].filter(Boolean).join(', ')
  const langs = (s.languages || s.spokenLanguages || []).join(', ')
  const locLang = [cityCountry, langs].filter(Boolean).join(' | ')
  const key = (s.slug || s.id || '').toLowerCase()
  const profilePath = `#/speaker/${encodeURIComponent(key)}`
  const go = (e) => {
    e.preventDefault()
    window.history.pushState({}, '', profilePath)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const name = getDisplayName(s)
  const fee = s.feeRangeGeneral ?? s.feeRange ?? null
  const expertiseTags = s.expertiseAreas || s.expertise || []
  const showFee = s.displayFee !== 'No' && !!fee

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center">
      <a href={profilePath} onClick={go} className="w-40 h-40 rounded-xl overflow-hidden bg-gray-100 mb-6">
      {s.photoUrl
        ? (
          <img
            src={s.photoUrl}
            alt={name}
            className="w-full h-full object-cover"
            width={160}
            height={160}
            {...lazyImgProps}
          />
        )
        : <div className="w-full h-full grid place-items-center text-gray-400 text-sm">No Image</div>
      }
      </a>

      <h3 className="text-xl font-semibold">
        <a href={profilePath} onClick={go}>{name}</a>
      </h3>
      {s.professionalTitle && <p className="text-gray-600 mt-1">{s.professionalTitle}</p>}
      {locLang && <p className="text-gray-500 mt-1 text-sm">{locLang}</p>}

      { (s.keyMessage || s.keyMessages) && (
        <p className="text-gray-700 mt-4 text-[15px] leading-6 max-w-md">
          {(s.keyMessage || s.keyMessages).length > 220
            ? (s.keyMessage || s.keyMessages).slice(0, 217) + '…'
            : (s.keyMessage || s.keyMessages)}
        </p>
      )}

      {!!(expertiseTags && expertiseTags.length) && (
        <div className="mt-5 flex flex-wrap gap-2 justify-center">
          {expertiseTags.slice(0, 4).map(tag => (
            <span key={tag} className="px-3 py-[6px] rounded-full text-sm bg-indigo-50 text-indigo-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      {showFee && <p className="mt-5 font-medium">Fee Range: {fee}</p>}

      <a
        href={profilePath}
        onClick={go}
        className="mt-6 inline-block px-5 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
        aria-label={`View ${name}'s profile`}
      >
        View Profile
      </a>
    </div>
  )
}

export default function FindSpeakersPage() {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All Categories')
  const [country, setCountry] = useState('All Countries')
  const [lang, setLang] = useState('All Languages')
  const [fee, setFee] = useState('All Fee Ranges')
  const [visible, setVisible] = useState(15)

  // fetch from Airtable directly (no reliance on App state)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await fetchSpeakersForListing()
        if (alive) setAll(data)
      } catch (e) {
        console.error('Failed to load speakers:', e?.status || '', e?.body || e)
        if (alive) setError('Could not load speakers.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  // Build dropdown options from data
  const { categories, countries, languages, feeRanges } = useMemo(() => {
    const cats = new Set(), ctys = new Set(), lngs = new Set(), fees = new Set()
    all.forEach(s => {
      ;(s.expertiseAreas || s.expertise || []).forEach(v => cats.add(v))
      if (s.country) ctys.add(s.country)
      ;(s.languages || s.spokenLanguages || []).forEach(v => lngs.add(v))
      if (s.feeRangeGeneral) fees.add(s.feeRangeGeneral)
    })
    return {
      categories: ['All Categories', ...Array.from(cats).sort()],
      countries:  ['All Countries',  ...Array.from(ctys).sort()],
      languages:  ['All Languages',  ...Array.from(lngs).sort()],
      feeRanges:  ['All Fee Ranges',  ...Array.from(fees).sort()],
    }
  }, [all])

  // Apply filters
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase()
    return all.filter(s => {
      if (cat !== 'All Categories' && !(s.expertiseAreas || s.expertise || []).includes(cat)) return false
      if (country !== 'All Countries' && s.country !== country) return false
      if (lang !== 'All Languages' && !(s.languages || s.spokenLanguages || []).includes(lang)) return false
      if (fee !== 'All Fee Ranges' && s.feeRangeGeneral !== fee) return false

      if (text) {
        const hay = [
          getDisplayName(s), s.professionalTitle, (s.keyMessage || s.keyMessages || ''),
          (s.expertise || []).join(' '),
          s.location, s.country, (s.languages || s.spokenLanguages || []).join(' ')
        ].join(' ').toLowerCase()
        if (!hay.includes(text)) return false
      }
      return true
    })
  }, [all, q, cat, country, lang, fee])

  const canLoadMore = visible < filtered.length
  const top = filtered.slice(0, visible)

  return (
    <>
      {/* Header provided by PublicLayout */}
      <div className="max-w-6xl mx-auto px-4 py-12 mb-16">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold">Find Your Perfect Speaker</h1>
          <p className="text-gray-600 mt-2">Browse our extensive roster of African experts</p>
        </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="text"
            className="col-span-1 md:col-span-4 lg:col-span-4 border rounded-lg px-4 py-3"
            placeholder="Search speakers…"
            value={q}
            onChange={e => { setQ(e.target.value); setVisible(15); }}
          />
          <select className="border rounded-lg px-3 py-3" value={cat} onChange={e => { setCat(e.target.value); setVisible(15); }}>
            {categories.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select className="border rounded-lg px-3 py-3" value={country} onChange={e => { setCountry(e.target.value); setVisible(15); }}>
            {countries.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select className="border rounded-lg px-3 py-3" value={lang} onChange={e => { setLang(e.target.value); setVisible(15); }}>
            {languages.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <select className="border rounded-lg px-3 py-3" value={fee} onChange={e => { setFee(e.target.value); setVisible(15); }}>
            {feeRanges.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {loading && <p className="text-center text-gray-600">Loading…</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && all.length === 0 && (
        <p className="mt-8 text-center text-gray-600">Speakers uploading…</p>
      )}

      {!loading && !error && all.length > 0 && (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {top.map(s => <SearchCard key={s.id} s={s} />)}
          </div>
          {filtered.length === 0 && (
            <p className="mt-8 text-center text-gray-600">No speakers found.</p>
          )}
          {canLoadMore && (
            <div className="mt-8 flex justify-center">
              <button
                className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-50"
                onClick={() => setVisible(v => v + 15)}
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </>
  )
}
