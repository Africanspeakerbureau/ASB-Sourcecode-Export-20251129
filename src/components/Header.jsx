import React, { useState } from "react";
import { Menu } from "lucide-react"; // hamburger icon
import { MAIN_LINKS } from "@/lib/navLinks";
import MobileMenu from "@/components/MobileMenu.jsx";

export default function Header({ countryCode, currency }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm pointer-events-auto">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          {/* Logo -> Home */}
          <a href="#/" className="h-12 flex items-center">
            <div className="bg-blue-900 rounded px-3 py-2 flex items-center justify-center min-w-[50px]">
              <span className="text-white font-bold text-lg">ASB</span>
            </div>
            <div className="ml-3 text-blue-900 leading-tight">
              <span className="text-sm font-medium block">AFRICAN</span>
              <span className="text-sm font-medium block">SPEAKER</span>
              <span className="text-sm font-medium block">BUREAU</span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 text-slate-800">
            {MAIN_LINKS.map(({ to, label, variant }) => (
              <a
                key={to}
                href={`#${to}`}
                className={
                  variant === 'default'
                    ? 'px-3 py-1 rounded bg-black text-white hover:bg-black/80'
                    : undefined
                }
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Geo/currency chip (wired in Patch 2) + mobile button */}
          <div className="flex items-center gap-3">
            {countryCode && currency && (
              <div className="hidden md:flex items-center gap-1 text-sm text-gray-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
                <span className="font-medium">{countryCode}</span>
                <span className="text-blue-600 font-semibold">{currency}</span>
              </div>
            )}
            <button
              type="button"
              aria-label="Open menu"
              className="lg:hidden p-2 rounded hover:bg-blue-50 text-blue-900"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* stays mounted but hidden unless open */}
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
