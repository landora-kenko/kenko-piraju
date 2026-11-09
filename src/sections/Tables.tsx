import { useEffect, useMemo, useRef, useState, type SVGProps } from 'react'
import { animate, stagger } from 'animejs'
import { Check, Users, X } from 'lucide-react'
import { TABLES, ZONES, type TableDef, type TableStatus } from '../data/tables'
import { RESERVATION_SLOTS, RESTAURANT, openStatus, waLink } from '../lib/config'
import { store, type TableMap } from '../lib/store'
import { useReveal } from '../hooks/useReveal'
import { useSplit } from '../hooks/useSplit'
import { cn, hash, reducedMotion } from '../lib/utils'

const STATUS_LABEL: Record<TableStatus, string> = { livre: 'Livre', ocupada: 'Ocupada', reservada: 'Reservada' }

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const last = useRef(0)
  useEffect(() => {
    const el = ref.current!
    if (reducedMotion()) { el.textContent = String(value); return }
    const o = { n: last.current }
    const a = animate(o, { n: value, duration: 900, ease: 'outExpo', onUpdate: () => { el.textContent = String(Math.round(o.n)) } })
    last.current = value
    return () => { a.pause() }
  }, [value])
  return <span ref={ref} className="tabular-nums">0</span>
}

const RED = '#ff2d1f'

/** Cores por estado: a planta é neon vermelha, o estado da mesa é lido pela cor. */
const PAL = {
  livre: { stroke: '#4ade80', fill: 'rgba(74,222,128,.15)', chair: 'rgba(74,222,128,.34)', chairLine: 'rgba(74,222,128,.7)', text: '#eafff1', sub: '#8fe6ae' },
  reservada: { stroke: '#fbbf24', fill: 'rgba(251,191,36,.10)', chair: 'rgba(251,191,36,.22)', chairLine: 'rgba(251,191,36,.55)', text: '#ffeab0', sub: '#d7b04a' },
  ocupada: { stroke: '#4d4249', fill: '#171214', chair: '#1b1518', chairLine: '#2c2328', text: '#6b6067', sub: '#5b5158' },
} as const

type ShapeProps = { t: TableDef; inset?: number } & SVGProps<SVGElement>
/** Contorno do tampo; `inset` encolhe para desenhar detalhes internos. */
function Shape({ t, inset = 0, ...p }: ShapeProps) {
  const i = inset
  const q = p as SVGProps<SVGCircleElement> & SVGProps<SVGRectElement>
  if (t.shape === 'stool') return <circle r={16 - i} {...(q as SVGProps<SVGCircleElement>)} />
  if (t.shape === 'round') return <circle r={32 - i} {...(q as SVGProps<SVGCircleElement>)} />
  if (t.shape === 'square') return <rect x={-28 + i} y={-28 + i} width={56 - 2 * i} height={56 - 2 * i} rx={4} {...(q as SVGProps<SVGRectElement>)} />
  return <rect x={-60 + i} y={-32 + i} width={120 - 2 * i} height={64 - 2 * i} rx={3} {...(q as SVGProps<SVGRectElement>)} />
}

