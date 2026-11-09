import type { ReactNode } from 'react'
import type { Kind } from '../../data/menu'
import { hash, rng } from '../../lib/utils'

/** Arte vetorial dos pratos, vista de cima, sobre prato de cerâmica preta. Troque por fotos reais quando houver. */

const FILL: Record<string, string> = {
  salmon: 'url(#g-salmon)', torched: 'url(#g-salmon)', tuna: 'url(#g-tuna)', shrimp: 'url(#g-shrimp)',
  kani: 'url(#g-kani)', eel: 'url(#g-eel)', egg: 'url(#g-egg)', white: 'url(#g-white)', veg: 'url(#g-avocado)',
  cucumber: 'url(#g-cucumber)', mango: 'url(#g-mango)', skin: 'url(#g-eel)', chili: 'url(#g-chili)',
  mix: 'url(#g-salmon)', chicken: 'url(#g-fry)', green: 'url(#g-leaf)',
}
const fillOf = (t: string) => FILL[t] ?? 'url(#g-salmon)'
const MIX = ['salmon', 'tuna', 'shrimp', 'kani', 'salmon', 'eel']

type P = { x: number; y: number; s?: number; r?: number }
const G = ({ x, y, s = 1, r = 0, children }: P & { children: ReactNode }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>{children}</g>
)

