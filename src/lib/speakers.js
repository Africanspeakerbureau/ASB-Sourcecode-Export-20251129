// Lightweight speakers cache and related-speaker helpers

// --- cache (module scope) ---
let _SPEAKERS_CACHE = null;
let _SPEAKERS_CACHE_AT = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min
const LS_KEY = "asb_speakers_cache_v1";

// Safe read helpers
const arr = (v) => Array.isArray(v) ? v : (v ? [v] : []);
const lowerSet = (xs) => new Set(arr(xs).map(x => String(x).toLowerCase().trim()).filter(Boolean));

// Normalize to the fields we need
export function normalizeSpeaker(rec) {
  const f = rec.fields || {};
  const status = arr(f["Status"]);
  const published = status.includes("Published on Site");
  const profile = arr(f["Profile Image"])[0];
  const photoUrl = profile?.thumbnails?.large?.url || profile?.url || "";
  const firstName = (f["First Name"] || "").toString().trim();
  const lastName = (f["Last Name"] || "").toString().trim();
  const fullName = (f["Full Name"] || `${firstName} ${lastName}`).trim();
  const honorific = (f["Title"] || "").toString().trim();
  const professionalTitle = (f["Professional Title"] || "").toString().trim();
  return {
    id: rec.id,
    slug: (f["Slug"] || "").toString().trim().toLowerCase(),
    fullName,
    name: fullName,
    firstName,
    lastName,
    title: honorific,
    professionalTitle,
    country: (f["Country"] || "").toString().trim(),
    languages: arr(f["Spoken Languages"]),
    spokenLanguages: arr(f["Spoken Languages"]),
    expertise: arr(f["Expertise Areas"]),
    expertiseAreas: arr(f["Expertise Areas"]),
    featured: (f["Featured"] === "Yes"),
    published,
    photoUrl,
    fields: f
  };
}

// Fetch all, filter published, cache (memory + localStorage)
export async function getAllPublishedSpeakersCached(listFn) {
  const now = Date.now();
  if (_SPEAKERS_CACHE && (now - _SPEAKERS_CACHE_AT) < CACHE_TTL_MS) return _SPEAKERS_CACHE;

  if (!_SPEAKERS_CACHE) {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (raw && Array.isArray(raw.items) && (now - (raw.ts||0)) < CACHE_TTL_MS) {
        _SPEAKERS_CACHE = raw.items;
        _SPEAKERS_CACHE_AT = raw.ts;
      }
    } catch { /* ignore */ }
  }

  if (!_SPEAKERS_CACHE) {
    const res = await listFn();
    const items = res.records ? res.records.map(normalizeSpeaker) : res.map(normalizeSpeaker);
    _SPEAKERS_CACHE = items.filter(s => s.published);
    _SPEAKERS_CACHE_AT = now;
    try { localStorage.setItem(LS_KEY, JSON.stringify({ ts: now, items: _SPEAKERS_CACHE })); } catch { /* ignore */ }
  }

  return _SPEAKERS_CACHE;
}
// Scoring for related speakers
export function computeRelatedSpeakers(current, all, limit = 3) {
  const curId = current.id;
  const curCountry = (current.country || "").toLowerCase().trim();
  const exSet = lowerSet(current.expertise);
  const langSet = lowerSet(current.languages);

  const scored = [];
  for (const s of all) {
    if (s.id === curId) continue;
    let score = 0;

    // 1) Expertise overlap (weight 3 each)
    const otherEx = lowerSet(s.expertise);
    let exOverlap = 0;
    for (const x of otherEx) if (exSet.has(x)) exOverlap++;
    score += exOverlap * 3;

    // 2) Same country (weight 2)
    const sameCountry = curCountry && (curCountry === (s.country || "").toLowerCase().trim());
    if (sameCountry) score += 2;

    // 3) Language overlap (weight 1 each)
    const otherLang = lowerSet(s.languages);
    let langOverlap = 0;
    for (const l of otherLang) if (langSet.has(l)) langOverlap++;
    score += langOverlap;

    // Slight nudge for featured (tie-break)
    if (s.featured) score += 0.1;

    // Deterministic tiny tie-breaker from slug to avoid flicker
    const slug = s.slug || s.id;
    const hash = [...slug].reduce((a,c)=>a + c.charCodeAt(0), 0) % 1000;
    scored.push({ s, score, hash });
  }

  scored.sort((a,b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.hash !== b.hash) return a.hash - b.hash;
    return (a.s.fullName || "").localeCompare(b.s.fullName || "");
  });

  // Primary picks
  let picks = scored.filter(x => x.score > 0).slice(0, limit).map(x => x.s);

  // Fallbacks to fill to 3: featured, then any published
  if (picks.length < limit) {
    const chosenIds = new Set(picks.map(p => p.id).concat([curId]));
    const featured = all.filter(s => s.featured && !chosenIds.has(s.id));
    for (const f of featured) {
      if (picks.length >= limit) break;
      picks.push(f);
      chosenIds.add(f.id);
    }
    if (picks.length < limit) {
      for (const s of all) {
        if (picks.length >= limit) break;
        if (!chosenIds.has(s.id)) picks.push(s);
      }
    }
  }

  return picks.slice(0, limit);
}

export { arr, lowerSet }; // optional exports if needed elsewhere

