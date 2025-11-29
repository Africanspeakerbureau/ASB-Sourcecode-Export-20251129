export default function ExternalVideoCard({ host, url, label }: { host: string; url: string; label: string }) {
  let path = "";
  try {
    path = new URL(url).pathname;
  } catch (err) {
    path = url;
  }
  return (
    <a href={url} target="_blank" rel="noopener" aria-label={`Open on ${host} (opens in new tab)`}>
      <div className="rounded-2xl border border-border bg-white p-4 hover:shadow-sm">
        <div className="text-sm font-semibold">{label}</div>
        <div className="mt-1 text-xs text-muted">
          {host} · {path}
        </div>
      </div>
    </a>
  );
}
