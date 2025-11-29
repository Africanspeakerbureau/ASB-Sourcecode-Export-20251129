export default function SectionTitle({ children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="block h-8 w-1.5 rounded-full" style={{ background: 'var(--asb-blue-600)' }} />
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{children}</h1>
    </div>
  );
}