/* ---------- peças reutilizáveis ---------- */
function Wasabi({ x, y, s = 1 }: P) {
  return (
    <G x={x} y={y} s={s}>
      <path d="M-9 2c-3-8 5-12 11-9 7-3 12 4 9 10-3 7-10 8-14 6-4 0-6-3-6-7z" fill="#8cc152" />
      <path d="M-2-4c3-3 8-1 8 3" stroke="#d8f0b0" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </G>
  )
}
function Ginger({ x, y, s = 1, r = 0 }: P) {
  return (
    <G x={x} y={y} s={s} r={r}>
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${-12 + i * 5} 6c-4-9 2-15 8-13 4 3 3 10-1 14z`} fill="#f4a6b6" opacity={0.95 - i * 0.07} stroke="#e57f95" strokeWidth=".6" />
      ))}
    </G>
  )
}
function Sesame({ seed, n, r0, r1, cx = 0, cy = 0 }: { seed: number; n: number; r0: number; r1: number; cx?: number; cy?: number }) {
  const rd = rng(seed)
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = rd() * Math.PI * 2
        const d = r0 + rd() * (r1 - r0)
        const dark = rd() > 0.5
        return <ellipse key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} rx="1.7" ry="1" transform={`rotate(${rd() * 180} ${cx + Math.cos(a) * d} ${cy + Math.sin(a) * d})`} fill={dark ? '#1a1410' : '#f3e7c9'} />
      })}
    </>
  )
}

function Maki({ x, y, r, tint, top, hot, seed }: { x: number; y: number; r: number; tint: string; top?: string; hot?: boolean; seed: number }) {
  const rd = rng(seed)
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#f-soft)">
      <circle r={r} fill={hot ? 'url(#g-panko)' : 'url(#g-rice)'} />
      {hot && Array.from({ length: 16 }, (_, i) => {
        const a = rd() * 6.28, d = r * (0.55 + rd() * 0.4)
        return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={0.9 + rd()} fill="#fff1c8" opacity=".55" />
      })}
      {top === 'tobiko' && Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * 6.28, d = r * 0.86
        return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r="1.7" fill="#ff6a1a" />
      })}
      {top === 'sesame' && <Sesame seed={seed} n={14} r0={r * 0.7} r1={r * 0.95} />}
      <circle r={r * 0.6} fill="url(#g-nori)" />
      <circle r={r * 0.5} fill="url(#g-rice)" />
      <circle r={r * 0.3} fill={fillOf(tint)} />
      <circle cx={r * 0.12} cy={-r * 0.1} r={r * 0.12} fill="url(#g-cucumber)" opacity=".9" />
    </g>
  )
}

function Nigiri({ x, y, r = 0, tint, s = 1 }: { x: number; y: number; r?: number; tint: string; s?: number }) {
  const fill = fillOf(tint)
  return (
    <G x={x} y={y} r={r} s={s}>
      <g filter="url(#f-soft)">
        <rect x="-29" y="-11" width="58" height="22" rx="10" fill="url(#g-rice)" />
        {tint === 'egg' ? (
          <>
            <rect x="-26" y="-14" width="52" height="25" rx="5" fill={fill} />
            <rect x="-5" y="-15" width="10" height="27" fill="url(#g-nori)" />
          </>
        ) : tint === 'eel' ? (
          <>
            <path d="M-31 -1C-27-17 27-17 31-1 32 9 22 11 0 11-22 11-32 9-31-1Z" fill={fill} />
            <path d="M-20-3Q-6-9 8-7M-14 3Q0-2 18 0" stroke="#d58a4a" strokeWidth="1.2" fill="none" opacity=".7" />
            <Sesame seed={7} n={8} r0={0} r1={18} />
          </>
        ) : (
          <>
            <path d="M-31-1C-27-17 27-17 31-1 32 9 22 11 0 11-22 11-32 9-31-1Z" fill={fill} />
            {tint === 'kani' ? (
              <path d="M-26-6h52M-26 0h52M-26 6h52" stroke="#ff5a4a" strokeWidth="2.2" opacity=".85" />
            ) : tint === 'shrimp' ? (
              <path d="M-20-9v18M-10-11v22M0-12v24M10-11v22M20-9v18" stroke="#ff7a4a" strokeWidth="2" opacity=".55" />
            ) : (
              <path d="M-24-3Q-10-11 4-8M-16 3Q0-5 20-2M-8 8Q8 3 22 5" stroke="#fff0e6" strokeWidth="1.5" fill="none" opacity=".6" strokeLinecap="round" />
            )}
            {tint === 'torched' && (
              <>
                <path d="M-24-8l8 8M-14-10l9 9M-4-11l9 9M6-10l9 9M16-8l7 7M-22 2l7 7M-10 3l8 8" stroke="#3b1a0a" strokeWidth="1.6" opacity=".55" />
                <circle cx="-8" cy="-3" r="1.8" fill="#7fb85a" /><circle cx="2" cy="1" r="1.8" fill="#7fb85a" /><circle cx="10" cy="-4" r="1.8" fill="#7fb85a" />
              </>
            )}
          </>
        )}
      </g>
    </G>
  )
}

const Leaf = ({ x, y, r = 0, s = 1 }: P) => (
  <G x={x} y={y} r={r} s={s}>
    <path d="M0-26C22-20 30 6 0 28-30 6-22-20 0-26z" fill="url(#g-leaf)" />
    <path d="M0-22V24M0-10L-10-18M0 2L-14-6M0-10l10-8M0 2l14-8" stroke="#a9d98f" strokeWidth=".9" opacity=".7" fill="none" />
  </G>
)

/* ---------- pratos ---------- */
function Uramaki({ tint, hot, seed, top }: { tint: string; hot?: boolean; seed: number; top: string }) {
  const pos = [[64, 64], [100, 64], [136, 64], [82, 100], [118, 100], [64, 136], [100, 136], [136, 136]]
  return (
    <>
      {pos.map(([x, y], i) => (
        <Maki key={i} x={x} y={y} r={17.5} tint={tint === 'mix' ? MIX[i % MIX.length] : tint} top={top} hot={hot} seed={seed + i} />
      ))}
      {hot && <path d="M52 56c20 8 20 26 48 24s34 14 52 6M50 112c22 6 30 18 52 14s34 8 50 0" stroke="url(#g-tare)" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".9" />}
      <Wasabi x={44} y={160} s={0.8} />
      <Ginger x={150} y={162} s={0.8} />
    </>
  )
}

function Sashimi({ tint }: { tint: string }) {
  const n = 6
  return (
    <>
      <Leaf x={100} y={104} r={90} s={1.7} />
      <g stroke="#fff" strokeWidth="1.2" opacity=".85" strokeLinecap="round" fill="none">
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${54 + i * 1.4} ${58 - i * 0.5}Q${60 + i} 70 ${58 + i * 2} ${86 + (i % 3)}`} />)}
      </g>
      {Array.from({ length: n }, (_, i) => {
        const t = tint === 'mix' ? ['salmon', 'tuna', 'white'][i % 3] : tint
        const x = 70 + i * 11.5, y = 98 + Math.sin(i * 0.9) * 3
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(-16)`} filter="url(#f-soft)">
            <path d="M-8-33C4-37 14-30 12-18L10 24C8 34-6 36-10 28z" fill={fillOf(t)} />
            <path d="M-4-26Q3-12 0 6M4-24Q8-10 5 14" stroke="#fff4ec" strokeWidth="1.1" fill="none" opacity=".55" />
          </g>
        )
      })}
      <Wasabi x={146} y={150} s={0.9} />
      <Ginger x={64} y={158} s={0.8} r={-10} />
    </>
  )
}

function Temaki({ tint }: { tint: string }) {
  return (
    <>
      {[-30, 0, 30].map((rot, i) => (
        <G key={i} x={100} y={148} r={rot}>
          <g filter="url(#f-soft)">
            <path d="M0 30L-17-72Q0-82 17-72z" fill="url(#g-nori)" />
            <path d="M-12-50Q0-40 13-52M-10-30Q2-20 11-33M-7-8Q2 2 8-12" stroke="#4a6a55" strokeWidth="1" fill="none" opacity=".5" />
            <ellipse cx="0" cy="-74" rx="16" ry="6" fill="url(#g-rice)" />
            <ellipse cx="-4" cy="-78" rx="8" ry="6" fill={fillOf(tint === 'mix' ? MIX[i] : tint)} />
            <ellipse cx="6" cy="-80" rx="5" ry="6" fill={fillOf(i === 1 ? 'cucumber' : 'shrimp')} />
            <path d="M-2-86l-3-9M3-86l3-8" stroke="#6fb04a" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </G>
      ))}
    </>
  )
}

function Combo({ tint, seed }: { tint: string; seed: number }) {
  const mix = tint === 'mix'
  const t = (i: number) => (mix ? MIX[i % MIX.length] : tint)
  return (
    <>
      <g filter="url(#f-soft)">
        <ellipse cx="100" cy="102" rx="92" ry="60" fill="url(#g-wood)" stroke="#d3111c" strokeWidth="2.4" />
        <ellipse cx="100" cy="102" rx="82" ry="51" fill="none" stroke="#fff" strokeOpacity=".08" />
      </g>
      <Nigiri x={64} y={78} r={-10} tint={t(0)} s={0.78} />
      <Nigiri x={112} y={72} r={-6} tint={t(1)} s={0.78} />
      <Nigiri x={156} y={82} r={8} tint={t(2)} s={0.78} />
      {[[52, 116], [78, 122], [64, 142], [90, 142]].map(([x, y], i) => <Maki key={i} x={x} y={y} r={12} tint={t(i + 3)} top={i % 2 ? 'tobiko' : 'sesame'} seed={seed + i} />)}
      {[[124, 112], [148, 120], [132, 136], [160, 138]].map(([x, y], i) => <Maki key={i} x={x} y={y} r={12} tint={t(i)} hot seed={seed + 9 + i} />)}
      <Wasabi x={104} y={116} s={0.55} />
      <Ginger x={106} y={140} s={0.55} />
    </>
  )
}

function Gyoza({ tint, seed }: { tint: string; seed: number }) {
  const rd = rng(seed)
  if (tint === 'harumaki') {
    return (
      <>
        {[0, 1, 2, 3].map((i) => (
          <G key={i} x={86 + (i % 2) * 14 - 10} y={58 + i * 22} r={-14 + i * 3}>
            <g filter="url(#f-soft)">
              <rect x="-38" y="-8" width="76" height="17" rx="8.5" fill="url(#g-fry)" />
              <path d="M-24-8l8 17M-8-8l8 17M8-8l8 17M24-8l8 17" stroke="#fbd78e" strokeWidth="1.2" opacity=".5" />
            </g>
          </G>
        ))}
        <circle cx="156" cy="152" r="15" fill="#2a0a05" stroke="#fff" strokeOpacity=".15" />
        <circle cx="156" cy="152" r="11" fill="url(#g-chili)" opacity=".9" />
      </>
    )
  }
  return (
    <>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 62 + (i % 3) * 38, y = 70 + Math.floor(i / 3) * 44
        return (
          <G key={i} x={x} y={y} r={-20 + rd() * 14}>
            <g filter="url(#f-soft)">
              <path d="M-22 6C-20-16 20-16 22 6 22 12 14 15 0 15-14 15-22 12-22 6z" fill="url(#g-dough)" />
              <path d="M-21 8C-14 16 14 16 21 8 20 13 10 16 0 16S-20 13-21 8z" fill="#b5702c" />
              <path d="M-14-6l2 8M-8-9l2 9M-2-10l1 10M4-9l-1 10M10-7l-2 9" stroke="#caa56a" strokeWidth="1.3" strokeLinecap="round" />
            </g>
          </G>
        )
      })}
      <circle cx="160" cy="158" r="14" fill="#2a0a05" stroke="#fff" strokeOpacity=".15" />
      <circle cx="160" cy="158" r="10" fill="url(#g-tare)" />
    </>
  )
}

function Noodle({ seed }: { seed: number }) {
  const rd = rng(seed)
  const strokes = Array.from({ length: 16 }, () => {
    const a = rd() * 6.28, r = 12 + rd() * 44
    const x1 = 100 + Math.cos(a) * r, y1 = 100 + Math.sin(a) * r
    const a2 = a + 1.4 + rd(), r2 = 12 + rd() * 44
    const x2 = 100 + Math.cos(a2) * r2, y2 = 100 + Math.sin(a2) * r2
    return `M${x1} ${y1}C${100 + rd() * 90 - 20} ${100 + rd() * 90 - 20} ${100 + rd() * 90 - 20} ${100 + rd() * 90 - 20} ${x2} ${y2}`
  })
  const bits = Array.from({ length: 26 }, (_, i) => {
    const a = rd() * 6.28, d = rd() * 46
    return { x: 100 + Math.cos(a) * d, y: 100 + Math.sin(a) * d, c: ['#6fb04a', '#ff8a2a', '#5a2a14', '#e0443a', '#9fd36a'][i % 5], r: rd() * 360 }
  })
  return (
    <g filter="url(#f-soft)">
      <circle cx="100" cy="100" r="64" fill="#140a06" stroke="#d3111c" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="58" fill="#2a1409" />
      {strokes.map((d, i) => <path key={i} d={d} stroke="#a8742f" strokeWidth="6" fill="none" strokeLinecap="round" />)}
      {strokes.map((d, i) => <path key={i} d={d} stroke="#e9bf6d" strokeWidth="4" fill="none" strokeLinecap="round" />)}
      {bits.map((b, i) => <rect key={i} x={b.x - 3.5} y={b.y - 1.6} width="7" height="3.2" rx="1.4" fill={b.c} transform={`rotate(${b.r} ${b.x} ${b.y})`} />)}
    </g>
  )
}

function Soup({ tint, seed }: { tint: string; seed: number }) {
  const rd = rng(seed)
  const ramen = tint === 'ramen'
  return (
    <g filter="url(#f-soft)">
      <circle cx="100" cy="100" r="68" fill="#140a06" stroke="#d3111c" strokeWidth="1.6" />
      <circle cx="100" cy="100" r="60" fill={ramen ? 'url(#g-broth)' : '#b57b3f'} />
      <circle cx="100" cy="100" r="60" fill="none" stroke="#fff" strokeOpacity=".12" />
      {ramen ? (
        <>
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${60 + i * 3} ${92 + i * 5}Q100 ${70 + i * 8} ${140 - i * 3} ${96 + i * 4}`} stroke="#f2dfa8" strokeWidth="4" fill="none" strokeLinecap="round" />)}
          {[[76, 76], [118, 118]].map(([x, y], i) => (
            <g key={i}><ellipse cx={x} cy={y} rx="14" ry="11" fill="#fff8ea" /><circle cx={x} cy={y} r="6" fill="#f3a21f" /></g>
          ))}
          {[[126, 72, -20], [74, 124, 10]].map(([x, y, r], i) => <rect key={i} x={x - 10} y={y - 12} width="20" height="24" fill="url(#g-nori)" transform={`rotate(${r} ${x} ${y})`} />)}
          {[[104, 100], [92, 112], [110, 84]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" fill="#e8a493" stroke="#b86a5a" />)}
        </>
      ) : (
        <>
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={72 + rd() * 56} y={72 + rd() * 56} width="11" height="11" rx="2" fill="#fff4dd" transform={`rotate(${rd() * 90} 100 100)`} />)}
          {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${76 + rd() * 48} ${76 + rd() * 48}q8-6 12 2-6 8-12-2z`} fill="#2f6a3a" />)}
        </>
      )}
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={80 + rd() * 40} cy={80 + rd() * 40} r="3.2" fill="none" stroke="#8fd16a" strokeWidth="1.8" />)}
    </g>
  )
}

function Salad({ tint, seed }: { tint: string; seed: number }) {
  const rd = rng(seed)
  if (tint === 'green') {
    return (
      <g filter="url(#f-soft)">
        {Array.from({ length: 22 }, (_, i) => {
          const a = rd() * 6.28, d = rd() * 40
          const x = 100 + Math.cos(a) * d, y = 100 + Math.sin(a) * d
          return <path key={i} d={`M${x} ${y}c12-22 28 18 40 0`} stroke="#2f7a3a" strokeWidth="5" fill="none" strokeLinecap="round" transform={`rotate(${rd() * 360} ${x} ${y}) translate(-20 0)`} />
        })}
        <Sesame seed={seed} n={22} r0={0} r1={44} cx={100} cy={100} />
      </g>
    )
  }
  return (
    <g filter="url(#f-soft)">
      <circle cx="100" cy="100" r="62" fill="#120808" stroke="#fff" strokeOpacity=".1" />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * 6.28, x = 100 + Math.cos(a) * 36, y = 100 + Math.sin(a) * 36
        return <g key={i}><circle cx={x} cy={y} r="13" fill="url(#g-cucumber)" /><circle cx={x} cy={y} r="9" fill="#e9f5cf" opacity=".7" /></g>
      })}
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={86 + rd() * 8} y={70 + rd() * 56} width="26" height="4" rx="2" fill={i % 2 ? '#ff5a4a' : '#fff'} transform={`rotate(${rd() * 180} 100 100)`} />)}
      <Sesame seed={seed} n={14} r0={0} r1={30} cx={100} cy={100} />
    </g>
  )
}

function Edamame({ seed }: { seed: number }) {
  const rd = rng(seed)
  return (
    <g filter="url(#f-soft)">
      <circle cx="100" cy="100" r="62" fill="#120808" stroke="#d3111c" strokeWidth="1.4" />
      {Array.from({ length: 13 }, (_, i) => {
        const a = rd() * 6.28, d = rd() * 38
        const x = 100 + Math.cos(a) * d, y = 100 + Math.sin(a) * d
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rd() * 360})`}>
            <path d="M-17 0C-12-9 12-9 17 0 12 9-12 9-17 0z" fill="url(#g-leaf)" stroke="#a6d98c" strokeWidth=".6" />
            <path d="M-8 0l1-4M0 0V-5M8 0l-1-4" stroke="#b5e69a" strokeWidth="1.3" opacity=".7" />
          </g>
        )
      })}
      <Sesame seed={seed + 1} n={26} r0={0} r1={48} cx={100} cy={100} />
    </g>
  )
}

