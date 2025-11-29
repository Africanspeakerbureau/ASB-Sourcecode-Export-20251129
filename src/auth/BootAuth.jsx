import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

const AUTO_REDIRECT_FROM = new Set(['/speaker-login', '/speaker-callback'])

export default function BootAuth() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const goDashboard = () => {
      const raw = location.hash?.slice(1) || location.pathname || '/'
      const path = raw.startsWith('/') ? raw : `/${raw}`
      if (AUTO_REDIRECT_FROM.has(path)) {
        navigate('/speaker-dashboard', { replace: true })
      }
    }

    const cleanUrl = () => {
      const path = window.location.pathname
      const hash = window.location.hash.startsWith('#/') ? window.location.hash : '#/'
      window.history.replaceState({}, '', path + hash)
    }

    const handleUrl = async () => {
      try {
        const { hash, search } = window.location

        // Case 1: magic-link tokens in hash
        if (hash.includes('access_token=')) {
          const sp = new URLSearchParams(hash.slice(1))
          const access_token = sp.get('access_token')
          const refresh_token = sp.get('refresh_token')
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token })
            // Clean URL and force a single, safe reload to hydrate auth everywhere.
            cleanUrl()
            goDashboard()
            window.location.reload() // ← one-time hard reload
            return
          }
        }

        // Case 2: code (PKCE-style)
        const qs = new URLSearchParams(search)
        const code = qs.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (!error) {
            cleanUrl()
            goDashboard()
            window.location.reload() // ← one-time hard reload
          }
        }
      } catch { /* no-op */ }
    }

    handleUrl()

    // Also react when auth becomes ready or user signs in elsewhere
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        goDashboard()
      }
    })

    // If the hash changes to include tokens (some browsers), re-handle
    const onHash = () => {
      if (window.location.hash.includes('access_token=')) handleUrl()
    }
    window.addEventListener('hashchange', onHash)

    return () => {
      subscription?.unsubscribe()
      window.removeEventListener('hashchange', onHash)
    }
  }, [location, navigate])

  return null
}
