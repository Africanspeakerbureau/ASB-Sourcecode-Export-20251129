import React from 'react';
import { NavLink } from 'react-router-dom';
import { MAIN_LINKS, SERVICE_LINKS } from '@/lib/navLinks';
import { BOOK_ROUTE } from '@/lib/booking';
import WhatsAppButton from '@/components/WhatsAppButton';
import { waMsgGeneral } from '@/lib/whatsapp';
import { lazyImgProps } from '@/lib/img';

export default function Footer() {

  return (
    <footer
      className="bg-slate-900 text-slate-200 relative z-10"
      onClickCapture={(e) => e.stopPropagation()}
    >
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo-asb.svg"
                alt="ASB"
                className="h-10 w-10"
                width={40}
                height={40}
                {...lazyImgProps}
              />
              <div className="text-lg font-semibold leading-tight">
                AFRICAN<br/>SPEAKER<br/>BUREAU
              </div>
            </div>
            <p className="mt-6 text-slate-400">
              Connecting authentic African voices with global audiences since 2008.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Quick Links</h3>
            <ul className="mt-6 space-y-3 text-slate-300">
              {MAIN_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} className="hover:text-white">{label}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Services</h3>
            <ul className="mt-6 space-y-3 text-slate-300">
              {SERVICE_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} className="hover:text-white">{label}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Contact</h3>
            <div className="mt-6 space-y-4 text-slate-300">
              <div>
                <a className="hover:text-white" href="mailto:info@africanspeakerbureau.com">
                  info@africanspeakerbureau.com
                </a>
              </div>
              <WhatsAppButton
                label="WhatsApp"
                message={waMsgGeneral()}
                size="sm"
                align="center"
                campaign="footer"
                className="w-full"
              />
              <div>
                <a className="hover:text-white underline" href="#/#quick-inquiry">Message us</a>
              </div>
              <div>
                <a className="hover:text-white underline" href={BOOK_ROUTE}>
                  Request Consultation
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-slate-400 flex items-center justify-between">
          <span>© 2025 African Speaker Bureau. All rights reserved.</span>
          <span>{import.meta.env.VITE_BUILD_ID ?? ""}</span>
        </div>
      </div>
    </footer>
  );
}

