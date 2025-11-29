import { normalizeSpeaker } from './normalizeSpeaker';

const AIRTABLE_BASE = import.meta.env.VITE_AIRTABLE_BASE_ID;
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const TABLE_SPEAKERS = import.meta.env.VITE_AIRTABLE_TABLE_SPEAKERS || 'Speaker Applications';
const TABLE_BLOG = import.meta.env.VITE_AIRTABLE_TABLE_BLOG || 'Blog';

// Escape single quotes used inside Airtable formulas
const q = (s) => String(s).replace(/'/g, "\\'");

// Common fragments for status checks
const HAS_APPROVED = `FIND('Approved', ARRAYJOIN({Status}))`;
const HAS_PUBLISHED = `FIND('Published on Site', ARRAYJOIN({Status}))`;
const IS_FEATURED = "OR({Featured}='Yes', FIND('Featured', ARRAYJOIN({Status})))"; // or your featured test

function assertEnv() {
  if (!AIRTABLE_BASE || !API_KEY) {
    throw new Error('Missing Airtable env (VITE_AIRTABLE_BASE_ID / VITE_AIRTABLE_API_KEY)');
  }
}

export const isAirtableId = s => /^rec[a-zA-Z0-9]{14}$/.test(String(s || ''));

const API_ROOT = `https://api.airtable.com/v0/${encodeURIComponent(AIRTABLE_BASE)}`;
const SPEAKERS_URL = `${API_ROOT}/${encodeURIComponent(TABLE_SPEAKERS)}`;
const BLOG_BASE_URL = `${API_ROOT}/${encodeURIComponent(TABLE_BLOG)}`;

async function airtableSelectAll(table, params = {}) {
  assertEnv();
  const urlBase = `${API_ROOT}/${encodeURIComponent(table)}`;
  const headers = { Authorization: `Bearer ${API_KEY}` };
  let url = new URL(urlBase);
  Object.entries(params).forEach(([k, v]) => {
    if (v == null) return;
    url.searchParams.set(k, v);
  });

  const all = [];
  while (true) {
    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('Airtable list error', res.status, body);
      throw new Error(`Airtable list failed: ${res.status}`);
    }
    const json = await res.json();
    all.push(...(json.records || []));
    if (json.offset) {
      url = new URL(urlBase);
      Object.entries(params).forEach(([k, v]) => {
        if (v == null) return;
        url.searchParams.set(k, v);
      });
      url.searchParams.set('offset', json.offset);
    } else {
      break;
    }
  }
  return all;
}

export function toSpeaker(record) {
  const base = normalizeSpeaker(record);
  const f = record?.fields || {};
  return {
    ...base,
    // About → Notable Achievements
    notableAchievements: f['Notable Achievements'] || '',
  };
}

export async function listSpeakersAll() {
  return await airtableSelectAll(TABLE_SPEAKERS, { pageSize: 50 });
}

export async function fetchSpeakerForDetailBySlug(slug) {
  assertEnv();
  const formula = `AND({Slug}='${q(slug)}', OR(${HAS_APPROVED}, ${HAS_PUBLISHED}))`;
  const records = await airtableSelectAll(TABLE_SPEAKERS, {
    filterByFormula: formula,
    maxRecords: 1,
    pageSize: 1,
  });
  const rec = records[0];
  return rec ? toSpeaker(rec) : null;
}

export async function fetchSpeakersForListing() {
  const records = await airtableSelectAll(TABLE_SPEAKERS, {
    filterByFormula: HAS_PUBLISHED,
    pageSize: 50,
  });
  return records.map(r => toSpeaker(r));
}

export async function fetchFeaturedSpeakers() {
  const records = await airtableSelectAll(TABLE_SPEAKERS, {
    filterByFormula: `AND(OR(${HAS_PUBLISHED}, ${HAS_APPROVED}), ${IS_FEATURED})`,
    pageSize: 50,
  });
  return records.map(r => toSpeaker(r));
}

// Backwards compatibility
export const listSpeakers = fetchSpeakersForListing;
export const fetchSpeakerForDetail = fetchSpeakerForDetailBySlug;

