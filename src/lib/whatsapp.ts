const RAW_PHONE =
  (import.meta.env.VITE_WA_PHONE as string) || '+27674842001';

// wa.me requires digits only (no +, spaces, or punctuation)
const DIGITS = RAW_PHONE.replace(/[^\d]/g, '');

export function waLink(message: string) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${DIGITS}?text=${text}`;
}

/**
 * ASB default messages
 */
export function waMsgGeneral() {
  return `Hello ASB — I’d like more information about speakers for an upcoming event. Thanks!`;
}
export function waMsgForSpeaker(name: string) {
  return `Hello ASB — I’d like more information about ${name} for an upcoming event. Thanks!`;
}
