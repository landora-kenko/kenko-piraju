import { useEffect, useRef } from 'react'
import { animate, onScroll } from 'animejs'
import { useReveal } from '../hooks/useReveal'
import { useSplit } from '../hooks/useSplit'
import { reducedMotion } from '../lib/utils'
import { Photo } from '../components/Photo'

const PRINCIPLES = [
  { k: '旬', n: 'Shun', t: 'Ingrediente na estação', d: 'Peixes e legumes escolhidos pelo frescor do dia, não pelo costume.' },
  { k: '匠', n: 'Takumi', t: 'Técnica na faca e nas mãos', d: 'Arroz temperado e moldado à mão, corte limpo e montagem na hora.' },
  { k: '心', n: 'Kokoro', t: 'Atendimento de coração', d: 'Do balcão ao delivery, a mesma atenção com quem está do outro lado.' },
]

export function About() {
  const root = useReveal<HTMLElement>()
  const title = useSplit<HTMLHeadingElement>()
  const fill = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const disc = useRef<HTMLDivElement>(null)

  /* o kanji se enche de tinta conforme a rolagem */
  useEffect(() => {
    const f = frame.current!, d = disc.current!
    if (reducedMotion()) { f.style.clipPath = 'inset(0)'; d.style.opacity = '1' }
    else {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        animate(f, { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'], duration: 1500, ease: 'outExpo' })
        animate(d, { opacity: [0, 1], scale: [0.5, 1], rotate: [-120, 0], duration: 1600, delay: 500, ease: 'outExpo' })
      }, { threshold: 0.2 })
      io.observe(box.current!)
      const par = animate(img.current!, { y: ['-7%', '7%'], ease: 'linear', autoplay: onScroll({ target: f, enter: 'top bottom', leave: 'bottom top', sync: true }) })
      return () => { io.disconnect(); par.revert() }
    }
  }, [])

  useEffect(() => {
    if (reducedMotion()) { if (fill.current) fill.current.style.clipPath = 'inset(0)'; return }
    const a = animate(fill.current!, {
      clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'],
      ease: 'linear',
      autoplay: onScroll({ target: box.current!, enter: 'bottom 85%', leave: 'center 40%', sync: true }),
    })
    return () => { a.revert() }
  }, [])

  return (
    <section id="sobre" ref={root} className="relative px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-12 lg:gap-8">
        {/* fotos + kanji */}
        <div className="lg:col-span-5">
          <div ref={box} className="relative mx-auto w-full max-w-[470px] pb-14 lg:sticky lg:top-28">
            <div ref={frame} className="relative aspect-[4/5] w-[80%] overflow-hidden bg-[#120506]" style={{ clipPath: 'inset(0 0 100% 0)' }}>
              <img ref={img} src="/img/tobiko.webp" alt="Uramaki coberto de ovas laranja, segurado por hashi sobre o molho shoyu" loading="lazy" decoding="async" className="absolute -top-[8%] left-0 h-[116%] w-full object-cover object-[50%_28%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-wine/30" />
            </div>
            <div ref={disc} className="neon-disc absolute -bottom-0 -left-4 w-[46%] rounded-full opacity-0 md:-left-8">
              <Photo crop="splash-roll" alt="Uramaki com broto, mergulhando no shoyu" className="w-full rounded-full" />
            </div>
            <div className="absolute right-0 top-0 flex items-stretch gap-3">
              <div className="relative font-display text-[clamp(5.2rem,13vw,9.5rem)] font-extrabold leading-[.9] vertical" aria-hidden>
                <span className="block text-transparent" style={{ WebkitTextStroke: '1.5px rgba(241,235,227,.45)' }}>健康</span>
                <div ref={fill} className="absolute inset-0 text-beni [text-shadow:0_0_26px_rgba(255,45,31,.6)]" style={{ clipPath: 'inset(100% 0 0 0)' }}>健康</div>
              </div>
              <div className="flex flex-col justify-between py-3">
                <p className="vertical-latin text-xs tracking-[.4em] text-ash">kenko, saúde</p>
                <span className="hanko h-11 w-11 text-xl" aria-hidden>食</span>
              </div>
            </div>
          </div>
        </div>

        {/* texto */}
        <div className="lg:col-span-7 lg:pt-10">
          <h2 ref={title} className="font-display text-[clamp(2.4rem,5.4vw,4.6rem)] font-extrabold leading-[1.05] tracking-tight">
            Kenko, em japonês, quer dizer saúde.
          </h2>
          <div className="mt-8 max-w-xl space-y-5 text-lg leading-relaxed text-washi/80" data-reveal>
            <p>É esse o jeito que a gente cozinha: peixe fresco, arroz no ponto e tudo montado na hora, sem pressa no preparo e sem atalho no sabor.</p>
            <p>Você escolhe o que quer no cardápio digital e recebe em casa, retira no balcão ou senta com a gente e vê a mesa livre antes de sair de casa.</p>
          </div>

          <ul className="mt-14 border-t border-white/12">
            {PRINCIPLES.map((p) => (
              <li key={p.k} data-reveal className="group grid grid-cols-[auto_1fr] items-center gap-6 border-b border-white/12 py-7 transition-colors hover:bg-white/[.03] md:grid-cols-[auto_1fr_auto] md:px-4">
                <span className="hanko h-14 w-14 text-3xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 md:h-16 md:w-16 md:text-4xl">{p.k}</span>
                <div>
                  <h3 className="font-display text-2xl font-bold">{p.t}</h3>
                  <p className="mt-1 max-w-md text-washi/70">{p.d}</p>
                </div>
                <span className="hidden font-display text-xl italic text-ash md:block">{p.n}</span>
              </li>
            ))}
          </ul>

          <blockquote data-reveal className="mt-14 flex items-start gap-5">
            <span className="mt-1 h-16 w-1 shrink-0 bg-beni" />
            <div>
              <p className="font-display text-3xl font-bold md:text-4xl">一期一会</p>
              <p className="mt-2 max-w-md text-washi/70">Ichi-go ichi-e: cada refeição é um encontro que só acontece uma vez. É assim que a gente pensa cada prato.</p>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  )
}
