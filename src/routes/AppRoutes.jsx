import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'

import RequireSpeakerAuth from '@/components/RequireSpeakerAuth.jsx'
import AdminBlogList from '@/admin/blog/AdminBlogList'
import AdminBlogEditor from '@/admin/blog/AdminBlogEditor'
import SpeakerLogin from '@/pages/speaker/SpeakerLogin.jsx'
import SpeakerCallback from '@/pages/speaker/SpeakerCallback.jsx'
import SignOut from '@/routes/SignOut'
import SpeakerProfile from '@/routes/SpeakerProfile'
import SpeakerDashboard from '@/pages/speaker/SpeakerDashboard.jsx'

const PublicLayout = lazy(() => import('@/site/layout/PublicLayout'))
const App = lazy(() => import('@/App.jsx'))
const FindSpeakersPage = lazy(() => import('@/components/FindSpeakersPage.jsx'))
const SpeakerProfilePage = lazy(() => import('@/features/speakers/SpeakerProfilePage'))
const MicrositeCampaign = lazy(() => import('@/pages/MicrositeCampaign'))
const BookASpeaker = lazy(() => import('@/pages/BookASpeaker'))
const ApplyConsultantCardV1 = lazy(() => import('@/pages/ApplyConsultantCardV1'))
const VideosLandingPage = lazy(() => import('@/features/videos/VideosLandingPage'))
const SpeakerVideosPage = lazy(() => import('@/features/videos/SpeakerVideosPage'))
const BlogIndex = lazy(() => import('@/site/blog/BlogIndex'))
const BlogPost = lazy(() => import('@/site/blog/BlogPost'))
const Insights = lazy(() => import('@/site/blog/Insights'))
const AcademyLandingPage = lazy(() => import('@/pages/AcademyLandingPage'))
const AcademyCoursePage = lazy(() => import('@/pages/AcademyCoursePage'))
const ConsultantsPage = lazy(() => import('@/pages/ConsultantsPage'))
const ConsultantProfilePage = lazy(() => import('@/pages/ConsultantProfilePage'))

function RouteFallback() {
  return <div style={{ height: 1 }} aria-hidden="true" />
}

function SpeakerProfileRoute() {
  const { slug = '' } = useParams()
  return <SpeakerProfilePage key={slug} />
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/speaker/:slug" element={<SpeakerProfileRoute />} />
          <Route path="/speakers/:slug" element={<SpeakerProfileRoute />} />
          <Route path="/find-speakers" element={<FindSpeakersPage />} />
          <Route path="/book-a-speaker" element={<BookASpeaker />} />
          <Route path="/apply-card-v1" element={<App />} />
          <Route path="/apply-consultant-v1" element={<ApplyConsultantCardV1 />} />
          <Route path="/apply-beta" element={<Navigate to="/apply-card-v1" replace />} />
          <Route path="/apply-v2" element={<App />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/pack/:country/:slug" element={<MicrositeCampaign />} />
          <Route path="/interviews" element={<VideosLandingPage />} />
          <Route path="/interviews/:speakerSlug" element={<SpeakerVideosPage />} />
          <Route path="/videos" element={<VideosLandingPage />} />
          <Route path="/videos/:speakerSlug" element={<SpeakerVideosPage />} />
          <Route path="/academy" element={<AcademyLandingPage />} />
          <Route path="/academy/:slug" element={<AcademyCoursePage />} />
          <Route path="/consultants" element={<ConsultantsPage />} />
          <Route path="/consultants/:slug" element={<ConsultantProfilePage />} />
          <Route path="/*" element={<App />} />
        </Route>
        <Route path="/speaker-login" element={<SpeakerLogin />} />
        <Route path="/speaker-callback" element={<SpeakerCallback />} />
        <Route path="/sign-out" element={<SignOut />} />
        <Route path="/speaker-profile" element={<SpeakerProfile />} />
        <Route
          path="/speaker-dashboard"
          element={(
            <RequireSpeakerAuth>
              <SpeakerDashboard />
            </RequireSpeakerAuth>
          )}
        />
        <Route path="/admin/blog" element={<AdminBlogList />} />
        <Route path="/admin/blog/new" element={<AdminBlogEditor />} />
        <Route path="/admin/blog/:id" element={<AdminBlogEditor />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
