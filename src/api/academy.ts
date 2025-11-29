import { atList } from '@/lib/airtableClient.ts'
import { AcademyCourseRecord, AcademyLandingRecord } from '@/types/academy'

const ACADEMY_LANDING_TABLE_ID = 'tblIRvDYqMNKINGbS'
const ACADEMY_COURSES_TABLE_ID = 'tbly4oVTQvrn1Oh7g'

function escapeFormulaValue(value: string) {
  return String(value || '').replace(/'/g, "\\'")
}

async function fetchAllPages<T>(
  table: string,
  params: Record<string, any>,
): Promise<T[]> {
  let offset: string | undefined
  const records: T[] = []

  do {
    const response = await atList<T>(table, { ...params, offset })
    records.push(...(response.records || []))
    offset = response.offset
  } while (offset)

  return records
}

export async function fetchAcademyLanding(): Promise<AcademyLandingRecord | null> {
  const response = await atList<AcademyLandingRecord>(ACADEMY_LANDING_TABLE_ID, {
    filterByFormula: "{Status} = 'Published on Site'",
    maxRecords: 1,
  })

  return (response.records?.[0] as AcademyLandingRecord) || null
}

export async function fetchAcademyCourses(): Promise<AcademyCourseRecord[]> {
  const records = await fetchAllPages<AcademyCourseRecord>(ACADEMY_COURSES_TABLE_ID, {
    filterByFormula: "{Status} = 'Published on Site'",
    'sort[0][field]': 'Display Order',
    'sort[0][direction]': 'asc',
    pageSize: 100,
  })

  return records
}

export async function fetchAcademyCourseBySlug(slug: string): Promise<AcademyCourseRecord | null> {
  const safeSlug = escapeFormulaValue(slug)
  const response = await atList<AcademyCourseRecord>(ACADEMY_COURSES_TABLE_ID, {
    filterByFormula: `AND({Status} = 'Published on Site', {Slug} = '${safeSlug}')`,
    maxRecords: 1,
  })

  return (response.records?.[0] as AcademyCourseRecord) || null
}

export { ACADEMY_COURSES_TABLE_ID, ACADEMY_LANDING_TABLE_ID }
