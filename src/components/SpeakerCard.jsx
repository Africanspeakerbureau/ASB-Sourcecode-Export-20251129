import React from 'react';
import { getDisplayName } from '@/utils/displayName';
import { lazyImgProps } from '@/lib/img';

export default function SpeakerCard({ speaker, variant = 'search' }) {
  const s = speaker || {};
  const img = s.photoUrl || s.photo || null;
  const displayName = getDisplayName(s);
  // Compose City, Region, Country with graceful fallback
  const locationLabel = [s.city || s.location, s.regionOrProvince, s.country]
    .filter(Boolean)
    .join(', ');
  // Normalize languages from arrays or comma-separated strings
  const langsRaw = Array.isArray(s.spokenLanguages) && s.spokenLanguages.length
    ? s.spokenLanguages
    : Array.isArray(s.languages)
    ? s.languages
    : typeof s.spokenLanguages === 'string'
    ? s.spokenLanguages.split(',').map((v) => v.trim()).filter(Boolean)
    : typeof s.languages === 'string'
    ? s.languages.split(',').map((v) => v.trim()).filter(Boolean)
    : [];
  const languagesLabel = langsRaw.join(', ');
  const locLang = [locationLabel, languagesLabel].filter(Boolean).join(' | ');
  const kmFull = s.keyMessage || s.keyMessages || '';
  const km = kmFull.length > 220 ? `${kmFull.slice(0, 220)}…` : kmFull;
  const tags = (s.expertise || s.expertiseAreas || []).slice(0, 3);
  const professionalTitle = s.professionalTitle || s.titleText;
  const key = (s.slug || s.id || '').toLowerCase();
  const profilePath = `#/speaker/${encodeURIComponent(key)}`;
  const fee = s.feeRangeGeneral ?? s.feeRange ?? null;
  const showFee = s.displayFee !== 'No' && !!fee;
  const go = (e) => {
    e.preventDefault();
    window.history.pushState({}, '', profilePath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // ===== Featured (homepage grid) =====
  if (variant === 'featured') {
    return (
      <a
        href={profilePath}
        onClick={go}
        className="group block rounded-2xl border overflow-hidden bg-white"
        style={{ borderColor: 'var(--asb-border)' }}
      >
        <div className="aspect-[4/3] min-h-[280px] bg-gray-100">
          {img ? (
            <img
              src={img}
              alt={displayName}
              width={640}
              height={480}
              className="h-full w-full object-cover"
              {...lazyImgProps}
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-400 text-sm">No image</div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-[16px] font-semibold text-gray-900 group-hover:underline">
            {displayName}
          </h3>
          {locLang && (
            <p className="mt-1 text-xs text-gray-500">{locLang}</p>
          )}
          {tags.length > 0 && (
            <p className="mt-2 text-[14px] font-normal text-gray-700 leading-5">
              {tags.join(' | ')}
            </p>
          )}
          {showFee && (
            <p className="mt-2 text-sm font-semibold text-gray-900">
              Fee Range: {fee}
            </p>
          )}
        </div>
      </a>
    );
  }

  // ===== Search page card (bigger, like your mockup) =====
  if (variant === 'search') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 h-full flex flex-col">
        <div className="w-full flex justify-center">
          <a href={profilePath} onClick={go} className="w-40 h-40 rounded-xl overflow-hidden bg-gray-100">
            {img ? (
              <img
                src={img}
                alt={displayName}
                width={160}
                height={160}
                className="w-full h-full object-cover"
                {...lazyImgProps}
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-gray-400 text-sm">No image</div>
            )}
          </a>
        </div>

        <h3 className="text-lg font-semibold text-center mt-4">
          <a href={profilePath} onClick={go}>{displayName}</a>
        </h3>
        {locLang && <p className="text-sm text-center text-gray-600">{locLang}</p>}
        {professionalTitle && (
          <p className="text-base text-center text-gray-800 mt-1">{professionalTitle}</p>
        )}

        {km && <p className="text-gray-700 mt-3 text-center">{km}</p>}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {tags.map((t) => (
              <span key={t} className="text-xs bg-indigo-50 px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}

        {showFee && (
          <div className="text-base font-semibold text-center mt-4">
            Fee Range: {fee}
          </div>
        )}

        <div className="flex justify-center mt-4">
          <a
            href={profilePath}
            onClick={go}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-5 rounded-lg"
            aria-label={`View ${displayName}'s profile`}
          >
            View Profile
          </a>
        </div>
      </div>
    );
  }

  // ===== Compact (used on Home) =====
  if (variant === 'compact') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 h-full">
        <a href={profilePath} onClick={go} className="group block h-full">
          <div className="w-full flex justify-center">
            {img ? (
              <img
              src={img}
              alt={displayName}
              width={112}
              height={112}
              className="w-28 h-28 object-cover rounded-lg"
              {...lazyImgProps}
            />
            ) : (
              <div className="w-28 h-28 rounded-lg bg-gray-100 grid place-items-center text-gray-400 text-xs">No image</div>
            )}
          </div>
          <h3 className="text-base font-semibold text-center mt-3">{displayName}</h3>
          {locLang && <p className="text-xs text-center text-gray-600">{locLang}</p>}
          {professionalTitle && (
            <p className="text-sm text-center text-gray-800 mt-1">{professionalTitle}</p>
          )}
          {showFee && (
            <p className="text-sm text-center text-gray-900 mt-2">Fee Range: {fee}</p>
          )}
        </a>
      </div>
    );
  }

  return null;
}
