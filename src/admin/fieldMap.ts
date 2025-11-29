// Exact Airtable column names (Speaker Applications)
export const F = {
  // About / Identity
  FirstName: "First Name",
  LastName: "Last Name",
  Title: "Title", // Dr/Prof honorific
  ProfessionalTitle: "Professional Title",
  Company: "Company",
  Location: "Location",
  Country: "Country", // singleSelect

  // Background
  Industry: "Industry", // singleSelect
  ExpertiseLevel: "Expertise Level", // singleSelect
  YearsExperience: "Years Experience", // singleSelect
  NotableAchievements: "Notable Achievements",
  Achievements: "Achievements",
  Education: "Education",

  // Experience
  SpeakingExperience: "Speaking Experience", // singleSelect
  NumberEvents: "Number of Events", // singleSelect
  LargestAudience: "Largest Audience", // singleSelect
  VirtualExperience: "Virtual Experience", // singleSelect
  TargetAudience: "Target Audience", // multipleSelects
  DeliveryContext: "Delivery Context", // multipleSelects

  // Expertise & Content
  ExpertiseAreas: "Expertise Areas", // multipleSelects
  SpeakingTopics: "Speaking Topics",
  KeyMessages: "Key Messages",
  ProfessionalBio: "Professional Bio",
  SpeechesDetailed: "Speeches Detailed",

  // Why booking
  DeliveryStyle: "Speakers Delivery Style",
  WhyListen: "Why the audience should listen to these topics",
  WillAddress: "What the speeches will address",
  WillLearn: "What participants will learn",
  TakeHome: "What the audience will take home",
  BenefitIndividual: "Benefits for the individual",
  BenefitOrg: "Benefits for the organisation",

  // Media & Languages
  Video1: "Video Link 1",
  Video2: "Video Link 2",
  Video3: "Video Link 3",
  SpokenLanguages: "Spoken Languages", // multipleSelects

  // Logistics & Fees
  FeeRangeLocal: "Fee Range Local", // singleSelect
  FeeRangeContinental: "Fee Range Continental", // singleSelect
  FeeRangeInternational: "Fee Range International", // singleSelect
  FeeRangeVirtual: "Fee Range Virtual", // singleSelect
  FeeRangeGeneral: "Fee Range General", // singleSelect
  DisplayFee: "Display Fee", // singleSelect (Yes/No)
  TravelWillingness: "Travel Willingness", // singleSelect
  TravelRequirements: "Travel Requirements",

  // Links & Admin
  Website: "Website",
  LinkedIn: "LinkedIn Profile",
  Twitter: "Twitter Profile", // some bases use "Twitter"; we set both below during save
  References: "References",
  PAName: "PA Name",
  PAEmail: "PA Email",
  PAPhone: "PA Phone",
  Banking: "Banking Details",
  AdditionalInfo: "Additional Information",

  // Images (attachments)
  ProfileImage: "Profile Image",
  HeaderImage: "Header Image",

  // Internal
  Status: "Status", // multipleSelects
  CreatedDate: "Created Date",
  Featured: "Featured", // singleSelect
  ClientInquiries: "Client Inquiries", // linked records, we’ll not mutate
  InternalNotes: "Internal Notes",

  // Read-only formulas
  ExperienceScore: "Experience Score",
  TotalEvents: "Total Events",
  PotentialRevenue: "Potential Revenue",
} as const;
