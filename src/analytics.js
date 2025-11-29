const GA_MEASUREMENT_ID = 'G-C8XNFM5RGH'

const isProduction = import.meta.env?.MODE === 'production'

export const trackPageView = (url) => {
  if (!isProduction) return
  if (typeof window === 'undefined') return
  const gtag = window.gtag
  if (typeof gtag !== 'function') return

  gtag('event', 'page_view', {
    page_path: url,
    send_to: GA_MEASUREMENT_ID,
  })
}

export { GA_MEASUREMENT_ID }
