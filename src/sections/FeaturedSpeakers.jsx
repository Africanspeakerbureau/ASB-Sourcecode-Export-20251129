import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SpeakerCard from '@/components/SpeakerCard';
import { fetchFeaturedSpeakers } from '@/lib/airtable';

const FEATURED_COUNT = 4;

function pickRandom(items, count) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length));
}

export default function FeaturedSpeakers() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const featuredRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const all = await fetchFeaturedSpeakers();
        if (!alive) return;
        if (!featuredRef.current) {
          featuredRef.current = pickRandom(all, FEATURED_COUNT);
        }
        setItems(featuredRef.current);
      } catch (e) {
        console.error('Failed to load speakers:', e?.status || '', e?.body || e);
        if (alive) setError('Could not load speakers.');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="featured" className="mx-auto max-w-7xl px-6 md:px-8 py-16">
      <div className="grid gap-10 md:grid-cols-3">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
            Ideas That Travel — Context That Lands.
          </h2>

          <p className="mt-4 text-slate-700 leading-7">
            The African Speaker Bureau is the two-way bridge between Africa and the world. We place African voices on global stages and bring world-class experts into African rooms—translated for local realities. Leaders get decision-grade context on trust &amp; legitimacy, resilient performance, AI-shaped service, culture that behaves like its values, and SA/Africa outlooks.
          </p>

          <p className="mt-4 text-slate-700 leading-7">
            Our workflow is simple and fast: shortlist • clear fees • one contract • travel handled • post-event action note.
          </p>

          <figure className="mt-6 border-l-4 border-slate-300 pl-4">
            <blockquote className="italic text-slate-800">
              “The great powers of the world may have done wonders in giving the world an industrial look, but the great gift still has to come from Africa – giving the world a more human face.”
            </blockquote>
            <figcaption className="mt-2 text-slate-700 font-medium">— Steve Biko</figcaption>
          </figure>

          <p className="mt-6 text-slate-700 leading-7">
            Work with ASB when you need cultural fluency with commercial rigour—conversations that land, and plans that move the next business day.
          </p>

          <Link
            to="/find-speakers"
            className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            View all speakers
          </Link>
        </div>

        <div className="md:col-span-2">
          {/* Mobile heading shown above cards */}
          <h2 className="md:hidden text-2xl font-semibold text-slate-900 mb-4">Featured Speakers</h2>

          {/* Desktop heading for the grid */}
          <h2 className="hidden md:block text-2xl font-semibold text-slate-900 mb-4">Featured Speakers</h2>

          {error && <p className="text-red-600">{error}</p>}
          {!error && items.length === 0 && (
            <p className="text-gray-400">Speakers uploading…</p>
          )}
          {!error && items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {items.map((s) => (
                <SpeakerCard key={s.id} speaker={s} variant="featured" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
