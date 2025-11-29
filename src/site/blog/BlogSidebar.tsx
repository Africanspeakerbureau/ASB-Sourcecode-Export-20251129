import React, { useEffect, useMemo, useState } from 'react';
import { listPublicPosts } from '../../lib/airtable';
import { pickBlogThumb } from '../../lib/blogMedia';
import './blog.css';
import { lazyImgProps } from '@/lib/img';

export default function BlogSidebar({ currentSlug }: { currentSlug?: string }) {
  const [rows,setRows]=useState<any[]>([]);
  useEffect(()=>{(async()=>{ setRows(await listPublicPosts(12)); })();},[]);

  const latest = useMemo(()=> rows.filter(r=>r.Slug!==currentSlug).slice(0,3),[rows,currentSlug]);

  const topics = useMemo(()=>{
    const counts: Record<string,number> = {};
    rows.forEach(r => (Array.isArray(r.Tags)?r.Tags:[]).forEach((t:string)=>{counts[t]=(counts[t]||0)+1;}));
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(e=>e[0]);
  },[rows]);

  return (
    <aside className="blog-sidebar">
      <div className="sb-card">
        <h3 className="sb-title">Quick Inquiry</h3>
        <a className="btn" href="/#/contact">Book a Workshop</a>
      </div>

      <div className="sb-card">
        <h3 className="sb-title">Latest Articles</h3>
        {latest.map(p=>{
          const img = pickBlogThumb(p);
          return (
            <a key={p.Slug||p.id} href={`/blog/${p.Slug}`} className="latest-item">
              {img ? (
                <img
                  src={img}
                  alt=""
                  className="h-10 w-10 object-cover rounded"
                  width={40}
                  height={40}
                  {...lazyImgProps}
                />
              ) : <div className="h-10 w-10 rounded bg-gray-200" />}
              <div>
                <div style={{fontWeight:700,lineHeight:1.2}}>{p.Name}</div>
                <div className="latest-meta">
                  {p['Publish Date'] ? new Date(p['Publish Date']).toLocaleDateString() : ''}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="sb-card">
        <h3 className="sb-title">Popular Topics</h3>
        <div className="tag-list">
          {topics.map(t=> <a key={t} className="tag" href={`/blog?tag=${encodeURIComponent(t)}`}>{t}</a>)}
        </div>
      </div>
    </aside>
  );
}
