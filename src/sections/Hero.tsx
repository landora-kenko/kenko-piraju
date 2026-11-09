import { useEffect, useRef } from 'react'
import { animate, createTimeline, stagger } from 'animejs'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { Embers } from '../components/art/Embers'
import { openStatus } from '../lib/config'
import { reducedMotion } from '../lib/utils'

const LETTERS = ['K', 'E', 'N', 'K', 'O']
// valor por índice do alvo (tipagem do anime.js é estrita demais para funções)
const fn = (f: (i: number) => number) => ((_: unknown, i: number) => f(i)) as never

export function Hero({ revealed }: { revealed: boolean }) {
  const sec = useRef<HTMLElement>(null)
  const status = openStatus()

  /* entrada */
  useEffect(() => {
    const el = sec.current!
    if (!revealed || reducedMotion()) {
      if (reducedMotion()) el.querySelectorAll<HTMLElement>('[data-in]').forEach((n) => (n.style.opacity = '1'))
      return
    }
    const tl = createTimeline({ defaults: { ease: 'outExpo' } })
    tl.add('.sun-wrap', { opacity: [0, 1], scale: [0.55, 1], duration: 1800 }, 0)
      .add('.hk', { y: ['115%', '0%'], rotate: { from: fn((i) => (i % 2 ? 6 : -6)), to: 0 }, opacity: [0, 1], duration: 1400, delay: stagger(90) }, 150)
      .add('.ex-intro', { y: [-180, 0], scale: [0.78, 1], opacity: [0, 1], duration: 1500, ease: 'outBack' }, 450)
      .add('.plate-intro', { rotate: [-260, 0], duration: 2600, ease: 'outExpo' }, 450)
      .add('.plate-ring', { opacity: [0, 1], duration: 1400 }, 1300)
      .add('[data-in="up"]', { y: [28, 0], opacity: [0, 1], duration: 1100, delay: stagger(120) }, 900)
      .add('.rail', { opacity: [0, 1], duration: 1200 }, 1200)
      .add('.halo', { opacity: [0, 0.55], duration: 1600 }, 900)
    const float = animate('.ex-float', { y: [-6, 6], duration: 3800, alternate: true, loop: true, ease: 'inOutSine' })
    return () => { tl.revert(); float.revert() }
  }, [revealed])

  /* rolagem: um único progresso (--p, 0 a 1) suavizado em rAF; o resto é CSS */
  useEffect(() => {
    if (reducedMotion()) return
    const el = sec.current!
    let target = 0, cur = 0, raf = 0
    const read = () => {
      const max = el.offsetHeight - innerHeight
      target = max > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / max)) : 0
    }
    const tick = () => {
      cur += (target - cur) * 0.14
      if (Math.abs(target - cur) < 0.0008) cur = target
      el.style.setProperty('--p', cur.toFixed(4))
      raf = cur === target ? 0 : requestAnimationFrame(tick)
    }
    const onScroll = () => { read(); if (!raf) raf = requestAnimationFrame(tick) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf) }
  }, [])

  /* paralaxe leve com o ponteiro */
  useEffect(() => {
    const el = sec.current!
    if (reducedMotion() || !window.matchMedia('(hover: hover)').matches) return
    const move = (e: PointerEvent) => {
      el.style.setProperty('--mx', String(e.clientX / innerWidth - 0.5))
      el.style.setProperty('--my', String(e.clientY / innerHeight - 0.5))
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  const hidden = { opacity: 0 }

  return (
    <section id="inicio" ref={sec} className="hero-scroll relative h-[170vh]" style={{ ['--mx' as string]: 0, ['--my' as string]: 0, ['--p' as string]: 0 }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-black">
        <Embers className="absolute inset-0 h-full w-full" />

        {/* sol */}
        <div className="sun-wrap absolute left-1/2 top-[46%] aspect-square md:top-[52%] w-[min(92vw,86vh,820px)] -translate-x-1/2 -translate-y-1/2" style={hidden} data-in>
          <div className="h-full w-full transition-transform duration-700 ease-out" style={{ transform: 'translate3d(calc(var(--mx) * 22px), calc(var(--my) * 16px), 0)' }}>
            <div className="sun h-full w-full rounded-full" />
            <svg viewBox="0 0 400 400" className="halo absolute -inset-[7%] h-[114%] w-[114%] animate-[spin-slow_70s_linear_infinite]" style={hidden} aria-hidden>
              <defs><path id="ringpath" d="M200 200m-186 0a186 186 0 1 1 372 0a186 186 0 1 1-372 0" /></defs>
              <text fontSize="13" letterSpacing="7" fill="#f1ebe3" fontFamily="Shippori Mincho, serif">
                <textPath href="#ringpath">Kenko 健康 Piraju 寿司 Kenko 健康 Piraju 刺身 Kenko 健康 Piraju 手巻き </textPath>
              </text>
            </svg>
          </div>
        </div>

        {/* wordmark */}
        <h1 className="absolute inset-x-0 top-[13svh] flex justify-center md:top-[11svh]" aria-label="Kenko, culinária japonesa em Piraju">
          <span className="wordmark" aria-hidden>
            {LETTERS.map((l, i) => (
              <span key={i} className="hk" style={hidden}><span className="hk-i inline-block">{l}</span></span>
            ))}
          </span>
        </h1>

        {/* prato */}
        <div className="absolute left-1/2 top-[47%] w-[min(92vw,50svh,760px)] -translate-x-1/2 -translate-y-1/2 md:top-[55%] md:w-[min(90vw,76svh,760px)]">
          <div className="transition-transform duration-700 ease-out" style={{ transform: 'translate3d(calc(var(--mx) * -16px), calc(var(--my) * -10px), 0)' }}>
            <div className="ex-intro" style={hidden} data-in>
              <div className="ex-float relative [container-type:inline-size]">
                <div className="plate-zoom relative aspect-square">
                  <img src="/img/plate.webp" alt="" aria-hidden className="plate-glow absolute inset-0 h-full w-full scale-[1.1] opacity-55 blur-[36px] saturate-[1.9]" />
                  <div className="plate-ring absolute -inset-[1.6%] rounded-full" style={hidden} />
                  <div className="plate-intro h-full w-full">
                    <div className="plate-spin h-full w-full">
                      <img
                        src="/img/plate.webp" width={1600} height={1600} fetchPriority="high" draggable={false}
                        alt="Prato redondo com niguiris, sashimis e rolinhos variados do Kenko"
                        className="h-full w-full select-none drop-shadow-[0_30px_40px_rgba(0,0,0,.6)]"
                      />
                    </div>
                  </div>
                  <div className="plate-gloss pointer-events-none absolute inset-0 rounded-full" />
                </div>
                <Callout x={22} y={41} side="left" title="Salmão fresco" text="Fatia grossa, cortada na hora." />
                <Callout x={77} y={70} side="right" title="Atum" text="Corte limpo, servido gelado." />
                <Callout x={74} y={28} side="right" title="Rolinhos de alga" text="Arroz temperado e recheio do dia." />
              </div>
            </div>
          </div>
        </div>

        {/* texto */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="hero-copy absolute inset-x-0 bottom-0 z-10 px-5 pb-24 md:px-10 md:pb-12">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-md">
              <p data-in="up" style={hidden} className={`mb-3 inline-flex items-center gap-2.5 border px-3 py-1.5 text-[13px] font-medium backdrop-blur md:mb-4 md:text-sm ${status.open ? 'border-[#4ade80]/40 bg-[#052e16]/60 text-[#86efac]' : 'border-[#ef4444]/40 bg-[#2a0608]/60 text-[#fca5a5]'}`}>
                <span className={`h-2 w-2 rounded-full ${status.open ? 'live-dot-green bg-[#4ade80]' : 'bg-[#ef4444]'}`} />
                {status.text}
              </p>
              <p data-in="up" style={hidden} className="hidden font-display text-2xl font-medium leading-snug text-washi sm:block md:text-[1.7rem]">
                Sushi, sashimi e pratos quentes preparados na hora, em Piraju.
              </p>
            </div>
            <div data-in="up" style={hidden} className="flex flex-wrap gap-2.5 md:gap-3">
              <a href="#cardapio" className="btn btn-primary btn-sm md:min-h-[3.25rem] md:text-base">Ver cardápio <span className="dot"><ArrowRight size={18} /></span></a>
              <a href="#cardapio" className="btn btn-ghost btn-sm md:min-h-[3.25rem] md:text-base">Pedir delivery <span className="dot"><ShoppingBag size={16} /></span></a>
            </div>
          </div>
        </div>

        {/* trilho vertical */}
        <div className="rail pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex lg:right-8" style={hidden}>
          <span className="vertical font-display text-4xl font-extrabold tracking-[.3em] text-washi/90">健康</span>
          <span className="h-16 w-px bg-beni" />
          <span className="vertical-latin text-xs tracking-[.35em] text-ash">Piraju, SP</span>
        </div>
      </div>
    </section>
  )
}

/** Legenda ligada a um ponto do prato (x, y em % do prato). O prato termina o giro parado, então o ponto fica no lugar. */
function Callout({ x, y, side, title, text }: { x: number; y: number; side: 'left' | 'right'; title: string; text: string }) {
  const left = side === 'left'
  const reach = left ? x : 100 - x
  return (
    <div className="ex-label absolute hidden lg:block" style={{ left: `${x}%`, top: `${y}%` }}>
      <span className="ex-label-dot callout-dot" />
      <span
        className="ex-label-line absolute top-0 h-px bg-shu shadow-[0_0_8px_#ff2d1f]"
        style={left ? { right: 0, width: `calc(${reach}cqw + 2.5rem)`, transformOrigin: 'right' } : { left: 0, width: `calc(${reach}cqw + 2.5rem)`, transformOrigin: 'left' }}
      />
      <div className="absolute top-0 w-56 -translate-y-1/2 [text-shadow:0_2px_14px_#000,0_0_4px_#000]" style={left ? { right: `calc(${reach}cqw + 3rem)`, textAlign: 'right' } : { left: `calc(${reach}cqw + 3rem)` }}>
        <p className="font-display text-xl font-bold leading-tight">{title}</p>
        <p className="mt-1 text-sm leading-snug text-washi/70">{text}</p>
      </div>
    </div>
  )
}
