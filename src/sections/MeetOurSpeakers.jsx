import { useEffect, useState } from 'react'
import SpeakerCard from '../components/SpeakerCard'
import { fetchSpeakersForListing } from '@/lib/airtable'

function sampleRandom(arr, n) {
  const copy = arr.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

export default function MeetOurSpeakers() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const all = await fetchSpeakersForListing()
        if (alive) setItems(sampleRandom(all, 8))
      } catch (e) {
        console.error('Failed to load speakers:', e?.status || '', e?.body || e)
        if (alive) setError('Could not load speakers.')
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className="section" style={{ background: 'var(--asb-surface)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Meet Our Speakers</h2>
          <p className="text-lg mt-2" style={{ color: 'var(--asb-muted)' }}>
            Voices That Inspire
          </p>
        </header>

        {error && <p className="text-red-600">{error}</p>}
        {!error && items.length === 0 && (
          <p className="text-gray-400">Speakers uploading…</p>
        )}
        {!error && items.length > 0 && (
          <div className="mt-6 grid gap-5 grid-cols-2 md:grid-cols-4 lg:grid-cols-4 justify-items-center lg:justify-items-stretch">
            {items.map((s) => (
              <SpeakerCard key={s.id} speaker={s} variant="compact" />
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <a
            href="/#/find-speakers"
            className="inline-flex items-center px-5 py-3 rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            Find more speakers
          </a>
        </div>
      </div>
    </section>
  )
}