function Skewer({ tint, seed }: { tint: string; seed: number }) {
  const rd = rng(seed)
  const salmon = tint === 'salmon'
  return (
    <>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`rotate(-10 100 100) translate(0 ${i * 38 - 38})`} filter="url(#f-soft)">
          <rect x="30" y="97" width="150" height="3" rx="1.5" fill="#d9b779" />
          {Array.from({ length: salmon ? 3 : 4 }, (_, j) => (
            <g key={j} transform={`translate(${52 + j * (salmon ? 38 : 31)} 98.5)`}>
              {salmon ? (
                <><rect x="-17" y="-12" width="34" height="24" rx="7" fill="url(#g-salmon)" /><path d="M-12-4l22-2M-12 3l22-2" stroke="#6a2412" strokeWidth="3" opacity=".6" /></>
              ) : (
                <><rect x="-13" y="-11" width="26" height="22" rx="8" fill="url(#g-fry)" /><rect x="-13" y="-11" width="26" height="22" rx="8" fill="url(#g-tare)" opacity=".55" /><ellipse cx="-3" cy="-4" rx="6" ry="2.4" fill="#fff" opacity=".25" /></>
              )}
            </g>
          ))}
        </g>
      ))}
      <Sesame seed={seed} n={22} r0={0} r1={60} cx={100} cy={100} />
    </>
  )
}

