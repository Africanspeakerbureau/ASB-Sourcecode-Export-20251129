// Lightweight Airtable client used by videos.data.ts
// Works with either a table *name* or *table ID* (tblXXXXXXXX).
// Reads several env var names to match your existing setup.

type SortOpt = { field: string; direction?: "asc" | "desc" };
type QueryOpts = {
  filterByFormula?: string;
  view?: string;
  sort?: SortOpt[];
  pageSize?: number;
  maxRecords?: number;
};

function getEnv(nameList: string[]): string | undefined {
  for (const n of nameList) {
    const v = (import.meta as any).env?.[n];
    if (v) return v as string;
  }
}

const AT_BASE =
  getEnv(["VITE_AT_BASE_ID", "VITE_AIRTABLE_BASE_ID", "VITE_AT_BASE"]) ?? "";
const AT_KEY =
  getEnv(["VITE_AT_API_KEY", "VITE_AIRTABLE_API_KEY", "VITE_AT_KEY"]) ?? "";

if (!AT_BASE) console.warn("[Airtable] Base ID env is missing");
if (!AT_KEY) console.warn("[Airtable] API Key env is missing");

export async function airtableQuery(table: string, opts: QueryOpts = {}) {
  if (!AT_BASE || !AT_KEY) {
    throw new Error(
      "Airtable env missing. Set VITE_AT_BASE_ID and VITE_AT_API_KEY in Vercel."
    );
  }

  const baseUrl = `https://api.airtable.com/v0/${AT_BASE}/${encodeURIComponent(
    table
  )}`;

  const headers = {
    Authorization: `Bearer ${AT_KEY}`,
  };

  const params = new URLSearchParams();
  if (opts.filterByFormula) params.set("filterByFormula", opts.filterByFormula);
  if (opts.view) params.set("view", opts.view);
  if (opts.pageSize) params.set("pageSize", String(opts.pageSize));
  if (opts.maxRecords) params.set("maxRecords", String(opts.maxRecords));
  if (opts.sort && opts.sort.length) {
    opts.sort.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction ?? "asc");
    });
  }

  let out: any[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(baseUrl);
    for (const [k, v] of params.entries()) url.searchParams.set(k, v);
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        `[Airtable] ${res.status} ${res.statusText} — ${body.slice(0, 200)}`
      );
    }
    const json: any = await res.json();
    out = out.concat(json.records ?? json);
    offset = json.offset;
  } while (offset);

  return out;
}
