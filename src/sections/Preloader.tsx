import { useEffect, useRef, useState } from 'react'
import { animate, createTimeline, svg } from 'animejs'
import { reducedMotion } from '../lib/utils'

/** Abertura: a logo do Kenko surge com um brilho vermelho e a cortina (noren) se abre. */
export function Preloader({ onDone, onReveal }: { onDone: () => void; onReveal: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const seen = (() => { try { return sessionStorage.getItem('kenko:seen') } catch { return null } })()
    if (reducedMotion() || seen) {
      setGone(true); onReveal(); onDone(); return
    }
    document.body.style.overflow = 'hidden'
    const el = root.current!
    const tl = createTimeline({
      defaults: { ease: 'inOutQuart' },
      onComplete: () => {
        document.body.style.overflow = ''
        try { sessionStorage.setItem('kenko:seen', '1') } catch { /* ignora */ }
        setGone(true); onDone()
      },
    })
    const [a, b] = [el.querySelector('.enso-a')!, el.querySelector('.enso-b')!]
    tl.add(svg.createDrawable(a), { draw: ['0 0', '0 1'], duration: 1300, ease: 'inOutQuart' }, 0)
      .add(svg.createDrawable(b), { draw: ['0 0', '0 1'], duration: 1100, ease: 'inOutQuart' }, 150)
      .add(el.querySelector('.pre-sun')!, { scale: [0.4, 1], opacity: [0, 1], duration: 1200, ease: 'outExpo' }, 500)
      .add(el.querySelector('.pre-logo')!, { opacity: [0, 1], scale: [0.8, 1], duration: 1100, ease: 'outExpo' }, 750)
      .add(el.querySelector('.pre-center')!, { opacity: [1, 0], scale: [1, 1.12], duration: 500, ease: 'inQuad' }, 2100)
      .call(() => onReveal(), 2250)
      .add(el.querySelector('.noren-l')!, { x: ['0%', '-101%'], duration: 1100, ease: 'inOutExpo' }, 2250)
      .add(el.querySelector('.noren-r')!, { x: ['0%', '101%'], duration: 1100, ease: 'inOutExpo' }, 2250)
    return () => { tl.revert(); document.body.style.overflow = '' }
  }, [])

  if (gone) return null
  return (
    <div ref={root} className="fixed inset-0 z-[100] grid place-items-center" role="status" aria-label="Carregando Kenko">
      <div className="noren-l absolute inset-y-0 left-0 w-1/2 bg-black" />
      <div className="noren-r absolute inset-y-0 right-0 w-1/2 bg-black" />
      <div className="pre-center relative grid h-[min(78vw,360px)] w-[min(78vw,360px)] place-items-center">
        <div className="pre-sun absolute inset-[8%] rounded-full opacity-0" style={{ background: 'radial-gradient(circle, rgba(211,17,28,.38) 0%, rgba(211,17,28,.14) 45%, rgba(211,17,28,0) 70%)' }} />
        <svg viewBox="0 0 220 220" className="absolute inset-0 h-full w-full" fill="none" strokeLinecap="round" aria-hidden>
          <path className="enso-a" d="M118 22C60 14 18 62 24 118c6 58 60 92 112 76 50-15 72-66 52-110" stroke="#d3111c" strokeWidth="6" />
          <path className="enso-b" d="M122 30C70 26 34 68 38 116c5 50 54 78 98 62" stroke="#f1ebe3" strokeWidth="1.6" opacity=".7" />
        </svg>
        <img src="/img/logo.webp" alt="Kenko Sushi Bar" width={840} height={840} className="pre-logo relative h-[58%] w-[58%] rounded-full opacity-0" />
      </div>
    </div>
  )
}

export function bump(el: Element | null) {
  if (el) animate(el, { scale: [1, 1.35, 1], duration: 500, ease: 'outBack' })
}
