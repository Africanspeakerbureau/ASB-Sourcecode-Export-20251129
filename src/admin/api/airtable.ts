const AIRTABLE_BASE = import.meta.env.VITE_AIRTABLE_BASE_ID as string;
const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY as string;

if (!AIRTABLE_BASE || !AIRTABLE_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Airtable] Missing VITE_AIRTABLE_BASE_ID or VITE_AIRTABLE_API_KEY in env."
  );
}

const endpoint = `https://api.airtable.com/v0/${AIRTABLE_BASE}`;

type AirtableRecord<T = any> = { id: string; fields: T };

async function getRecord<T>(table: string, id: string): Promise<AirtableRecord<T>> {
  const res = await fetch(`${endpoint}/${encodeURIComponent(table)}/${id}`, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Airtable ${table}/${id} ${res.status}`);
  return res.json();
}

export async function airtablePatchRecord(
  tableName: string,
  recordId: string,
  fields: Record<string, unknown>
) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(
    tableName
  )}/${recordId}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    // `typecast: true` helps gently coerce select values that match an option.
    body: JSON.stringify({ fields, typecast: true }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const et = (data?.error?.type as string) || res.status.toString();
    const em = (data?.error?.message as string) || "Unknown Airtable error";
    const err: any = new Error(`${et}: ${em}`);
    err.status = res.status;
    throw err;
  }

  return data;
}

const readSingleSelect = (v: any) =>
  typeof v === "string" ? v : v?.name ?? "";
const readMultiSelect = (v: any) =>
  Array.isArray(v)
    ? v
        .map((x) => (typeof x === "string" ? x : x?.name))
        .filter(Boolean)
    : [];
const readAttachments = (v: any) =>
  Array.isArray(v) ? v.map((a) => ({ url: a.url, filename: a.filename })) : [];

export { getRecord, readSingleSelect, readMultiSelect, readAttachments };
