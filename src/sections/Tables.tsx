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

/** Cores de estado: verde livre, amarelo reservada, vermelho ocupada. */
const PAL = {
  livre: { top: '#3fb56b', rim: '#27854d', text: '#ffffff', sub: 'rgba(255,255,255,.88)' },
  reservada: { top: '#e4a82f', rim: '#a97a14', text: '#2b1d05', sub: 'rgba(43,29,5,.82)' },
  ocupada: { top: '#e5383b', rim: '#a3191c', text: '#ffffff', sub: 'rgba(255,255,255,.88)' },
} as const

type ShapeProps = { t: TableDef; inset?: number } & SVGProps<SVGElement>
/** Tampo da mesa; `inset` encolhe (ou, se negativo, engrossa a borda). */
function Shape({ t, inset = 0, ...p }: ShapeProps) {
  const i = inset
  const q = p as SVGProps<SVGCircleElement> & SVGProps<SVGRectElement>
  if (t.shape === 'stool') return <circle r={16 - i} {...(q as SVGProps<SVGCircleElement>)} />
  if (t.shape === 'round') return <circle r={32 - i} {...(q as SVGProps<SVGCircleElement>)} />
  if (t.shape === 'square') return <rect x={-28 + i} y={-28 + i} width={56 - 2 * i} height={56 - 2 * i} rx={6} {...(q as SVGProps<SVGRectElement>)} />
  return <rect x={-60 + i} y={-32 + i} width={120 - 2 * i} height={64 - 2 * i} rx={5} {...(q as SVGProps<SVGRectElement>)} />
}

const Person = ({ x = 0, y = 0 }: { x?: number; y?: number }) => (
  <g transform={`translate(${x} ${y})`}><circle r={4.2} fill="#f1e3d1" stroke="#7a5a45" strokeWidth={0.8} /></g>
)

