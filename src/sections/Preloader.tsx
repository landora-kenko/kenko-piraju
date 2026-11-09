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
    tl.add(svg.createDrawable(el.querySelector('.enso-mask')!), { draw: ['0 0', '0 1'], duration: 1800, ease: 'inOutSine' }, 0)
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
        <svg viewBox="0 0 1254 1254" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <filter id="soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="14" /></filter>
            <mask id="paint" maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254">
              <g filter="url(#soft)"><path className="enso-mask" d="M1135 837 L1124 863 L1111 888 L1097 912 L1082 936 L1066 959 L1048 981 L1030 1002 L1010 1022 L990 1041 L968 1058 L946 1075 L923 1091 L899 1105 L874 1118 L849 1130 L823 1141 L796 1150 L769 1158 L742 1165 L715 1170 L687 1174 L659 1176 L631 1177 L603 1176 L575 1175 L547 1171 L520 1166 L492 1160 L465 1153 L439 1144 L413 1134 L387 1122 L362 1109 L338 1095 L315 1080 L292 1063 L270 1046 L250 1027 L230 1007 L211 987 L193 965 L176 942 L161 919 L147 895 L134 870 L122 845 L112 819 L102 792 L95 765 L88 738 L83 711 L80 683 L78 655 L77 627 L78 599 L80 571 L83 543 L88 516 L95 489 L102 462 L112 435 L122 409 L134 384 L147 359 L161 335 L176 312 L193 289 L211 267 L230 247 L250 227 L270 208 L292 191 L315 174 L338 159 L362 145 L387 132 L413 120 L439 110 L465 101 L492 94 L520 88 L547 83 L575 79 L603 78 L631 77 L659 78 L687 80 L715 84 L742 89 L769 96 L796 104 L823 113 L849 124 L874 136 L899 149 L923 163 L946 179 L968 196 L990 213 L1010 232 L1030 252 L1048 273 L1066 295 L1082 318 L1097 342 L1111 366 L1124 391 L1135 417 L1145 443 L1154 469 L1161 496 L1167 524 L1172 551 L1175 579 L1177 607 L1177 635 L1176 663 L1173 691 L1169 719 L1164 746" fill="none" stroke="#fff" strokeWidth="300" strokeLinecap="butt" strokeLinejoin="round" /></g>
            </mask>
          </defs>
          <image href="/img/ring.webp" width="1254" height="1254" mask="url(#paint)" />
        </svg>
        <img src="/img/logo.webp" alt="Kenko Sushi Bar" width={840} height={840} className="pre-logo relative h-[60%] w-[60%] rounded-full opacity-0" />
      </div>
    </div>
  )
}

export function bump(el: Element | null) {
  if (el) animate(el, { scale: [1, 1.35, 1], duration: 500, ease: 'outBack' })
}
