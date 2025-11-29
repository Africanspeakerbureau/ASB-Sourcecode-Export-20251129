import React from "react";
import { getConsent, setConsent } from "@/lib/consent";

export default function ConsentBanner({ onAllow }) {
  const [visible, setVisible] = React.useState(() => getConsent().geo === null);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] bg-white/95 backdrop-blur shadow-lg border-t border-slate-200">
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col sm:flex-row items-center gap-3">
        <p className="text-sm text-slate-700 text-center sm:text-left">
          We use your location to show local options (e.g. currency/region). Allow once to enable this.
        </p>
        <div className="flex gap-2 ml-auto">
          <button
            className="px-3 py-1.5 rounded bg-black text-white hover:bg-black/80 text-sm"
            onClick={() => {
              setConsent({ geo: true });
              setVisible(false);
              onAllow?.();
            }}
          >
            Allow location
          </button>
          <button
            className="px-3 py-1.5 rounded border border-slate-300 text-sm"
            onClick={() => {
              setConsent({ geo: false });
              setVisible(false);
            }}
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
