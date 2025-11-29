import React, { useEffect, useRef, useState } from 'react';
import { createPost, getPost, updatePost } from '@/lib/airtable.ts';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useNavigate, useParams } from 'react-router-dom';
import { TAG_OPTIONS } from '../../constants/tags';

declare global { interface Window { ClassicEditor: any; DOMPurify: any } }

export default function AdminBlogEditor() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [initialBody, setInitialBody] = useState<string>('');
  const [form, setForm] = useState<any>({
    Name:'', Slug:'', Status:'Draft', Type:'Article', Excerpt:'',
    'Hero Image':'', 'Hero Video URL':'', 'Publish Date':'',
    Author:'', Featured:false, 'Pin Order':0,
    'Hero Image URL':''
  });
  const [existingHeroAttachment, setExistingHeroAttachment] = useState<any[]>([]);
  const [heroAttachmentToSet, setHeroAttachmentToSet] = useState<{ url: string; filename: string } | string | null>(null); // staged attachment
  const [saving, setSaving] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);

  const editorElem = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<any>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(p => ({ ...p, [k]: v }));
  }

  useEffect(() => {
    (async () => {
      // Load record if editing
      if (id && id !== 'new') {
        const r = await getPost(id);
        setForm({
          Name: r.Name || '',
          Slug: (r as any).Slug || '',
          Status: (r as any).Status || 'Draft',
          Type: (r as any).Type || 'Article',
          Excerpt: (r as any).Excerpt || '',
          'Hero Image': (r as any)['Hero Image'] || '',
          'Hero Video URL': (r as any)['Hero Video URL'] || '',
          'Publish Date': (r as any)['Publish Date'] || '',
          Author: (r as any).Author || '',
          Featured: !!(r as any).Featured,
          'Pin Order': (r as any)['Pin Order'] || 0,
          'Hero Image URL': (r as any)['Hero Image URL'] || ''
        });
        setExistingHeroAttachment(Array.isArray((r as any)['Hero Image']) ? (r as any)['Hero Image'] : []);
        setSelectedTags(Array.isArray((r as any).Tags) ? (r as any).Tags : []);
        setInitialBody((r as any).Body || '');
      }

      // Init CKEditor (CDN)
      if (editorElem.current && !editorInstance.current) {
        const ClassicEditor = window.ClassicEditor;
        editorInstance.current = await ClassicEditor.create(editorElem.current, {
          toolbar: [
            'heading', '|', 'bold', 'italic', 'link',
            'bulletedList', 'numberedList', 'blockQuote',
            'insertTable', 'horizontalLine', '|',
            'imageUpload', 'undo', 'redo'
          ]
        });

        // Wire image upload → Cloudinary
        editorInstance.current.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
          return {
            upload: () => loader.file.then(async (file: File) => {
              const { url } = await uploadToCloudinary(file);
              return { default: url };
            }),
            abort: () => {}
          };
        };

        // Prefill body
        if (initialBody) editorInstance.current.setData(initialBody);
      }

      setLoading(false);
    })();

    return () => { editorInstance.current?.destroy?.(); editorInstance.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, initialBody]);

  async function uploadHero(file: File) {
    try {
      const uploaded = await uploadToCloudinary(file);
      set('Hero Image URL', uploaded.url);         // fill text field too (nice to copy/share)
      setHeroAttachmentToSet(uploaded);            // stage as attachment on save
      alert('Hero image uploaded');
    } catch (e:any) {
      alert('Upload failed: ' + (e?.message || e));
    }
  }

  async function save() {
    if (!form.Name?.trim()) return alert('Title is required');
    if (!form.Slug?.trim()) return alert('Slug is required');
    if (form.Status !== 'Draft' && !form['Publish Date']) return alert('Publish Date required for Scheduled/Published');
    if (form.Type === 'Video' && !form['Hero Video URL']) return alert('Hero Video URL required for Video');

    try {
      setSaving(true);

      const raw = editorInstance.current?.getData?.() || '';
      const Body =
        (typeof window !== 'undefined' && window.DOMPurify)
          ? window.DOMPurify.sanitize(raw)
          : raw;

      const payload: any = {
        Name: form.Name,
        Slug: form.Slug.toLowerCase().replace(/\s+/g,'-'),
        Status: form.Status,
        Type: form.Type,
        Excerpt: form.Excerpt,
        'Hero Video URL': form['Hero Video URL'] || undefined,
        'Publish Date': form['Publish Date'] || undefined,
        Author: form.Author || undefined,
        Tags: selectedTags,   // exact Airtable multi-select array
        Featured: !!form.Featured,
        'Pin Order': Number(form['Pin Order'] || 0),
        Body,
        // always persist URL field if present
        'Hero Image URL': form['Hero Image URL'] || undefined
      };

      // attachments logic (works whether Airtable field is Attachment or Text)
      if (heroAttachmentToSet === '') {
        payload['Hero Image'] = []; // clear attachment
      } else if (heroAttachmentToSet && typeof heroAttachmentToSet === 'object') {
        payload['Hero Image'] = [{ url: heroAttachmentToSet.url, filename: heroAttachmentToSet.filename }];
      }

      if (id && id !== 'new') {
        await updatePost(id, payload);
      } else {
        const rec = await createPost(payload);
        setExistingHeroAttachment(heroAttachmentToSet ? [{ url: heroAttachmentToSet.url, filename: heroAttachmentToSet.filename }] : []);
        setHeroAttachmentToSet(null);
        alert('Saved');
        return nav(`/admin/blog/${rec.id}`);
      }

      if (heroAttachmentToSet !== null) {
        setExistingHeroAttachment(
          heroAttachmentToSet === ''
            ? []
            : [{ url: (heroAttachmentToSet as any).url, filename: (heroAttachmentToSet as any).filename }]
        );
        setHeroAttachmentToSet(null);
      }
      alert('Saved');
    } catch (e:any) {
      // show Airtable error text so we know exactly why it failed
      const msg = e?.message || String(e);
      console.error('Save failed:', e);
      alert('Save failed:\n' + msg);
    } finally {
      setSaving(false);
    }
  }

  function preview() {
    if (!form.Slug) return alert('Add a Slug first');
    window.open(`/blog/${form.Slug}?preview=1`, '_blank');
  }

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Side fields */}
        <div className="space-y-3">
          <label className="block">Title
            <input className="mt-1 border p-2 rounded w-full" value={form.Name} onChange={e=>set('Name', e.target.value)} />
          </label>
          <label className="block">Slug
            <input className="mt-1 border p-2 rounded w-full" value={form.Slug} onChange={e=>set('Slug', e.target.value)} />
          </label>
          <label className="block">Status
            <select className="mt-1 border p-2 rounded w-full" value={form.Status} onChange={e=>set('Status', e.target.value)}>
              <option>Draft</option><option>Scheduled</option><option>Published</option>
            </select>
          </label>
          <label className="block">Publish Date
            <input type="date" className="mt-1 border p-2 rounded w-full" value={form['Publish Date'] || ''} onChange={e=>set('Publish Date', e.target.value)} />
          </label>
          <label className="block">Type
            <select className="mt-1 border p-2 rounded w-full" value={form.Type} onChange={e=>set('Type', e.target.value)}>
              <option>Article</option><option>Video</option>
            </select>
          </label>
          <label className="block">Hero Video URL (for Video)
            <input className="mt-1 border p-2 rounded w-full" value={form['Hero Video URL']} onChange={e=>set('Hero Video URL', e.target.value)} />
          </label>
          <label className="block">Hero Image
            <div className="mt-1 flex gap-2">
              {/* URL input */}
              <input
                className="border p-2 rounded w-full"
                value={form['Hero Image URL'] || ''}
                onChange={e=>set('Hero Image URL', e.target.value)}
                placeholder="https://… (Cloudinary or any image URL)"
              />
              {/* Upload button */}
              <label className="px-3 py-2 border rounded cursor-pointer whitespace-nowrap">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async e=>{
                    const f = e.target.files?.[0];
                    if (!f) return;
                    await uploadHero(f);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
            </div>

            {/* Existing attachment preview + clear */}
            {existingHeroAttachment?.length > 0 && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={existingHeroAttachment[0]?.thumbnails?.small?.url || existingHeroAttachment[0]?.url}
                  alt=""
                  className="w-16 h-16 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={()=>{
                    // mark to clear on save
                    setHeroAttachmentToSet('');    // special: empty string = clear
                    alert('Hero attachment will be cleared on Save');
                  }}
                  className="px-2 py-1 border rounded"
                >Clear attachment on Save</button>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              Paste a URL (saved to “Hero Image URL”), or Upload (file goes to Cloudinary and is attached to “Hero Image” in Airtable).
            </p>
          </label>
          <label className="block">Excerpt
            <textarea className="mt-1 border p-2 rounded w-full" rows={3} value={form.Excerpt} onChange={e=>set('Excerpt', e.target.value)} />
          </label>
          <label className="block">Author
            <input className="mt-1 border p-2 rounded w-full" value={form.Author} onChange={e=>set('Author', e.target.value)} />
          </label>
          <label className="block">Tags
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setTagsOpen(v => !v)}
                className="px-3 py-2 border rounded"
              >
                {tagsOpen ? 'Close' : 'Select tags'} ({selectedTags.length})
              </button>

              {tagsOpen && (
                <div className="mt-2 max-h-56 overflow-auto rounded border p-2 space-y-1">
                  {TAG_OPTIONS.map(opt => {
                    const checked = selectedTags.includes(opt);
                    return (
                      <label key={opt} className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSelectedTags(prev =>
                              e.target.checked ? [...prev, opt] : prev.filter(t => t !== opt)
                            );
                          }}
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* pills */}
              {selectedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTags.map(t => (
                    <span key={t} className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
                      {t}
                      <button
                        type="button"
                        className="opacity-60 hover:opacity-100"
                        onClick={() => setSelectedTags(prev => prev.filter(x => x !== t))}
                        aria-label={`Remove ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </label>
          <label className="block flex items-center gap-2">
            <input type="checkbox" checked={!!form.Featured} onChange={e=>set('Featured', e.target.checked)} />
            Featured
          </label>
          <label className="block">Pin Order
            <input
              type="number"
              min={0}
              step={1}
              className="mt-1 border p-2 rounded w-full"
              value={form['Pin Order']}
              onChange={e=>set('Pin Order', Math.max(0, Number(e.target.value || 0)))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Smaller number = higher priority among Featured. Use 0 (default), 1, 2…
            </p>
          </label>

          <div className="flex gap-2 pt-2">
            <button onClick={save} disabled={saving} className="px-3 py-2 border rounded">{saving ? 'Saving…' : 'Save'}</button>
            <button onClick={preview} disabled={saving} className="px-3 py-2 border rounded">Preview</button>
            <button onClick={()=>nav('/admin/blog')} className="ml-auto px-3 py-2 border rounded">Back</button>
          </div>
        </div>

        {/* CKEditor canvas */}
        <div className="md:col-span-2">
          <div className="border rounded p-2">
            <div ref={editorElem}></div>
            {loading && <div className="p-4 text-sm text-gray-500">Loading editor…</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

