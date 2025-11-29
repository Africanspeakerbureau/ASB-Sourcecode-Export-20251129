// Airtable-aligned option lists for speaker application edit and public apply cards.
// Values are sourced from the centralized FieldOptions (derived from Airtable_Field_List.csv)
// to avoid divergence between admin and public forms.

import fieldOptions from '../../FieldOptions.js'

const SPEAKER = fieldOptions['Speaker Applications']

export const INDUSTRIES = SPEAKER['Industry']

export const YEARS_EXPERIENCE = SPEAKER['Years Experience']

export const SPEAKING_EXPERIENCE = SPEAKER['Speaking Experience']

export const NUMBER_OF_EVENTS = SPEAKER['Number of Events']

export const LARGEST_AUDIENCE = SPEAKER['Largest Audience']

export const VIRTUAL_EXPERIENCE = SPEAKER['Virtual Experience']

export const PRESENTATION_FORMAT = fieldOptions['Client Inquiries']?.['Presentation Format'] || []

export const BUDGET_RANGE_USD = fieldOptions['Client Inquiries']?.['Budget Range'] || []

export const EXPERTISE_AREAS = SPEAKER['Expertise Areas']

export const SPOKEN_LANGUAGES = SPEAKER['Spoken Languages']

export const COUNTRIES: string[] = SPEAKER['Country']

export const TARGET_AUDIENCE = SPEAKER['Target Audience']

export const DELIVERY_CONTEXT = SPEAKER['Delivery Context']

export const FEE_RANGE_LOCAL = SPEAKER['Fee Range Local']
export const FEE_RANGE_CONTINENTAL = SPEAKER['Fee Range Continental']
export const FEE_RANGE_INTERNATIONAL = SPEAKER['Fee Range International']
export const FEE_RANGE_VIRTUAL = SPEAKER['Fee Range Virtual']
export const FEE_RANGE_GENERAL = SPEAKER['Fee Range General']

export const EXPERTISE_LEVEL = SPEAKER['Expertise Level']

export const DISPLAY_FEE = ['Yes', 'No']

export const TRAVEL_WILLINGNESS = SPEAKER['Travel Willingness']

export const FEATURED = SPEAKER['Featured']

export const STATUS = SPEAKER['Status']
