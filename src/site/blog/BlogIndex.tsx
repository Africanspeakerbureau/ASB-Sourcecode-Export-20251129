import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPublicPosts } from '../../lib/airtable';
import './blog.css';

export default function BlogIndex(){
  const [posts, setPosts] = useState<any[] | null>(null);

  useEffect(()=>{ (async()=>{
    const p = await listPublicPosts();
    setPosts(p);
  })(); },[]);

  if(!posts) return <div className="asb-blog blog-article">Loading…</div>;
  if(!posts.length) return <div className="asb-blog blog-article">No posts yet.</div>;

  return (
    <div className="asb-blog blog-article">
      {posts.map(post => (
        <article key={post.id} className="blog-header">
          <h2 className="blog-title">
            <Link to={`/blog/${post.Slug}`}>{post.Name}</Link>
          </h2>
          {post['Publish Date'] && (
            <div className="blog-date">
              {new Date(post['Publish Date']).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})}
            </div>
          )}
          {post.Excerpt && <p className="blog-excerpt">{post.Excerpt}</p>}
        </article>
      ))}
    </div>
  );
}
