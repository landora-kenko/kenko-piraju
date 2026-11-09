import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { reducedMotion } from '../lib/utils'

/** Revela filhos [data-reveal] quando a seção entra na tela (uma vez). */
export function useReveal<T extends HTMLElement>(opts: { y?: number; delay?: number } = {}) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (reducedMotion()) return
    items.forEach((i) => (i.style.opacity = '0'))
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        animate(items, {
          opacity: [0, 1],
          y: [opts.y ?? 36, 0],
          duration: 1100,
          ease: 'outExpo',
          delay: stagger(110, { start: opts.delay ?? 0 }),
        })
      },
      { threshold: 0.18 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}
