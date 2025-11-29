export default function BottomCta() {
  return (
    <section
      className="py-12 text-white"
      style={{
        background: 'linear-gradient(90deg, var(--asb-footer), var(--asb-blue-800))',
        borderRadius: '16px',
      }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold">Ready to transform your organization?</h2>
        <p className="mt-3 text-sm md:text-base opacity-90">
          Keynotes, panels, boardroom consulting, workshops, virtual events, leadership coaching.
        </p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <a
            href="/#/contact#consult"
            className="rounded-xl bg-white px-4 py-2.5 font-semibold"
            style={{ color: 'var(--asb-blue-800)' }}
          >
            Schedule consultation
          </a>
          <a
            href="/#/speakers"
            className="rounded-xl border px-4 py-2.5 font-semibold"
            style={{ borderColor: '#FFFFFF', color: '#FFFFFF' }}
          >
            Browse speakers
          </a>
        </div>
      </div>
    </section>
  );
}
