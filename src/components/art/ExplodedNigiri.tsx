import { useMemo } from 'react'
import { rng } from '../../lib/utils'

/**
 * Niguiri de salmão maçaricado em vista explodida.
 * Cada camada é um <g class="ex-*"> animado pelo scroll (ver Hero).
 */
export function ExplodedNigiri({ className }: { className?: string }) {
  const grains = useMemo(() => {
    const rd = rng(42)
    return Array.from({ length: 150 }, () => {
      const x = 128 + rd() * 384, y = 380 + rd() * 106
      return { x, y, r: rd() * 180 }
    }).filter((g) => {
      // mantém os grãos dentro do bloco arredondado
      const dx = Math.max(0, 170 - g.x, g.x - 470)
      const dy = Math.max(0, 430 - g.y, g.y - 430) * 0
      return dx * dx + dy < 60 * 60 && g.y > 378 && g.y < 488
    })
  }, [])
  const seeds = useMemo(() => {
    const rd = rng(9)
    return Array.from({ length: 26 }, () => ({ x: 150 + rd() * 340, y: 252 + rd() * 62, r: rd() * 180, d: rd() > 0.45 }))
  }, [])

  return (
    <svg viewBox="60 50 520 580" className={className} role="img" aria-label="Niguiri de salmão maçaricado em vista explodida">
      <defs>
        <linearGradient id="ex-riceshade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#6b5a40" stopOpacity=".38" />
        </linearGradient>
        <radialGradient id="ex-ikura" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffb25a" />
          <stop offset=".6" stopColor="#f2551a" />
          <stop offset="1" stopColor="#b3200a" />
        </radialGradient>
        <linearGradient id="ex-neta" x1="0" y1="0" x2=".35" y2="1">
          <stop offset="0" stopColor="#ffb58c" />
          <stop offset=".55" stopColor="#ff6c45" />
          <stop offset="1" stopColor="#e63a24" />
        </linearGradient>
        <clipPath id="ex-clip-neta">
          <path d="M100 352C92 292 190 248 320 248S548 292 540 352C536 384 460 392 320 392S104 384 100 352Z" />
        </clipPath>
      </defs>

      <ellipse className="ex-shadow" cx="320" cy="650" rx="215" ry="22" fill="#000" opacity=".7" />

      {/* arroz */}
      <g className="ex-rice">
        <rect x="110" y="370" width="420" height="124" rx="60" fill="url(#g-rice)" />
        {grains.map((g, i) => (
          <ellipse key={i} cx={g.x} cy={g.y} rx="11" ry="4.6" transform={`rotate(${g.r} ${g.x} ${g.y})`} fill="#fffdf7" stroke="#cfc2ad" strokeWidth=".8" opacity=".95" />
        ))}
        <rect x="110" y="370" width="420" height="124" rx="60" fill="url(#ex-riceshade)" />
      </g>

      {/* alga */}
      <g className="ex-nori">
        <rect x="140" y="360" width="360" height="30" rx="14" fill="url(#g-nori)" />
        <g stroke="#5f8a6c" strokeWidth="1" opacity=".35">
          {[366, 372, 378, 384].map((y) => <path key={y} d={`M158 ${y}H482`} />)}
        </g>
        <rect x="140" y="360" width="360" height="30" rx="14" fill="none" stroke="#fff" strokeOpacity=".1" />
      </g>

      {/* salmão */}
      <g className="ex-neta">
        <path d="M100 352C92 292 190 248 320 248S548 292 540 352C536 384 460 392 320 392S104 384 100 352Z" fill="url(#ex-neta)" />
        <g clipPath="url(#ex-clip-neta)">
          <g fill="none" stroke="#fff1e8" strokeLinecap="round">
            <path d="M112 338C170 296 262 280 338 286" strokeWidth="5" opacity=".5" />
            <path d="M130 360C210 318 320 304 430 322" strokeWidth="4" opacity=".42" />
            <path d="M210 276C300 262 410 280 470 312" strokeWidth="3" opacity=".45" />
            <path d="M360 262C430 270 500 298 528 340" strokeWidth="4" opacity=".4" />
            <path d="M150 372C250 346 380 346 520 360" strokeWidth="3" opacity=".35" />
            <path d="M240 300C290 292 340 294 380 304" strokeWidth="2" opacity=".5" />
          </g>
          {/* marcas do maçarico */}
          <g stroke="#3a1608" strokeLinecap="round">
            {Array.from({ length: 15 }, (_, i) => <path key={'a' + i} d={`M${130 + i * 26} ${258 + (i % 3) * 8}l30 30`} strokeWidth="3.6" opacity={0.5 - (i % 4) * 0.08} />)}
            {Array.from({ length: 15 }, (_, i) => <path key={'b' + i} d={`M${166 + i * 26} ${254 + (i % 3) * 8}l-30 30`} strokeWidth="3" opacity={0.42 - (i % 4) * 0.07} />)}
          </g>
          <g stroke="#ffb04a" strokeLinecap="round" opacity=".55">
            {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${150 + i * 38} ${262 + (i % 2) * 14}l18 18`} strokeWidth="1.6" />)}
          </g>
          <ellipse cx="250" cy="284" rx="96" ry="13" fill="#fff" opacity=".2" transform="rotate(-9 250 284)" />
        </g>
        <path d="M100 352C92 292 190 248 320 248S548 292 540 352" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="1.5" />
      </g>

      {/* finalização */}
      <g className="ex-garnish">
        <path d="M148 306C222 338 282 272 342 306S452 284 502 316" fill="none" stroke="url(#g-tare)" strokeWidth="7" strokeLinecap="round" />
        <path d="M156 303C226 332 284 268 344 301" fill="none" stroke="#ff9a7a" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
        {seeds.map((s, i) => (
          <ellipse key={i} cx={s.x} cy={s.y} rx="5" ry="2.8" transform={`rotate(${s.r} ${s.x} ${s.y})`} fill={s.d ? '#1d1511' : '#f6ebcf'} />
        ))}
        {[[262, 268], [304, 258], [348, 262], [388, 272], [226, 280]].map(([x, y], i) => (
          <g key={i}><circle cx={x} cy={y} r="10" fill="#d9efb5" stroke="#57a336" strokeWidth="4" /><circle cx={x} cy={y} r="3" fill="#a8d878" /></g>
        ))}
        {[[424, 284, 13], [446, 300, 12], [410, 304, 11], [434, 322, 10], [462, 286, 9]].map(([x, y, r], i) => (
          <g key={i}><circle cx={x} cy={y} r={r} fill="url(#ex-ikura)" /><circle cx={x - r * 0.35} cy={y - r * 0.38} r={r * 0.25} fill="#fff" opacity=".85" /></g>
        ))}
        <g className="ex-bits" fill="#5a1409">
          <circle cx="180" cy="270" r="5" /><circle cx="520" cy="296" r="4" /><circle cx="116" cy="316" r="3.6" />
        </g>
      </g>
    </svg>
  )
}
