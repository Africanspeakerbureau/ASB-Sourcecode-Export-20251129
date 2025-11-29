// @ts-nocheck
import React from 'react'
import {
  Field,
  Text,
  TextArea,
  Select,
  Chips,
} from '@/public/apply-beta/cards/components.jsx'
import ImageUploadField from '@/public/apply-beta/components/ImageUploadField.jsx'
import { UploadPublic } from '@/components/upload/UploadPublic.jsx'
import { toAirtableAttachments } from '@/utils/airtableAttachments'
import '@/admin/components/Edit/editDialog.css'

const CONSULTANTS_TABLE_ID = 'tbltBNmJvC8vnvsHv'
const DRAFT_STORAGE_KEY = 'asbConsultantApply:v1'
const STATUS_DRAFT = 'Draft'
const SOURCE_DEFAULT = 'Web - Join as Consultant'

const TABS = [
  { key: 'identity', label: 'Identity' },
  { key: 'background', label: 'Background' },
  { key: 'expertise', label: 'Expertise & Context' },
  { key: 'availability', label: 'Formats & Availability' },
  { key: 'media', label: 'Media & Documents' },
  { key: 'contact', label: 'Contact & Admin' },
]

const REQUIRED_FIELDS = ['firstName', 'lastName', 'emailAddress', 'country', 'professionalTitle']

const COUNTRY_OPTIONS = [
  'South Africa',
  'Nigeria',
  'France',
  'Ghana',
  'Morocco',
  'Egypt',
  'Zimbabwe',
  'United Kingdom',
  'United Arab Emirates',
  'Kenya',
  'India',
  'Portugal',
  'Zambia',
  'Italy',
]

const REGION_OPTIONS = [
  'Southern Africa',
  'East Africa',
  'West Africa',
  'North Africa',
  'Central Africa',
  'Pan-Africa',
  'Europe',
  'Middle East',
  'North America',
  'Asia-Pacific',
  'Rest of Africa',
  'Asia',
]

const POSITIONING_BADGES = [
  'Board-Level Advisor',
  'C-Suite Sparring Partner',
  'Specialist Consultant',
  'Coach',
]

const AVAILABILITY_BADGES = ['Available Q1', 'Available Now', 'Limited Slots', 'By Arrangement']

const MODE_BADGES = ['Remote', 'On-site', 'Remote & On-site']

const EXPERTISE_OPTIONS = [
  'Consulting',
  'Strategy',
  'HR / People & Culture',
  'Finance / Strategy',
  'Operations / Supply Chain / PMO',
  'Marketing / Brand / Comms / CX',
  'Entrepreneurs / SMEs & Startups',
  'Business / Management',
  'Leadership / Motivation',
  'Innovation / Creativity',
  'Future / Technology',
  'Society / Education',
  'Government / Politics',
  'IT / AI',
  'Economic / Finance',
  'Research and Development',
  'Healthcare',
  'Energy / Mining Teams',
  'Retail and Consumer Goods',
  'Manufacturing',
  'Media & Entertainment',
  'Telecommunications',
  'Transport & Logistics',
  'Energy and Mining',
  'Agriculture & Food',
  'Non Profit and NGO',
  'Finance & Banking',
  'Legal Services',
  'Tourism & Hospitality',
  'Government & Public Policy',
  'IT & AI',
]

const INDUSTRY_OPTIONS = [
  'Financial Services',
  'Energy & Utilities',
  'Mining & Metals',
  'Public Sector / SOEs',
  'FMCG',
  'Healthcare',
  'Telecoms',
  'Manufacturing',
  'Telecommunications',
  'Media & Entertainment',
  'Government & Public Policy',
  'Legal Services',
  'Non Profit and NGO',
  'Finance & Banking',
  'Agriculture & Food',
  'Retail and Consumer Goods',
  'Energy and Mining',
  'Transport & Logistics',
  'Education',
  'Market Analysis',
  'Change Management',
  'OKRs',
  'Brand Strategy',
  'Supply Chain Design',
  'Lean Methods',
  'Agri Systems',
  'Risk Analysis',
  'Service Design',
  'Lean Manufacturing',
  'Compliance Audits',
  'Resource Analysis',
  'Design Thinking',
  'AI Strategy',
]

