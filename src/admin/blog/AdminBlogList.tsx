import React, { useEffect, useState } from 'react';
import { listPosts, deletePost } from '@/lib/airtable.ts';
import { useNavigate } from 'react-router-dom';

export default function AdminBlogList() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const nav = useNavigate();

  async function load() {
    const data = await listPosts({ search: q, status });
    setRows(data);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search title…" className="border p-2 rounded w-64" />
        <select value={status} onChange={e=>setStatus(e.target.value)} className="border p-2 rounded">
          <option value="">All</option>
          <option>Draft</option>
          <option>Scheduled</option>
          <option>Published</option>
        </select>
        <button onClick={load} className="px-3 py-2 border rounded">Filter</button>
        <button onClick={()=>nav('/admin/blog/new')} className="ml-auto px-3 py-2 border rounded">New Post</button>
      </div>

      <table className="w-full text-sm">
        <thead><tr className="text-left border-b">
          <th className="py-2">Title</th>
          <th>Slug</th>
          <th>Status</th>
          <th>Type</th>
          <th>Publish Date</th>
          <th></th>
        </tr></thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id} className="border-b">
              <td className="py-2">{r.Name}</td>
              <td>{r.Slug}</td>
              <td>{r.Status}</td>
              <td>{r.Type}</td>
              <td>{r['Publish Date'] || '-'}</td>
              <td className="text-right">
                <button onClick={()=>nav(`/admin/blog/${r.id}`)} className="px-2 py-1 border rounded mr-2">Edit</button>
                <button onClick={async()=>{ if(confirm('Delete?')){ await deletePost(r.id); load(); }}} className="px-2 py-1 border rounded">Delete</button>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td className="py-6 italic text-gray-500">No posts yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

