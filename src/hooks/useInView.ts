import { MutableRefObject, useEffect, useRef, useState } from 'react'

type UseInViewOptions = {
  root?: Element | Document | null
  rootMargin?: string
  threshold?: number | number[]
}

export function useInView(options: UseInViewOptions = {}): {
  ref: MutableRefObject<HTMLElement | null>
  inView: boolean
} {
  const { root = null, rootMargin = '0px', threshold = 0 } = options
  const ref = useRef<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current || inView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        })
      },
      { root, rootMargin, threshold }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [inView, root, rootMargin, threshold])

  return { ref, inView }
}