const CONTEXT_TAG_OPTIONS = [
  'Turnaround',
  'Operating Model',
  'PMO / Execution',
  'ESG',
  'Strategy',
  'Org Design',
  'Public Sector',
  'Change Management',
  'Leadership',
  'Digital Transformation',
  'Innovation',
  'IT / AI',
  'Public Policy',
  'Governance',
  'Growth',
  'Finance',
  'Entrepreneurship',
  'Sustainability',
  'Healthcare',
  'Operations',
  'HR',
  'People Strategy',
  'Coaching',
  'Energy',
  'Infrastructure',
  'Project Delivery',
  'Education',
  'Learning',
  'Retail',
  'Consumer Insights',
  'Marketing',
  'Brand',
  'Communications',
  'Logistics',
  'Supply Chain',
  'Agriculture',
  'Food Systems',
  'Banking',
  'Risk Management',
  'Tourism',
  'Hospitality',
  'Manufacturing',
  'Process Improvement',
  'Legal',
  'Compliance',
  'Mining',
  'Resources',
  'Creativity',
  'AI',
  'Technology',
]

const IDEAL_AUDIENCE_OPTIONS = [
  'Board of Directors / Board Committees',
  'C-Suite / Executive Leadership Team',
  'Development / NGO / Multilateral Teams',
  'Energy / Mining Teams',
  'Entrepreneurs / SMEs & Startups',
  'Finance / Strategy',
  'Frontline Staff / Operators',
  'Frontline Supervisors',
  'Government Executives / Public Sector Leaders',
  'Healthcare Professionals',
  'High-Potentials / Emerging Leaders (HiPo)',
  'HR / People & Culture',
  'Marketing / Brand / Comms / CX',
  'Middle Management (People Managers)',
  'Municipal / Local Government Leaders',
  'Senior Leaders (VP/Director)',
  'Product / Engineering / Tech & Data',
  'Legal Services',
  'Sales Organisation (AEs | SEs | CS | Partners)',
  'Operations / Supply Chain / PMO',
  'Universities / Business Schools / Educators',
  'Youth / Graduates / Early Career',
  'Retail and Consumer Goods',
  'Transport & Logistics',
  'Manufacturing',
  'Agriculture & Food',
  'Tourism & Hospitality',
  'Innovation / Creativity',
  'IT & AI',
]

const TOOLS_AND_METHODS_OPTIONS = [
  'OKRs',
  'Balanced Scorecard',
  'Hoshin X-Matrix',
  'PMO',
  'Change Management',
  'Agile Methods',
  'Policy Analysis',
  'Stakeholder Engagement',
  'Financial Modelling',
  'Market Analysis',
  'ESG Reporting',
  'Lean Healthcare',
  'Coaching',
  'Project Management',
  'Curriculum Design',
]

const TRAVEL_REGION_OPTIONS = [
  'Africa',
  'Southern Africa',
  'East Africa',
  'West Africa',
  'North Africa',
  'Europe',
  'Middle East',
  'North America',
  'Asia-Pacific',
  'Asia',
]

const AVAILABILITY_WINDOW_OPTIONS = ['Now', '<30 days', '30–90 days', '90+ days']
const FEE_RANGE_OPTIONS = ['$', '$$', '$$$', '$$$$', '$$$$$', 'On Request']
const DAY_RATE_CURRENCY_OPTIONS = ['ZAR', 'USD', 'EUR', 'GBP', 'Other']

function slugify(text = '') {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function usePersistedForm(defaults) {
  const [form, setForm] = React.useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(DRAFT_STORAGE_KEY) : null
      return saved ? { ...defaults, ...JSON.parse(saved) } : { ...defaults }
    } catch (error) {
      console.warn('Unable to load draft', error)
      return { ...defaults }
    }
  })

  React.useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form))
        }
      } catch (error) {
        console.warn('Unable to save draft', error)
      }
    }, 600)
    return () => clearTimeout(t)
  }, [form])

  return [form, setForm]
}

function buildAttachment(info) {
  const filename = `${info.original_filename}.${info.format || ''}`.replace(/\.$/, '')
  const type = info.resource_type === 'raw' && info.format
    ? `application/${info.format}`
    : info.resource_type === 'image'
    ? `image/${info.format || 'jpeg'}`
    : info.resource_type === 'video'
    ? `video/${info.format || 'mp4'}`
    : 'application/octet-stream'
  return {
    url: info.secure_url,
    filename,
    size: info.bytes,
    type,
  }
}

