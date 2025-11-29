/* eslint-disable */
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import SectionTitle from '@/components/SectionTitle'
import BottomCta from '@/components/BottomCta'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { supabase } from '@/lib/supabaseClient'
import { getLocationAndRate } from './lib/geo.js'
import {
  getSpeakerApplications,
  getClientInquiries,
  getQuickInquiries,
  fetchSpeakersForListing,
  getSpeakerBySlugOrId,
  isAirtableId,
  listSpeakersAll,
  fetchSpeakerForDetail
} from '@/lib/airtable'
import fieldOptions from './FieldOptions.js'
import { fieldPresets } from './utils/fieldPresets.js'
import { Cloudinary } from "@cloudinary/url-gen"
import { AdvancedImage, placeholder } from "@cloudinary/react"
import { CLOUDINARY } from "@/config/cloudinary";
import AdminLoginModal from "./components/AdminLoginModal"
import SpeakerEditDialog from "./admin/components/Edit/SpeakerEditDialog"
import QuickInquiryEditDialog from "./admin/components/Edit/QuickInquiryEditDialog"
import ClientInquiryEditDialog from "./admin/components/Edit/ClientInquiryEditDialog"
import { toast } from "./lib/toast"
import { validateAdmin } from "./utils/auth"
import ConsentBanner from "@/components/ConsentBanner"
import { getConsent } from "@/lib/consent"
import { useGeolocation } from "@/hooks/useGeolocation"
import ApplyBeta from "./public/apply-beta/ApplyBeta"
import { getAllPublishedSpeakersCached } from '@/lib/speakers'
import { BOOK_ROUTE } from '@/lib/booking'
import WhatsAppButton from '@/components/WhatsAppButton'
import { waMsgGeneral } from '@/lib/whatsapp'
import { lazyImgProps } from '@/lib/img'
import { useInView } from '@/hooks/useInView'
import { SELECTS } from '@/constants/speakerEnums'

const EXPERTISE_OPTIONS = SELECTS['Expertise Areas']

const FeaturedSpeakers = lazy(() => import('./sections/FeaturedSpeakers'))
const MeetOurSpeakers = lazy(() => import('./sections/MeetOurSpeakers'))
const FindSpeakersPage = lazy(() => import('./components/FindSpeakersPage'))
const SpeakerProfile = lazy(() => import('./components/SpeakerProfile'))
const PlanYourEvent = lazy(() => import('./sections/PlanYourEvent'))
const HomeInsights = lazy(() => import('./site/home/HomeInsights'))
const HomeInterviewsSection = lazy(() => import('@/features/home/HomeInterviewsSection'))

// Field presets mapping for dropdowns
const FIELD_PRESETS = {
  "Industry": {
    fieldType: "singleSelect",
    presetValues: "Agriculture & Food | Arts and Cultures | Business / Management  | Consulting | Education | Energy and Mining | Finance & Banking | Government & Public Policy | Healthcare & Medical | IT & AI | Legal Services | Manufacturing | Media & Entertainment | Non Profit and NGO | Others | Real Estate & Construction | Research and Development | Retail and Consumer Goods | Technology | Telecommunications | Tourism & Hospitality | Transport & Logistics"
  },
  "Years Experience": {
    fieldType: "singleSelect",
    presetValues: "1-3 years | 4-5 years | 5-10 years | 10-15 years | 15-20 years | 20-25 years | 25 years +"
  },
  "Speaking Experience": {
    fieldType: "singleSelect",
    presetValues: "Beginner | Intermediate | Advanced | Expert"
  },
  "Number of Events": {
    fieldType: "singleSelect",
    presetValues: "1-5 events | 6-10 events | 11-20 events | 21-50 events | 51-100 events | 100 - 500 | 500+"
  },
  "Largest Audience": {
    fieldType: "singleSelect",
    presetValues: "1-50 | 51-200 | 201-500 | 500 - 1000 | 1000 - 5000 | 5000+"
  },
  "Virtual Experience": {
    fieldType: "singleSelect",
    presetValues: "None | Limited | Moderate | Extensive | Experienced"
  },
  "Travel Willingness": {
    fieldType: "singleSelect",
    presetValues: "Virtual Only | Local Only | Domestic | International | On request"
  },
  "Country": {
    fieldType: "singleSelect",
    presetValues: "Afghanistan | Albania | Algeria | Andorra | Angola | Antigua and Barbuda | Argentina | Armenia | Australia | Austria | Azerbaijan | Bahamas | Bahrain | Bangladesh | Barbados | Belarus | Belgium | Belize | Benin | Bhutan | Bolivia | Bosnia and Herzegovina | Botswana | Brazil | Brunei | Bulgaria | Burkina Faso | Burundi | Cabo Verde | Cambodia | Cameroon | Canada | Central African Republic | Chad | Chile | China | Colombia | Comoros | Congo (Congo-Brazzaville) | Costa Rica | Croatia | Cuba | Cyprus | Czechia (Czech Republic) | Democratic Republic of the Congo | Denmark | Djibouti | Dominica | Dominican Republic | Ecuador | Egypt | El Salvador | Equatorial Guinea | Eritrea | Estonia | Eswatini (fmr. \"Swaziland\") | Ethiopia | Fiji | Finland | France | Gabon | Gambia | Georgia | Germany | Ghana | Greece | Grenada | Guatemala | Guinea | Guinea-Bissau | Guyana | Haiti | Holy See | Honduras | Hungary | Iceland | India | Indonesia | Iran | Iraq | Ireland | Israel | Italy | Jamaica | Japan | Jordan | Kazakhstan | Kenya | Kiribati | Kuwait | Kyrgyzstan | Laos | Latvia | Lebanon | Lesotho | Liberia | Libya | Liechtenstein | Lithuania | Luxembourg | Madagascar | Malawi | Malaysia | Maldives | Mali | Malta | Marshall Islands | Mauritania | Mauritius | Mexico | Micronesia | Moldova | Monaco | Mongolia | Montenegro | Morocco | Mozambique | Myanmar (formerly Burma) | Namibia | Nauru | Nepal | Netherlands | New Zealand | Nicaragua | Niger | Nigeria | North Korea | North Macedonia | Norway | Oman | Pakistan | Palau | Palestine State | Panama | Papua New Guinea | Paraguay | Peru | Philippines | Poland | Portugal | Qatar | Romania | Russia | Rwanda | Saint Kitts and Nevis | Saint Lucia | Saint Vincent and the Grenadines | Samoa | San Marino | Sao Tome and Principe | Saudi Arabia | Senegal | Serbia | Seychelles | Sierra Leone | Singapore | Slovakia | Slovenia | Solomon Islands | Somalia | South Africa | South Korea | South Sudan | Spain | Sri Lanka | Sudan | Suriname | Sweden | Switzerland | Syria | Tajikistan | Tanzania | Thailand | Timor-Leste | Togo | Tonga | Trinidad and Tobago | Tunisia | Turkey | Turkmenistan | Tuvalu | Uganda | Ukraine | United Arab Emirates | United Kingdom | United States of America | Uruguay | Uzbekistan | Vanuatu | Venezuela | Vietnam | Yemen | Zambia | Zimbabwe"
  },
  "Expertise Level": {
    fieldType: "singleSelect",
    presetValues: "Entry Level | Mid Level | Senior Level | Executive Level | C-Suite | Board Level | International Renown Expert | International Renown Trainer | Celebrity"
  },
  "Company Size": {
    fieldType: "singleSelect",
    presetValues: "1 - 10 employees | 11 - 50 employees | 51 - 250 employees | 251 - 500 employees | 501 - 1000 employees | 1000 + employees"
  },
  "Audience Size": {
    fieldType: "singleSelect",
    presetValues: "Less than 50 | 50-100 | 100-500 | 500-1000 | More than 1000"
  },
  "Budget Range": {
    fieldType: "singleSelect",
    presetValues: "Less than $1 000 / R20 000 | $1 000-$2 500 / R20 000 - R50 000 | $2 500-$5 000 / R50000 - R100 000 | $5 000 - $10 000 / R100 000 - R200 000 | More than $10 000 / R200 000"
  },
  "Presentation Format": {
    fieldType: "singleSelect",
    presetValues: "In-Person | Virtual | Hybrid"
  },
  "Spoken Languages": {
    fieldType: "multipleSelects",
    presetValues: "English | Afrikaans | Zulu | Xhosa | Sotho | Tswana | Tsonga | Swati | Venda | Ndebele | French | Portuguese | Arabic | Swahili | Amharic | Yoruba | Igbo | Hausa | Dutch | Others"
  }
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Star, MapPin, Users, Calendar, Award, Globe, ChevronRight, Search, Mail, Building, Edit, Trash2, Download, Filter, RefreshCw, Eye, CheckCircle, XCircle, Clock, AlertCircle, Menu } from 'lucide-react'
import './App.css'
import heroImage from './assets/hero_background_professional.webp'
import heroBg1 from './assets/hero-bg-1.jpg'
import heroBg2 from './assets/hero-bg-2.jpg'
import heroBg3 from './assets/hero-bg-3.jpg'
import heroMeeting from './assets/hero_background_meeting.webp'
import heroWebinar from './assets/hero_webinar_virtual.webp'
import heroConference from './assets/hero_conference.jpg'
import heroTechSummit from './assets/hero_tech_summit.jpg'
import heroExecutiveAI from './assets/hero_executive_ai_training.jpg'
import heroCorporateLeadership from './assets/hero_corporate_leadership_conference.jpg'
import heroVirtualSeminars from './assets/hero_virtual_seminars_webinars.jpg'

