const WORDS = [
  ['寿司', 'Sushi'], ['刺身', 'Sashimi'], ['手巻き', 'Temaki'], ['天ぷら', 'Tempurá'],
  ['餃子', 'Gyoza'], ['焼きそば', 'Yakisoba'], ['味噌汁', 'Missoshiru'], ['抹茶', 'Matcha'],
]

/** Faixa fina e silenciosa, uma linha só. */
export function Marquee() {
  return (
    <div
      className="marquee relative overflow-hidden border-y border-white/10 py-3.5 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] md:py-4"
      aria-label="Sushi, sashimi, temaki, tempurá, gyoza, yakisoba, missoshiru e matcha"
    >
      <div className="marquee-track flex" style={{ animationDuration: '80s' }}>
        {[0, 1].map((k) => (
          <ul key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {[...WORDS, ...WORDS].map(([jp, pt], i) => (
              <li key={i} className="flex items-center gap-3 whitespace-nowrap pr-8 text-[13px] text-washi/55 md:pr-12 md:text-sm">
                <span className="font-display text-base font-bold text-washi/80 md:text-lg">{jp}</span>
                <span className="italic">{pt}</span>
                <span className="ml-5 h-1 w-1 rounded-full bg-beni md:ml-9" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