export async function getSpeakerBySlugOrId(slugOrId) {
  assertEnv();
  if (isAirtableId(slugOrId)) {
    const url = `${SPEAKERS_URL}/${encodeURIComponent(slugOrId)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
    if (!res.ok) throw new Error(`Airtable get failed: ${res.status}`);
    const rec = await res.json();
    return toSpeaker(rec);
  }

  const slug = String(slugOrId).toLowerCase();
  const bySlug = await airtableSelectAll(TABLE_SPEAKERS, {
    filterByFormula: `OR(LOWER({Slug Override}) = "${slug}", LOWER({Slug}) = "${slug}")`,
    pageSize: 1,
  });
  if (bySlug[0]) return toSpeaker(bySlug[0]);

  const byName = await airtableSelectAll(TABLE_SPEAKERS, {
    filterByFormula: `LOWER({Full Name}) = "${slug.replace(/-/g, ' ')}"`,
    pageSize: 1,
  });
  if (byName[0]) return toSpeaker(byName[0]);

  return null;
}


async function query(table, params = {}) {
  assertEnv();
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_ROOT}/${encodeURIComponent(table)}?${qs}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return (json.records || []).map((r) => ({ id: r.id, createdTime: r.createdTime, ...r.fields }));
}

export const getSpeakerApplications = (opts = {}) =>
  query(TABLE_SPEAKERS, { view: 'Grid view', maxRecords: 200, ...opts });

export const getClientInquiries = (opts = {}) =>
  query('Client Inquiries', { view: 'Grid view', maxRecords: 200, ...opts });

export const getQuickInquiries = (opts = {}) =>
  query('Quick Inquiries', { view: 'Grid view', maxRecords: 200, ...opts });

export async function updateSpeaker(recordId, fields) {
  assertEnv();
  const res = await fetch(`${SPEAKERS_URL}/${recordId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listAllSpeakersLite() {
  // Fetch minimal data for duplicate checking
  const records = await airtableSelectAll(TABLE_SPEAKERS, {
    // no 'fields' filter to be robust
    pageSize: 100,
  });
  return records.map(rec => {
    const f = rec.fields || {};
    const slug = (f['Slug Override'] || f['Slug'] || '')
      .toString()
      .trim()
      .toLowerCase();
    return { id: rec.id, slug };
  });
}

// ---- Blog helpers ----
async function blogAt(method, path = '', body) {
  const res = await fetch(`${BLOG_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable ${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function listPosts(params = {}) {
  const filter = [];
  if (params.status) filter.push(`{Status} = '${params.status}'`);
  if (params.search) filter.push(`FIND(LOWER('${params.search}'), LOWER({Name}))`);
  const filterByFormula = filter.length ? filter.join(' AND ') : undefined;

  const urlParams = new URLSearchParams();
  if (filterByFormula) urlParams.set('filterByFormula', filterByFormula);
  urlParams.set('sort[0][field]', 'Publish Date');
  urlParams.set('sort[0][direction]', 'desc');

  const data = await blogAt('GET', `?${urlParams.toString()}`);
  return (data.records || []).map((r) => ({ id: r.id, ...r.fields }));
}

export async function getPost(id) {
  const data = await blogAt('GET', `/${id}`);
  return { id: data.id, ...data.fields };
}

export async function createPost(fields) {
  const data = await blogAt('POST', '', { records: [{ fields }] });
  const r = data.records[0];
  return { id: r.id, ...r.fields };
}

export async function updatePost(id, fields) {
  const data = await blogAt('PATCH', '', { records: [{ id, fields }] });
  const r = data.records[0];
  return { id: r.id, ...r.fields };
}

export async function deletePost(id) {
  await blogAt('DELETE', `?records[]=${encodeURIComponent(id)}`);
}

export function isPostVisible(rec, preview) {
  if (preview) return true;
  if (rec?.Status !== 'Published') return false;
  if (rec?.['Publish Date']) {
    const pub = new Date(rec['Publish Date']);
    if (pub > new Date()) return false;
  }
  return true;
}

export async function getPostBySlug(slug) {
  const s = String(slug || '').toLowerCase();
  const formula = `LOWER({Slug})='${s}'`;
  const params = new URLSearchParams({ filterByFormula: formula, maxRecords: '1' });
  const res = await fetch(`${BLOG_BASE_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable GET by slug failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  const rec = data.records?.[0];
  return rec ? { id: rec.id, ...rec.fields } : null;
}

export async function listPublicPosts(max = 24) {
  const formula = "AND({Status}='Published', IS_BEFORE({Publish Date}, NOW()))";
  const params = new URLSearchParams({
    filterByFormula: formula,
    maxRecords: String(max),
    'sort[0][field]': 'Publish Date',
    'sort[0][direction]': 'desc',
  });
  const res = await fetch(`${BLOG_BASE_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Airtable listPublicPosts failed: ${res.status} ${t}`);
  }
  const json = await res.json();
  return (json.records || []).map((r) => ({ id: r.id, ...r.fields }));
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

  const res = await fetch(`${BLOG_BASE_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  const data = await res.json();
  return (data.records || []).map(r => ({ id: r.id, ...r.fields }));
}

