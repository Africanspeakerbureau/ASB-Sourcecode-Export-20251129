const BASE = import.meta.env.VITE_AIRTABLE_BASE_ID || (window as any).AIRTABLE_BASE_ID
const KEY = import.meta.env.VITE_AIRTABLE_API_KEY || (window as any).AIRTABLE_API_KEY

if (!BASE || !KEY) console.warn('Airtable env vars missing')

const HEADERS: HeadersInit = { Authorization: `Bearer ${KEY}` }

function qs(params: Record<string, any>) {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue
    if (Array.isArray(v)) v.forEach((vv) => sp.append(k, String(vv)))
    else if (typeof v === 'object') for (const [kk, vv] of Object.entries(v)) sp.append(`${k}[${kk}]`, String(vv))
    else sp.set(k, String(v))
  }
  return sp.toString()
}

export async function atList<T = any>(table: string, params: Record<string, any>) {
  const url = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}?${qs(params)}`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`)
  return (await res.json()) as { records: T[]; offset?: string }
}

export const f = (field: string, value: string) => `{${field}}='${value}'`
export const and = (...parts: string[]) => `AND(${parts.join(',')})`

export function airtableBase(table: string) {
  return {
    select: (config: Record<string, any>) => ({
      async firstPage() {
        const params: Record<string, any> = { ...config }

        if (Array.isArray(params.sort)) {
          params.sort.forEach((sortConfig: any, index: number) => {
            if (!sortConfig) return
            if (sortConfig.field) params[`sort[${index}][field]`] = sortConfig.field
            if (sortConfig.direction) params[`sort[${index}][direction]`] = sortConfig.direction
          })
          delete params.sort
        }

        const response = await atList<any>(table, params)
        return response.records as any[]
      },
    }),
  }
}
