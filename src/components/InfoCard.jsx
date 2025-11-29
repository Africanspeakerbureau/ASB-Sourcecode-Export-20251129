import React from 'react';

export default function InfoCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      {title && <h2 className="text-lg font-semibold mb-3">{title}</h2>}
      {subtitle && (
        <p className="text-base text-slate-600 mb-4">{subtitle}</p>
      )}
      <div>{children}</div>
    </section>
  );
}
