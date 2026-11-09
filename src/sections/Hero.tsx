import { useEffect, useRef } from 'react'
import { animate, createTimeline, onScroll, stagger } from 'animejs'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { ExplodedNigiri } from '../components/art/ExplodedNigiri'
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
      .add('.ex-intro', { y: [-160, 0], rotate: [-8, 0], opacity: [0, 1], duration: 1700, ease: 'outBack' }, 500)
      .add('[data-in="up"]', { y: [28, 0], opacity: [0, 1], duration: 1100, delay: stagger(120) }, 900)
      .add('.rail', { opacity: [0, 1], duration: 1200 }, 1200)
      .add('.halo', { opacity: [0, 0.55], duration: 1600 }, 900)
    const float = animate('.ex-float', { y: [-7, 7], rotate: [-1, 1], duration: 3800, alternate: true, loop: true, ease: 'inOutSine' })
    return () => { tl.revert(); float.revert() }
  }, [revealed])

  /* vista explodida controlada pelo scroll */
  useEffect(() => {
    if (reducedMotion()) return
    const el = sec.current!
    const tl = createTimeline({
      defaults: { ease: 'inOutSine', duration: 1000 },
      autoplay: onScroll({ target: el, enter: 'top top', leave: 'bottom bottom', sync: true }),
    })
    tl.add('.ex-garnish', { y: [0, -160], rotate: [0, -3] }, 0)
      .add('.ex-neta', { y: [0, -96], rotate: [0, 1.5] }, 0)
      .add('.ex-nori', { y: [0, -6] }, 0)
      .add('.ex-rice', { y: [0, 84] }, 0)
      .add('.ex-shadow', { scaleX: [1, 1.12], opacity: [0.7, 0.35] }, 0)
      .add('.hk-i', { x: { to: fn((i) => (i - 2) * 12) }, y: { to: fn((i) => (i % 2 ? 16 : -16)) } }, 0)
      .add('.sun', { scale: [1, 1.18] }, 0)
      .add('.wordmark', { opacity: [1, 0.4] }, 0)
      .add('.hero-copy', { opacity: [1, 0], y: [0, -40], duration: 260 }, 40)
      .add('.ex-label', { opacity: [0, 1], y: [16, 0], duration: 220, delay: stagger(130) }, 480)
      .add('.ex-label-line', { scaleX: [0, 1], duration: 260, delay: stagger(130) }, 480)
    return () => { tl.revert() }
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
    <section id="inicio" ref={sec} className="relative h-[330vh]" style={{ ['--mx' as string]: 0, ['--my' as string]: 0 }}>
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

        {/* sushi */}
        <div className="absolute left-1/2 top-[47%] w-[min(104vw,56svh,780px)] -translate-x-1/2 -translate-y-1/2 md:w-[min(100vw,80svh,780px)] md:top-[55%]">
          <div className="transition-transform duration-700 ease-out" style={{ transform: 'translate3d(calc(var(--mx) * -16px), calc(var(--my) * -10px), 0)' }}>
            <div className="ex-intro" style={hidden} data-in>
              <div className="ex-float relative">
                <ExplodedNigiri className="w-full drop-shadow-[0_30px_40px_rgba(0,0,0,.55)]" />
                {/* legendas */}
                <Label cls="right-full top-[41%] mr-2" side="left" title="Salmão maçaricado" text="Selado na hora, com tarê e cebolinha." />
                <Label cls="left-full top-[53%] ml-2" side="right" title="Alga nori tostada" text="Uma faixa fina que segura o corte." />
                <Label cls="right-full top-[75%] mr-2" side="left" title="Arroz shari" text="Temperado com vinagre, moldado à mão." />
              </div>
            </div>
          </div>
        </div>

        {/* texto */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="hero-copy absolute inset-x-0 bottom-0 z-10 px-5 pb-24 md:px-10 md:pb-12">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-md">
              <p data-in="up" style={hidden} className="mb-3 inline-flex items-center gap-2.5 text-[13px] md:mb-4 md:text-sm border border-white/15 bg-black/50 px-3 py-1.5 text-sm backdrop-blur">
                <span className={`h-2 w-2 rounded-full ${status.open ? 'live-dot bg-beni' : 'bg-ash'}`} />
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

function Label({ cls, side, title, text }: { cls: string; side: 'left' | 'right'; title: string; text: string }) {
  return (
    <div className={`ex-label absolute ${cls} hidden w-56 opacity-0 lg:block`} style={{ textAlign: side === 'right' ? 'left' : 'right' }}>
      <div className={`ex-label-line mb-2 h-px w-20 bg-beni ${side === 'left' ? 'ml-auto origin-right' : 'origin-left'}`} />
      <p className="font-display text-xl font-bold leading-tight">{title}</p>
      <p className="mt-1 text-sm leading-snug text-washi/70">{text}</p>
    </div>
  )
}
