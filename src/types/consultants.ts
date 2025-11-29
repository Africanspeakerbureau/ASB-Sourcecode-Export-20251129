export interface AsbConsultantsLandingRecord {
  id: string
  fields: {
    'Page Name'?: string
    'URL Slug'?: string
    'Status'?: 'Draft' | 'Approved' | 'Published on Site' | 'Archived'
    'Hero Heading'?: string
    'Hero Subheading'?: string
    'Hero Intro Text'?: string
    'Hero Primary CTA Label'?: string
    'Hero Primary CTA Target'?: string
    'Hero Secondary CTA Label'?: string
    'Hero Secondary CTA URL'?: string
    'Highlight Bullets'?: string
    'Featured Consultants'?: string[]
    'Hero Image'?: any[]
    'Hero Video URL'?: string
    'SEO Title Override'?: string
    'SEO Description'?: string
    'Last Updated'?: string
  }
}

export interface AsbConsultantRecord {
  id: string
  fields: {
    'First Name'?: string
    'Last Name'?: string
    'Full Name'?: string
    'Slug'?: string
    'Status'?: 'Draft' | 'Approved' | 'Published on Site' | 'Archived'
    'Professional Title'?: string
    'Company / Firm'?: string
    'Location'?: string
    'Country'?: string
    'Works Across Regions'?: string[]
    'Typical Engagement Length'?: string
    'Availability Badge'?: string
    'Mode Badge'?: string
    'Positioning Badge'?: string
    'Years Consulting'?: number
    'Countries Worked'?: number
    'Flagship Outcome'?: string
    'Fee Range General'?: string
    'Consulting Day Rate Local'?: string
    'Consulting Day Rate Currency'?: string
    'Travel Regions'?: string[]
    'Clearances'?: string
    'Ideal Audience'?: string[]
    'Context Tags'?: string[]
    'Availability Window'?: string
    'Availability Notes'?: string
    'About'?: string
    'Expertise Areas'?: string[]
    'Industries'?: string[]
    'Tools & Methods'?: string[]
    'Services Overview'?: string
    'Case Studies Summary'?: string
    'Profile Image'?: any[]
    'Hero Image'?: any[]
    'Hero Video URL'?: string
    'CV Attachment'?: any[]
    'Case Pack Attachment'?: any[]
    'Other Documents'?: any[]
    'Related Videos'?: string[]
    'Featured on Consultants'?: boolean
    'Directory Order'?: number
    'SEO Title Override'?: string
    'SEO Description'?: string
  }
}
