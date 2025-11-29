import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { getLocationAndRate } from '@/lib/geo.js';

export default function PublicLayout() {
  const [countryCode, setCountryCode] = useState('ZA');
  const [currency, setCurrency] = useState('ZAR');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await getLocationAndRate();
        if (!alive) return;
        if (r?.countryCode) setCountryCode(r.countryCode);
        if (r?.currency) setCurrency(r.currency);
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

  return (
    <>
      <Header countryCode={countryCode} currency={currency} />
      <Outlet />
      <Footer />
    </>
  );
}
