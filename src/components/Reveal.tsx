import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  delay?: number
  className?: string
  once?: boolean
}

export function Reveal({ children, delay = 0, className = '', once = true }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-in')
            if (once) io.unobserve(el)
          } else if (!once) {
            el.classList.remove('is-in')
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
