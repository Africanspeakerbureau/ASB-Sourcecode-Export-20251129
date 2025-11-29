export interface AcademyLandingRecord {
  id: string;
  fields: {
    'Page Name'?: string;
    'URL Slug'?: string;
    'Status'?: 'Draft' | 'Approved' | 'Published on Site' | 'Archived';
    'Hero Heading'?: string;
    'Hero Subheading'?: string;
    'Hero Intro Text'?: string;
    'Hero CTA Label'?: string;
    'Hero CTA URL'?: string;
    'Intro Section Title'?: string;
    'Intro Section Body'?: string;
    'Audience Summary'?: string;
    'Highlight Bullets'?: string;
    'Featured Courses'?: string[];
    'Hero Image'?: any[];
    'SEO Title Override'?: string;
    'SEO Description'?: string;
  };
}

export interface AcademyCourseRecord {
  id: string;
  fields: {
    'Course Name'?: string;
    'Slug'?: string;
    'Status'?: 'Draft' | 'Approved' | 'Published on Site' | 'Archived';
    'Category'?:
      | 'Leadership'
      | 'Strategy & Execution'
      | 'Culture & People'
      | 'Sales & Influence'
      | 'AI & Future of Work'
      | 'Personal Mastery'
      | 'Other';
    'Course Type'?:
      | 'Online Programme'
      | 'In-person Workshop'
      | 'Masterclass'
      | 'Keynote + Lab'
      | 'Self-paced Course';
    'Level'?: 'Introductory' | 'Intermediate' | 'Advanced' | 'Executive';
    'Short Tagline'?: string;
    'Short Description'?: string;
    'Long Description'?: string;
    'Key Outcomes'?: string;
    'Key Topics'?: string;
    'Ideal Audience'?: string;
    'Duration'?: string;
    'Delivery Mode'?: 'Live Online' | 'In-person' | 'Hybrid' | 'Self-paced';
    'Format Details'?: string;
    'Language'?: 'English' | 'French' | 'Portuguese' | 'Arabic' | 'Other';
    'Primary Region'?: 'South Africa' | 'Rest of Africa' | 'Global';
    'Lead Instructor (Speaker)'?: string[];
    'Supporting Instructors'?: string[];
    'External Course URL'?: string;
    'External Enquiry Email'?: string;
    'Price From'?: number;
    'Currency'?: 'ZAR' | 'USD' | 'EUR' | 'GBP' | 'Other';
    'Hero Image'?: any[];
    'Thumbnail Image'?: any[];
    'Display Order'?: number;
    'Featured on Academy'?: boolean;
    'Tags'?: string[];
    'SEO Title Override'?: string;
    'SEO Description'?: string;
  };
}
