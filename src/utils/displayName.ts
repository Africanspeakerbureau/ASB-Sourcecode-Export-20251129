import { Speaker } from '@/types/speaker';

/** Build "Dr Sharron L. McPherson" safely. */
export function getDisplayName(s: Pick<Speaker, 'title' | 'firstName' | 'lastName'>): string {
  const t = (s.title || '').trim();

  // Normalize common forms (optional, tweak as you like)
  const normalized = t
    // keep Prof., Dr., Ms., Mr.; add dot if missing on short honorifics
    .replace(/^professor$/i, 'Professor')
    .replace(/^prof\.?$/i, 'Prof.')
    .replace(/^dr\.?$/i, 'Dr.')
    .replace(/^mr\.?$/i, 'Mr.')
    .replace(/^ms\.?$/i, 'Ms.')
    .replace(/^mrs\.?$/i, 'Mrs.');

  // Avoid double-title if first/last already include it (rare, but safe)
  const fn = (s.firstName || '').replace(/^(Dr\.?|Prof\.?|Mr\.?|Ms\.?|Mrs\.?)\s+/i, '').trim();
  const ln = (s.lastName || '').trim();

  return [normalized, fn, ln].filter(Boolean).join(' ').replace(/\s+/g, ' ');
}
