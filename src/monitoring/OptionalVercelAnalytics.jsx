import { useEffect, useState } from 'react'

const Noop = () => null

export default function OptionalVercelAnalytics(props) {
  const [Component, setComponent] = useState(() => Noop)

  useEffect(() => {
    if (!import.meta.env.PROD) {
      return
    }

    let cancelled = false

    const moduleName = '@vercel/analytics/react'

    import(/* @vite-ignore */ moduleName)
      .then(mod => {
        const AnalyticsComponent = mod?.Analytics || mod?.default
        if (!cancelled && typeof AnalyticsComponent === 'function') {
          setComponent(() => AnalyticsComponent)
        }
      })
      .catch(error => {
        if (import.meta.env.DEV) {
          console.info('Vercel analytics unavailable, skipping instrumentation.', error)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const AnalyticsComponent = Component

  return <AnalyticsComponent {...props} />
}
