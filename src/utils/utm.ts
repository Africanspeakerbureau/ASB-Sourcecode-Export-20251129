export function appendUTM(url: string, utm: { source?: string; medium?: string; campaign?: string }) {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (utm.source) u.searchParams.set("utm_source", utm.source);
    if (utm.medium) u.searchParams.set("utm_medium", utm.medium);
    if (utm.campaign) u.searchParams.set("utm_campaign", utm.campaign);
    return u.toString();
  } catch {
    return url;
  }
}
