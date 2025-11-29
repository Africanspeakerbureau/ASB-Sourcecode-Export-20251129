import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

export default function SignOut() {
  const navigate = useNavigate()
  useEffect(() => {
    ;(async () => {
      try { await supabase.auth.signOut() } catch { /* ignore */ }
      try {
        localStorage.removeItem('asb_pending_email')
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('sb-') || k.includes('supabase') || k.includes('pkce')) {
            localStorage.removeItem(k)
          }
        })
      } catch { /* ignore */ }
      navigate('/speaker-login', { replace: true })
    })()
  }, [navigate])

  return <div style={{ padding:24 }}>Signing you out…</div>
}
