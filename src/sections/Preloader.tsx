import { useEffect, useRef, useState } from 'react'
import { animate, createTimeline } from 'animejs'
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
    tl.add(el.querySelector('.pre-sun')!, { scale: [0.3, 1], opacity: [0, 1], duration: 1100, ease: 'outExpo' }, 0)
      .add(el.querySelector('.pre-logo')!, { opacity: [0, 1], scale: [0.82, 1], rotate: [-10, 0], duration: 1200, ease: 'outExpo' }, 250)
      .add(el.querySelector('.pre-line')!, { scaleX: [0, 1], duration: 1300, ease: 'inOutQuart' }, 500)
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
      <div className="pre-center relative grid place-items-center justify-items-center">
        <div className="pre-sun absolute h-[min(70vw,380px)] w-[min(70vw,380px)] rounded-full bg-beni/45 opacity-0 blur-[70px]" />
        <img src="/img/logo.webp" alt="Kenko Sushi Bar" width={840} height={840} className="pre-logo relative h-[min(62vw,300px)] w-[min(62vw,300px)] rounded-full opacity-0" />
        <div className="pre-line mt-8 h-px w-[min(40vw,160px)] origin-left bg-beni/80" style={{ transform: 'scaleX(0)' }} />
      </div>
    </div>
  )
}

export function bump(el: Element | null) {
  if (el) animate(el, { scale: [1, 1.35, 1], duration: 500, ease: 'outBack' })
}
