import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Typed helper for passing CSS custom properties through `style` */
export function cssVars(vars: Record<string, string | number>): CSSProperties {
  return vars as CSSProperties
}

/** Becomes true the first time the element scrolls into view, then stays true */
export function useInView<T extends Element>(threshold = 0.15, rootMargin = '0px 0px -40px 0px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, inView] as const
}

/** Fades and slides its children up when they scroll into view */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className={`reveal ${inView ? 'is-visible' : ''} ${className}`} style={cssVars({ '--delay': `${delay}ms` })}>
      {children}
    </div>
  )
}

/**
 * Counts up to a display value such as "40,000+", "1.4M+" or "Band 8.0" once visible,
 * keeping its prefix, suffix, decimals and thousands separators.
 */
export function CountUp({ value, from = 0, delay = 0, duration = 1600 }: { value: string; from?: number; delay?: number; duration?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.5, '0px')
  const match = value.match(/^(\D*)([\d,]*\.?\d+)(.*)$/)
  const target = match ? Number(match[2].replace(/,/g, '')) : 0
  // Reduced-motion visitors see the final value straight away, even before it scrolls into view
  const [current, setCurrent] = useState(() => (prefersReducedMotion() ? target : from))

  useEffect(() => {
    if (!match || !inView) return
    if (prefersReducedMotion()) {
      setCurrent(target)
      return
    }
    let frame = 0
    const timeout = window.setTimeout(() => {
      const startedAt = performance.now()
      const tick = (now: number) => {
        // rAF timestamps can be slightly earlier than performance.now(), so clamp at 0
        const progress = Math.min(1, Math.max(0, (now - startedAt) / duration))
        const eased = 1 - Math.pow(1 - progress, 3)
        setCurrent(from + (target - from) * eased)
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, delay)
    return () => {
      window.clearTimeout(timeout)
      cancelAnimationFrame(frame)
    }
  }, [inView, target, from, delay, duration])

  if (!match) return <span>{value}</span>

  const [, prefix, raw, suffix] = match
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0
  const formatted = raw.includes(',')
    ? current.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : current.toFixed(decimals)

  return (
    <span ref={ref}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{prefix}{formatted}{suffix}</span>
    </span>
  )
}