function AttachmentUploadField({
  id,
  label,
  value = [],
  help,
  setField,
  buttonLabel = 'Upload file',
  clientAllowedFormats,
  maxFiles,
}) {
  const attachments = Array.isArray(value) ? value : []
  const canUpload = !maxFiles || attachments.length < maxFiles

  const handleUploaded = (info) => {
    const attachment = buildAttachment(info)
    const next = [...attachments, attachment]
    setField(id, next)
  }

  const handleRemove = (index) => {
    const next = attachments.filter((_, idx) => idx !== index)
    setField(id, next)
  }

  return (
    <Field label={label} hint={help} id={id}>
      <div className="space-y-3">
        {attachments.length > 0 && (
          <ul className="space-y-2">
            {attachments.map((file, idx) => (
              <li
                key={`${file.url}-${idx}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="mr-3 flex-1 truncate">{file.filename || file.url}</span>
                <button
                  type="button"
                  className="text-xs font-semibold text-red-600"
                  onClick={() => handleRemove(idx)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        {canUpload && (
          <UploadPublic
            onUploaded={handleUploaded}
            clientAllowedFormats={clientAllowedFormats}
            buttonClassName="px-4 py-2 rounded-lg bg-black text-white hover:bg-black/80"
            buttonLabel={buttonLabel}
          />
        )}
        {maxFiles && attachments.length >= maxFiles && (
          <div className="text-xs text-slate-500">Maximum of {maxFiles} files reached.</div>
        )}
      </div>
    </Field>
  )
}

async function fetchExistingSlugs(baseSlug) {
  const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY || import.meta.env.AIRTABLE_API_KEY
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID || import.meta.env.AIRTABLE_BASE_ID
  if (!apiKey || !baseId) return []
  const safePattern = baseSlug.replace(/'/g, "\\'")
  const url = new URL(`https://api.airtable.com/v0/${baseId}/${CONSULTANTS_TABLE_ID}`)
  url.searchParams.set('filterByFormula', `REGEX_MATCH(LOWER({Slug}), '^${safePattern}')`)
  url.searchParams.append('fields[]', 'Slug')
  url.searchParams.set('pageSize', '50')
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return []
  const json = await res.json()
  return json.records || []
}

async function ensureUniqueSlug(baseSlug) {
  if (!baseSlug) return ''
  try {
    const records = await fetchExistingSlugs(baseSlug)
    const existing = new Set(
      records
        .map((rec) => (rec.fields?.Slug || '').toLowerCase())
        .filter(Boolean),
    )
    let candidate = baseSlug
    let counter = 2
    while (existing.has(candidate)) {
      candidate = `${baseSlug}-${counter}`
      counter += 1
    }
    return candidate
  } catch (error) {
    console.warn('Slug check failed', error)
    return baseSlug
  }
}

async function createConsultantApplication(fields) {
  const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY || import.meta.env.AIRTABLE_API_KEY
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID || import.meta.env.AIRTABLE_BASE_ID
  if (!apiKey || !baseId) {
    throw new Error('Missing Airtable credentials')
  }
  const url = `https://api.airtable.com/v0/${baseId}/${CONSULTANTS_TABLE_ID}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Unable to create record')
  }
  return res.json()
}

function sanitizeFields(fields) {
  const out = {}
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (typeof value === 'string' && value.trim() === '') return
    if (Array.isArray(value) && value.length === 0) return
    out[key] = value
  })
  return out
}

const DEFAULT_FORM = {
  firstName: '',
  lastName: '',
  emailAddress: '',
  phoneNumber: '',
  professionalTitle: '',
  company: '',
  country: '',
  location: '',
  worksAcrossRegions: [],
  profileImage: [],
  about: '',
  yearsConsulting: '',
  countriesWorked: '',
  flagshipOutcome: '',
  positioningBadge: '',
  availabilityBadge: '',
  modeBadge: '',
  typicalEngagementLength: '',
  expertiseAreas: [],
  industries: [],
  contextTags: [],
  idealAudience: [],
  toolsMethods: [],
  travelRegions: [],
  availabilityWindow: '',
  availabilityNotes: '',
  feeRangeGeneral: 'On Request',
  consultingDayRateLocal: '',
  consultingDayRateCurrency: '',
  heroImage: [],
  heroVideoUrl: '',
  cvAttachment: [],
  casePackAttachment: [],
  otherDocuments: [],
  website: '',
  linkedinUrl: '',
  applicationNotes: '',
}

export default function ApplyConsultantCardV1() {
  const [form, setForm] = usePersistedForm(DEFAULT_FORM)
  const [tab, setTab] = React.useState(TABS[0].key)
  const [errors, setErrors] = React.useState({})
  const [status, setStatus] = React.useState({ type: 'idle', message: '' })
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const tabIndex = TABS.findIndex((item) => item.key === tab)

  const setField = React.useCallback(
    (name, value) => {
      setForm((prev) => ({ ...prev, [name]: value }))
      setErrors((prev) => {
        if (!prev[name]) return prev
        const next = { ...prev }
        delete next[name]
        return next
      })
    },
    [setForm, setErrors],
  )

  const baseSlug = React.useMemo(() => {
    const base = slugify(`${form.firstName || ''} ${form.lastName || ''}`.trim())
    return base ? `${base}-consultant` : ''
  }, [form.firstName, form.lastName])

  const validate = React.useCallback(() => {
    const nextErrors = {}
    REQUIRED_FIELDS.forEach((field) => {
      const value = form[field]
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        nextErrors[field] = 'This field is required'
      }
    })
    setErrors(nextErrors)
    return nextErrors
  }, [form])

  const saveDraft = React.useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form))
      }
      setStatus({ type: 'info', message: 'Draft saved' })
      setTimeout(() => setStatus((prev) => (prev.type === 'info' ? { type: 'idle', message: '' } : prev)), 2000)
    } catch (error) {
      console.warn('Draft save failed', error)
    }
  }, [form])

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) {
      setStatus({ type: 'error', message: 'Please fill in the required fields before submitting.' })
      return
    }
    if (!baseSlug) {
      setStatus({ type: 'error', message: 'Unable to generate slug. Please add your name.' })
      return
    }
    try {
      setSubmitting(true)
      setStatus({ type: 'info', message: 'Submitting application…' })
      const slug = await ensureUniqueSlug(baseSlug)
      const fields = sanitizeFields({
        'First Name': form.firstName,
        'Last Name': form.lastName,
        'Professional Title': form.professionalTitle,
        'Company / Firm': form.company,
        'Email Address': form.emailAddress,
        'Phone Number': form.phoneNumber,
        Country: form.country,
        Location: form.location,
        'Works Across Regions': form.worksAcrossRegions,
        'Profile Image': toAirtableAttachments(form.profileImage),
        About: form.about,
        'Years Consulting': form.yearsConsulting ? Number(form.yearsConsulting) : undefined,
        'Countries Worked': form.countriesWorked ? Number(form.countriesWorked) : undefined,
        'Flagship Outcome': form.flagshipOutcome,
        'Positioning Badge': form.positioningBadge,
        'Availability Badge': form.availabilityBadge,
        'Mode Badge': form.modeBadge,
        'Typical Engagement Length': form.typicalEngagementLength,
        'Expertise Areas': form.expertiseAreas,
        Industries: form.industries,
        'Context Tags': form.contextTags,
        'Ideal Audience': form.idealAudience,
        'Tools & Methods': form.toolsMethods,
        'Travel Regions': form.travelRegions,
        'Availability Window': form.availabilityWindow,
        'Availability Notes': form.availabilityNotes,
        'Fee Range General': form.feeRangeGeneral,
        'Consulting Day Rate Local': form.consultingDayRateLocal,
        'Consulting Day Rate Currency': form.consultingDayRateCurrency,
        'Hero Image': toAirtableAttachments(form.heroImage),
        'Hero Video URL': form.heroVideoUrl,
        'CV Attachment': toAirtableAttachments(form.cvAttachment),
        'Case Pack Attachment': toAirtableAttachments(form.casePackAttachment),
        'Other Documents': toAirtableAttachments(form.otherDocuments),
        Website: form.website,
        'LinkedIn URL': form.linkedinUrl,
        'Application Notes (internal)': form.applicationNotes,
        'Application Source': SOURCE_DEFAULT,
        Status: STATUS_DRAFT,
        Slug: slug,
      })
      await createConsultantApplication(fields)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DRAFT_STORAGE_KEY)
      }
      setSubmitted(true)
      setStatus({ type: 'success', message: 'Thank you for your consultant application.' })
    } catch (error) {
      console.error('Application submit failed', error)
      setStatus({ type: 'error', message: error.message || 'Submission failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const renderIdentity = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Text id="firstName" label="First Name" required form={form} setField={setField} error={errors.firstName} />
        <Text id="lastName" label="Last Name" required form={form} setField={setField} error={errors.lastName} />
        <Text
          id="emailAddress"
          label="Email Address"
          type="email"
          required
          form={form}
          setField={setField}
          error={errors.emailAddress}
        />
        <Text id="phoneNumber" label="Phone Number" form={form} setField={setField} />
        <Text
          id="professionalTitle"
          label="Professional Title"
          required
          form={form}
          setField={setField}
          error={errors.professionalTitle}
        />
        <Text id="company" label="Company / Firm" form={form} setField={setField} />
        <Text id="location" label="Location" form={form} setField={setField} />
        <Select id="country" label="Country" options={COUNTRY_OPTIONS} form={form} setField={setField} required />
      </div>
      <Chips
        id="worksAcrossRegions"
        label="Works Across Regions"
        options={REGION_OPTIONS}
        form={form}
        setField={setField}
      />
      <ImageUploadField
        label="Profile Image"
        value={form.profileImage}
        onChange={(value) => setField('profileImage', value)}
      />
    </div>
  )

  const renderBackground = () => (
    <div className="space-y-6">
      <TextArea id="about" label="About" form={form} setField={setField} rows={5} />
      <div className="grid gap-4 md:grid-cols-2">
        <Text id="yearsConsulting" label="Years Consulting" form={form} setField={setField} inputMode="numeric" />
        <Text id="countriesWorked" label="Countries Worked" form={form} setField={setField} inputMode="numeric" />
        <Text id="flagshipOutcome" label="Flagship Outcome" form={form} setField={setField} />
        <Text id="typicalEngagementLength" label="Typical Engagement Length" form={form} setField={setField} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Select id="positioningBadge" label="Positioning Badge" options={POSITIONING_BADGES} form={form} setField={setField} />
        <Select id="availabilityBadge" label="Availability Badge" options={AVAILABILITY_BADGES} form={form} setField={setField} />
        <Select id="modeBadge" label="Mode Badge" options={MODE_BADGES} form={form} setField={setField} />
      </div>
    </div>
  )

  const renderExpertise = () => (
    <div className="space-y-6">
      <Chips id="expertiseAreas" label="Expertise Areas" options={EXPERTISE_OPTIONS} form={form} setField={setField} />
      <Chips id="industries" label="Industries" options={INDUSTRY_OPTIONS} form={form} setField={setField} />
      <Chips id="contextTags" label="Context Tags" options={CONTEXT_TAG_OPTIONS} form={form} setField={setField} />
      <Chips id="idealAudience" label="Ideal Audience" options={IDEAL_AUDIENCE_OPTIONS} form={form} setField={setField} />
      <Chips id="toolsMethods" label="Tools & Methods" options={TOOLS_AND_METHODS_OPTIONS} form={form} setField={setField} />
      <Chips id="travelRegions" label="Travel Regions" options={TRAVEL_REGION_OPTIONS} form={form} setField={setField} />
    </div>
  )

  const renderAvailability = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          id="availabilityWindow"
          label="Availability Window"
          options={AVAILABILITY_WINDOW_OPTIONS}
          form={form}
          setField={setField}
        />
        <Select
          id="feeRangeGeneral"
          label="Fee Range General"
          options={FEE_RANGE_OPTIONS}
          form={form}
          setField={setField}
        />
        <Text
          id="consultingDayRateLocal"
          label="Consulting Day Rate (Local Amount)"
          form={form}
          setField={setField}
        />
        <Select
          id="consultingDayRateCurrency"
          label="Consulting Day Rate Currency"
          options={DAY_RATE_CURRENCY_OPTIONS}
          form={form}
          setField={setField}
        />
      </div>
      <TextArea
        id="availabilityNotes"
        label="Availability Notes"
        form={form}
        setField={setField}
        rows={4}
      />
    </div>
  )

  const renderMedia = () => (
    <div className="space-y-6">
      <ImageUploadField
        label="Hero Image"
        value={form.heroImage}
        onChange={(value) => setField('heroImage', value)}
      />
      <Text id="heroVideoUrl" label="Hero Video URL" type="url" form={form} setField={setField} />
      <AttachmentUploadField
        id="cvAttachment"
        label="CV Attachment"
        value={form.cvAttachment}
        setField={setField}
        clientAllowedFormats={['pdf', 'doc', 'docx']}
      />
      <AttachmentUploadField
        id="casePackAttachment"
        label="Case Pack Attachment"
        value={form.casePackAttachment}
        setField={setField}
        clientAllowedFormats={['pdf', 'ppt', 'pptx', 'doc', 'docx']}
      />
      <AttachmentUploadField
        id="otherDocuments"
        label="Other Documents"
        value={form.otherDocuments}
        setField={setField}
        clientAllowedFormats={['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'png']}
        help="Upload any additional materials you'd like to share."
      />
    </div>
  )

  const renderContact = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Text id="website" label="Website" type="url" form={form} setField={setField} />
        <Text id="linkedinUrl" label="LinkedIn URL" type="url" form={form} setField={setField} />
      </div>
      <TextArea
        id="applicationNotes"
        label="Application Notes (Internal)"
        form={form}
        setField={setField}
        rows={4}
      />
      <Field label="Application Source" id="applicationSource">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          {SOURCE_DEFAULT}
        </div>
      </Field>
      <Field label="Status" id="status-field">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">{STATUS_DRAFT}</div>
      </Field>
      <Field label="Slug (preview)" id="slug-preview" hint="Final slug is confirmed on submit">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono">
          {baseSlug || 'Provide first & last name to generate slug'}
        </div>
      </Field>
    </div>
  )

  const renderStep = () => {
    switch (tab) {
      case 'identity':
        return renderIdentity()
      case 'background':
        return renderBackground()
      case 'expertise':
        return renderExpertise()
      case 'availability':
        return renderAvailability()
      case 'media':
        return renderMedia()
      case 'contact':
        return renderContact()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Consultant Applications</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">Join as Consultant</h1>
            <p className="mt-3 text-lg text-slate-600">
              Partner with African Speaker Bureau as a trusted consultant or advisor.
            </p>
            <p className="mt-4 text-base text-slate-700">
              Share your consulting expertise, regions, and formats. We review every profile for fit and may reach out with
              mandates, projects, or advisory opportunities that match your experience.
            </p>
          </div>

          {status.message && (
            <div
              className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
                status.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : status.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-blue-200 bg-blue-50 text-blue-800'
              }`}
            >
              {status.message}
            </div>
          )}

          {submitted ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Thank you for your consultant application</h2>
              <p className="mt-4 text-slate-600">
                Our team will review your profile and contact you if there is a strong fit with current or upcoming mandates.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="sticky top-16 z-40">
                <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2 rounded-2xl bg-asb-navy/90 px-4 py-3 text-white shadow">
                  <button
                    type="button"
                    onClick={() => setTab(TABS[Math.max(0, tabIndex - 1)].key)}
                    disabled={tabIndex === 0}
                    className="rounded border border-white/40 bg-white px-3 py-1.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={saveDraft}
                    className="rounded border border-white/40 bg-white px-3 py-1.5 text-sm font-semibold text-black"
                  >
                    Save Draft
                  </button>
                  {tabIndex < TABS.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setTab(TABS[Math.min(TABS.length - 1, tabIndex + 1)].key)}
                      className="rounded bg-black px-3 py-1.5 text-sm font-semibold text-white"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="rounded bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {submitting ? 'Submitting…' : 'Submit Application'}
                    </button>
                  )}
                  <div className="ml-auto hidden text-sm font-medium text-white md:block">
                    Step {tabIndex + 1} of {TABS.length}: {TABS[tabIndex].label}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap gap-2 pb-6">
                  {TABS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTab(item.key)}
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                        tab === item.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-6">{renderStep()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
