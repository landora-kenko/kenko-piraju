const WORDS = [
  ['寿司', 'Sushi'], ['刺身', 'Sashimi'], ['手巻き', 'Temaki'], ['天ぷら', 'Tempurá'],
  ['餃子', 'Gyoza'], ['焼きそば', 'Yakisoba'], ['味噌汁', 'Missoshiru'], ['抹茶', 'Matcha'],
]

function Row({ reverse }: { reverse?: boolean }) {
  const items = [...WORDS, ...WORDS]
  return (
    <div className="marquee overflow-hidden">
      <div className="marquee-track flex items-center" style={reverse ? { animationDirection: 'reverse', animationDuration: '60s' } : undefined}>
        {[0, 1].map((k) => (
          <ul key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {items.map(([jp, pt], i) => (
              <li key={i} className="flex items-center gap-6 pr-6 md:gap-10 md:pr-10">
                <span className="font-display text-4xl font-extrabold md:text-6xl">{jp}</span>
                <span className="font-display text-3xl font-medium italic md:text-5xl">{pt}</span>
                <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0"><circle cx="11" cy="11" r="9" fill="currentColor" /></svg>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

/** Faixas inclinadas que se cruzam, vermelha e preta. */
export function Marquee() {
  return (
    <div className="relative z-10 -my-6 overflow-hidden py-14 md:py-20" aria-label="Sushi, sashimi, temaki, tempurá, gyoza, yakisoba, missoshiru e matcha">
      <div className="-rotate-2 bg-beni py-4 text-black md:py-6"><Row /></div>
      <div className="-mt-3 rotate-1 border-y border-white/15 bg-black py-4 text-washi md:-mt-5 md:py-6"><Row reverse /></div>
    </div>
  )
}
