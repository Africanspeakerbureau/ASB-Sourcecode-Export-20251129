import { useEffect } from 'react'

export default function MagicLinkShim() {
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search)
    if (qs.get('code') && !window.location.hash.includes('/speaker-callback')) {
      window.location.replace(`${window.location.origin}/#/speaker-callback${window.location.search}`)
    }
  }, [])
  return null
}