function Tempura({ tint, seed }: { tint: string; seed: number }) {
  const rd = rng(seed)
  const lace = (w: number, h: number) => {
    let d = `M${-w} 0`
    for (let i = 0; i < 9; i++) d += `Q${-w + (i + 0.5) * (2 * w / 9)} ${-h - rd() * 5} ${-w + (i + 1) * (2 * w / 9)} ${-h * 0.4 + rd() * 3}`
    for (let i = 0; i < 9; i++) d += `Q${w - (i + 0.5) * (2 * w / 9)} ${h + rd() * 5} ${w - (i + 1) * (2 * w / 9)} ${h * 0.4 - rd() * 3}`
    return d + 'Z'
  }
  if (tint === 'chicken') {
    return (
      <g filter="url(#f-soft)">
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * 6.28, x = 100 + Math.cos(a) * 34, y = 100 + Math.sin(a) * 34
          return <path key={i} d="M-16-4Q-10-18 6-14Q18-10 15 4Q12 16-6 16Q-14 14-16-4z" fill="url(#g-fry)" transform={`translate(${x} ${y}) rotate(${i * 50})`} stroke="#f6cf86" strokeOpacity=".5" />
        })}
        <path d="M82 94l22-8 6 18-22 10z" fill="#f2e04a" opacity="0" />
        <circle cx="100" cy="100" r="13" fill="#f4e56a" /><circle cx="100" cy="100" r="9" fill="#fff6a8" />
      </g>
    )
  }
  const veg = tint === 'veg'
  return (
    <>
      {[0, 1, 2].map((i) => (
        <G key={i} x={96 + i * 6} y={60 + i * 40} r={-12 + i * 6}>
          <g filter="url(#f-soft)">
            <path d={lace(44, veg ? 14 : 11)} fill="url(#g-fry)" />
            <path d={lace(36, 6)} fill="#ffd78a" opacity=".35" transform="translate(0 -2)" />
            {!veg && <path d="M44 0l18-12-4 12 4 12z" fill="url(#g-shrimp)" stroke="#ff7a4a" />}
            {veg && <circle cx={-10 + i * 8} cy="0" r="5" fill={['#ff8a2a', '#7fb85a', '#fff2cf'][i]} opacity=".85" />}
          </g>
        </G>
      ))}
      <circle cx="156" cy="162" r="14" fill="#2a0a05" stroke="#fff" strokeOpacity=".15" />
      <circle cx="156" cy="162" r="10" fill="#7a3a1a" />
    </>
  )
}

