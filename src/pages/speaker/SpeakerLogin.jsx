import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import logoUrl from '/logo-asb.svg'
import { lazyImgProps } from '@/lib/img'

export default function SpeakerLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // If user becomes signed-in while this page is open, go to dashboard.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        navigate('/speaker-dashboard', { replace: true })
      }
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  const redirectTo = `${window.location.origin}/#/speaker-callback`

  async function onSubmit(e) {
    e.preventDefault()
    setSending(true)
    setMessage('')
    setError('')
    try {
      localStorage.setItem('asb_pending_email', email.trim())
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
        },
      })
      if (error) throw error
      setMessage('Check your inbox for the login link.')
    } catch (err) {
      setError(err.message || 'Failed to send magic link')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{minHeight:'70vh', display:'grid', placeItems:'center', padding:'40px 16px'}}>
      <div style={{maxWidth:520, width:'100%'}}>
        <img
          src={logoUrl}
          alt="ASB"
          style={{height:56, margin:'0 auto 20px', display:'block'}}
          width={56}
          height={56}
          {...lazyImgProps}
        />
        <h1 style={{fontSize:48, lineHeight:1, margin:'0 0 12px', textAlign:'center'}}>Speaker Login</h1>
        <p style={{textAlign:'center', color:'#4b5563', margin:'0 0 24px'}}>
          Enter your email address and we’ll send you a one-time magic link to sign in.
        </p>
        <form onSubmit={onSubmit} style={{display:'grid', gap:12}}>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            style={{height:44, border:'1px solid #e5e7eb', borderRadius:10, padding:'0 12px'}}
          />
          <button type="submit" disabled={sending}
            style={{height:44, borderRadius:10, background:'#111827', color:'#fff'}}>
            {sending ? 'Sending…' : 'Email me a magic link'}
          </button>
        </form>
        {message && <p style={{marginTop:12, color:'#065f46', background:'#ecfdf5', border:'1px solid #a7f3d0', padding:'8px 12px', borderRadius:8}}>{message}</p>}
        {error && <p style={{marginTop:12, color:'crimson'}}>{error}</p>}
      </div>
    </div>
  )
}
