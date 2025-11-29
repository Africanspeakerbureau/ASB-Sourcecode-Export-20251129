// Comprehensive field presets for admin backend edit forms
// Based on latest Airtable field specifications

export const fieldPresets = {
  "Speaker Applications": {
    "Industry": {
      type: "singleSelect",
      options: [
        "Technology", "Finance & Banking", "Healthcare & Medical", "Education", 
        "Government & Public Policy", "Non Profit and NGO", "Energy and Mining", 
        "Agriculture & Food", "Manufacturing", "Telecommunications", "Transport & Logistics", 
        "Real Estate & Construction", "Media & Entertainment", "Tourism & Hospitality", 
        "Retail and Consumer Goods", "Legal Services", "Consulting", "Research and Development", 
        "Arts and Cultures", "IT & AI", "Others"
      ]
    },
    "Years Experience": {
      type: "singleSelect",
      options: ["1-3 years", "4-5 years", "5-10 years", "10-15 years", "15-20 years", "20-25 years", "25 years +"]
    },
    "Speaking Experience": {
      type: "singleSelect",
      options: ["Beginner", "Intermediate", "Advanced", "Expert"]
    },
    "Number of Events": {
      type: "singleSelect",
      options: ["1-5 events", "6-10 events", "11-20 events", "21-50 events", "51-100 events", "100+ events"]
    },
    "Largest Audience": {
      type: "singleSelect",
      options: ["1-50", "51-200", "201-500", "500+"]
    },
    "Virtual Experience": {
      type: "singleSelect",
      options: ["None", "Limited", "Moderate", "Extensive"]
    },
    "Expertise Areas": {
      type: "multipleSelects",
      options: [
        "Business / Management", "Art / Culture", "Cities / Environment", "Economic  / Finance",
        "Facilitator / Moderator", "Future / Technology", "Government / Politics",
        "Innovation / Creativity", "Leadership / Motivation", "Society / Education", "Celebrity", "IT / AI"
      ]
    },
    "Target Audience": {
      type: "multipleSelects",
      options: [
        "Board of Directors / Board Committees",
        "C-Suite / Executive Leadership Team",
        "Senior Leaders (VP/Director)",
        "Middle Management (People Managers)",
        "Frontline Supervisors",
        "Frontline Staff / Operators",
        "High-Potentials / Emerging Leaders (HiPo)",
        "Women in Leadership (ERGs / Networks)",
        "Youth / Graduates / Early Career",
        "Sales Organisation (AEs, SEs, CS, Partners)",
        "Product / Engineering / Tech & Data",
        "HR / People & Culture",
        "Finance / Strategy",
        "Marketing / Brand / Comms / CX",
        "Operations / Supply Chain / PMO",
        "Entrepreneurs / SMEs & Startups",
        "Government Executives / Public Sector Leaders",
        "Municipal / Local Government Leaders",
        "Development / NGO / Multilateral Teams",
        "Universities / Business Schools / Educators",
        "Healthcare Professionals",
        "Energy / Mining Teams"
      ]
    },
    "Delivery Context": {
      type: "multipleSelects",
      options: [
        "Boardroom Advisory / Consulting",
        "Executive Leadership Programme / Academy Cohort",
        "Executive Offsite / Senior Getaway",
        "Succession / HiPo / OD Track",
        "Middle-Management Training (in-house)",
        "Frontline / Lower-Management Training",
        "Annual Leadership Conference / Town Hall",
        "Sales Kickoff / Sales Enablement (SKO)",
        "Executive Briefing Centre / External Organiser",
        "Keynote / Plenary — Workshop / Masterclass — Advisory (maps to your one-pager)",
        "Panel / Fireside / Moderation",
        "Coaching (1:1 / Team)",
        "Virtual Webinar / Studio"
      ]
    },
    "Fee Range Local": {
      type: "singleSelect",
      options: [
        "$500-$1 000", "$1 001-$2 500", "$2 501-$5 000", "$5 0001- $10 000",
        "$10 001 - $25 000", "$25 001 - $50 000", "$50 001 - $100 000", "$100 000+",
        "On request (TBD)", "On request"
      ]
    },
    "Fee Range Continental": {
      type: "singleSelect",
      options: [
        "$500-$1 000", "$1 001-$2 500", "$2 501-$5 000", "$5 0001- $10 000",
        "$10 001 - $25 000", "$25 001 - $50 000", "$50 001 - $100 000", "$100 000+",
        "On request (TBD)", "On request"
      ]
    },
    "Fee Range International": {
      type: "singleSelect",
      options: [
        "$500-$1 000", "$1 001-$2 500", "$2 501-$5 000", "$5 0001- $10 000",
        "$10 001 - $25 000", "$25 001 - $50 000", "$50 001 - $100 000", "$100 000+",
        "On request (TBD)", "On request"
      ]
    },
    "Fee Range Virtual": {
      type: "singleSelect",
      options: [
        "$500-$1 000", "$1 001-$2 500", "$2 501-$5 000", "$5 0001- $10 000",
        "$10 001 - $25 000", "$25 001 - $50 000", "$50 001 - $100 000", "$100 000+",
        "On request (TBD)", "On request"
      ]
    },
    "Fee Range General": {
      type: "singleSelect",
      options: ["$", "$$", "$$$", "$$$$", "$$$$$", "On Request"]
    },
    "Travel Willingness": {
      type: "singleSelect",
      options: ["Virtual Only", "Local Only", "Domestic", "International"]
    },
    "Country": {
      type: "singleSelect",
      options: [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", 
        "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", 
        "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", 
        "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", 
        "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", 
        "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", 
        "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", 
        "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. \"Swaziland\")", "Ethiopia", "Fiji", 
        "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", 
        "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", 
        "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", 
        "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", 
        "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", 
        "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", 
        "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", 
        "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", 
        "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", 
        "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", 
        "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
        "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", 
        "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", 
        "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", 
        "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", 
        "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", 
        "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", 
        "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
      ]
    },
    "Expertise Level": {
      type: "singleSelect",
      options: [
        "Entry Level", "Mid Level", "Senior Level", "Executive Level", "C-Suite", "Board Level", 
        "International Renown Expert", "International Renown Trainer", "Celebrity"
      ]
    },
    "Spoken Languages": {
      type: "multipleSelects",
      options: [
        "English", "French", "German", "Dutch", "Spanish", "Portuguese", "Russian", "Chinese", 
        "Hindi", "Arabic", "Swahili", "Amharic", "Yoruba", "Zulu", "Afrikaans", "Others"
      ]
    },
    "Featured": {
      type: "singleSelect",
      options: ["Yes", "No", "On review"]
    },
    "Status": {
      type: "multipleSelects",
      options: ["Pending", "Under Review", "Approved", "Rejected", "Featured", "Published on Site"]
    }
  },

  "Client Inquiries": {
    "Company Size": {
      type: "singleSelect",
      options: [
        "1 - 10 employees", "11 - 50 employees", "51 - 250 employees", 
        "251 - 500 employees", "501 - 1000 employees", "1000 + employees"
      ]
    },
    "Industry": {
      type: "singleSelect",
      options: [
        "Technology", "Finance & Banking", "Healthcare & Medical", "Education", 
        "Government & Public Policy", "Non Profit and NGO", "Energy and Mining", 
        "Agriculture & Food", "Manufacturing", "Telecommunications", "Transport & Logistics", 
        "Real Estate & Construction", "Media & Entertainment", "Tourism & Hospitality", 
        "Retail and Consumer Goods", "Legal Services", "Consulting", "Research and Development", 
        "Arts and Cultures", "IT & AI", "Others"
      ]
    },
    "Audience Size": {
      type: "singleSelect",
      options: ["Less than 50", "50-100", "100-500", "500-1000", "More than 1000"]
    },
    "Budget Range": {
      type: "singleSelect",
      options: [
        "Less than $1 000 / R20 000", "$1 000-$2 500 / R20 000 - R50 000", 
        "$2 500-$5 000 / R50000 - R100 000", "$5 000 - $10 000 / R100 000 - R200 000", 
        "More than $10 000 / R200 000"
      ]
    },
    "Presentation Format": {
      type: "singleSelect",
      options: ["In-Person", "Virtual", "Hybrid"]
    },
    "Status": {
      type: "singleSelect",
      options: ["New", "Contacted", "Proposal Sent", "Booked", "Completed", "Follow up Required"]
    }
  },

  "Quick Inquiries": {
    "Status": {
      type: "singleSelect",
      options: ["New", "Responded", "Closed", "Follow Up", "Assigned to Agent", "Spam"]
    }
  }
};

export default fieldPresets;

