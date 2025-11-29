import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

function getParams() {
  const search = new URLSearchParams(window.location.search)
  const access_token = search.get('access_token')
  const refresh_token = search.get('refresh_token')
  if (access_token && refresh_token) return { access_token, refresh_token }

  const rawHash = window.location.hash || ''
  const hashPart = rawHash.includes('?')
    ? rawHash.slice(rawHash.indexOf('?') + 1)
    : rawHash.replace(/^#/, '')
  const hashParams = new URLSearchParams(hashPart)
  return {
    access_token: hashParams.get('access_token') || undefined,
    refresh_token: hashParams.get('refresh_token') || undefined,
  }
}

export default function SpeakerCallback() {
  const nav = useNavigate()
  const [msg, setMsg] = useState('Finalizing sign-in…')

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const { access_token, refresh_token } = getParams()

      if (!access_token || !refresh_token) {
        setMsg('Missing sign-in tokens. Redirecting to login…')
        setTimeout(() => nav('/speaker-login', { replace: true }), 800)
        return
      }

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })

      if (error) {
        setMsg('Sign-in failed. Redirecting to login…')
        setTimeout(() => nav('/speaker-login', { replace: true }), 1000)
        return
      }

      const { data: sess } = await supabase.auth.getSession()
      if (!sess?.session) {
        setMsg('Starting session…')
      }

      if (!cancelled) {
        nav('/speaker-dashboard', { replace: true })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [nav])

  return (
    <div style={{ padding: 24, fontSize: 18 }}>
      {msg}
    </div>
  )
}

