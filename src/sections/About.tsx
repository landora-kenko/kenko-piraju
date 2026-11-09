import { useEffect, useRef } from 'react'
import { animate, onScroll } from 'animejs'
import { useReveal } from '../hooks/useReveal'
import { useSplit } from '../hooks/useSplit'
import { reducedMotion } from '../lib/utils'

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

  /* o kanji se enche de tinta conforme a rolagem */
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
        {/* kanji */}
        <div className="lg:col-span-5">
          <div ref={box} className="relative mx-auto flex w-fit items-stretch gap-6 lg:sticky lg:top-28">
            <div className="relative font-display text-[clamp(9rem,26vw,21rem)] font-extrabold leading-[.9] vertical" aria-hidden>
              <span className="block text-transparent" style={{ WebkitTextStroke: '1.5px rgba(241,235,227,.35)' }}>健康</span>
              <div ref={fill} className="absolute inset-0 text-beni" style={{ clipPath: 'inset(100% 0 0 0)' }}>健康</div>
            </div>
            <div className="flex flex-col justify-between py-4">
              <p className="vertical-latin text-sm tracking-[.4em] text-ash">kenko, saúde</p>
              <span className="hanko h-12 w-12 text-2xl" aria-hidden>食</span>
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
