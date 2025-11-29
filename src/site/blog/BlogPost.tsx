import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getPostBySlug, isPostVisible } from '../../lib/airtable';
import BlogSidebar from './BlogSidebar';
import './blog.css';
import { useFitLines } from '../../lib/useFitLines';
import { lazyImgProps } from '@/lib/img';

declare global { interface Window { DOMPurify: any } }
function useQuery(){ return new URLSearchParams(useLocation().search); }

function toYouTubeEmbed(url?: string){
  if(!url) return null;
  try{
    if(url.includes('watch?v=')){ const u=new URL(url); const id=u.searchParams.get('v'); return id?`https://www.youtube.com/embed/${id}`:url; }
    if(url.includes('youtu.be/')){ const id=url.split('youtu.be/')[1].split(/[?&]/)[0]; return `https://www.youtube.com/embed/${id}`; }
  }catch{}
  return url;
}
function cld(url?: string, transform='f_auto,q_auto'){ 
  if(!url) return url; 
  return (url.includes('res.cloudinary.com') && url.includes('/upload/')) ? url.replace('/upload/','/upload/'+transform+'/') : url;
}
function textOnly(html:string){ return html.replace(/<[^>]+>/g,' '); }

function upsertMeta(name:string, content:string){
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if(!el){ el=document.createElement('meta'); el.setAttribute('name',name); document.head.appendChild(el); }
  el.setAttribute('content',content);
}
function upsertOG(property:string, content:string){
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if(!el){ el=document.createElement('meta'); el.setAttribute('property',property); document.head.appendChild(el); }
  el.setAttribute('content',content);
}

export default function BlogPost(){
  const { slug } = useParams();
  const q = useQuery();
  const preview = q.get('preview')==='1';

  const [post, setPost] = useState<any|null>(null);
  const [state, setState] = useState<'loading'|'notfound'|'forbidden'|'ready'>('loading');

  useEffect(()=>{ (async()=>{
    const rec = await getPostBySlug(slug||'');
    if(!rec) return setState('notfound');
    if(!isPostVisible(rec, preview)) return setState('forbidden');
    setPost(rec); setState('ready');
  })(); },[slug,preview]);

  // SEO
  useEffect(()=>{ if(!post) return;
    const title = post['OG Title'] || post.Name;
    const desc = post['OG Description'] || post.Excerpt || '';
    const heroRaw =
      typeof post['Hero Image']==='string' ? post['Hero Image'] :
      (Array.isArray(post['Hero Image']) && post['Hero Image'][0]?.url) ? post['Hero Image'][0].url : '';
    const ogImage = post['OG Image'] || cld(heroRaw, 'w_1200,h_630,c_fill,f_auto,q_auto');
    document.title = `${title} — African Speaker Bureau`;
    upsertMeta('description', desc);
    upsertOG('og:title', title);
    upsertOG('og:description', desc);
    if(ogImage) upsertOG('og:image', ogImage);
  },[post]);

  const readMinutes = useMemo(()=>{
    const words = post ? textOnly(post.Body||'').trim().split(/\s+/).filter(Boolean).length : 0;
    return Math.max(1, Math.round(words/200));
  },[post]);

  const postH1Ref = useRef<HTMLHeadingElement>(null);
  useFitLines(postH1Ref, { maxLines: 3, sizes: [40, 38, 36, 34, 32, 30, 28] });

  if(state==='loading') return <div className="asb-blog"><div className="blog-shell"><div className="blog-article">Loading…</div></div></div>;
  if(state==='notfound') return <div className="asb-blog"><div className="blog-shell"><div className="blog-article">Post not found.</div></div></div>;
  if(state==='forbidden') return <div className="asb-blog"><div className="blog-shell"><div className="blog-article">This post is not published yet.</div></div></div>;

  const heroImageUrlField = post['Hero Image URL'];
  const heroAttachment =
    Array.isArray(post['Hero Image']) && post['Hero Image'].length
      ? (post['Hero Image'][0]?.url || post['Hero Image'][0]?.thumbnails?.large?.url || post['Hero Image'][0]?.thumbnails?.small?.url)
      : null;

  const heroImage = heroImageUrlField || heroAttachment;
  const videoEmbed = toYouTubeEmbed(post['Hero Video URL']);
  const safeBody =
    (typeof window!=='undefined' && window.DOMPurify)
      ? window.DOMPurify.sanitize(post.Body || '')
      : (post.Body || '');

  const author = post.Author || 'ASB Editorial';
  const dateStr = post['Publish Date'] ? new Date(post['Publish Date']).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}) : '';

  return (
    <div className="asb-blog">
      <div className="blog-shell">
        {/* MAIN */}
        <article className="blog-article">
          <header className="blog-header">
            <h1
              ref={postH1Ref}
              className="font-serif font-bold text-gray-900 leading-[1.15]"
              style={{ fontSize: '40px' }} // start bigger on article page, then fit down
            >
              {post.Name}
            </h1>
            <div className="blog-byline">
              By {author} • {dateStr}{readMinutes ? ` • ${readMinutes} min read` : ''}{post.Type?` • ${post.Type}`:''}
            </div>
            {post.Excerpt && <p className="blog-excerpt">{post.Excerpt}</p>}
          </header>

          {post.Type==='Video' && videoEmbed && (
            <div className="blog-hero aspect-video">
              <iframe
                src={videoEmbed} title="Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen />
            </div>
          )}

          {post.Type!=='Video' && heroImage && (
            <img
              className="blog-hero"
              src={cld(heroImage,'w_1600,f_auto,q_auto')}
              alt=""
              width={1600}
              height={900}
              sizes="(max-width: 1024px) 100vw, 1024px"
              {...lazyImgProps}
            />
          )}

          <div className="rich-content" dangerouslySetInnerHTML={{ __html: safeBody }} />
        </article>

        {/* SIDEBAR */}
        <BlogSidebar currentSlug={post.Slug} />
      </div>
    </div>
  );
}