function Dessert({ tint, seed }: { tint: string; seed: number }) {
  if (tint === 'mochi') {
    return (
      <g filter="url(#f-soft)">
        {[[70, 92, '#e23a4e'], [124, 92, '#f6f2ea'], [97, 138, '#6fa860']].map(([x, y, c], i) => (
          <g key={i}>
            <ellipse cx={x as number} cy={y as number} rx="30" ry="26" fill={c as string} />
            <ellipse cx={(x as number) - 7} cy={(y as number) - 8} rx="14" ry="8" fill="#fff" opacity=".4" />
            <Sesame seed={seed + i} n={6} r0={0} r1={20} cx={x as number} cy={y as number} />
          </g>
        ))}
      </g>
    )
  }
  if (tint === 'fried') {
    return (
      <>
        {[0, 1, 2].map((i) => (
          <G key={i} x={100} y={64 + i * 36} r={-8 + i * 6}>
            <g filter="url(#f-soft)">
              <rect x="-40" y="-10" width="80" height="20" rx="10" fill="url(#g-fry)" />
              <path d="M-24-10l8 20M-6-10l8 20M12-10l8 20" stroke="#fbd78e" strokeWidth="1.2" opacity=".5" />
            </g>
          </G>
        ))}
        <path d="M44 50c16 14 30-14 46 0s30-14 46 0 28-10 40 4" stroke="url(#g-tare)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M44 120c16 14 30-14 46 0s30-14 46 0 28-10 40 4" stroke="url(#g-tare)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    )
  }
  return (
    <g filter="url(#f-soft)">
      <circle cx="82" cy="98" r="32" fill="#8fc46f" /><path d="M60 92c10-12 32-12 44 0M62 106c12 10 30 10 40-2" stroke="#d3eebd" strokeWidth="2.4" fill="none" opacity=".7" strokeLinecap="round" />
      <circle cx="122" cy="104" r="30" fill="#f6efe2" /><path d="M102 98c10-12 30-12 40 0M104 112c12 10 28 8 36-2" stroke="#fff" strokeWidth="2.4" fill="none" opacity=".9" strokeLinecap="round" />
      <path d="M130 56l26 38-34-8z" fill="url(#g-dough)" stroke="#c9a867" />
    </g>
  )
}

function Drink({ tint, seed }: { tint: string; seed: number }) {
  const rd = rng(seed)
  const liquid: Record<string, [string, string]> = {
    orange: ['#ffb02e', '#ff7a00'], lemon: ['#e8f08a', '#b8d84a'], water: ['#cfeaff', '#8ec8ee'], cola: ['#2a0f08', '#0c0402'],
    beer: ['#ffd25a', '#e3951a'], tea: ['#a9cf6a', '#6f9a36'], sake: ['#f7f7f2', '#e5e5dc'],
  }
  const [a, b] = liquid[tint] ?? liquid.orange
  if (tint === 'sake') {
    return (
      <g filter="url(#f-soft)">
        <circle cx="78" cy="96" r="30" fill="#0b0b0b" stroke="#d3111c" strokeWidth="2" />
        <circle cx="78" cy="96" r="12" fill="#d3111c" /><circle cx="78" cy="96" r="5" fill="#0b0b0b" />
        {[[134, 74], [138, 128]].map(([x, y], i) => (
          <g key={i}><circle cx={x} cy={y} r="20" fill="#f1ebe3" /><circle cx={x} cy={y} r="16" fill="url(#g-white)" stroke="#c9c2b4" /><ellipse cx={x - 4} cy={y - 4} rx="6" ry="3" fill="#fff" opacity=".8" /></g>
        ))}
      </g>
    )
  }
  const cola = tint === 'cola'
  return (
    <g filter="url(#f-soft)">
      <circle cx="100" cy="100" r="52" fill={cola ? '#101010' : 'rgba(255,255,255,.08)'} stroke={cola ? '#d3111c' : '#fff'} strokeOpacity={cola ? 1 : 0.35} strokeWidth={cola ? 3 : 2} />
      <defs><radialGradient id={`dl-${tint}`} cx=".4" cy=".35" r=".8"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></radialGradient></defs>
      <circle cx="100" cy="100" r="46" fill={`url(#dl-${tint})`} />
      {cola ? (
        <>
          <circle cx="100" cy="100" r="34" fill="none" stroke="#d3111c" strokeWidth="1.4" opacity=".7" />
          <rect x="84" y="90" width="32" height="20" rx="8" fill="#e8e8e8" /><circle cx="94" cy="100" r="4" fill="#333" />
        </>
      ) : (
        <>
          {Array.from({ length: tint === 'beer' ? 0 : 5 }, (_, i) => <rect key={i} x={72 + rd() * 40} y={72 + rd() * 40} width="15" height="15" rx="4" fill="#fff" opacity=".4" transform={`rotate(${rd() * 80} 100 100)`} />)}
          {tint === 'beer' && <circle cx="100" cy="100" r="40" fill="none" stroke="#fffaf0" strokeWidth="9" opacity=".9" />}
          {tint === 'tea' && <circle cx="100" cy="100" r="30" fill="none" stroke="#d7ee9b" strokeOpacity=".5" />}
          {(tint === 'orange' || tint === 'lemon') && (
            <g transform="translate(138 66)"><circle r="17" fill={tint === 'lemon' ? '#e6f06a' : '#ff9a1a'} /><circle r="13" fill="none" stroke="#fff" strokeOpacity=".6" /><path d="M0-12V12M-12 0H12M-8-8L8 8M8-8L-8 8" stroke="#fff" strokeOpacity=".6" /></g>
          )}
          <path d="M104 60l30-34" stroke="#d3111c" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="86" cy="82" rx="14" ry="6" fill="#fff" opacity=".28" transform="rotate(-30 86 82)" />
        </>
      )}
    </g>
  )
}

export function DishArt({ kind, tint, id = 'x', plate = true, className }: { kind: Kind; tint: string; id?: string; plate?: boolean; className?: string }) {
  const seed = hash(id)
  const top = hash(id) % 2 ? 'sesame' : 'tobiko'
  let body: ReactNode
  switch (kind) {
    case 'nigiri':
      body = (
        <>
          <Leaf x={56} y={150} r={50} s={0.9} />
          <Nigiri x={100} y={84} r={-16} tint={tint} s={1.5} />
          <Nigiri x={100} y={134} r={-16} tint={tint} s={1.5} />
          <Wasabi x={160} y={152} s={0.9} /><Ginger x={150} y={52} s={0.8} r={20} />
        </>
      )
      break
    case 'sashimi': body = <Sashimi tint={tint} />; break
    case 'uramaki': body = <Uramaki tint={tint} seed={seed} top={top} />; break
    case 'hot': body = <Uramaki tint={tint} hot seed={seed} top="none" />; break
    case 'temaki': body = <Temaki tint={tint} />; break
    case 'combo': body = <Combo tint={tint} seed={seed} />; break
    case 'gyoza': body = <Gyoza tint={tint} seed={seed} />; break
    case 'noodle': body = <Noodle seed={seed} />; break
    case 'soup': body = <Soup tint={tint} seed={seed} />; break
    case 'salad': body = <Salad tint={tint} seed={seed} />; break
    case 'edamame': body = <Edamame seed={seed} />; break
    case 'skewer': body = <Skewer tint={tint} seed={seed} />; break
    case 'tempura': body = <Tempura tint={tint} seed={seed} />; break
    case 'dessert': body = <Dessert tint={tint} seed={seed} />; break
    case 'drink': body = <Drink tint={tint} seed={seed} />; break
  }
  const big = kind === 'combo'
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-hidden>
      {plate && !big && (
        <>
          <circle cx="100" cy="100" r="97" fill="url(#g-plate)" />
          <circle cx="100" cy="100" r="97" fill="none" stroke="#d3111c" strokeOpacity=".75" strokeWidth="1.4" />
          <circle cx="100" cy="100" r="86" fill="none" stroke="#fff" strokeOpacity=".07" />
        </>
      )}
      {plate && big && <circle cx="100" cy="102" r="97" fill="url(#g-plate)" opacity=".0" />}
      {body}
    </svg>
  )
}
