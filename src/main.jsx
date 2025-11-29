import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { HashRouter as Router } from 'react-router-dom'
import { initSpeedInsights } from './monitoring/speedInsights'
import ScrollToTop from './components/ScrollToTop'
import { ToastProvider } from './components/Toast'
import MagicLinkShim from './app/MagicLinkShim.jsx'
import BootAuth from '@/auth/BootAuth'
import AppRoutes from '@/routes/AppRoutes'
import OptionalVercelAnalytics from './monitoring/OptionalVercelAnalytics'
import AnalyticsListener from './components/AnalyticsListener'

initSpeedInsights()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <Router>
        <AnalyticsListener />
        <BootAuth />
        <MagicLinkShim />
        <ScrollToTop />
        <AppRoutes />
      </Router>
    </ToastProvider>
    <OptionalVercelAnalytics />
  </StrictMode>,
)
