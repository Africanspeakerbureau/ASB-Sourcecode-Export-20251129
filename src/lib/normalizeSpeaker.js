// Basic slugification used across admin and site
export const basicSlugify = (s = '') =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Normalizes a speaker Airtable record safely.
export function normalizeSpeaker(rec) {
  const f = (rec && rec.fields) || {};
  const arr = v => (Array.isArray(v) ? v : v ? [v] : []);
  const first = a => (Array.isArray(a) && a.length ? a[0] : undefined);

  const profAtt = first(arr(f['Profile Image']));
  const headerAtt = first(arr(f['Header Image']));

  const photoUrl =
    profAtt?.thumbnails?.large?.url ||
    profAtt?.url ||
    ''; // leave empty -> UI shows built-in “No image” tile

  const headerUrl =
    headerAtt?.thumbnails?.large?.url ||
    headerAtt?.url ||
    '';

  const video1 = f['Video Link 1'] || '';
  const video2 = f['Video Link 2'] || '';
  const video3 = f['Video Link 3'] || '';

  const firstName = (f['First Name'] || '').trim();
  const lastName  = (f['Last Name'] || '').trim();
  const fullName  = (f['Full Name'] || `${firstName} ${lastName}`).trim();
  const honorific = (f['Title'] || '').trim();

  const slugFormula = (f['Slug'] || '').toString().trim();
  const slugOverride = (f['Slug Override'] || '').toString().trim();
  // canonical slug used everywhere
  const slug = (slugOverride || slugFormula || basicSlugify(fullName)).trim();

  const status = arr(f['Status']).map(s => s?.name || s);
  const featuredSelect = f['Featured']?.name || f['Featured'];
  const featured = (featuredSelect === 'Yes') || status.includes('Featured');

  const languages = arr(f['Spoken Languages']).map(s => s?.name || s);
  const country = (typeof f['Country'] === 'string')
    ? f['Country']
    : f['Country']?.name || f['Location'] || '';
  const expertiseAreas = arr(f['Expertise Areas']).map(s => s?.name || s);

  return {
    id: rec.id,
    slug,
    slugFormula,
    slugOverride,
    name: fullName,
    fullName,
    firstName,
    lastName,
    title: honorific,
    professionalTitle: f['Professional Title'] || '',
    company: f['Company'] || '',
    country,
    languages,
    spokenLanguages: languages,
    expertiseAreas,
    expertise: expertiseAreas,
    featured,
    photoUrl,
    headerUrl,
    videos: [video1, video2, video3].filter(Boolean),
    status,
    slackUrl: f['Slack URL'] || f['Slack'] || '',

    // detail fields (kept so profile page has data)
    bio: f['Professional Bio'] || '',
    achievements: f['Achievements'] || '',
    education: f['Education'] || '',

    // --- What You’ll Get (Airtable exact names) ---
    // Use the exact Airtable field names you provided and expose them as props consumed by SpeakerProfile.jsx
    keyMessages:          f['Key Messages'] || '',
    keyMessage:           f['Key Messages'] || '',      // keep both for backward compatibility
    deliveryStyle:        f['Speakers Delivery Style'] || '',
    whyListen:            f['Why the audience should listen to these topics'] || '',
    whatAddress:          f['What the speeches will address'] || '',
    whatLearn:            f['What participants will learn'] || '',
    whatTakeHome:         f['What the audience will take home'] || '',
    benefitsIndividual:   f['Benefits for the individual'] || '',
    benefitsOrganisation: f['Benefits for the organisation'] || '',

    feeRangeGeneral: f['Fee Range General'] || '',
    displayFee: f['Display Fee'] || '',
    availability: f['Travel Willingness'] || '',
    travelWillingness: f['Travel Willingness'] || '',
    topics: f['Speaking Topics'] || '',
    speakingTopics: f['Speaking Topics'] || '',
    location: f['Location'] || '',
    targetAudience: arr(f['Target Audience']).map(s => s?.name || s),
    deliveryContext: arr(f['Delivery Context']).map(s => s?.name || s),
    feeRangeLocal: f['Fee Range Local'] || '',
    feeRangeContinental: f['Fee Range Continental'] || '',
    feeRangeInternational: f['Fee Range International'] || '',
    feeRangeVirtual: f['Fee Range Virtual'] || '',
    speechesDetailed: f['Speeches Detailed'] || '',
  };
}
