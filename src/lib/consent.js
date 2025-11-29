const KEY = "asbConsent:v1";

export function getConsent() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? { geo: null, ts: null }; }
  catch { return { geo: null, ts: null }; }
}

export function setConsent(update) {
  const prev = getConsent();
  const next = { ...prev, ...update, ts: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(next));
  // Also set a light cookie for server/static contexts (optional)
  document.cookie = `asb_geo_consent=${next.geo ? "allow" : "deny"}; Max-Age=31536000; Path=/; SameSite=Lax`;
  return next;
}

export function clearConsent() {
  localStorage.removeItem(KEY);
  document.cookie = "asb_geo_consent=; Max-Age=0; Path=/; SameSite=Lax";
}