/** Cadeira de madeira vista de cima; o encosto fica para fora. */
function Chair({ x, y, a, taken }: { x: number; y: number; a: number; taken: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a + 90})`}>
      <rect x={-8} y={-6} width={16} height={13} rx={4} fill="#4a3427" stroke="#2b1d15" strokeWidth={1} />
      <rect x={-8} y={-9.5} width={16} height={3.5} rx={1.75} fill="#6a4c39" stroke="#2b1d15" strokeWidth={0.8} />
      {taken && <Person y={1} />}
    </g>
  )
}

function Seats({ t, status }: { t: TableDef; status: TableStatus }) {
  const taken = status === 'ocupada'
  if (t.shape === 'square') return <><Chair x={-40} y={0} a={180} taken={taken} /><Chair x={40} y={0} a={0} taken={taken} /></>
  if (t.shape === 'round') return <>{[45, 135, 225, 315].map((a) => <Chair key={a} a={a} x={Math.cos(a * Math.PI / 180) * 46} y={Math.sin(a * Math.PI / 180) * 46} taken={taken} />)}</>
  if (t.shape === 'low') return <>{[-36, 0, 36].flatMap((x) => [-48, 48].map((y) => (
    <g key={`${x}${y}`}>
      <rect x={x - 12} y={y - 10} width={24} height={20} rx={6} fill="#7a2f33" stroke="#4a1a1d" strokeWidth={1} />
      <rect x={x - 7} y={y - 5} width={14} height={10} rx={3} fill="none" stroke="rgba(255,255,255,.18)" />
      {taken && <Person x={x} y={y} />}
    </g>
  )))}</>
  return null
}

function TableShape({ t, status, selected, dim, onPick }: { t: TableDef; status: TableStatus; selected: boolean; dim: boolean; onPick: () => void }) {
  const c = PAL[status]
  const short = t.id.startsWith('B') ? t.id.slice(1) : t.label.replace(/\D/g, '') || t.id
  const reach = t.shape === 'low' ? 80 : t.shape === 'stool' ? 24 : 56
  return (
    <g transform={`translate(${t.x} ${t.y})`} style={{ opacity: dim ? 0.25 : 1, transition: 'opacity .35s' }}>
      <g
        className="tbl cursor-pointer outline-none"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        role="button" tabIndex={dim ? -1 : 0}
        aria-label={`${t.label}, ${t.seats} ${t.seats === 1 ? 'lugar' : 'lugares'}, ${STATUS_LABEL[status].toLowerCase()}`}
        aria-pressed={selected}
        onClick={onPick}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onPick())}
      >
        <g style={{ filter: 'url(#sh)' }}><Seats t={t} status={status} /></g>
        <g className="tbl-in" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <g style={{ filter: 'url(#sh)' }}><Shape t={t} inset={-3} fill={c.rim} /></g>
          <Shape t={t} className="top" fill={c.top} />
          <Shape t={t} inset={t.shape === 'stool' ? 6 : 8} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth={1} />
          {t.shape === 'low' && <><circle cx={-34} cy={0} r={3.5} fill="rgba(255,255,255,.55)" /><circle cx={34} cy={0} r={3.5} fill="rgba(255,255,255,.55)" /></>}
          <text textAnchor="middle" dy={t.shape === 'stool' ? 4.5 : -1} className="pointer-events-none font-display text-[16px] font-extrabold" fill={c.text}>{short}</text>
          {t.shape !== 'stool' && <text textAnchor="middle" dy={13} className="pointer-events-none text-[10px] font-medium" fill={c.sub}>{t.seats} lug.</text>}
        </g>
        <circle className="focus fill-none stroke-white opacity-0" r={reach + 4} strokeWidth={2} />
        {selected && <circle r={reach + 5} fill="rgba(255,255,255,.06)" stroke="#fff" strokeWidth={2} />}
      </g>
    </g>
  )
}

/** Etiqueta de zona. */
function Tag({ x, y, name, jp }: { x: number; y: number; name: string; jp?: string }) {
  const w = Math.round(name.length * 7 + (jp ? jp.length * 14 + 14 : 0) + 22)
  return (
    <g className="zone" transform={`translate(${x} ${y})`}>
      <rect y={-11} width={w} height={22} rx={11} fill="rgba(8,5,4,.82)" stroke="rgba(255,255,255,.16)" />
      <text x={11} y={4.5} className="fill-washi font-sans text-[12.5px] font-medium">{name}</text>
      {jp && <text x={11 + name.length * 7 + 7} y={4.5} className="fill-shu font-display text-[12.5px] font-bold">{jp}</text>}
    </g>
  )
}

function Plant({ x, y }: { x: number; y: number }) {
  return (
    <g className="zone" transform={`translate(${x} ${y})`} style={{ filter: 'url(#sh)' }}>
      <circle r={11} fill="#6b4a35" stroke="#3c281c" />
      {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-8} rx={4.5} ry={8} fill="#3c8a4e" stroke="#25603a" strokeWidth={0.8} transform={`rotate(${a})`} />)}
      <circle r={3} fill="#2a6a3a" />
    </g>
  )
}

function Plan({ map, selected, need, onPick }: { map: TableMap; selected: string | null; need: number; onPick: (id: string) => void }) {
  const open = openStatus().open
  const wallPath = 'M110 536H876V24H24V536H40'
  return (
    <svg viewBox="0 0 900 570" className="w-full min-w-[680px]" role="group" aria-label="Planta do salão do Kenko">
      <defs>
        <filter id="sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity=".55" /></filter>
        <pattern id="planks" width="64" height="16" patternUnits="userSpaceOnUse"><path d="M0 .5H64" stroke="rgba(0,0,0,.32)" /><path d="M20 0V16" stroke="rgba(0,0,0,.2)" /><path d="M0 1.5H64" stroke="rgba(255,255,255,.035)" /></pattern>
        <pattern id="deck" width="16" height="64" patternUnits="userSpaceOnUse"><path d="M.5 0V64" stroke="rgba(0,0,0,.32)" /><path d="M0 22H16" stroke="rgba(0,0,0,.2)" /></pattern>
      </defs>
      <style>{`
        .tbl-in{transition:transform .4s cubic-bezier(.16,1,.3,1)}
        .tbl .top{transition:filter .3s}
        .tbl:hover .tbl-in{transform:scale(1.06)}
        .tbl:hover .top{filter:brightness(1.12)}
        .tbl:focus-visible .focus{opacity:1}
      `}</style>

      <rect width="900" height="570" fill="#0b0807" />
      <g className="zone">
        <rect x="24" y="24" width="852" height="512" fill="#1b1310" />
        <rect x="24" y="24" width="852" height="512" fill="url(#planks)" />
      </g>

      {/* paredes, com vão na porta */}
      <g className="zone">
        <path d={wallPath} fill="none" stroke="#4a3b32" strokeWidth={11} strokeLinecap="square" />
        <path d={wallPath} fill="none" stroke="#2b211c" strokeWidth={5} strokeLinecap="square" />
        {[150, 216].map((y) => <rect key={y} x={18} y={y} width={12} height={52} fill="#8fb8cc" fillOpacity={0.5} stroke="#d9eaf2" strokeOpacity={0.5} />)}
        <rect x="108" y="466" width="4" height="70" rx="1" fill="#c9a77a" />
        <path d="M40 536A70 70 0 0 1 110 466" fill="none" stroke="rgba(255,255,255,.22)" strokeDasharray="3 4" />
      </g>
      <Tag x={40} y={553} name="Entrada" />

      {/* letreiro: verde aberto, vermelho fechado */}
      <g className="zone">
        <rect x="676" y="40" width="168" height="50" rx="8" fill="#0c0807" stroke={open ? '#2f8f57' : '#a3191c'} strokeWidth={1.5} />
        <text x="760" y="76" textAnchor="middle" className="font-display text-[28px] font-extrabold" fill={open ? '#4ade80' : '#f0575a'}>{open ? '営業中' : '準備中'}</text>
        <text x="760" y="106" textAnchor="middle" className="font-sans text-[11px] font-medium" fill={open ? '#4ade80' : '#f0575a'}>{open ? 'Aberto agora' : 'Fechado agora'}</text>
      </g>

      {/* balcão do sushiman */}
      <g className="zone">
        <rect x="100" y="40" width="430" height="100" rx="10" fill="#241a16" />
        <g style={{ filter: 'url(#sh)' }}>
          <rect x="116" y="56" width="398" height="40" rx="6" fill="#5a3a27" stroke="#7c5339" />
          <rect x="123" y="62" width="302" height="28" rx="3" fill="#141011" stroke="#2c2527" />
          <path d="M128 66H420" stroke="rgba(255,255,255,.08)" />
          <rect x="438" y="64" width="64" height="24" rx="3" fill="#2b2b30" stroke="#47474f" />
          <rect x="444" y="68" width="22" height="10" rx="1.5" fill="#6fa2b8" opacity=".8" />
        </g>
        {[168, 262, 356].map((x) => <g key={x}><circle cx={x} cy={76} r={7} fill="#f2c27a" opacity={0.95} /><circle cx={x} cy={76} r={3} fill="#fff1d6" /></g>)}
      </g>
      <Tag x={108} y={140} name={ZONES.balcao.name} jp={ZONES.balcao.jp} />

      {/* salão */}
      <g className="zone">
        <rect x="64" y="204" width="388" height="270" rx="12" fill="#2b1f19" />
        <rect x="64" y="204" width="388" height="270" rx="12" fill="url(#planks)" />
        <rect x="64" y="204" width="388" height="270" rx="12" fill="none" stroke="rgba(255,255,255,.07)" />
      </g>
      <Tag x={76} y={204} name={ZONES.salao.name} jp={ZONES.salao.jp} />

      {/* tatame: plataforma elevada com esteiras */}
      <g className="zone">
        <g style={{ filter: 'url(#sh)' }}><rect x="512" y="108" width="256" height="300" rx="8" fill="#3b2d22" stroke="#5a4636" /></g>
        <rect x="520" y="116" width="240" height="284" rx="3" fill="#2d241c" />
        {[0, 1, 2, 3].flatMap((r) => [0, 1].map((c) => {
          const x = 524 + c * 116, y = 120 + r * 70
          return (
            <g key={`${r}${c}`}>
              <rect x={x} y={y} width={112} height={66} rx={1.5} fill={(r + c) % 2 ? '#a19e6d' : '#98955f'} stroke="#5b5a37" />
              <rect x={x} y={y} width={7} height={66} fill="#34432a" /><rect x={x + 105} y={y} width={7} height={66} fill="#34432a" />
              <path d={`M${x + 12} ${y + 8}H${x + 100}M${x + 12} ${y + 22}H${x + 100}M${x + 12} ${y + 36}H${x + 100}M${x + 12} ${y + 50}H${x + 100}`} stroke="rgba(0,0,0,.09)" />
            </g>
          )
        }))}
      </g>
      <Tag x={528} y={104} name="Tatame, sem sapatos" jp={ZONES.tatame.jp} />

      {/* varanda */}
      <g className="zone">
        <rect x="560" y="420" width="300" height="112" rx="8" fill="#33261d" />
        <rect x="560" y="420" width="300" height="112" rx="8" fill="url(#deck)" />
        <rect x="560" y="420" width="300" height="112" rx="8" fill="none" stroke="#b9ac9b" strokeWidth={2} />
        {Array.from({ length: 11 }, (_, i) => <circle key={i} cx={572 + i * 27.6} cy={532} r={2.6} fill="#d8ccbb" />)}
      </g>
      <Tag x={568} y={420} name={ZONES.varanda.name} jp={ZONES.varanda.jp} />

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
    <div className="cut border border-white/15 bg-[#0a0505] p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-3xl font-extrabold">{t.label}</h3>
          <p className="mt-1 flex items-center gap-2 text-washi/70"><Users size={16} /> {t.seats} {t.seats === 1 ? 'lugar' : 'lugares'}, {ZONES[t.zone].name.toLowerCase()}</p>
        </div>
        <button onClick={onClose} aria-label="Fechar painel da mesa" className="grid h-9 w-9 place-items-center hover:bg-white/10"><X size={18} /></button>
      </div>
      <p className={cn('mt-4 inline-flex items-center gap-2 border px-3 py-1 text-sm font-medium', status === 'livre' ? 'border-[#3fb56b]/60 text-[#4ade80]' : status === 'reservada' ? 'border-[#e4a82f]/60 text-[#f0b840]' : 'border-[#e5383b]/60 text-[#f0575a]')}>
        <span className={cn('h-2 w-2 rounded-full', status === 'livre' ? 'bg-[#4ade80]' : status === 'reservada' ? 'bg-[#f0b840]' : 'bg-[#f0575a]')} /> {STATUS_LABEL[status]} agora
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

  /* entrada simples: a planta aparece e as mesas "assentam" em sequência */
  useEffect(() => {
    const el = plan.current
    if (!el || reducedMotion()) return
    const zones = Array.from(el.querySelectorAll<SVGElement>('.zone'))
    const tbls = Array.from(el.querySelectorAll<SVGElement>('.tbl'))
    ;[...zones, ...tbls].forEach((n) => (n.style.opacity = '0'))
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      animate(zones, { opacity: [0, 1], duration: 700, ease: 'outQuad', delay: stagger(45) })
      animate(tbls, { opacity: [0, 1], scale: [0.85, 1], duration: 700, ease: 'outBack', delay: stagger(50, { from: 'center', start: 450 }) })
    }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

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
            {([['livre', 'Livres', 'text-[#3fb56b]'], ['reservada', 'Reservadas', 'text-[#e4a82f]'], ['ocupada', 'Ocupadas', 'text-[#e5383b]']] as const).map(([k, l, c]) => (
              <div key={k} className="min-w-24 flex-1 bg-black px-5 py-3">
                <p className={cn('font-display text-4xl font-extrabold', c)}><CountUp value={counts[k]} /></p>
                <p className="text-sm text-ash">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] [&>*]:min-w-0">
          <div data-reveal ref={plan} className="relative isolate border border-white/10 bg-[#0b0807] p-3 md:p-6">
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
              <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full bg-[#3fb56b]" /> Livre</li>
              <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full bg-[#e4a82f]" /> Reservada</li>
              <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 rounded-full bg-[#e5383b]" /> Ocupada</li>
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
                  <p className="mx-auto mt-2 max-w-xs text-washi/70">Verde é livre, amarelo é reservada e vermelho é ocupada. Escolha uma mesa livre para reservar.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
