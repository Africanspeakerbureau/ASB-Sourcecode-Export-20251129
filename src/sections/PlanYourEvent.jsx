import React from 'react';
import { BOOK_ROUTE } from '@/lib/booking';

export default function PlanYourEvent() {
  return (
    <section
      id="services"
      className="section text-white"
      style={{ background: 'linear-gradient(90deg, var(--asb-blue-800), var(--asb-footer))' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">Plan Your Event with ASB</h2>
        <p className="mt-4 text-sm md:text-base opacity-90">
          Let us help you find the perfect speaker to elevate your next event.
        </p>
        <a
          href={BOOK_ROUTE}
          className="mt-6 inline-flex items-center rounded-xl bg-white px-4 py-2.5 font-semibold"
          style={{ color: 'var(--asb-blue-800)' }}
        >
          Booking Inquiry
        </a>
      </div>
    </section>
  );
}
