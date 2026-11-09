import { useEffect, useRef, useState } from 'react'
import { animate, createTimeline, svg } from 'animejs'
import { reducedMotion } from '../lib/utils'

/** Abertura: ensō desenhado a pincel, selo 健康 e cortina (noren) que se abre. */
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
    const [a, b] = svg.createDrawable(el.querySelectorAll('.enso-a, .enso-b'))
    const tl = createTimeline({
      defaults: { ease: 'inOutQuart' },
      onComplete: () => {
        document.body.style.overflow = ''
        try { sessionStorage.setItem('kenko:seen', '1') } catch { /* ignora */ }
        setGone(true); onDone()
      },
    })
    tl.add(a, { draw: ['0 0', '0 1'], duration: 1300 }, 0)
      .add(b, { draw: ['0 0', '0 1'], duration: 1100 }, 150)
      .add(el.querySelector('.pre-kanji')!, { opacity: [0, 1], y: [24, 0], duration: 800, ease: 'outExpo' }, 700)
      .add(el.querySelector('.pre-sun')!, { scale: [0.2, 1], opacity: [0, 1], duration: 900, ease: 'outExpo' }, 500)
      .add(el.querySelector('.pre-center')!, { opacity: [1, 0], scale: [1, 1.15], duration: 500, ease: 'inQuad' }, 2000)
      .call(() => onReveal(), 2150)
      .add(el.querySelector('.noren-l')!, { x: ['0%', '-101%'], duration: 1100, ease: 'inOutExpo' }, 2150)
      .add(el.querySelector('.noren-r')!, { x: ['0%', '101%'], duration: 1100, ease: 'inOutExpo' }, 2150)
    return () => { tl.revert(); document.body.style.overflow = '' }
  }, [])

  if (gone) return null
  return (
    <div ref={root} className="fixed inset-0 z-[100] grid place-items-center" role="status" aria-label="Carregando Kenko">
      <div className="noren-l absolute inset-y-0 left-0 w-1/2 bg-black" />
      <div className="noren-r absolute inset-y-0 right-0 w-1/2 bg-black" />
      <div className="pre-center relative grid place-items-center">
        <div className="pre-sun absolute h-28 w-28 rounded-full sun opacity-0" />
        <svg viewBox="0 0 220 220" className="relative h-[min(60vw,260px)] w-[min(60vw,260px)]" fill="none" strokeLinecap="round">
          <path className="enso-a" d="M118 22C60 14 18 62 24 118c6 58 60 92 112 76 50-15 72-66 52-110" stroke="#d3111c" strokeWidth="11" />
          <path className="enso-b" d="M122 30C70 26 34 68 38 116c5 50 54 78 98 62" stroke="#f1ebe3" strokeWidth="2.2" opacity=".7" />
        </svg>
        <div className="pre-kanji absolute font-display text-5xl font-extrabold tracking-wide text-washi opacity-0">健康</div>
      </div>
    </div>
  )
}

export function bump(el: Element | null) {
  if (el) animate(el, { scale: [1, 1.35, 1], duration: 500, ease: 'outBack' })
}
