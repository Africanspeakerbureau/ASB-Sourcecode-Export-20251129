import React from 'react'

export default function QuickFacts({ country, languages, availability, feeRange }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Quick Facts</h2>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <dt className="text-gray-500">Country</dt>
        <dd>{country || '—'}</dd>
        <dt className="text-gray-500">Languages</dt>
        <dd>{languages?.join(', ') || '—'}</dd>
        <dt className="text-gray-500">Availability</dt>
        <dd>{availability || '—'}</dd>
        <dt className="text-gray-500">Fee Range</dt>
        <dd>{feeRange || 'On request'}</dd>
      </dl>
    </div>
  )
}