/** Cadeira vista de cima: assento e encosto virado para fora. */
function Chair({ x, y, a, fill, line }: { x: number; y: number; a: number; fill: string; line: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a + 90})`}>
      <rect x={-8} y={-6} width={16} height={13} rx={4} fill={fill} stroke={line} strokeWidth={1} />
      <rect x={-8} y={-9.5} width={16} height={3.5} rx={1.75} fill={line} />
    </g>
  )
}

function Seats({ t, status }: { t: TableDef; status: TableStatus }) {
  const c = PAL[status]
  if (t.shape === 'square') return <><Chair x={-40} y={0} a={180} fill={c.chair} line={c.chairLine} /><Chair x={40} y={0} a={0} fill={c.chair} line={c.chairLine} /></>
  if (t.shape === 'round') return <>{[45, 135, 225, 315].map((a) => <Chair key={a} a={a} x={Math.cos(a * Math.PI / 180) * 46} y={Math.sin(a * Math.PI / 180) * 46} fill={c.chair} line={c.chairLine} />)}</>
  if (t.shape === 'low') return <>{[-36, 0, 36].flatMap((x) => [-48, 48].map((y) => <rect key={`${x}${y}`} x={x - 12} y={y - 10} width={24} height={20} rx={5} fill={c.chair} stroke={c.chairLine} strokeWidth={1} />))}</>
  return null
}

function TableShape({ t, status, selected, dim, onPick }: { t: TableDef; status: TableStatus; selected: boolean; dim: boolean; onPick: () => void }) {
  const c = PAL[status]
  const free = status === 'livre'
  const short = t.id.startsWith('B') ? t.id.slice(1) : t.label.replace(/\D/g, '') || t.id
  const reach = t.shape === 'low' ? 82 : t.shape === 'stool' ? 24 : 58
  return (
    <g transform={`translate(${t.x} ${t.y})`} style={{ opacity: dim ? 0.22 : 1, transition: 'opacity .35s' }}>
      <g
        className={cn('tbl cursor-pointer outline-none', free && 'is-free')}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        role="button" tabIndex={dim ? -1 : 0}
        aria-label={`${t.label}, ${t.seats} ${t.seats === 1 ? 'lugar' : 'lugares'}, ${STATUS_LABEL[status].toLowerCase()}`}
        aria-pressed={selected}
        onClick={onPick}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onPick())}
      >
        <Seats t={t} status={status} />
        <g className="tbl-in" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          {free && <g className="hot" style={{ filter: 'url(#glow-hot)' }}><Shape t={t} stroke={c.stroke} strokeWidth={8} fill="none" /></g>}
          <Shape t={t} stroke={c.stroke} strokeWidth={free ? 2.2 : 1.6} strokeDasharray={status === 'reservada' ? '5 4' : undefined} fill={c.fill} style={free ? { filter: 'url(#glow-soft)' } : undefined} />
          {t.shape === 'round' && <circle r={20} fill="none" stroke={c.stroke} strokeOpacity={0.35} />}
          {t.shape === 'square' && <Shape t={t} inset={9} stroke={c.stroke} strokeOpacity={0.35} fill="none" />}
          {t.shape === 'stool' && <circle r={9} fill="none" stroke={c.stroke} strokeOpacity={0.35} />}
          {t.shape === 'low' && (
            <>
              <Shape t={t} inset={8} stroke={c.stroke} strokeOpacity={0.3} fill="none" />
              <circle cx={-34} cy={0} r={3.5} fill="none" stroke={c.stroke} strokeOpacity={0.55} />
              <circle cx={34} cy={0} r={3.5} fill="none" stroke={c.stroke} strokeOpacity={0.55} />
            </>
          )}
          <text textAnchor="middle" dy={t.shape === 'stool' ? 4.5 : -1} className="pointer-events-none font-display text-[16px] font-extrabold" fill={c.text}>{short}</text>
          {t.shape !== 'stool' && <text textAnchor="middle" dy={13} className="pointer-events-none text-[10px]" fill={c.sub}>{t.seats} lug.</text>}
        </g>
        {free && <circle r={reach - 8} className="free-pulse fill-none" stroke={c.stroke} strokeWidth={1} opacity={0} />}
        <circle className="focus fill-none stroke-white opacity-0" r={reach + 4} strokeWidth={2} />
        {selected && <circle r={reach + 5} className="sel-ring fill-none stroke-white" strokeWidth={1.6} strokeDasharray="3 6" />}
      </g>
    </g>
  )
}

/** Etiqueta de zona, sobre a borda da área. */
function Tag({ x, y, name, jp }: { x: number; y: number; name: string; jp?: string }) {
  const w = Math.round(name.length * 7 + (jp ? jp.length * 14 + 14 : 0) + 22)
  return (
    <g className="zone-neon" transform={`translate(${x} ${y})`}>
      <rect y={-11} width={w} height={22} rx={4} fill="#060203" stroke="rgba(255,45,31,.6)" />
      <text x={11} y={4.5} className="fill-washi font-sans text-[12.5px] font-medium">{name}</text>
      {jp && <text x={11 + name.length * 7 + 7} y={4.5} className="fill-shu font-display text-[12.5px] font-bold">{jp}</text>}
    </g>
  )
}

function Plant({ x, y }: { x: number; y: number }) {
  return (
    <g className="zone-neon" transform={`translate(${x} ${y})`} fill="none" stroke="rgba(255,45,31,.55)" strokeLinecap="round">
      <circle r={11} fill="rgba(255,45,31,.07)" />
      {[0, 72, 144, 216, 288].map((a) => <path key={a} d="M0 0 Q4 -8 0 -15" transform={`rotate(${a})`} />)}
      <circle r={2} fill="rgba(255,45,31,.6)" stroke="none" />
    </g>
  )
}

function Plan({ map, selected, need, onPick }: { map: TableMap; selected: string | null; need: number; onPick: (id: string) => void }) {
  const open = openStatus().open
  const wall = { fill: 'none', strokeLinecap: 'square' as const }
  return (
    <svg viewBox="0 0 900 570" className="w-full min-w-[680px]" role="group" aria-label="Planta do salão do Kenko">
      <defs>
        <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="a" /><feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="a" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-hot" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id="glow-soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="a" /><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="a" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <pattern id="wood" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><path d="M0 0H18" stroke="rgba(255,255,255,.035)" /></pattern>
        <pattern id="deck" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M0 7H14" stroke="rgba(255,255,255,.04)" /></pattern>
      </defs>
      <style>{`
        .free-pulse{animation:fp 3s ease-out infinite;transform-box:fill-box;transform-origin:center}
        @keyframes fp{0%{opacity:.55;transform:scale(.8)}100%{opacity:0;transform:scale(1.3)}}
        .hot{opacity:0;transition:opacity .35s}
        .tbl:hover .hot,.tbl:focus-visible .hot{opacity:.9}
        .tbl-in{transition:transform .4s cubic-bezier(.16,1,.3,1)}
        .tbl:hover .tbl-in{transform:scale(1.06)}
        .tbl:focus-visible .focus{opacity:1}
        .sel-ring{transform-box:fill-box;transform-origin:center;animation:spin-slow 9s linear infinite}
        .sign-on{animation:flick 7s steps(1,end) infinite}
        @keyframes flick{0%,100%{opacity:1}61%{opacity:1}62%{opacity:.25}63%{opacity:1}64%{opacity:.55}65%{opacity:1}}
        @media (prefers-reduced-motion:reduce){.free-pulse,.sel-ring,.sign-on{animation:none}}
      `}</style>

      {/* piso */}
      <rect x="24" y="24" width="852" height="512" fill="url(#wood)" />

      {/* paredes, com vão na porta */}
      <g className="zone-neon">
        <path d="M110 536H876V24H24V536H40" {...wall} stroke={RED} strokeWidth={5} style={{ filter: 'url(#glow)' }} />
        <path d="M110 536H876V24H24V536H40" {...wall} stroke="#ffd9d2" strokeWidth={1.2} strokeOpacity={0.8} />
        {/* janelas na parede esquerda */}
        {[150, 216].map((y) => <path key={y} d={`M24 ${y}V${y + 52}`} stroke="#0a0304" strokeWidth={7} />)}
        {[150, 216].map((y) => <path key={'w' + y} d={`M21 ${y}V${y + 52}M27 ${y}V${y + 52}`} stroke="#ffd9d2" strokeWidth={1} strokeOpacity={0.7} />)}
        {/* porta */}
        <path d="M110 536V466" stroke="#ffd9d2" strokeWidth={2} />
        <path d="M40 536A70 70 0 0 1 110 466" fill="none" stroke="rgba(255,217,210,.45)" strokeDasharray="3 4" />
        <text x="40" y="556" className="fill-washi font-sans text-[12px] font-medium">Entrada</text>
      </g>

      {/* letreiro */}
      <g className="zone-neon">
        <g className={open ? 'sign-on' : undefined} opacity={open ? 1 : 0.4}>
          <rect x="676" y="40" width="168" height="50" rx="8" fill="none" stroke={RED} strokeWidth="3" style={{ filter: 'url(#glow)' }} />
          <rect x="676" y="40" width="168" height="50" rx="8" fill="none" stroke="#ffd9d2" strokeWidth="1.1" />
          <text x="760" y="76" textAnchor="middle" className="font-display text-[28px] font-extrabold" fill="#ffe6e1" style={{ filter: 'url(#glow-soft)' }}>{open ? '営業中' : '準備中'}</text>
        </g>
        <text x="760" y="104" textAnchor="middle" className="fill-ash font-sans text-[11px]">{open ? 'Aberto agora' : 'Fechado agora'}</text>
      </g>

      {/* balcão do sushiman */}
      <rect className="zone-neon" x="100" y="40" width="430" height="100" rx="6" fill="none" stroke="rgba(255,45,31,.45)" strokeDasharray="2 7" strokeWidth="1.5" />
      <g className="zone-neon">
        <rect x="116" y="56" width="398" height="40" rx="5" fill="rgba(255,45,31,.07)" stroke={RED} strokeWidth="1.8" style={{ filter: 'url(#glow-soft)' }} />
        <rect x="124" y="63" width="300" height="26" rx="3" fill="none" stroke="rgba(255,217,210,.35)" />
        {[168, 262, 356, 450].map((x) => (
          <g key={x}><circle cx={x} cy={76} r={6} fill="rgba(255,217,210,.18)" stroke="rgba(255,217,210,.6)" /><circle cx={x} cy={76} r={1.6} fill="#ffd9d2" /></g>
        ))}
        <rect x="438" y="64" width="64" height="24" rx="3" fill="rgba(255,255,255,.04)" stroke="rgba(255,217,210,.35)" />
        <text x="470" y="80" textAnchor="middle" className="fill-ash font-sans text-[9px]">caixa</text>
      </g>
      <Tag x={108} y={140} name={ZONES.balcao.name} jp={ZONES.balcao.jp} />

      {/* salão */}
      <rect x="64" y="204" width="388" height="270" rx="6" fill="rgba(255,45,31,.035)" stroke="rgba(255,45,31,.45)" strokeDasharray="2 7" strokeWidth="1.5" className="zone-neon" />
      <Tag x={76} y={204} name={ZONES.salao.name} jp={ZONES.salao.jp} />

      {/* tatame, plataforma elevada */}
      <g className="zone-neon">
        <rect x="512" y="108" width="256" height="300" rx="4" fill="none" stroke="rgba(255,45,31,.3)" />
        <rect x="520" y="116" width="240" height="284" fill="rgba(255,45,31,.04)" stroke={RED} strokeWidth="1.8" style={{ filter: 'url(#glow-soft)' }} />
        {[0, 1, 2, 3].flatMap((r) => [0, 1].map((c) => (
          <g key={`${r}${c}`}>
            <rect x={524 + c * 116} y={120 + r * 70} width={112} height={66} fill="none" stroke="rgba(255,140,120,.26)" />
            <rect x={529 + c * 116} y={125 + r * 70} width={102} height={56} fill="none" stroke="rgba(255,140,120,.12)" />
          </g>
        )))}
        <text x="640" y="391" textAnchor="middle" className="fill-ash font-sans text-[10.5px]">Sapatos na entrada do tatame</text>
      </g>
      <Tag x={528} y={116} name="Tatame" jp={ZONES.tatame.jp} />

      {/* varanda */}
      <g className="zone-neon">
        <rect x="560" y="420" width="300" height="112" fill="url(#deck)" stroke={RED} strokeOpacity={0.55} strokeDasharray="7 6" strokeWidth="1.5" />
        {Array.from({ length: 13 }, (_, i) => <circle key={i} cx={572 + i * 23} cy={526} r={1.8} fill="#ffd9d2" fillOpacity={0.7} />)}
      </g>
      <Tag x={568} y={420} name={ZONES.varanda.name} jp={ZONES.varanda.jp} />

      {/* plantas */}
      <Plant x={52} y={52} /><Plant x={850} y={150} /><Plant x={850} y={400} /><Plant x={590} y={514} /><Plant x={844} y={514} /><Plant x={470} y={452} />

      {TABLES.map((t) => <TableShape key={t.id} t={t} status={map[t.id] ?? 'livre'} selected={selected === t.id} dim={need > 0 && ((map[t.id] ?? 'livre') !== 'livre' || t.seats < need)} onPick={() => onPick(t.id)} />)}
    </svg>
  )
}

function Reserve({ t, status, onClose }: { t: TableDef; status: TableStatus; onClose: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [people, setPeople] = useState(Math.min(2, t.seats))
  const [time, setTime] = useState('')
  const [tried, setTried] = useState(false)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  useEffect(() => { setSent(false); setPeople(Math.min(2, t.seats)); setTime(''); setTried(false); setErr('') }, [t.id])

  const bad = { name: name.trim().length < 2, phone: phone.replace(/\D/g, '').length < 10, time: !time }
  const submit = async () => {
    setTried(true)
    if (bad.name || bad.phone || bad.time) return
    setBusy(true); setErr('')
    try {
      await store.createReservation({ tableId: t.id, name: name.trim(), phone: phone.trim(), people, time, status: 'pendente', createdAt: Date.now() })
      setSent(true)
    } catch { setErr('Não foi possível enviar agora. Tente de novo em instantes.') } finally { setBusy(false) }
  }
  const wa = waLink(`Olá, Kenko! Quero reservar a ${t.label} (${people} ${people === 1 ? 'pessoa' : 'pessoas'}) hoje às ${time}. Nome: ${name}.`)

  return (
    <div className="cut border border-shu/40 bg-[#0a0505] p-6 shadow-[inset_0_0_50px_rgba(255,45,31,.13)] md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-3xl font-extrabold">{t.label}</h3>
          <p className="mt-1 flex items-center gap-2 text-washi/70"><Users size={16} /> {t.seats} {t.seats === 1 ? 'lugar' : 'lugares'}, {ZONES[t.zone].name.toLowerCase()}</p>
        </div>
        <button onClick={onClose} aria-label="Fechar painel da mesa" className="grid h-9 w-9 place-items-center hover:bg-white/10"><X size={18} /></button>
      </div>
      <p className={cn('mt-4 inline-flex items-center gap-2 border px-3 py-1 text-sm font-medium', status === 'livre' ? 'border-[#4ade80]/60 text-[#4ade80]' : status === 'reservada' ? 'border-[#fbbf24]/60 text-[#fbbf24]' : 'border-white/20 text-ash')}>
        <span className={cn('h-2 w-2 rounded-full', status === 'livre' ? 'bg-[#4ade80]' : status === 'reservada' ? 'bg-[#fbbf24]' : 'bg-ash')} /> {STATUS_LABEL[status]} agora
      </p>

      {status !== 'livre' ? (
        <p className="mt-5 text-washi/75">Esta mesa não está disponível agora. Toque em uma mesa livre no mapa para reservar.</p>
      ) : sent ? (
        <div className="mt-6">
          <p className="flex items-center gap-2 font-display text-2xl font-bold"><Check className="text-shu" /> Pedido de reserva enviado.</p>
          <p className="mt-2 text-washi/75">Pedimos a {t.label} às {time} para {people} {people === 1 ? 'pessoa' : 'pessoas'}. O Kenko confirma com você por WhatsApp.</p>
          {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-primary mt-5">Confirmar pelo WhatsApp <span className="dot"><Check size={17} /></span></a>}
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); submit() }} noValidate>
          <label className="block"><span className="mb-1.5 block text-sm text-washi/80">Nome</span>
            <input className="h-12 w-full border border-white/15 bg-white/[.04] px-3.5 outline-none focus:border-beni" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            {tried && bad.name && <span role="alert" className="mt-1 block text-sm text-shu">Informe seu nome.</span>}
          </label>
          <label className="block"><span className="mb-1.5 block text-sm text-washi/80">WhatsApp</span>
            <input className="h-12 w-full border border-white/15 bg-white/[.04] px-3.5 outline-none focus:border-beni" inputMode="tel" placeholder="(14) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            {tried && bad.phone && <span role="alert" className="mt-1 block text-sm text-shu">Informe um WhatsApp com DDD.</span>}
          </label>
          <fieldset>
            <legend className="mb-1.5 text-sm text-washi/80">Quantas pessoas?</legend>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: t.seats }, (_, i) => i + 1).map((n) => (
                <button type="button" key={n} aria-pressed={people === n} onClick={() => setPeople(n)} className={cn('h-10 w-10 border font-bold tabular-nums transition-colors', people === n ? 'border-beni bg-beni' : 'border-white/15 hover:border-white/40')}>{n}</button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-1.5 text-sm text-washi/80">Horário, hoje</legend>
            <div className="flex flex-wrap gap-2">
              {RESERVATION_SLOTS.map((s) => (
                <button type="button" key={s} aria-pressed={time === s} onClick={() => setTime(s)} className={cn('h-10 border px-3 text-sm tabular-nums transition-colors', time === s ? 'border-beni bg-beni font-bold' : 'border-white/15 hover:border-white/40')}>{s}</button>
              ))}
            </div>
            {tried && bad.time && <span role="alert" className="mt-1 block text-sm text-shu">Escolha um horário.</span>}
          </fieldset>
          {err && <p role="alert" className="text-sm text-shu">{err}</p>}
          <button type="submit" disabled={busy} className="btn btn-primary w-full justify-between">{busy ? 'Enviando…' : 'Pedir reserva'}<span className="dot"><Check size={17} /></span></button>
          <p className="text-xs text-ash">A reserva só vale depois da confirmação do {RESTAURANT.name}.</p>
        </form>
      )}
    </div>
  )
}

export function Tables() {
  const root = useReveal<HTMLElement>()
  const title = useSplit<HTMLHeadingElement>()
  const [map, setMap] = useState<TableMap>({})
  const [sel, setSel] = useState<string | null>(null)
  const [need, setNeed] = useState(0)
  const plan = useRef<HTMLDivElement>(null)

  useEffect(() => store.subscribeTables(setMap), [])
  const counts = useMemo(() => {
    const c = { livre: 0, ocupada: 0, reservada: 0 }
    TABLES.forEach((t) => c[map[t.id] ?? 'livre']++)
    return c
  }, [map])

  /* acendimento tipo letreiro: contornos primeiro, depois as mesas, do centro para fora */
  useEffect(() => {
    const el = plan.current
    if (!el || reducedMotion()) return
    const zones = Array.from(el.querySelectorAll<SVGElement>('.zone-neon'))
    const tbls = Array.from(el.querySelectorAll<SVGElement>('.tbl'))
    ;[...zones, ...tbls].forEach((n) => (n.style.opacity = '0'))
    const flick = [{ to: 0.9, duration: 70 }, { to: 0.1, duration: 90 }, { to: 1, duration: 60 }, { to: 0.3, duration: 120 }, { to: 1, duration: 90 }, { to: 0.55, duration: 70 }, { to: 1, duration: 260 }]
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      animate(zones, { opacity: flick, duration: 900, delay: stagger(70) })
      animate(tbls, { opacity: flick, scale: [0.82, 1], duration: 900, ease: 'outBack', delay: stagger(60, { from: 'center', start: 500 }) })
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const spot = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--px', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--py', `${e.clientY - r.top}px`)
  }

  const table = TABLES.find((t) => t.id === sel)

  return (
    <section id="mesas" ref={root} className="relative border-t border-white/10 bg-gradient-to-b from-black via-[#0a0304] to-black px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <h2 ref={title} className="font-display text-[clamp(2.4rem,5.4vw,4.6rem)] font-extrabold leading-[1.05] tracking-tight">Veja as mesas livres agora.</h2>
            <p data-reveal className="mt-4 max-w-xl text-lg text-washi/70">Escolha uma mesa livre no mapa e peça a reserva. O mapa muda quando a casa atualiza o salão.</p>
          </div>
          <div data-reveal className="flex items-stretch gap-px border border-white/12 bg-white/12" aria-live="polite">
            {([['livre', 'Livres', 'text-[#4ade80]'], ['reservada', 'Reservadas', 'text-[#fbbf24]'], ['ocupada', 'Ocupadas', 'text-[#7a6e75]']] as const).map(([k, l, c]) => (
              <div key={k} className="min-w-24 flex-1 bg-black px-5 py-3">
                <p className={cn('font-display text-4xl font-extrabold', c)}><CountUp value={counts[k]} /></p>
                <p className="text-sm text-ash">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] [&>*]:min-w-0">
          <div data-reveal ref={plan} onPointerMove={spot} className="plan-box relative isolate border border-shu/30 bg-black p-3 shadow-[0_0_46px_rgba(255,45,31,.16),inset_0_0_70px_rgba(255,45,31,.07)] md:p-6">
            <div className="plan-spot pointer-events-none absolute inset-0 -z-0" />
            <div className="relative mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar mesas por número de pessoas">
              <span className="mr-1 text-sm text-washi/75">Quantas pessoas?</span>
              {[[0, 'Qualquer'], [2, '2'], [4, '4'], [6, '6']].map(([n, l]) => (
                <button key={n} aria-pressed={need === n} onClick={() => { setNeed(n as number); setSel(null) }}
                  className={cn('h-9 min-w-9 border px-3 text-sm font-medium transition-colors', need === n ? 'border-beni bg-beni text-white' : 'border-white/15 text-washi/80 hover:border-white/40')}>{l}</button>
              ))}
              {need > 0 && <span className="text-sm text-ash" aria-live="polite">{TABLES.filter((t) => (map[t.id] ?? 'livre') === 'livre' && t.seats >= need).length} mesas livres para {need} ou mais</span>}
            </div>
            <div className="scroll-x relative -mx-1"><Plan map={map} selected={sel} need={need} onPick={(id) => setSel(id)} /></div>
            <p className="mt-2 text-xs text-ash md:hidden">Deslize a planta para os lados para ver todo o salão.</p>
            <ul className="relative mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-washi/75">
              <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-sm border border-[#4ade80] bg-[#4ade80]/20 shadow-[0_0_8px_rgba(74,222,128,.6)]" /> Livre</li>
              <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-sm border border-dashed border-[#fbbf24] bg-[#fbbf24]/10" /> Reservada</li>
              <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-sm border border-[#4d4249] bg-[#171214]" /> Ocupada</li>
              {store.demo && <li className="ml-auto border border-white/20 px-2 py-0.5 text-xs text-ash">Dados de demonstração</li>}
            </ul>
          </div>
          <div data-reveal>
            {table ? (
              <Reserve t={table} status={map[table.id] ?? 'livre'} onClose={() => setSel(null)} />
            ) : (
              <div className="grid h-full min-h-60 place-items-center border border-dashed border-white/20 p-8 text-center">
                <div>
                  <span className="hanko mx-auto mb-4 h-14 w-14 text-3xl">席</span>
                  <p className="font-display text-2xl font-bold">Toque em uma mesa.</p>
                  <p className="mx-auto mt-2 max-w-xs text-washi/70">Verde é livre, amarelo é reservada e cinza é ocupada. Escolha uma mesa livre para reservar.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
