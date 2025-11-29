const AIRTABLE_API_KEY =
  import.meta.env.VITE_AIRTABLE_API_KEY || import.meta.env.AIRTABLE_API_KEY;
const BASE_ID =
  import.meta.env.VITE_AIRTABLE_BASE_ID || import.meta.env.AIRTABLE_BASE_ID;

const TABLE = 'Speaker%20Applications';

export async function submitApplication(fields) {
  const filtered = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined && v !== '')
  );
  filtered['Status'] = ['Pending'];
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: filtered }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}
