import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

export default function RequireSpeakerAuth({ children }) {
  const [state, setState] = useState('loading')

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setState(data.session ? 'authed' : 'guest')
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setState(session ? 'authed' : 'guest')
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (state === 'loading') return <div style={{ padding: 24 }}>Loading…</div>
  if (state === 'guest') return <Navigate to="/speaker-login" replace />
  return children
}

