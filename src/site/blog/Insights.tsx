import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPublishedPostsForIndex, BlogIndexRecord } from '../../lib/airtable.ts';
import { pickBlogThumb } from '../../lib/blogMedia';
import { useFitLines } from '../../lib/useFitLines';
import { lazyImgProps } from '@/lib/img';

const TOKENS = {
  surface: '#F6F8FC',
  footer:  '#0B2A4A',
  navy:    '#1E3A8A',
  blue:    '#2563EB',
  border:  '#E5E7EB',
  text:    '#0A0A0A',
  muted:   '#4B5563',
};

export default function Insights() {
  const [rows, setRows] = useState<BlogIndexRecord[] | null>(null);
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState('All');     // tag
  const [ctype, setCtype] = useState('All');     // Article | Video | All
  const [author, setAuthor] = useState('All');

  useEffect(() => {
    (async () => {
      const data = await listPublishedPostsForIndex();
      setRows(data);
    })();
  }, []);

  const topics = useMemo(() => {
    if (!rows) return ['All'];
    const s = new Set<string>();
    rows.forEach(r => (r.Tags || []).forEach(t => s.add(t)));
    return ['All', ...Array.from(s)];
  }, [rows]);

  const authors = useMemo(() => {
    if (!rows) return ['All'];
    const s = new Set<string>();
    rows.forEach(r => { if (r.Author) s.add(r.Author); });
    return ['All', ...Array.from(s)];
  }, [rows]);

  const featured = useMemo(() => {
    if (!rows || rows.length === 0) return null;
    const feat = rows.find(r => !!r.Featured);
    return feat || rows[0];
  }, [rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const featuredId = (featured as any)?.id;
    return rows
      .filter(r => r.id !== featuredId)
      .filter(r => (topic === 'All' ? true : (r.Tags || []).includes(topic)))
      .filter(r => (ctype === 'All' ? true : (r.Type || '').toLowerCase() === ctype.toLowerCase()))
      .filter(r => (author === 'All' ? true : (r.Author || '') === author))
      .filter(r => {
        if (!q.trim()) return true;
        const hay = (
          (r.Name || '') + ' ' + (r.Excerpt || '') + ' ' +
          (r.Author || '') + ' ' + (r.Tags || []).join(' ')
        ).toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      });
  }, [rows, featured, topic, ctype, author, q]);

  const featuredH1Ref = useRef<HTMLHeadingElement>(null);
  useFitLines(featuredH1Ref, { maxLines: 3, sizes: [36, 34, 32, 30, 28, 26, 24] });

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* FEATURED */}
          {!rows ? (
            <div className="h-60 rounded-2xl border animate-pulse" style={{ borderColor: TOKENS.border }} />
          ) : featured ? (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: TOKENS.border }}>
              {/* Switch to flex so media is fixed-width on the left */}
              <div className="md:flex">
                {/* Media (fixed width on md+) */}
                <Link to={`/blog/${featured.Slug || ''}`} className="block md:w-[380px] lg:w-[460px] shrink-0">
                  <div className="h-64 md:h-[360px] lg:h-[420px] w-full bg-gray-200 relative">
                      {pickBlogThumb(featured as any) ? (
                        <img
                          src={pickBlogThumb(featured as any)!}
                          alt=""
                          className="h-full w-full object-cover"
                          width={640}
                          height={420}
                          sizes="(max-width: 768px) 100vw, 460px"
                          {...lazyImgProps}
                        />
                      ) : null}

                    {(featured.Type || '').toLowerCase() === 'video' && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: TOKENS.navy }}>
                          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                            <path d="M8 5v14l11-7z" fill="#fff"></path>
                          </svg>
                        </span>
                      </span>
                    )}
                  </div>
                </Link>

                {/* Content (fills remaining space) */}
                <div className="p-6 md:p-8 flex-1">
                  <div className="text-xs font-semibold tracking-wide" style={{ color: TOKENS.navy }}>
                    INSIGHTS
                  </div>
                  <h1
                    ref={featuredH1Ref}
                    className="mt-1 font-serif font-bold text-gray-900 leading-[1.15]"
                    style={{ fontSize: '36px' }} // starting size; hook will step down as needed
                  >
                    {featured.Name}
                  </h1>
                  <div className="mt-2 text-sm" style={{ color: TOKENS.muted }}>
                    {(featured.Author || 'ASB Editorial')}
                    {featured.Tags?.length ? <> • {featured.Tags[0]}</> : null}
                  </div>
                  {featured.Excerpt && (
                    <p className="mt-4 text-[16px] leading-7 text-gray-800">{featured.Excerpt}</p>
                  )}
                  <div className="mt-6 flex justify-end md:justify-start">
                    <Link
                      to={`/blog/${featured.Slug || ''}`}
                      className="inline-flex items-center rounded-xl px-4 py-2.5 text-white font-semibold shadow-sm"
                      style={{ backgroundColor: TOKENS.navy }}
                    >
                      Read article
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border p-6 text-gray-600">No articles yet.</div>
          )}

          {/* FILTER BAR */}
          <div className="mt-6 rounded-xl border p-3 md:p-4" style={{ borderColor: TOKENS.border }}>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Search */}
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="w-full md:w-[420px] rounded-lg border px-3 py-2 text-[15px] outline-none focus:ring"
                style={{ backgroundColor: TOKENS.surface, borderColor: TOKENS.border }}
              />

              {/* Topic chips */}
              <div className="flex flex-wrap gap-2">
                {topics.map(t => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className={`h-8 rounded-full border px-3 text-sm ${t === topic ? 'font-semibold' : ''}`}
                    style={{
                      backgroundColor: t === topic ? '#EAEEFE' : '#FFFFFF',
                      color: t === topic ? TOKENS.navy : TOKENS.muted,
                      borderColor: TOKENS.border
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Type chips + Author select */}
            <div className="mt-3 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex gap-2">
                {['All','Article','Video'].map(t => (
                  <button
                    key={t}
                    onClick={() => setCtype(t)}
                    className={`h-8 rounded-full border px-3 text-sm ${t === ctype ? 'font-semibold' : ''}`}
                    style={{
                      backgroundColor: t === ctype ? '#EAEEFE' : '#FFFFFF',
                      color: t === ctype ? TOKENS.navy : TOKENS.muted,
                      borderColor: TOKENS.border
                    }}
                  >
                    {t === 'All' ? 'All types' : t}
                  </button>
                ))}
              </div>

              <div className="md:ml-auto flex items-center gap-2">
                <span className="text-sm text-gray-600">Author</span>
                <select
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="h-9 rounded-lg border px-3 text-sm"
                  style={{ borderColor: TOKENS.border }}
                >
                  {authors.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* GRID */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filtered || []).map((a) => {
              const img = pickBlogThumb(a as any);
              return (
                <Link key={a.id} to={`/blog/${a.Slug || ''}`} className="group">
                  <div className="rounded-2xl border overflow-hidden bg-white" style={{ borderColor: TOKENS.border }}>
                    <div className="h-40 w-full bg-gray-200 relative">
                      {img ? (
                        <img
                          src={img}
                          alt=""
                          className="h-full w-full object-cover"
                          width={400}
                          height={256}
                          sizes="(max-width: 768px) 100vw, 360px"
                          {...lazyImgProps}
                        />
                      ) : null}
                      {(a.Type || '').toLowerCase() === 'video' && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: TOKENS.navy }}>
                            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                              <path d="M8 5v14l11-7z" fill="#fff"></path>
                            </svg>
                          </span>
                        </span>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 h-[4px]" style={{ backgroundColor: TOKENS.blue }} />
                    </div>
                    <div className="p-4">
                      <div className="text-[11px] font-semibold tracking-wide" style={{ color: TOKENS.navy }}>
                        {(a.Tags?.[0] || 'Insights').toUpperCase()}
                      </div>
                      <h3 className="mt-1 text-[16px] font-semibold text-gray-900 group-hover:underline">{a.Name}</h3>
                      <div className="mt-2 text-xs" style={{ color: TOKENS.muted }}>
                        {(a.Author || 'ASB Editorial')}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Simple pager stub (hook real pagination later) */}
          {rows && rows.length > 12 && (
            <div className="mt-6 flex justify-center gap-4 text-sm" style={{ color: TOKENS.muted }}>
              <span className="font-semibold text-gray-900">1</span>
              <span>2</span>
              <span>3</span>
              <span>…</span>
            </div>
          )}
      </section>
    </main>
  );
}

