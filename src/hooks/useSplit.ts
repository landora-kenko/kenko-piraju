import { useEffect, useRef } from 'react'
import { animate, splitText, stagger } from 'animejs'
import { reducedMotion } from '../lib/utils'

/** Título que sobe palavra por palavra ao entrar na tela. */
export function useSplit<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    const sp = splitText(el, { words: { wrap: 'clip' } })
    const words = sp.words as HTMLElement[]
    words.forEach((w) => {
      w.style.transform = 'translateY(115%)'
      const wrap = w.parentElement
      if (wrap) { wrap.style.paddingBottom = '.22em'; wrap.style.marginBottom = '-.22em' } // não corta descendentes (j, g, p)
    })
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        animate(words, { y: ['115%', '0%'], duration: 1200, ease: 'outExpo', delay: stagger(70) })
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => { io.disconnect(); sp.revert() }
  }, [])
  return ref
}
