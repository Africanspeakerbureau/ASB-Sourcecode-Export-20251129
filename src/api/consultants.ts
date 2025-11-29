import { airtableBase } from '@/lib/airtableClient.ts'
import { AsbConsultantRecord, AsbConsultantsLandingRecord } from '@/types/consultants'

const CONSULTANTS_LANDING_TABLE_ID =
  (import.meta.env.VITE_ASB_CONSULTANTS_LANDING_TABLE_ID as string | undefined) ||
  (typeof process !== 'undefined' ? process.env.ASB_CONSULTANTS_LANDING_TABLE_ID : undefined) ||
  'tblRBiWBoD95w2OEG'
const CONSULTANTS_TABLE_ID =
  (import.meta.env.VITE_ASB_CONSULTANTS_TABLE_ID as string | undefined) ||
  (typeof process !== 'undefined' ? process.env.ASB_CONSULTANTS_TABLE_ID : undefined) ||
  'tbltBNmJvC8vnvsHv'

// Helper: safe console logging for debugging (can be left in dev)
const logConsultantsDebug = (...args: any[]) => {
  const isProduction =
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') ||
    (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.MODE === 'production')

  if (!isProduction) {
    // eslint-disable-next-line no-console
    console.log('[consultants]', ...args)
  }
}

export async function fetchConsultantsLanding(): Promise<AsbConsultantsLandingRecord | null> {
  try {
    const baseQuery = airtableBase(CONSULTANTS_LANDING_TABLE_ID)

    const safeSelect = async (options: any) => {
      try {
        return await baseQuery.select(options).firstPage()
      } catch (err) {
        logConsultantsDebug('consultants landing select failed', err)
        return null
      }
    }

    // Prefer the record that is explicitly published
    const publishedRecords =
      (await safeSelect({
        filterByFormula: '{Status} = "Published on Site"',
        view: 'Published on Site',
        maxRecords: 1,
      })) ||
      (await safeSelect({
        filterByFormula: '{Status} = "Published on Site"',
        maxRecords: 1,
      }))

    const publishedRecord = (publishedRecords?.[0] as unknown as AsbConsultantsLandingRecord) || null
    if (publishedRecord) {
      logConsultantsDebug(
        'landing record (published)',
        publishedRecord?.fields?.['Page Name'],
        publishedRecord?.fields?.['Status'],
      )
      return publishedRecord
    }

    // Fallback: grab the most recently updated record so the page is never empty
    const fallbackRecords = await safeSelect({
      sort: [{ field: 'Last Updated', direction: 'desc' }],
      maxRecords: 1,
    })

    const fallbackRecord = (fallbackRecords?.[0] as unknown as AsbConsultantsLandingRecord) || null
    logConsultantsDebug(
      'landing record (fallback)',
      fallbackRecord?.fields?.['Page Name'],
      fallbackRecord?.fields?.['Status'],
    )
    return fallbackRecord
  } catch (err) {
    logConsultantsDebug('fetchConsultantsLanding error', err)
    return null
  }
}

export interface FetchConsultantsParams {
  search?: string
  country?: string
  availability?: string
  feeBand?: string
  offset?: string
}

export async function fetchConsultants(
  params: FetchConsultantsParams = {},
): Promise<{ records: AsbConsultantRecord[]; offset?: string }>
{
  try {
    const filterParts: string[] = ['{Status} = "Published on Site"']

    if (params.country) {
      filterParts.push(`{Country} = '${params.country}'`)
    }
    if (params.availability) {
      filterParts.push(`{Availability Window} = '${params.availability}'`)
    }
    if (params.feeBand) {
      filterParts.push(`{Fee Range General} = '${params.feeBand}'`)
    }

    const filterByFormula =
      filterParts.length > 1 ? `AND(${filterParts.join(',')})` : filterParts[0]

    const selectConfig: any = {
      filterByFormula,
      pageSize: 24,
      sort: [
        { field: 'Directory Order', direction: 'asc' },
        { field: 'Full Name', direction: 'asc' },
      ],
    }

    if (params.offset) {
      selectConfig.offset = params.offset
    }

    logConsultantsDebug('fetchConsultants selectConfig', selectConfig)

    const query = airtableBase(CONSULTANTS_TABLE_ID).select(selectConfig)
    const page = await query.firstPage()

    const records = page as unknown as AsbConsultantRecord[]
    logConsultantsDebug('fetchConsultants records count', records.length)

    // If you need true offset, adapt to our existing pattern. For now we omit it.
    return { records, offset: undefined }
  } catch (err) {
    logConsultantsDebug('fetchConsultants error', err)
    return { records: [], offset: undefined }
  }
}

export async function fetchConsultantBySlug(slug: string): Promise<AsbConsultantRecord | null> {
  try {
    logConsultantsDebug('fetchConsultantBySlug', slug)

    const records = await airtableBase(CONSULTANTS_TABLE_ID)
      .select({
        filterByFormula: `
          AND(
            {Status} = "Published on Site",
            {Slug} = '${slug}'
          )
        `,
        maxRecords: 1,
      })
      .firstPage()

    const record = (records[0] as unknown as AsbConsultantRecord) || null
    logConsultantsDebug(
      'fetchConsultantBySlug result',
      slug,
      !!record && record.fields['Full Name'],
    )
    return record
  } catch (err) {
    logConsultantsDebug('fetchConsultantBySlug error', err)
    return null
  }
}

export async function fetchConsultantsByIds(ids: string[]): Promise<AsbConsultantRecord[]> {
  const unique = Array.from(new Set(ids.filter(Boolean)))
  if (!unique.length) return []

  try {
    const formula =
      unique.length === 1
        ? `AND({Status} = "Published on Site", RECORD_ID() = '${unique[0]}')`
        : `AND({Status} = "Published on Site", OR(${unique
            .map((id) => `RECORD_ID() = '${id}'`)
            .join(',')}))`

    const records = await airtableBase(CONSULTANTS_TABLE_ID)
      .select({
        filterByFormula: formula,
        pageSize: unique.length,
      })
      .firstPage()

    logConsultantsDebug('fetchConsultantsByIds count', records.length)

    return (records as unknown as AsbConsultantRecord[]) || []
  } catch (err) {
    logConsultantsDebug('fetchConsultantsByIds error', err)
    return []
  }
}