function App() {
  // Cloudinary configuration
  const cld = new Cloudinary({
    cloud: {
      cloudName: CLOUDINARY.cloudName,
    },
  })
  
  const widgetRef = useRef()
  const navigate = useNavigate()
  const location = useLocation()
  const AUTO_REDIRECT_FROM = new Set(['/speaker-login', '/speaker-callback'])
  
  // State variables
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || '/')
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('asb_admin') === '1')
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedSpeakerId, setSelectedSpeakerId] = useState(null)
  const [selectedSpeakerSlug, setSelectedSpeakerSlug] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { ref: featuredRef, inView: featuredInView } = useInView({ rootMargin: '200px' })
  const { ref: meetRef, inView: meetInView } = useInView({ rootMargin: '200px' })
  const { ref: interviewsRef, inView: interviewsInView } = useInView({ rootMargin: '200px' })
  const { ref: insightsRef, inView: insightsInView } = useInView({ rootMargin: '200px' })
  const { ref: planRef, inView: planInView } = useInView({ rootMargin: '200px' })
  const [clientForm, setClientForm] = useState({})
  const [quickForm, setQuickForm] = useState({})
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' })
  const [quickStatus, setQuickStatus] = useState('idle')
  const [quickError, setQuickError] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [attachments, setAttachments] = useState([])
  
  // Admin Dashboard State
  const [apps, setApps] = useState([])
  const [clients, setClients] = useState([])
  const [quick, setQuick] = useState([])
  const [speakers, setSpeakers] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [priceRangeFilter, setPriceRangeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('speakers')
  const [selectedService, setSelectedService] = useState('keynote-speakers')

  // Handle Supabase magic-link returns (hash or code) globally.
  useEffect(() => {
    const bootstrapFromUrl = async () => {
      try {
        const { hash, search, pathname } = window.location
        const raw = (location.hash?.slice(1) || location.pathname || '/')
        const path = raw.startsWith('/') ? raw : `/${raw}`
        if (hash && hash.includes('access_token=')) {
          const sp = new URLSearchParams(hash.slice(1))
          const access_token = sp.get('access_token')
          const refresh_token = sp.get('refresh_token')
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token })
            window.history.replaceState({}, '', pathname + '#/')
            if (AUTO_REDIRECT_FROM.has(path)) {
              navigate('/speaker-dashboard', { replace: true })
            }
            return
          }
        }
        const qs = new URLSearchParams(search)
        const code = qs.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (!error) {
            window.history.replaceState({}, '', pathname + window.location.hash)
            if (AUTO_REDIRECT_FROM.has(path)) {
              navigate('/speaker-dashboard', { replace: true })
            }
          }
        }
      } catch { /* no-op */ }
    }
    bootstrapFromUrl()
  }, [navigate, location])


  const hashToService = {
    'keynotes': 'keynote-speakers',
    'panel-discussions': 'panel-discussions',
    'boardroom-consulting': 'boardroom-consulting',
    'workshops': 'workshop-facilitators',
    'virtual-events': 'virtual-events',
    'leadership-coaching': 'leadership-coaching'
  }
  const serviceToHash = Object.fromEntries(
    Object.entries(hashToService).map(([k, v]) => [v, k])
  )
  const [editCtx, setEditCtx] = useState({ open: false, table: '', recordId: '' })

  const handleEdit = (table, recordId) => {
    setEditCtx({ open: true, table, recordId })
    toast('Edit opened')
  }
  const closeEdit = () => setEditCtx({ open: false, table: '', recordId: '' })

  const data = activeTab === 'speakers' ? apps : activeTab === 'clients' ? clients : quick

  useEffect(() => {
    window.__asbOpenEdit = (id, table = 'Speaker Applications') => {
      handleEdit(table, id)
    }
    return () => { try { delete window.__asbOpenEdit } catch {} }
  }, [])

  const handleNav = (e) => {
    e.preventDefault()
    const href = e.currentTarget.getAttribute('href')
    window.history.pushState({}, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  const go = (path) => {
    const target = path.startsWith('#') ? path : `#${path}`
    window.history.pushState({}, '', target)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  function closeAdminModal() {
    window.history.replaceState({}, '', '#/')
    setRoute('/')
    setCurrentPage('home')
  }

  

  useEffect(() => {
    const syncAndScroll = () => {
      if (editCtx.open) return
      const fullHash = window.location.hash || ''
      const [pathPart, anchor] = fullHash.replace(/^#/, '').split('#')
      const pathname = pathPart || '/'
      const id = anchor ? decodeURIComponent(anchor) : ''
      setRoute(pathname)

      if (pathname === '/admin') {
        setCurrentPage('admin')
        return
      }

      // Path → state
      if (pathname === '/find-speakers') {
        setCurrentPage('find-speakers')
        setSelectedSpeakerId(null)
        setSelectedSpeakerSlug(null)
      } else if (pathname.startsWith('/speaker/')) {
        const keyRaw = pathname.split('/speaker/')[1] || ''
        const key = decodeURIComponent(keyRaw).trim()
        const isRecordId = isAirtableId(key)
        if (isRecordId) {
          setSelectedSpeakerId(key)
          setSelectedSpeakerSlug(null)
        } else {
          setSelectedSpeakerId(null)
          setSelectedSpeakerSlug(key.toLowerCase())
        }
        setCurrentPage('speaker-profile')
      } else if (pathname === '/services') {
        setCurrentPage('services')
        setSelectedSpeakerId(null)
        setSelectedSpeakerSlug(null)
      } else if (pathname === '/about') {
        setCurrentPage('about')
        setSelectedSpeakerId(null)
        setSelectedSpeakerSlug(null)
      } else if (pathname === '/speaker-application') {
        setCurrentPage('speaker-application')
        setSelectedSpeakerId(null)
        setSelectedSpeakerSlug(null)
      } else if (pathname === '/apply-card-v1') {
        setCurrentPage('apply-beta')
        setSelectedSpeakerId(null)
        setSelectedSpeakerSlug(null)
      } else if (pathname === '/apply-v2') {
        setCurrentPage('speaker-application-v2')
        setSelectedSpeakerId(null)
        setSelectedSpeakerSlug(null)
      } else {
        setCurrentPage('home')
        setSelectedSpeakerId(null)
        setSelectedSpeakerSlug(null)
      }

      if (pathname === '/services' && id && hashToService[id]) {
        setSelectedService(hashToService[id])
      }

      // Scroll after view mounts for hash anchors
      requestAnimationFrame(() => {
        if (anchor) {
          const el = document.getElementById(id)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    }

    syncAndScroll()
    window.addEventListener('popstate', syncAndScroll)
    window.addEventListener('hashchange', syncAndScroll)
    return () => {
      window.removeEventListener('popstate', syncAndScroll)
      window.removeEventListener('hashchange', syncAndScroll)
    }
  }, [editCtx.open])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const [a, c, q] = await Promise.all([
          getSpeakerApplications(),
          getClientInquiries(),
          getQuickInquiries(),
        ])
        if (!alive) return
        setApps(a); setClients(c); setQuick(q)
      } catch (e) {
        console.error('Admin data load failed', e)
        if (!alive) return
        setApps([]); setClients([]); setQuick([])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const rows = await fetchSpeakersForListing()
        if (alive) setSpeakers(rows)
      } catch (e) {
        console.error('Failed to load speakers:', e?.status || '', e?.body || e)
      }
    })()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    getAllPublishedSpeakersCached(listSpeakersAll).catch(() => {});
  }, [])

  useEffect(() => {
    (async () => {
      const setCanonicalHash = (slug) => {
        if (!slug) return;
        const target = `#/speaker/${encodeURIComponent(slug.toLowerCase())}`;
        if (window.location.hash !== target) {
          window.history.replaceState({}, '', target);
        }
      };

      const key = selectedSpeakerSlug || selectedSpeakerId;
      if (!key) return;

      let rec = speakers?.find?.(
        r => r.id === key || (r.slug || '').toLowerCase() === String(key).toLowerCase()
      );

      if (!rec) {
        try {
          if (selectedSpeakerSlug) {
            rec = await fetchSpeakerForDetail(selectedSpeakerSlug);
          } else if (selectedSpeakerId) {
            rec = await getSpeakerBySlugOrId(selectedSpeakerId);
          }
        } catch (e) {
          console.warn('fetch speaker failed', e);
        }
        if (rec) {
          setSpeakers(prev => {
            const list = Array.isArray(prev) ? prev.slice() : [];
            if (!list.some(s => s.id === rec.id)) list.push(rec);
            return list;
          });
        }
      }

      if (rec) {
        setSelectedSpeakerId(rec.id);
        setCanonicalHash(rec.slug);
      }
    })();
  }, [selectedSpeakerSlug, selectedSpeakerId, speakers]);

  // Currency state
  const [currency, setCurrency] = useState('ZAR');
  const [countryCode, setCountryCode] = useState('ZA');
  const [currencyInfo, setCurrencyInfo] = useState({ currency: 'ZAR', rate: 1 });

  const consent = getConsent();
  const { request } = useGeolocation(consent.geo === true);

  const banner = consent.geo === null ? (
    <ConsentBanner onAllow={() => {
      request();
    }} />
  ) : null;

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage('find-speakers')
  }

  // Airtable configuration
  const AIRTABLE_API_KEY =
    import.meta.env.VITE_AIRTABLE_API_KEY || import.meta.env.AIRTABLE_API_KEY
  const BASE_ID =
    import.meta.env.VITE_AIRTABLE_BASE_ID || import.meta.env.AIRTABLE_BASE_ID

  const heroSlides = [
    {
      image: heroBg1,
      title: 'Innovation Summit',
      subtitle: 'Technology leaders sharing breakthrough insights with industry pioneers'
    },
    {
      image: heroWebinar,
      title: 'Dynamic Conference Speaking',
      subtitle: 'Engaging large audiences with compelling presentations'
    },
    {
      image: heroImage,
      title: 'Executive Board Presentations',
      subtitle: 'Strategic insights for C-suite decision makers'
    },
    {
      image: heroMeeting,
      title: 'International Webinar',
      subtitle: 'Global expert presenting to diverse virtual audience across continents'
    },
    {
      image: heroBg3,
      title: 'Strategic Planning Session',
      subtitle: 'African business leaders facilitating high-level strategic discussions'
    },
    {
      image: heroBg2,
      title: 'Leadership Development Workshop',
      subtitle: 'Empowering next generation leaders with African leadership insights'
    },
    {
      image: heroCorporateLeadership,
      title: 'Corporate Leadership Conference',
      subtitle: 'Leading African expert addressing top executives at high-level corporate event'
    },
    {
      image: heroExecutiveAI,
      title: 'Executive AI Training',
      subtitle: 'African expert teaching AI strategies to diverse executive team'
    },
    {
      image: heroVirtualSeminars,
      title: 'Virtual Seminars & Webinars',
      subtitle: 'Global reach through digital platforms'
    }
  ]

  useEffect(() => {
    if (editCtx.open) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [editCtx.open])

  // Initialize currency conversion
  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        const { country, currency, rate } = await getLocationAndRate()
        setCountryCode(country)
        setCurrency(currency)
        setCurrencyInfo({ currency, rate })
      } catch (error) {
        console.error('Failed to get currency info:', error)
        // Keep default USD
      }
    }
    initializeCurrency()
  }, [])
  // Initialize Cloudinary upload widget
  useEffect(() => {
    if (window.cloudinary) {
      widgetRef.current = window.cloudinary.createUploadWidget({
        cloudName: CLOUDINARY.cloudName,
        uploadPreset: CLOUDINARY.uploadPreset,
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: false,
        folder: "speakers",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxFileSize: 5000000, // 5MB
        maxImageWidth: 2000,
        maxImageHeight: 2000
      }, (error, result) => {
        if (!error && result && result.event === "success") {
          console.log("Uploaded to Cloudinary:", result.info)
          setProfileImageUrl(result.info.secure_url)
        }
        if (error) {
          console.error("Cloudinary upload error:", error)
        }
      })
    }
  }, [])

  const openCloudinaryWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open()
    }
  }

  const submitToAirtable = async (tableName, data) => {
    try {
      setSubmitStatus({ type: 'loading', message: 'Submitting...' })
      
      console.log('Submitting to Airtable:', { tableName, data })
      
      // Don't send any internal-only fields (Status, Featured, etc.)
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([k]) => !['Status', 'Featured'].includes(k))
      );

      // Add default status for backend (array for multi-select, string for single-select)
      if (tableName === 'Speaker%20Applications') {
        filteredData['Status'] = ['Pending'];
      } else if (tableName === 'Client%20Inquiries' || tableName === 'Quick%20Inquiries') {
        filteredData['Status'] = 'New';
      }
      
      console.log('Filtered data for submission:', filteredData);
      
      const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: filteredData
        })
      })

      console.log('Response status:', response.status)
      const responseText = await response.text()
      console.log('Response text:', responseText)

      if (response.ok) {
        const responseData = JSON.parse(responseText)
        setSubmitStatus({ type: 'success', message: 'Application submitted successfully! We will review your information and get back to you soon.' })
        return { success: true, data: responseData }
      } else {
        throw new Error(`Submission failed: ${response.status} - ${responseText}`)
      }
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitStatus({ type: 'error', message: `There was an error submitting your application: ${error.message}. Please try again.` })
      return { success: false, error: error.message }
    }
  }

  // Admin Functions
  const loadAdminData = async () => {
    setLoading(true)
    try {
      const [a, c, q] = await Promise.all([
        getSpeakerApplications(),
        getClientInquiries(),
        getQuickInquiries(),
      ])
      setApps(a); setClients(c); setQuick(q)
    } catch (error) {
      console.error('Admin data load failed', error)
      setApps([]); setClients([]); setQuick([])
      setSubmitStatus({ type: 'error', message: 'Error loading data. Please try again.' })
    }
    setLoading(false)
  }

  const updateRecord = async (tableName, recordId, fields) => {
    try {
      // Airtable singleSelect expects a string that matches an option name.
      // (If a caller accidentally passes an array, take the first item.)
      const processedFields = { ...fields };
      if (processedFields.Status != null) {
        processedFields.Status = Array.isArray(processedFields.Status)
          ? String(processedFields.Status[0] ?? '')
          : String(processedFields.Status);
        if (!processedFields.Status) delete processedFields.Status; // let Airtable default (e.g. "New")
      }
      
      const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableName}/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: processedFields })
      })

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Record updated successfully!' })
        loadAdminData() // Reload data
        return true
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Error updating record. Please try again.' })
      return false
    }
  }

  const deleteRecord = async (tableName, recordId) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableName}/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      })

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Record deleted successfully!' })
        loadAdminData() // Reload data
        return true
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Error deleting record. Please try again.' })
      return false
    }
  }

  const exportToCSV = (data, filename) => {
    if (!data.length) return

    const { id: _id, ...first } = data[0]
    const headers = Object.keys(first)
    const csvContent = [
      headers.join(','),
      ...data.map(record =>
        headers.map(header =>
          `"${(record[header] || '').toString().replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Under Review': { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      'Approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Rejected': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'New': { color: 'bg-purple-100 text-purple-800', icon: Clock }
    }

    const value = Array.isArray(status) ? status[0] : status
    const config = statusConfig[value] || statusConfig['Pending']
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {value}
      </Badge>
    )
  }

  const filteredData = (data) => {
    return data.filter(record => {
      const matchesSearch =
        searchTerm === '' ||
        Object.values(record).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )

      const matchesStatus =
        statusFilter === 'all' ||
        (Array.isArray(record.Status)
          ? record.Status.includes(statusFilter)
          : record.Status === statusFilter)

      return matchesSearch && matchesStatus
    })
  }


  const handleSpeakerSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus({ type: 'loading', message: 'Submitting your application...' })
    
    const formData = new FormData(e.target)
    
    // Validate Virtual Experience field
    const virtualExp = formData.get('virtualExperience');
    if (!fieldOptions['Speaker Applications']['Virtual Experience'].includes(virtualExp)) {
      setSubmitStatus({ type: 'error', message: 'Invalid Virtual Experience selection. Please choose from the available options.' });
      return;
    }

    // Validate Expertise Areas field
    const validExpertise = EXPERTISE_OPTIONS;
    const chosenExpertise = Array.from(formData.getAll('expertiseAreas'));
    const invalidExpertise = chosenExpertise.filter(e => !validExpertise.includes(e));
    if (invalidExpertise.length > 0) {
      setSubmitStatus({ type: 'error', message: 'Invalid Expertise Areas selected. Please choose from the available options.' });
      return;
    }
    
    // Submit all available fields to Airtable
    const data = {
      "First Name": formData.get('firstName'),
      "Last Name": formData.get('lastName'),
      "Email": formData.get('email'),
      "Phone": formData.get('phone'),
      "Location": formData.get('location'),
      "Country": formData.get('country'),
      "Professional Title": formData.get('title'),
      "Company": formData.get('company'),
      "Industry": formData.get('industry'),
      "Years Experience": formData.get('experience'),
      "Speaking Experience": formData.get('speakingExperience'),
      "Number of Events": formData.get('numberOfEvents'),
      "Largest Audience": formData.get('largestAudience'),
      "Virtual Experience": formData.get('virtualExperience'),
      "Expertise Areas": Array.from(formData.getAll('expertiseAreas')),
      "Speaking Topics": formData.get('speakingTopics'),
      "Key Messages": formData.get('keyMessages'),
      "Professional Bio": formData.get('bio'),
      "Achievements": formData.get('achievements'),
      "Education": formData.get('education'),
      "Fee Range Local": formData.get('feeRangeLocal'),
      "Fee Range Continental": formData.get('feeRangeContinental'),
      "Fee Range International": formData.get('feeRangeInternational'),
      "Fee Range Virtual": formData.get('feeRangeVirtual'),
      "Fee Range General": formData.get('feeRangeGeneral'),
      "Travel Willingness": formData.get('travelWillingness'),
      "Travel Requirements": formData.get('travelRequirements'),
      "Website": formData.get('website'),
      "LinkedIn": formData.get('linkedin'),
      "Twitter": formData.get('twitter'),
      "References": formData.get('references'),
      "Banking Details": formData.get('bankingDetails'),
      "PA Name": formData.get('paName'),
      "PA Email": formData.get('paEmail'),
      "PA Phone": formData.get('paPhone'),
      "Special Requirements": formData.get('specialRequirements'),
      "Additional Info": formData.get('additionalInfo'),
      "Video Link 1": formData.get('videoLink1'),
      "Video Link 2": formData.get('videoLink2'),
      "Video Link 3": formData.get('videoLink3'),
      "Profile Image": profileImageUrl ? [{ url: profileImageUrl }] : undefined,
      "Spoken Languages": Array.from(formData.getAll('spokenLanguages')),
      "Expertise Level": formData.get('expertiseLevel'),
      "Notable Achievements": formData.get('notableAchievements'),
      "Status": ["Pending"]
    }

    console.log('Submitting full data:', data)
    const result = await submitToAirtable('Speaker%20Applications', data)
    if (result.success) {
      // Set attachments from Airtable response for preview
      if (result.data.fields && result.data.fields['Profile Image']) {
        setAttachments(result.data.fields['Profile Image'])
      }
      e.target.reset()
      setProfileImageUrl('')
      setTimeout(() => setSubmitStatus({ type: '', message: '' }), 5000)
    }
  }

  const handleSpeakerSubmitV2 = async (e) => {
    e.preventDefault()
    setSubmitStatus({ type: 'loading', message: 'Submitting your application...' })

    const formData = new FormData(e.target)

    const virtualExp = formData.get('virtualExperience');
    if (!fieldOptions['Speaker Applications']['Virtual Experience'].includes(virtualExp)) {
      setSubmitStatus({ type: 'error', message: 'Invalid Virtual Experience selection. Please choose from the available options.' });
      return;
    }

    const validExpertise = EXPERTISE_OPTIONS;
    const chosenExpertise = Array.from(formData.getAll('expertiseAreas'));
    const invalidExpertise = chosenExpertise.filter(e => !validExpertise.includes(e));
    if (invalidExpertise.length > 0) {
      setSubmitStatus({ type: 'error', message: 'Invalid Expertise Areas selected. Please choose from the available options.' });
      return;
    }

    const data = {
      "First Name": formData.get('firstName'),
      "Last Name": formData.get('lastName'),
      "Title": formData.get('title'),
      "Email": formData.get('email'),
      "Phone": formData.get('phone'),
      "Location": formData.get('location'),
      "Country": formData.get('country'),
      "Professional Title": formData.get('professionalTitle'),
      "Company": formData.get('company'),
      "Industry": formData.get('industry'),
      "Years Experience": formData.get('experience'),
      "Speaking Experience": formData.get('speakingExperience'),
      "Number of Events": formData.get('numberOfEvents'),
      "Largest Audience": formData.get('largestAudience'),
      "Virtual Experience": formData.get('virtualExperience'),
      "Expertise Areas": Array.from(formData.getAll('expertiseAreas')),
      "Speaking Topics": formData.get('speakingTopics'),
      "Key Messages": formData.get('keyMessages'),
      "Speakers Delivery Style": formData.get('speakersDeliveryStyle'),
      "Why the audience should listen to these topics": formData.get('whyAudience'),
      "What the speeches will address": formData.get('whatAddress'),
      "What participants will learn": formData.get('whatLearn'),
      "What the audience will take home": formData.get('whatTakeHome'),
      "Benefits for the individual": formData.get('benefitsIndividual'),
      "Benefits for the organisation": formData.get('benefitsOrganisation'),
      "Professional Bio": formData.get('bio'),
      "Achievements": formData.get('achievements'),
      "Education": formData.get('education'),
      "Fee Range Local": formData.get('feeRangeLocal'),
      "Fee Range Continental": formData.get('feeRangeContinental'),
      "Fee Range International": formData.get('feeRangeInternational'),
      "Fee Range Virtual": formData.get('feeRangeVirtual'),
      "Fee Range General": formData.get('feeRangeGeneral'),
      "Display Fee": formData.get('displayFee'),
      "Travel Willingness": formData.get('travelWillingness'),
      "Travel Requirements": formData.get('travelRequirements'),
      "Website": formData.get('website'),
      "LinkedIn": formData.get('linkedin'),
      "Twitter": formData.get('twitter'),
      "References": formData.get('references'),
      "Banking Details": formData.get('bankingDetails'),
      "PA Name": formData.get('paName'),
      "PA Email": formData.get('paEmail'),
      "PA Phone": formData.get('paPhone'),
      "Special Requirements": formData.get('specialRequirements'),
      "Additional Info": formData.get('additionalInfo'),
      "Video Link 1": formData.get('videoLink1'),
      "Video Link 2": formData.get('videoLink2'),
      "Video Link 3": formData.get('videoLink3'),
      "Profile Image": profileImageUrl ? [{ url: profileImageUrl }] : undefined,
      "Spoken Languages": Array.from(formData.getAll('spokenLanguages')),
      "Expertise Level": formData.get('expertiseLevel'),
      "Notable Achievements": formData.get('notableAchievements'),
      "Status": ["Pending"]
    }

    console.log('Submitting full data:', data)
    const result = await submitToAirtable('Speaker%20Applications', data)
    if (result.success) {
      if (result.data.fields && result.data.fields['Profile Image']) {
        setAttachments(result.data.fields['Profile Image'])
      }
      e.target.reset()
      setProfileImageUrl('')
      setTimeout(() => setSubmitStatus({ type: '', message: '' }), 5000)
    }
  }

  const handleQuickSubmit = async (e) => {
    e.preventDefault()
    setQuickStatus('loading')
    setQuickError('')

    const formData = new FormData(e.target)
    const data = {
      "First Name": formData.get('firstName'),
      "Last Name": formData.get('lastName'),
      "Email": formData.get('email'),
      "Message": formData.get('message'),
      "Status": "New"
    }

    try {
      await submitToAirtable('Quick%20Inquiries', data)
      setQuickStatus('success')
      e.target.reset()
    } catch (err) {
      setQuickError(err?.message || 'Something went wrong. Please try again.')
      setQuickStatus('error')
    }
  }

  const handleAdminSubmit = async (username, password) => {
    if (await validateAdmin(username, password)) {
      sessionStorage.setItem('asb_admin', '1')
      setIsAuthed(true)
      setSubmitStatus({ type: '', message: '' })
      return true
    }
    return false
  }

  // Admin Dashboard Component
  if (route === '/admin' && isAuthed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="h-12 flex items-center">
                  <div className="bg-blue-900 rounded px-3 py-2 flex items-center justify-center min-w-[50px]">
                    <span className="text-white font-bold text-lg">ASB</span>
                  </div>
                  <div className="ml-3">
                    <span className="text-sm font-medium leading-tight block text-blue-900">AFRICAN</span>
                    <span className="text-sm font-medium leading-tight block text-blue-900">SPEAKER</span>
                    <span className="text-sm font-medium leading-tight block text-blue-900">BUREAU</span>
                  </div>
                </div>
                <div className="ml-8">
                  <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" asChild>
                  <Link to="/admin/blog">Blog</Link>
                </Button>
                <Button variant="outline" onClick={() => loadAdminData()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" onClick={() => {
                  sessionStorage.removeItem('asb_admin')
                  setIsAuthed(false)
                  closeAdminModal()
                }}>
                  Back to Site
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Status Message */}
          {submitStatus.message && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === 'success' ? 'bg-green-100 text-green-800' :
              submitStatus.type === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {submitStatus.message}
            </div>
          )}

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Speaker Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apps.length}</div>
                <p className="text-xs text-muted-foreground">
                  {apps.filter(r => Array.isArray(r.Status) ? r.Status.includes('Pending') : r.Status === 'Pending').length} pending review
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Client Inquiries</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.length}</div>
                <p className="text-xs text-muted-foreground">
                  {clients.filter(r => Array.isArray(r.Status) ? r.Status.includes('New') : r.Status === 'New').length} new inquiries
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Inquiries</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quick.length}</div>
                <p className="text-xs text-muted-foreground">
                  {quick.filter(r => Array.isArray(r.Status) ? r.Status.includes('New') : r.Status === 'New').length} unread messages
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('speakers')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'speakers'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Speaker Applications ({apps.length})
                </button>
                <button
                  onClick={() => setActiveTab('clients')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'clients'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Client Inquiries ({clients.length})
                </button>
                <button
                  onClick={() => setActiveTab('quick')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'quick'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Quick Inquiries ({quick.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="New">New</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                const data = activeTab === 'speakers' ? apps :
                           activeTab === 'clients' ? clients :
                           quick
                exportToCSV(filteredData(data), `${activeTab}_${new Date().toISOString().split('T')[0]}`)
              }}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Data Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading data...</span>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {activeTab === 'speakers' && (
                          <>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </>
                        )}
                        {activeTab === 'clients' && (
                          <>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </>
                        )}
                        {activeTab === 'quick' && (
                          <>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData(
                        activeTab === 'speakers' ? apps :
                        activeTab === 'clients' ? clients :
                        quick
                      ).map((record) => (
                        <TableRow key={record.id}>
                          {activeTab === 'speakers' && (
                            <>
                              <TableCell className="font-medium">
                                {record['First Name']} {record['Last Name']}
                              </TableCell>
                              <TableCell>{record.Email}</TableCell>
                              <TableCell>{record['Professional Title']}</TableCell>
                              <TableCell>{record.Industry}</TableCell>
                              <TableCell>{getStatusBadge(record.Status)}</TableCell>
                              <TableCell>{record.createdTime ? new Date(record.createdTime).toLocaleDateString() : 'N/A'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="asb-edit-btn"
                                    aria-label={`View & Edit ${record['First Name'] || record.name || 'record'}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleEdit('Speaker Applications', record.id);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </TableCell>
                            </>
                          )}
                          {activeTab === 'clients' && (
                            <>
                              <TableCell className="font-medium">
                                {record['First Name']} {record['Last Name']}
                              </TableCell>
                              <TableCell>{record.Email}</TableCell>
                              <TableCell>{record['Company Name']}</TableCell>
                              <TableCell>{record['Event Name']}</TableCell>
                              <TableCell>{record['Budget Range']}</TableCell>
                              <TableCell>{getStatusBadge(record.Status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="asb-edit-btn"
                                    aria-label={`View & Edit ${record['First Name'] || record.name || 'record'}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleEdit('Client Inquiries', record.id);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </TableCell>
                            </>
                          )}
                          {activeTab === 'quick' && (
                            <>
                              <TableCell className="font-medium">{`${record['First Name'] || ''} ${record['Last Name'] || ''}`.trim()}</TableCell>
                              <TableCell>{record.Email}</TableCell>
                              <TableCell className="max-w-xs truncate">{record.Message}</TableCell>
                              <TableCell>{getStatusBadge(record.Status)}</TableCell>
                              <TableCell>{record.createdTime ? new Date(record.createdTime).toLocaleDateString() : 'N/A'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="asb-edit-btn"
                                    aria-label={`View & Edit ${record['First Name'] || record.name || 'record'}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleEdit('Quick Inquiries', record.id);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        {editCtx.open && editCtx.table === 'Speaker Applications' && (
          <SpeakerEditDialog recordId={editCtx.recordId} onClose={closeEdit} />
        )}
        {editCtx.open && editCtx.table === 'Quick Inquiries' && (
          <QuickInquiryEditDialog recordId={editCtx.recordId} onClose={closeEdit} />
        )}
        {editCtx.open && editCtx.table === 'Client Inquiries' && (
          <ClientInquiryEditDialog recordId={editCtx.recordId} onClose={closeEdit} />
        )}
      </div>
    )
  }

  // Rest of the original component code for other pages...
  // [The rest of the component remains the same as the original, including speaker-application, client-booking, quick-inquiry, and home pages]

  // Speaker Profile Page
  if (currentPage === 'speaker-profile') {
    return (
      <>
        {/* Header provided by PublicLayout */}
        <Suspense fallback={null}>
          <SpeakerProfile id={selectedSpeakerId} speakers={speakers} onBack={() => go('/find-speakers')} />
        </Suspense>
        {banner}
      </>
    )
  }

  if (currentPage === 'apply-beta') {
    return <ApplyBeta countryCode={countryCode || 'ZA'} currency={currency || 'ZAR'} />
  }

  if (currentPage === 'speaker-application' || currentPage === 'speaker-application-v2') {
    const isV2 = currentPage === 'speaker-application-v2'
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header provided by PublicLayout */}

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight text-center">Join as Speaker</h1>
            <p className="mt-3 text-slate-600 text-center">
              Share your expertise with global audiences and become part of Africa's premier speaker network
            </p>
            <div className="mt-6 max-w-3xl mx-auto px-4 text-center">
              <p className="text-slate-700 leading-relaxed">
                Thank you for your interest in speaking with African Speaker Bureau.
                Please share as much detail as you can—fields marked * are required; the rest are optional.
                The more we know about your expertise and formats, the better we can match you with the right stages and clients.
                We look forward to partnering with you.
              </p>
            </div>

            {submitStatus.message && (
              <div className={`mb-6 p-4 rounded-lg ${
                submitStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                submitStatus.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {submitStatus.message}
              </div>
            )}

            <Card>
              <CardContent className="p-8">
                <form onSubmit={isV2 ? handleSpeakerSubmitV2 : handleSpeakerSubmit} className="mt-8 space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                    <div className={`grid grid-cols-1 ${isV2 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <Input name="firstName" placeholder="Your first name" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                        <Input name="lastName" placeholder="Your last name" required />
                      </div>
                      {isV2 && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Title</label>
                          <Input name="title" placeholder="Mr, Ms, Dr, etc." />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address *</label>
                        <Input name="email" type="email" placeholder="your.email@example.com" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                        <Input name="phone" placeholder="+1 (555) 123-4567" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Location *</label>
                        <Input name="location" placeholder="City, State/Province" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Country *</label>
                        <select name="country" className="w-full p-2 border border-gray-300 rounded-md" required>
                          <option value="">Select your country</option>
                          <option value="Afghanistan">Afghanistan</option>
                          <option value="Albania">Albania</option>
                          <option value="Algeria">Algeria</option>
                          <option value="Andorra">Andorra</option>
                          <option value="Angola">Angola</option>
                          <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                          <option value="Argentina">Argentina</option>
                          <option value="Armenia">Armenia</option>
                          <option value="Australia">Australia</option>
                          <option value="Austria">Austria</option>
                          <option value="Azerbaijan">Azerbaijan</option>
                          <option value="Bahamas">Bahamas</option>
                          <option value="Bahrain">Bahrain</option>
                          <option value="Bangladesh">Bangladesh</option>
                          <option value="Barbados">Barbados</option>
                          <option value="Belarus">Belarus</option>
                          <option value="Belgium">Belgium</option>
                          <option value="Belize">Belize</option>
                          <option value="Benin">Benin</option>
                          <option value="Bhutan">Bhutan</option>
                          <option value="Bolivia">Bolivia</option>
                          <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                          <option value="Botswana">Botswana</option>
                          <option value="Brazil">Brazil</option>
                          <option value="Brunei">Brunei</option>
                          <option value="Bulgaria">Bulgaria</option>
                          <option value="Burkina Faso">Burkina Faso</option>
                          <option value="Burundi">Burundi</option>
                          <option value="Cabo Verde">Cabo Verde</option>
                          <option value="Cambodia">Cambodia</option>
                          <option value="Cameroon">Cameroon</option>
                          <option value="Canada">Canada</option>
                          <option value="Central African Republic">Central African Republic</option>
                          <option value="Chad">Chad</option>
                          <option value="Chile">Chile</option>
                          <option value="China">China</option>
                          <option value="Colombia">Colombia</option>
                          <option value="Comoros">Comoros</option>
                          <option value="Congo">Congo</option>
                          <option value="Costa Rica">Costa Rica</option>
                          <option value="Croatia">Croatia</option>
                          <option value="Cuba">Cuba</option>
                          <option value="Cyprus">Cyprus</option>
                          <option value="Czech Republic">Czech Republic</option>
                          <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                          <option value="Denmark">Denmark</option>
                          <option value="Djibouti">Djibouti</option>
                          <option value="Dominica">Dominica</option>
                          <option value="Dominican Republic">Dominican Republic</option>
                          <option value="Ecuador">Ecuador</option>
                          <option value="Egypt">Egypt</option>
                          <option value="El Salvador">El Salvador</option>
                          <option value="Equatorial Guinea">Equatorial Guinea</option>
                          <option value="Eritrea">Eritrea</option>
                          <option value="Estonia">Estonia</option>
                          <option value="Eswatini">Eswatini</option>
                          <option value="Ethiopia">Ethiopia</option>
                          <option value="Fiji">Fiji</option>
                          <option value="Finland">Finland</option>
                          <option value="France">France</option>
                          <option value="Gabon">Gabon</option>
                          <option value="Gambia">Gambia</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Germany">Germany</option>
                          <option value="Ghana">Ghana</option>
                          <option value="Greece">Greece</option>
                          <option value="Grenada">Grenada</option>
                          <option value="Guatemala">Guatemala</option>
                          <option value="Guinea">Guinea</option>
                          <option value="Guinea-Bissau">Guinea-Bissau</option>
                          <option value="Guyana">Guyana</option>
                          <option value="Haiti">Haiti</option>
                          <option value="Honduras">Honduras</option>
                          <option value="Hungary">Hungary</option>
                          <option value="Iceland">Iceland</option>
                          <option value="India">India</option>
                          <option value="Indonesia">Indonesia</option>
                          <option value="Iran">Iran</option>
                          <option value="Iraq">Iraq</option>
                          <option value="Ireland">Ireland</option>
                          <option value="Israel">Israel</option>
                          <option value="Italy">Italy</option>
                          <option value="Ivory Coast">Ivory Coast</option>
                          <option value="Jamaica">Jamaica</option>
                          <option value="Japan">Japan</option>
                          <option value="Jordan">Jordan</option>
                          <option value="Kazakhstan">Kazakhstan</option>
                          <option value="Kenya">Kenya</option>
                          <option value="Kiribati">Kiribati</option>
                          <option value="Kuwait">Kuwait</option>
                          <option value="Kyrgyzstan">Kyrgyzstan</option>
                          <option value="Laos">Laos</option>
                          <option value="Latvia">Latvia</option>
                          <option value="Lebanon">Lebanon</option>
                          <option value="Lesotho">Lesotho</option>
                          <option value="Liberia">Liberia</option>
                          <option value="Libya">Libya</option>
                          <option value="Liechtenstein">Liechtenstein</option>
                          <option value="Lithuania">Lithuania</option>
                          <option value="Luxembourg">Luxembourg</option>
                          <option value="Madagascar">Madagascar</option>
                          <option value="Malawi">Malawi</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="Maldives">Maldives</option>
                          <option value="Mali">Mali</option>
                          <option value="Malta">Malta</option>
                          <option value="Marshall Islands">Marshall Islands</option>
                          <option value="Mauritania">Mauritania</option>
                          <option value="Mauritius">Mauritius</option>
                          <option value="Mexico">Mexico</option>
                          <option value="Micronesia">Micronesia</option>
                          <option value="Moldova">Moldova</option>
                          <option value="Monaco">Monaco</option>
                          <option value="Mongolia">Mongolia</option>
                          <option value="Montenegro">Montenegro</option>
                          <option value="Morocco">Morocco</option>
                          <option value="Mozambique">Mozambique</option>
                          <option value="Myanmar">Myanmar</option>
                          <option value="Namibia">Namibia</option>
                          <option value="Nauru">Nauru</option>
                          <option value="Nepal">Nepal</option>
                          <option value="Netherlands">Netherlands</option>
                          <option value="New Zealand">New Zealand</option>
                          <option value="Nicaragua">Nicaragua</option>
                          <option value="Niger">Niger</option>
                          <option value="Nigeria">Nigeria</option>
                          <option value="North Korea">North Korea</option>
                          <option value="North Macedonia">North Macedonia</option>
                          <option value="Norway">Norway</option>
                          <option value="Oman">Oman</option>
                          <option value="Pakistan">Pakistan</option>
                          <option value="Palau">Palau</option>
                          <option value="Palestine">Palestine</option>
                          <option value="Panama">Panama</option>
                          <option value="Papua New Guinea">Papua New Guinea</option>
                          <option value="Paraguay">Paraguay</option>
                          <option value="Peru">Peru</option>
                          <option value="Philippines">Philippines</option>
                          <option value="Poland">Poland</option>
                          <option value="Portugal">Portugal</option>
                          <option value="Qatar">Qatar</option>
                          <option value="Romania">Romania</option>
                          <option value="Russia">Russia</option>
                          <option value="Rwanda">Rwanda</option>
                          <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                          <option value="Saint Lucia">Saint Lucia</option>
                          <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                          <option value="Samoa">Samoa</option>
                          <option value="San Marino">San Marino</option>
                          <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                          <option value="Saudi Arabia">Saudi Arabia</option>
                          <option value="Senegal">Senegal</option>
                          <option value="Serbia">Serbia</option>
                          <option value="Seychelles">Seychelles</option>
                          <option value="Sierra Leone">Sierra Leone</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Slovakia">Slovakia</option>
                          <option value="Slovenia">Slovenia</option>
                          <option value="Solomon Islands">Solomon Islands</option>
                          <option value="Somalia">Somalia</option>
                          <option value="South Africa">South Africa</option>
                          <option value="South Korea">South Korea</option>
                          <option value="South Sudan">South Sudan</option>
                          <option value="Spain">Spain</option>
                          <option value="Sri Lanka">Sri Lanka</option>
                          <option value="Sudan">Sudan</option>
                          <option value="Suriname">Suriname</option>
                          <option value="Sweden">Sweden</option>
                          <option value="Switzerland">Switzerland</option>
                          <option value="Syria">Syria</option>
                          <option value="Taiwan">Taiwan</option>
                          <option value="Tajikistan">Tajikistan</option>
                          <option value="Tanzania">Tanzania</option>
                          <option value="Thailand">Thailand</option>
                          <option value="Timor-Leste">Timor-Leste</option>
                          <option value="Togo">Togo</option>
                          <option value="Tonga">Tonga</option>
                          <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                          <option value="Tunisia">Tunisia</option>
                          <option value="Turkey">Turkey</option>
                          <option value="Turkmenistan">Turkmenistan</option>
                          <option value="Tuvalu">Tuvalu</option>
                          <option value="Uganda">Uganda</option>
                          <option value="Ukraine">Ukraine</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="United States">United States</option>
                          <option value="Uruguay">Uruguay</option>
                          <option value="Uzbekistan">Uzbekistan</option>
                          <option value="Vanuatu">Vanuatu</option>
                          <option value="Vatican City">Vatican City</option>
                          <option value="Venezuela">Venezuela</option>
                          <option value="Vietnam">Vietnam</option>
                          <option value="Yemen">Yemen</option>
                          <option value="Zambia">Zambia</option>
                          <option value="Zimbabwe">Zimbabwe</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Profile Image</label>
                        <div className="space-y-3">
                          {profileImageUrl && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 mb-2">Preview:</p>
                              <img
                                src={profileImageUrl}
                                alt="Profile preview"
                                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                                width={128}
                                height={128}
                                {...lazyImgProps}
                              />
                            </div>
                          )}
                          {attachments.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 mb-2">Uploaded Image:</p>
                              <img
                                src={attachments[0].url}
                                alt="Profile preview"
                                style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 4 }}
                                className="border border-gray-300"
                                width={120}
                                height={120}
                                {...lazyImgProps}
                              />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={openCloudinaryWidget}
                            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex flex-col items-center space-y-2">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <span className="text-sm font-medium text-gray-700">
                                {profileImageUrl || attachments.length > 0 ? "Change Image" : "Upload Image"}
                              </span>
                            </div>
                          </button>
                          <p className="text-xs text-gray-500">
                            Upload a professional headshot (JPG, PNG, max 5MB). This will be used on your speaker profile.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Background */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Professional Background</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Professional Title</label>
                        <Input name={isV2 ? 'professionalTitle' : 'title'} placeholder="CEO, Director, Professor, etc." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Company/Organization *</label>
                        <Input name="company" placeholder="Your company or organization" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Industry *</label>
                        <select name="industry" className="w-full p-2 border border-gray-300 rounded-md" required>
                          <option value="">Select your industry</option>
                          {fieldOptions['Speaker Applications']['Industry'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Expertise Level *</label>
                        <select name="expertiseLevel" className="w-full p-2 border border-gray-300 rounded-md" required>
                          <option value="">Select your expertise level</option>
                          <option value="Entry Level">Entry Level</option>
                          <option value="Mid Level">Mid Level</option>
                          <option value="Senior Level">Senior Level</option>
                          <option value="Executive Level">Executive Level</option>
                          <option value="C-Suite">C-Suite</option>
                          <option value="Board Level">Board Level</option>
                          <option value="International Renown Expert">International Renown Expert</option>
                          <option value="International Renown Trainer">International Renown Trainer</option>
                          <option value="Celebrity">Celebrity</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Years of Experience *</label>
                        <select name="experience" className="w-full p-2 border border-gray-300 rounded-md" required>
                          <option value="">Select years of experience</option>
                          {fieldOptions['Speaker Applications']['Years Experience'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Speaking Experience */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Speaking Experience</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Number of Speaking Events</label>
                        <select name="numberOfEvents" className="w-full p-2 border border-gray-300 rounded-md">
                          <option value="">Select range</option>
                          {fieldOptions['Speaker Applications']['Number of Events'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Largest Audience Size</label>
                        <select name="largestAudience" className="w-full p-2 border border-gray-300 rounded-md">
                          <option value="">Select size</option>
                          {fieldOptions['Speaker Applications']['Largest Audience'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Virtual Speaking Experience *</label>
                        <select name="virtualExperience" className="w-full p-2 border border-gray-300 rounded-md" required>
                          <option value="">— Please choose —</option>
                          {fieldOptions['Speaker Applications']['Virtual Experience'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Speaking Experience Level</label>
                        <select name="speakingExperience" className="w-full p-2 border border-gray-300 rounded-md">
                          <option value="">Select level</option>
                          {fieldOptions['Speaker Applications']['Speaking Experience'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Expertise and Topics */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Expertise and Topics</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expertise Areas *</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {EXPERTISE_OPTIONS.map(area => (
                            <label key={area} className="flex items-center space-x-2">
                              <input type="checkbox" name="expertiseAreas" value={area} className="rounded" />
                              <span>{area}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-gray-500 text-sm mt-2">Select all expertise areas you can provide expertise on</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Speaking Topics *</label>
                        <Textarea name="speakingTopics" placeholder="Describe the topics you speak about" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Key Messages</label>
                        <Textarea name="keyMessages" placeholder="What are the key messages you want to share with audiences?" />
                      </div>
                      {isV2 && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">Speakers Delivery Style</label>
                            <Textarea name="speakersDeliveryStyle" placeholder="Describe your delivery style" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Why the audience should listen to these topics</label>
                            <Textarea name="whyAudience" placeholder="Explain the importance of your topics" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">What the speeches will address</label>
                            <Textarea name="whatAddress" placeholder="Outline what your speeches will address" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">What participants will learn</label>
                            <Textarea name="whatLearn" placeholder="Describe what participants will learn" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">What the audience will take home</label>
                            <Textarea name="whatTakeHome" placeholder="Explain what the audience will take home" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Benefits for the individual</label>
                            <Textarea name="benefitsIndividual" placeholder="List benefits for individuals" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Benefits for the organisation</label>
                            <Textarea name="benefitsOrganisation" placeholder="List benefits for the organisation" />
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-2">Professional Bio *</label>
                        <Textarea name="bio" placeholder="Write a comprehensive professional biography (3-4 paragraphs). Include your background, achievements, expertise, and what makes you unique as a speaker." required className="min-h-[200px]" />
                      </div>
                    </div>
                  </div>

                  {/* Media and Portfolio */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Media and Portfolio</h3>
                    <div className="space-y-4">
                      {/* Removed old "Professional Headshot" field */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Video Links</label>
                        <div className="space-y-2">
                          <Input name="videoLink1" placeholder="https://youtube.com/watch?v=... (Speaking video 1)" />
                          <Input name="videoLink2" placeholder="https://youtube.com/watch?v=... (Speaking video 2)" />
                          <Input name="videoLink3" placeholder="https://youtube.com/watch?v=... (Speaking video 3)" />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Provide links to your speaking videos (YouTube, Vimeo, etc.)</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Spoken Languages *</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {fieldOptions['Speaker Applications']['Spoken Languages'].map(lang => (
                            <label key={lang} className="flex items-center space-x-2">
                              <input type="checkbox" name="spokenLanguages" value={lang} className="rounded" />
                              <span>{lang}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Select all languages you can speak fluently</p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Professional Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Notable Achievements</label>
                        <Input name="notableAchievements" placeholder="Your most notable achievement or recognition" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Achievements</label>
                        <Textarea name="achievements" placeholder="List your notable achievements, awards, recognitions" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Education Background</label>
                        <Textarea name="education" placeholder="Your educational background and qualifications" />
                      </div>
                      <div className={`grid grid-cols-1 ${isV2 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                        <div>
                          <label className="block text-sm font-medium mb-2">Fee Range (Local)</label>
                          <select name="feeRangeLocal" className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">Select range</option>
                            {fieldOptions['Speaker Applications']['Fee Range Local'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Fee Range (Continental)</label>
                          <select name="feeRangeContinental" className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">Select range</option>
                            {fieldOptions['Speaker Applications']['Fee Range Continental'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Fee Range (International)</label>
                          <select name="feeRangeInternational" className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">Select range</option>
                            {fieldOptions['Speaker Applications']['Fee Range International'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Fee Range (Virtual)</label>
                          <select name="feeRangeVirtual" className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">Select range</option>
                            {fieldOptions['Speaker Applications']['Fee Range Virtual'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Fee Range (General)</label>
                          <select name="feeRangeGeneral" className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">Select range</option>
                            {fieldOptions['Speaker Applications']['Fee Range General'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Travel Willingness</label>
                          <select name="travelWillingness" className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="">Select preference</option>
                            {fieldOptions['Speaker Applications']['Travel Willingness'].map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        {isV2 && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Display Fee</label>
                            <select name="displayFee" className="w-full p-2 border border-gray-300 rounded-md">
                              <option value="">Select option</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Travel Requirements</label>
                        <Textarea name="travelRequirements" placeholder="Any specific travel requirements or restrictions" />
                      </div>
                    </div>
                  </div>

                  {/* Contact and Social */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Contact and Social Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Website</label>
                        <Input name="website" placeholder="https://yourwebsite.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">LinkedIn Profile</label>
                        <Input name="linkedin" placeholder="https://linkedin.com/in/yourprofile" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Twitter/X Handle</label>
                        <Input name="twitter" placeholder="@yourusername" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">References</label>
                        <Input name="references" placeholder="Contact information for references" />
                      </div>
                    </div>
                  </div>

                  {/* Support and Additional Information */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Support and Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Personal Assistant Name</label>
                        <Input name="paName" placeholder="PA or assistant name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">PA Email</label>
                        <Input name="paEmail" type="email" placeholder="pa@example.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">PA Phone</label>
                        <Input name="paPhone" placeholder="+1 (555) 123-4567" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Banking Details</label>
                        <Input name="bankingDetails" placeholder="Bank name, account details for payment processing" />
                      </div>
                    </div>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Special Requirements</label>
                        <Textarea name="specialRequirements" placeholder="Any special requirements for speaking engagements" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Additional Information</label>
                        <Textarea name="additionalInfo" placeholder="Any additional information you'd like to share" />
                      </div>
                      {/* Removed internal "Featured" field */}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={submitStatus.type === 'loading'}>
                    {submitStatus.type === 'loading' ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      {banner}
      </div>
    )
  }

  if (currentPage === 'find-speakers') {
    return (
      <>
        <Suspense fallback={null}>
          <FindSpeakersPage countryCode={countryCode || 'ZA'} currency={currency || 'ZAR'} />
        </Suspense>
        {banner}
      </>
    )
  }

    if (currentPage === 'about') {
      return (
        <div className="min-h-screen bg-white">
        {/* Header provided by PublicLayout */}

          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">About African Speaker Bureau</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Connecting authentic African voices with global audiences, and global expertise with African audiences since 2008
              </p>
            </div>

            {/* Mission Statement */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-8 mb-16 max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed">
                The African Speaker Bureau stands as the premier gateway to Africa's most compelling intellectual capital, connecting global audiences with the continent's most influential thought leaders, innovators, and change-makers. Simultaneously, we serve as the vital conduit bringing international expertise, diverse approaches, and the latest global trends to African professional communities.
              </p>
            </div>

            {/* Our Dual Mission */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-blue-600 text-center mb-12">Our Dual Mission: Bridging Knowledge Across Continents</h2>
              
              <div className="max-w-6xl mx-auto mb-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  In 2008, the global landscape was ripe for transformation. While Africa was experiencing unprecedented economic growth and technological innovation, the continent's voices remained largely absent from international conferences, corporate boardrooms, and policy discussions. Simultaneously, there was a growing demand within African professional communities for exposure to global best practices, diverse approaches, and the latest trends from around the world.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  The African Speaker Bureau was conceived to address both needs – not merely as a business venture, but as a mission to reshape global narratives about Africa while enriching African discourse with international perspectives. We recognized that true progress comes from mutual learning and collaboration across borders.
                </p>
                
                <p className="text-gray-700 leading-relaxed">
                  Our founder recognized a fundamental disconnect: while the world was increasingly interested in African markets, innovations, and perspectives, there was no reliable mechanism to access authentic African expertise. Traditional speaker bureaus focused primarily on Western voices, often overlooking the rich intellectual capital that Africa had to offer. Concurrently, African businesses and professionals needed access to global insights to compete effectively on the international stage.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <div className="border border-gray-200 rounded-lg p-8">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">African Voices to Global Audiences</h3>
                  <p className="text-gray-700">
                    We connect global audiences with authentic African expertise, innovative solutions, and transformative perspectives that can't be found elsewhere. Our African speakers bring essential insights to Fortune 500 boardrooms and international conferences worldwide.
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-8">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">Global Expertise to African Audiences</h3>
                  <p className="text-gray-700">
                    We bring leading international experts to African professional communities, sharing cutting-edge global insights, diverse industry approaches, and the latest trends to fuel Africa's continued growth and innovation.
                  </p>
                </div>
              </div>
            </div>

            {/* Our Comprehensive Speaker Network */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-blue-600 text-center mb-8">Our Comprehensive Speaker Network</h2>
              <p className="text-gray-700 text-center max-w-4xl mx-auto mb-12">
                The African Speaker Bureau represents over 500 expert speakers across 54 African countries, covering every major industry and area of expertise. Our roster includes both African thought leaders and carefully curated international experts who bring global insights to African audiences.
              </p>

              <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
                <div>
                  <h3 className="text-xl font-bold text-blue-600 mb-4">• African Thought Leaders</h3>
                  <p className="text-gray-700 mb-4">
                    Technology pioneers, economic development experts, healthcare innovators, sustainability champions, and cultural leaders who represent the best of African excellence and innovation.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-blue-600 mb-4">• International Experts</h3>
                  <p className="text-gray-700 mb-4">
                    Carefully selected global thought leaders who bring cutting-edge insights, diverse approaches, and latest trends to African professional communities.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <div>
                  <h3 className="text-xl font-bold text-blue-600 mb-4">• Global Market Insights</h3>
                  <p className="text-gray-700">
                    Our African speakers offer unique perspectives on global markets, having successfully navigated both local African contexts and international business environments.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-blue-600 mb-4">• Cultural Adaptation</h3>
                  <p className="text-gray-700">
                    All our international speakers are trained in cultural sensitivity and adapt their content for African contexts while maintaining global relevance.
                  </p>
                </div>
              </div>
            </div>

            {/* Our Competitive Advantage */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-blue-600 text-center mb-8">Our Competitive Advantage: Two-Way Excellence</h2>
              <p className="text-gray-700 text-center max-w-4xl mx-auto mb-12">
                While the global speaker bureau market includes established players like Washington Speakers Bureau, London Speaker Bureau, and BigSpeak, the African Speaker Bureau occupies a unique position. Our competitive advantage lies in our deep understanding of both African contexts and global market needs, enabling us to serve a dual mandate effectively.
              </p>

              <div className="space-y-8 max-w-4xl mx-auto">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-bold text-blue-600 mb-3">Rigorous Curation Process</h3>
                  <p className="text-gray-700">
                    Unlike generalist bureaus, we have developed sophisticated vetting processes specifically designed to identify and develop African expertise, and to select international speakers who can effectively engage with African audiences.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-bold text-blue-600 mb-3">Cultural Competency</h3>
                  <p className="text-gray-700">
                    We understand that effective cross-cultural communication requires cultural interpretation, not just translation. Our speakers bridge cultural gaps whether they're African experts addressing global audiences or international experts engaging with African communities.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-bold text-blue-600 mb-3">Comprehensive Development</h3>
                  <p className="text-gray-700">
                    We don't just represent speakers; we develop them through comprehensive training programs tailored for both global and African speaking contexts, ensuring maximum impact and cultural relevance.
                  </p>
                </div>
              </div>
            </div>

            {/* Impact by Numbers */}
            <div className="bg-blue-600 text-white py-16 rounded-xl mb-16">
              <h2 className="text-3xl font-bold text-center mb-12">Our Impact by the Numbers</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">2000+</div>
                  <div className="text-lg opacity-90">Speaking Engagements</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">200+</div>
                  <div className="text-lg opacity-90">Fortune 500 Clients</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">6</div>
                  <div className="text-lg opacity-90">Continents Served</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">15+</div>
                  <div className="text-lg opacity-90">Years of Excellence</div>
                </div>
              </div>
            </div>

            {/* Our Commitment */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-blue-600 text-center mb-12">Our Commitment: Excellence, Authenticity, Impact, and Exchange</h2>
              <p className="text-gray-700 text-center max-w-4xl mx-auto mb-12">
                The African Speaker Bureau operates on four fundamental principles that guide everything we do:
              </p>

              <div className="space-y-8 max-w-4xl mx-auto">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-bold text-blue-600 mb-3">Excellence</h3>
                  <p className="text-gray-700">
                    We maintain the highest standards in everything we do, from speaker selection to event execution. Our commitment to excellence ensures that every engagement exceeds expectations and delivers meaningful value.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-bold text-blue-600 mb-3">Authenticity</h3>
                  <p className="text-gray-700">
                    We believe that authentic voices are the most powerful voices. Our African speakers embody African excellence, innovation, and wisdom, while our international speakers bring authentic global perspectives tailored for African contexts.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-bold text-blue-600 mb-3">Impact</h3>
                  <p className="text-gray-700">
                    We measure our success not just in terms of events delivered or revenue generated, but in terms of minds changed, relationships built, and opportunities created, both for African voices on the global stage and for global insights within Africa.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-bold text-blue-600 mb-3">Exchange</h3>
                  <p className="text-gray-700">
                    We foster a dynamic, two-way exchange of knowledge and ideas, recognizing that true progress comes from mutual learning and collaboration across borders.
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-12 text-center">
              <h2 className="text-3xl font-bold mb-6">Join Us in Our Mission</h2>
              <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                The African Speaker Bureau is more than a business – we are a bridge between Africa and the world, a platform for authentic voices, and a catalyst for global understanding and exchange. Whether you're seeking African expertise for your global audience or international insights for your African community, we're here to connect you with the perfect speaker.
              </p>
              <a
                href="/#/apply-card-v1"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg inline-block rounded"
              >
                Partner With Us Today
              </a>
            </div>
          </div>

        {banner}
        </div>
      )
    }

    if (currentPage === 'services') {
    const bookingFormUrl = 'https://www.africanspeakerbureau.com/#/book-a-speaker'

    const services = {
      'keynote-speakers': {
        title: 'Keynote Speakers',
        color: 'blue',
        description: 'Transform your events with powerful keynote presentations that inspire, educate, and drive action. Our African keynote speakers bring authentic perspectives and transformative insights that resonate with global audiences while delivering measurable impact for your organization.',
        sections: {
          left: {
            title: 'What Makes Our Keynote Speakers Exceptional',
            items: [
              {
                title: 'Proven Track Record',
                description: 'Our speakers have addressed Fortune 500 companies, international conferences, and global forums, consistently receiving outstanding feedback and driving meaningful change.'
              },
              {
                title: 'Authentic African Perspectives',
                description: 'Access insights that can only come from lived experience in Africa\'s dynamic markets, innovative ecosystems, and transformative social movements.'
              },
              {
                title: 'Customized Content',
                description: 'Every keynote is tailored to your specific audience, objectives, and organizational context, ensuring maximum relevance and impact.'
              }
            ]
          },
          right: {
            title: 'Popular Keynote Topics',
            items: [
              {
                title: 'Digital Transformation & Innovation',
                description: 'How Africa is leapfrogging traditional technologies and what global organizations can learn'
              },
              {
                title: 'Sustainable Development & ESG',
                description: 'Practical approaches to sustainability from the continent leading the charge'
              },
              {
                title: 'Leadership in Uncertainty',
                description: 'Lessons from leaders who have navigated complex challenges and emerged stronger'
              },
              {
                title: 'Future of Work & Youth Empowerment',
                description: 'Insights from the world\'s youngest continent on preparing for tomorrow\'s workforce'
              },
              {
                title: 'Entrepreneurship & Innovation',
                description: 'Stories of building successful businesses in emerging markets'
              }
            ]
          }
        },
        investment: {
          title: 'Investment in Impact',
          description: 'Our keynote speakers typically range from ZAR 30,000 to ZAR 100,000, and for international engagements from $5,000 to $30,000, depending on speaker, scope and format.',
          cta: 'Request Keynote Speaker'
        }
      },
      'panel-discussions': {
        title: 'Panel Discussions',
        color: 'green',
        description: 'Facilitate dynamic conversations that explore multiple perspectives and generate actionable insights. Our expertly curated panels bring together diverse African voices to address complex challenges and opportunities facing your industry.',
        investment: {
          title: 'Panel Investment',
          description: 'Panel discussions typically range from ZAR 50,000 to ZAR 200,000, and for international events from $15,000 to $50,000, depending on the mix of speakers, preparation and format.',
          cta: 'Request Panel Discussion'
        }
      },
      'boardroom-consulting': {
        title: 'Boardroom Consulting',
        color: 'purple',
        description: 'Bring African expertise directly to your executive team and board of directors. Our senior consultants provide strategic insights, market intelligence, and decision-making support for organizations looking to understand and engage with African markets.',
        investment: {
          title: 'Consulting Investment',
          description: 'Boardroom consulting engagements typically range from R100,000 - R250,000 / $50,000 - $200,000 depending on scope, duration, location and level of ongoing support required. We offer both project-based and retainer arrangements to meet your specific needs.',
          cta: 'Request Boardroom Consulting'
        }
      },
      'workshop-facilitators': {
        title: 'Workshop Facilitators',
        color: 'orange',
        description: 'Transform your team\'s capabilities through hands-on learning experiences led by African experts. Our workshop facilitators combine deep subject matter expertise with proven facilitation skills to deliver practical, actionable learning that drives immediate results.',
        investment: {
          title: 'Workshop Investment',
          description: 'Half-day workshops typically range from ZAR 35,000 to ZAR 50,000 / $7,500 – $15,000. Full-day workshops usually range from ZAR 50,000 to ZAR 250,000  / $15,000 – $25,000, depending on scope, location, customisation and follow-up support.\n\nMulti-day intensive programmes are priced on request based on complexity and outcomes.',
          cta: 'Request Workshop Facilitator'
        }
      },
      'virtual-events': {
        title: 'Virtual Events',
        color: 'teal',
        description: 'Connect with African expertise from anywhere in the world through our cutting-edge virtual event solutions. Our speakers are experienced in delivering high-impact presentations through digital platforms, ensuring engagement and interaction regardless of geographic boundaries.',
        investment: {
          title: 'Virtual Event Investment',
          description: 'Virtual presentations typically start at ZAR 15,000 / $5,000, with pricing adjusted for duration, number of sessions and level of customisation.',
          cta: 'Request Virtual Event'
        }
      },
      'leadership-coaching': {
        title: 'Leadership Coaching',
        color: 'red',
        description: 'Develop exceptional leaders through personalized coaching with African executives who have navigated complex challenges and achieved remarkable success. Our coaching programs combine global leadership principles with African wisdom and practical experience.',
        investment: {
          title: 'Coaching Investment',
          description: 'Individual executive coaching programmes typically start at ZAR 50,000 / $10,000 for a six-month engagement, with exact investment depending on scope, cadence and whether team coaching is included.',
          cta: 'Request Leadership Coaching'
        }
      }
    }

    const serviceButtons = [
      { id: 'keynote-speakers', label: 'Keynote Speakers' },
      { id: 'panel-discussions', label: 'Panel Discussions' },
      { id: 'boardroom-consulting', label: 'Boardroom Consulting' },
      { id: 'workshop-facilitators', label: 'Workshop Facilitators' },
      { id: 'virtual-events', label: 'Virtual Events' },
      { id: 'leadership-coaching', label: 'Leadership Coaching' }
    ]

    const currentService = services[selectedService]

    return (
      <div className="min-h-screen bg-white">
        {/* Header provided by PublicLayout */}

        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
            <p className="text-xl text-gray-600">Comprehensive speaking solutions tailored to your unique needs</p>
          </div>

          {/* Service Navigation Tabs */}
          <div
            role="tablist"
            className="flex flex-wrap items-center justify-center gap-2 py-2 sticky top-[64px] z-20 bg-white"
            style={{ borderBottom: '1px solid var(--asb-border)' }}
          >
            {serviceButtons.map((service) => {
              const active = service.id === selectedService
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  role="tab"
                  aria-selected={active}
                  className="rounded-full px-4 py-2 text-sm"
                  style={{
                    color: active ? 'var(--asb-blue-800)' : 'var(--asb-muted)',
                    background: active ? '#EAEEFE' : '#FFFFFF',
                    border: '1px solid var(--asb-border)'
                  }}
                >
                  {service.label}
                  <span
                    className="block h-[2px] mt-2"
                    style={{ background: active ? 'var(--asb-blue-600)' : 'transparent' }}
                  />
                </button>
              )
            })}
          </div>

          {/* Service Content */}
          <section
            id={serviceToHash[selectedService]}
            className="scroll-mt-24 max-w-6xl mx-auto py-12"
          >
            <div className="mb-8">
              <SectionTitle>{currentService.title}</SectionTitle>
              <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                {currentService.description}
              </p>
            </div>

            {/* Two-column content for keynote speakers */}
            {selectedService === 'keynote-speakers' && currentService.sections && (
              <div className="grid md:grid-cols-2 gap-5 mb-12">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{currentService.sections.left.title}</h3>
                  <div className="space-y-6">
                    {currentService.sections.left.items.map((item, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                        <p className="text-gray-700">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{currentService.sections.right.title}</h3>
                  <div className="space-y-4">
                    {currentService.sections.right.items.map((item, index) => (
                      <div key={index}>
                        <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-gray-700 text-sm">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Investment Section */}
            <div
              className="rounded-2xl border p-5 md:p-6 bg-[color:var(--asb-surface)] mb-12"
              style={{ borderColor: 'var(--asb-border)' }}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {currentService.investment.title}
              </h3>
              <p className="mt-2 text-gray-700">
                {currentService.investment.description}
              </p>
              <a
                href={bookingFormUrl}
                className="mt-4 inline-flex rounded-xl bg-[color:var(--asb-blue-600)] px-4 py-2.5 text-white font-semibold"
              >
                {currentService.investment.cta}
              </a>
            </div>
          </section>

          {/* Call to Action Section */}
          <div className="mt-12">
            <BottomCta />
          </div>
        </div>
        {banner}
      </div>
    )
  }

  if (currentPage === 'quick-inquiry') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header provided by PublicLayout */}

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Quick Inquiry</h1>
              <p className="text-lg text-gray-600">Send us a quick message and we'll get back to you soon</p>
            </div>

              <Card>
                <CardContent className="p-8">
                  {quickStatus === 'success' ? (
                    <div className="rounded-xl bg-green-50 text-green-800 p-4 border border-green-200">
                      <p className="font-medium">Thank you for your inquiry.</p>
                      <p>
                        We’ll get back to you soon. For urgent booking requests, please fill in our{' '}
                        <a href={BOOK_ROUTE} className="underline font-medium">Book a Speaker</a> form.
                      </p>
                    </div>
                  ) : (
                  <form onSubmit={handleQuickSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name *</label>
                      <Input name="firstName" placeholder="Your first name" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name *</label>
                      <Input name="lastName" placeholder="Your last name" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <Input name="email" type="email" placeholder="your.email@example.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <Textarea name="message" placeholder="Tell us how we can help you..." rows={6} required />
                  </div>
                    <Button type="submit" className="w-full" disabled={quickStatus === 'loading'}>
                      {quickStatus === 'loading' ? 'Sending...' : 'Send Message'}
                    </Button>
                    {quickStatus === 'error' && (
                      <p className="mt-3 text-sm text-red-600">{quickError}</p>
                    )}
                  </form>
                  )}
                </CardContent>
              </Card>
          </div>
        </div>
      {banner}
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      {/* Header provided by PublicLayout */}

      {/* Hero Section */}
      <section id="home-hero" className="relative overflow-hidden min-h-[720px] sm:min-h-[760px] pb-20 sm:pb-24">
        <div className="absolute inset-0">
          <img
            src={heroSlides[currentSlide].image}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/60"></div>
        </div>
        
        <div className="hero-stack relative z-10 container mx-auto px-4 h-full flex flex-col items-center lg:mt-[8vh] xl:mt-[10vh] 2xl:mt-[11vh]">
          <div className="hero-content max-w-4xl text-white text-center">
            <div className="mb-4">
              <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                Authentic African Voices
              </span>
            </div>
            <h1
              className="mx-auto text-center font-bold text-white leading-[1.1] [text-wrap:balance] max-w-[22ch] sm:max-w-[26ch] text-[clamp(28px,8vw,40px)] sm:text-[clamp(32px,6vw,44px)]"
            >
              Connect with Africa's Most Compelling Voices
            </h1>
            <p
              className="mx-auto mt-3 text-center text-white/90 leading-relaxed text-[clamp(14px,3.8vw,16px)] max-w-[92vw] sm:max-w-[60ch]"
            >
              Access world-class African speakers who bring authentic insights, innovative solutions, and transformative perspectives to your events. From Fortune 500 boardrooms to international conferences.
            </p>
            {/* Buttons */}
            <div className="mt-4 sm:mt-5 lg:mt-8 flex flex-col sm:flex-row gap-4 justify-center mb-2 sm:mb-3 lg:mb-4">
              <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white" onClick={() => setCurrentPage('find-speakers')}>
                Find Your Speaker
              </Button>
              <a
                href="/#/apply-card-v1"
                className="h-10 px-6 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900"
              >
                Join as Speaker
              </a>
            </div>
          </div>
          {/* Search — tighter to buttons on mobile */}
          <div className="hero-search mt-2 sm:mt-3 md:mt-4 lg:mt-8">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <Search className="search-icon" />
                <Input
                  type="text"
                  placeholder="Search by expertise, topic, or speaker name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <Button type="submit" className="search-button">Search</Button>
            </form>
          </div>
        </div>

        {/* Hero slide info */}
        <div className="absolute bottom-20 left-8 text-white">
          <h3 className="text-lg font-semibold">{heroSlides[currentSlide].title}</h3>
          <p className="text-blue-200 text-sm">{heroSlides[currentSlide].subtitle}</p>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>
      <div id="about" className="scroll-mt-24">
        <div ref={featuredRef}>
          <Suspense fallback={null}>{featuredInView ? <FeaturedSpeakers /> : null}</Suspense>
        </div>
        <div ref={meetRef}>
          <Suspense fallback={null}>{meetInView ? <MeetOurSpeakers /> : null}</Suspense>
        </div>
        <div ref={interviewsRef}>
          <Suspense fallback={null}>{interviewsInView ? <HomeInterviewsSection /> : null}</Suspense>
        </div>
      </div>
      <div ref={insightsRef}>
        <Suspense fallback={null}>{insightsInView ? <HomeInsights /> : null}</Suspense>
      </div>
      <div ref={planRef}>
        <Suspense fallback={null}>{planInView ? <PlanYourEvent /> : null}</Suspense>
      </div>

      {/* Contact Section */}
      <section id="get-in-touch" className="section bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600">Ready to book a speaker or join our bureau? We're here to help.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Contact</h3>

              <div className="mt-4 space-y-4">
                <a
                  href="mailto:info@africanspeakerbureau.com"
                  className="flex items-center gap-3 text-lg"
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                  info@africanspeakerbureau.com
                </a>

                <WhatsAppButton
                  label="Message us on WhatsApp"
                  message={waMsgGeneral()}
                  campaign="contact"
                  size="lg"
                  align="left"
                  className="w-full md:w-auto"
                />

                <div className="flex flex-col gap-2 pt-2">
                  <a href="#/#quick-inquiry" className="text-primary hover:underline">
                    Message us
                  </a>
                  <a
                    href={BOOK_ROUTE}
                    className="text-primary hover:underline"
                  >
                    Request Consultation
                  </a>
                </div>
              </div>
            </div>

            <section id="quick-inquiry">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Inquiry</CardTitle>
                </CardHeader>
                <CardContent>
                  {quickStatus === 'success' ? (
                    <div className="rounded-xl bg-green-50 text-green-800 p-4 border border-green-200">
                      <p className="font-medium">Thank you for your inquiry.</p>
                      <p>
                        We’ll get back to you soon. For urgent booking requests, please fill in our{' '}
                        <a href={BOOK_ROUTE} className="underline font-medium">Book a Speaker</a> form.
                      </p>
                    </div>
                  ) : (
                  <form onSubmit={handleQuickSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="firstName" placeholder="First name" required />
                    <Input name="lastName" placeholder="Last name" required />
                  </div>
                  <Input name="email" type="email" placeholder="Your email" required />
                  <Textarea name="message" placeholder="Your message" rows={4} required />
                    <Button type="submit" className="w-full" disabled={quickStatus === 'loading'}>
                      {quickStatus === 'loading' ? 'Sending...' : 'Send Message'}
                    </Button>
                    {quickStatus === 'error' && (
                      <p className="mt-3 text-sm text-red-600">{quickError}</p>
                    )}
                  </form>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </section>
      {/* Admin Login Modal */}
      <AdminLoginModal
        open={route === '/admin' && !isAuthed}
        onClose={closeAdminModal}
        onSubmit={handleAdminSubmit}
      />
      {banner}
    </div>
  )
}

export default App

