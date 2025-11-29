const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY as string;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID as string;
const TABLE = import.meta.env.VITE_AIRTABLE_TABLE_BLOG || 'Blog';

const SPEAKER_TABLE = import.meta.env.VITE_AIRTABLE_TABLE_SPEAKERS || 'Speaker Applications';
const FEATURED_SPEAKER_TABLE_ID = 'tblXdkqSyNvYkNMS6';


const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`;
const SPEAKER_URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(SPEAKER_TABLE)}`;
const FEATURED_SPEAKER_URL = `https://api.airtable.com/v0/${BASE_ID}/${FEATURED_SPEAKER_TABLE_ID}`;

// Escape single quotes used inside Airtable formulas
const q = (s: string) => String(s).replace(/'/g, "\\'");

// Common fragments
const HAS_APPROVED = `FIND('Approved', ARRAYJOIN({Status}))`;
const HAS_PUBLISHED = `FIND('Published on Site', ARRAYJOIN({Status}))`;
const IS_FEATURED = "OR({Featured}='Yes', FIND('Featured', ARRAYJOIN({Status})))"; // or your featured test

type Fields = Record<string, any>;

async function at(method: 'GET'|'POST'|'PATCH'|'DELETE', path = '', body?: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

// -------- Admin (list/edit) --------
export async function listPosts(params: { search?: string; status?: string } = {}) {
  const filter: string[] = [];
  if (params.status) filter.push(`{Status} = '${params.status}'`);
  if (params.search) filter.push(`FIND(LOWER('${params.search}'), LOWER({Name}))`);
  const filterByFormula = filter.length ? filter.join(' AND ') : undefined;

  const urlParams = new URLSearchParams();
  if (filterByFormula) urlParams.set('filterByFormula', filterByFormula);
  urlParams.set('sort[0][field]', 'Publish Date');
  urlParams.set('sort[0][direction]', 'desc');

  const data = await at('GET', `?${urlParams.toString()}`);
  return (data.records || []).map((r: any) => ({ id: r.id, ...r.fields })) as Array<Fields & {id: string}>;
}

export async function getPost(id: string) {
  const data = await at('GET', `/${id}`);
  return { id: data.id, ...data.fields } as Fields & { id: string };
}

export async function createPost(fields: Fields) {
  const data = await at('POST', '', { records: [{ fields }] });
  const r = data.records[0];
  return { id: r.id, ...r.fields } as Fields & { id: string };
}

export async function updatePost(id: string, fields: Fields) {
  const data = await at('PATCH', '', { records: [{ id, fields }] });
  const r = data.records[0];
  return { id: r.id, ...r.fields } as Fields & { id: string };
}

export async function deletePost(id: string) {
  await at('DELETE', `?records[]=${encodeURIComponent(id)}`);
}

// -------- Speakers --------
export async function fetchSpeakerForDetailBySlug(slug: string) {
  const formula = `AND({Slug}='${q(slug)}', OR(${HAS_APPROVED}, ${HAS_PUBLISHED}))`;
  const params = new URLSearchParams({ maxRecords: '1', filterByFormula: formula });
  const res = await fetch(`${SPEAKER_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Airtable fetchSpeakerForDetailBySlug failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  const rec = data.records?.[0];
  return rec ? (normalizeSpeaker(rec) as any) : null;
}

export async function fetchSpeakersForListing() {
  const params = new URLSearchParams({ filterByFormula: HAS_PUBLISHED });
  const res = await fetch(`${SPEAKER_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Airtable fetchSpeakersForListing failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  return (data.records || []).map((rec: any) => normalizeSpeaker(rec)) as any[];
}

export async function fetchFeaturedSpeakers() {
  const params = new URLSearchParams({
    view: 'Featured Speakers',
    filterByFormula: 'AND({Featured} = "Yes", {Status} = "Published on Site")',
  });

  [
    'Full Name',
    'Professional Title',
    'Location',
    'Country',
    'Spoken Languages',
    'Expertise Areas',
    'Fee Range General',
    'Profile Image',
    'Slug',
  ].forEach((field) => params.append('fields[]', field));

  const res = await fetch(`${FEATURED_SPEAKER_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Airtable fetchFeaturedSpeakers failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  return (data.records || []) as any[];
}

// Backwards compatibility
export const fetchSpeakerForDetail = fetchSpeakerForDetailBySlug;

// -------- Public read-side --------
export function isPostVisible(rec: any, preview: boolean) {
  if (preview) return true;
  if (rec?.Status !== 'Published') return false;
  if (rec?.['Publish Date']) {
    const pub = new Date(rec['Publish Date']);
    if (pub > new Date()) return false;
  }
  return true;
}

export async function getPostBySlug(slug: string) {
  const s = String(slug || '').toLowerCase();
  const formula = `LOWER({Slug})='${s}'`;
  const params = new URLSearchParams({ filterByFormula: formula, maxRecords: '1' });
  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable GET by slug failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  const rec = data.records?.[0];
  return rec ? ({ id: rec.id, ...rec.fields } as any) : null;
}

export async function listPublicPosts(max = 24) {
  const formula = "AND({Status}='Published', IS_BEFORE({Publish Date}, NOW()))";
  const params = new URLSearchParams({
    filterByFormula: formula,
    maxRecords: String(max),
    'sort[0][field]': 'Publish Date',
    'sort[0][direction]': 'desc'
  });
  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Airtable listPublicPosts failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  const rows = (data.records || []).map((r: any) => ({ id: r.id, ...r.fields }));
  rows.sort((a: any, b: any) => {
    const fa = a.Featured ? 1 : 0;
    const fb = b.Featured ? 1 : 0;
    if (fb - fa) return fb - fa;
    const pa = Number(a['Pin Order'] || 0);
    const pb = Number(b['Pin Order'] || 0);
    if (pa !== pb) return pa - pb;
    return new Date(b['Publish Date'] || 0).getTime() - new Date(a['Publish Date'] || 0).getTime();
  });
  return rows;
}

// ---- Blog index (public) ----
export type BlogIndexRecord = {
  id: string;
  Name?: string;
  Slug?: string;
  Excerpt?: string;
  'Hero Image'?: any;
  'Hero Image URL'?: string;
  'Publish Date'?: string;
  Status?: string;
  Tags?: string[];
  Author?: string;
  Type?: string;
  Featured?: boolean;
  'Pin Order'?: number;
  Body?: string;
};

export async function listPublishedPostsForIndex(): Promise<BlogIndexRecord[]> {
  // Visible = Published AND publish date <= today (or empty)
  const filterFormula =
    "AND({Status}='Published', OR({Publish Date}=BLANK(), {Publish Date}<=TODAY()))";

  const params = new URLSearchParams();
  params.set('filterByFormula', filterFormula);

  // Sort: Featured first, then Pin Order asc, then Publish Date desc
  params.set('sort[0][field]', 'Featured');
  params.set('sort[0][direction]', 'desc');
  params.set('sort[1][field]', 'Pin Order');
  params.set('sort[1][direction]', 'asc');
  params.set('sort[2][field]', 'Publish Date');
  params.set('sort[2][direction]', 'desc');

  // Select only fields we need
  [
    'Name','Slug','Excerpt','Hero Image','Hero Image URL','Hero Video URL','Publish Date',
    'Status','Tags','Author','Type','Featured','Pin Order'
  ].forEach(f => params.append('fields[]', f));

  const data = await fetch(
    `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${encodeURIComponent(import.meta.env.VITE_AIRTABLE_TABLE_BLOG || 'Blog')}?${params.toString()}`,
    { headers: { Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}` } }
  ).then(r => r.json());

  return (data.records || []).map((r: any) => ({ id: r.id, ...r.fields })) as BlogIndexRecord[];
}

export async function listFeaturedPosts(limit = 2) {
  const filterFormula =
    "AND({Status}='Published', OR({Publish Date}=BLANK(), {Publish Date}<=TODAY()), {Featured}=1)";

  const params = new URLSearchParams();
  params.set('filterByFormula', filterFormula);
  params.set('maxRecords', String(Math.max(2, limit)));

  // Sort by Pin Order asc, then Publish Date desc
  params.set('sort[0][field]', 'Pin Order');
  params.set('sort[0][direction]', 'asc');
  params.set('sort[1][field]', 'Publish Date');
  params.set('sort[1][direction]', 'desc');

  [
    'Name','Slug','Excerpt','Type','Author','Tags',
    'Hero Image','Hero Image URL','Hero Video URL',
    'Publish Date','Featured','Pin Order'
  ].forEach(f => params.append('fields[]', f));

  const res = await fetch(
    `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${encodeURIComponent(import.meta.env.VITE_AIRTABLE_TABLE_BLOG || 'Blog')}?${params.toString()}`,
    { headers: { Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}` } }
  );
  const data = await res.json();
  return (data.records || []).map((r: any) => ({ id: r.id, ...r.fields }));
}
import { normalizeSpeaker } from './normalizeSpeaker';
