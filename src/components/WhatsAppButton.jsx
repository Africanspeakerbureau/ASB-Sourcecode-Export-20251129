import React from 'react';
import { waLink, waMsgGeneral } from '@/lib/whatsapp';

export default function WhatsAppButton({
  label = 'Message us on WhatsApp',
  message,
  campaign, // optional: e.g. 'pack-sustainability' or 'speaker-<slug>'
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  align = 'center', // 'left' | 'center' | 'right'
}) {
  const baseMessage = message || waMsgGeneral();
  const text = campaign ? `${baseMessage} (ref: ${campaign})` : baseMessage;
  const href = waLink(text);

  const btnSize = size === 'lg' ? 'px-5 py-3 text-base' : size === 'sm' ? 'px-3 py-2 text-sm' : 'px-4 py-2 text-sm';
  const justify = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';

  function trackClick(e) {
    // Lightweight hooks if GA/FB are present. No hard dependency.
    try {
      window.dataLayer?.push({ event: 'whatsapp_click', campaign: campaign || null, href });
    } catch {}
    try {
      // gtag
      window.gtag?.('event', 'click', { event_category: 'engagement', event_label: 'whatsapp', value: 1 });
    } catch {}
    try {
      // Meta Pixel
      window.fbq?.('trackCustom', 'WhatsAppClick', { campaign: campaign || null });
    } catch {}
  }

  return (
    <div className={`w-full flex ${justify}`}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={trackClick}
        data-cta="whatsapp"
        data-campaign={campaign || ''}
        className={`inline-flex items-center gap-2 rounded-md bg-[#25D366] text-white hover:opacity-90 ${btnSize} ${className}`}
        aria-label="Chat with us on WhatsApp"
      >
        {/* simple inline icon (no extra assets) */}
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M20 3.999A9.948 9.948 0 0 0 12.026 2C6.506 2 2 6.477 2 11.99c0 1.979.52 3.84 1.43 5.45L2 22l4.67-1.362A9.93 9.93 0 0 0 12.026 22C17.546 22 22 17.523 22 12.01 22 7.497 17.546 3.999 20 3.999Zm-7.974 16.01A8.01 8.01 0 0 1 6.6 18.7l-.3-.18l-2.77.809l.82-2.7l-.19-.31A8.017 8.017 0 0 1 4.016 12c0-4.42 3.6-8.01 8.01-8.01c4.42 0 8.01 3.59 8.01 8.01c0 4.42-3.59 8.01-8.01 8.01Zm4.56-6.09c-.25-.12-1.46-.72-1.69-.8c-.23-.08-.4-.12-.56.12c-.16.25-.64.8-.79.97c-.15.17-.29.18-.54.06c-.25-.12-1.05-.39-2-1.25c-.74-.66-1.24-1.47-1.39-1.72c-.14-.25-.01-.39.11-.51c.11-.11.25-.29.37-.43c.12-.14.16-.23.24-.39c.08-.17.04-.31-.02-.43c-.06-.12-.56-1.35-.77-1.85c-.2-.48-.4-.42-.56-.43l-.48-.01c-.17 0-.43.06-.66.31c-.23.25-.88.86-.88 2.09c0 1.23.91 2.42 1.04 2.58c.14.17 1.8 2.75 4.36 3.85c.61.26 1.09.41 1.46.53c.61.19 1.16.16 1.6.1c.49-.08 1.46-.59 1.67-1.17c.2-.58.2-1.08.14-1.18c-.06-.1-.23-.16-.48-.28Z"/>
        </svg>
        <span>{label}</span>
      </a>
    </div>
  );
}
