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

const CORE = '#ffd9d2'
const RED = '#ff2d1f'

type ShapeProps = { t: TableDef; inset?: number } & SVGProps<SVGElement>
/** Contorno da mesa; `inset` encolhe para desenhar o "prato" interno. */
function Shape({ t, inset = 0, ...p }: ShapeProps) {
  const i = inset
  const q = p as SVGProps<SVGCircleElement> & SVGProps<SVGRectElement>
  if (t.shape === 'stool') return <circle r={16 - i} {...(q as SVGProps<SVGCircleElement>)} />
  if (t.shape === 'round') return <circle r={32 - i} {...(q as SVGProps<SVGCircleElement>)} />
  if (t.shape === 'square') return <rect x={-28 + i} y={-28 + i} width={56 - 2 * i} height={56 - 2 * i} rx={4} {...(q as SVGProps<SVGRectElement>)} />
  return <rect x={-60 + i} y={-32 + i} width={120 - 2 * i} height={64 - 2 * i} rx={3} {...(q as SVGProps<SVGRectElement>)} />
}

function Chairs({ t, status }: { t: TableDef; status: TableStatus }) {
  const fill = status === 'livre' ? 'rgba(255,90,74,.6)' : status === 'reservada' ? 'rgba(255,45,31,.3)' : '#240a0d'
  if (t.shape === 'square') return <><circle fill={fill} cx={-40} cy={0} r={8} /><circle fill={fill} cx={40} cy={0} r={8} /></>
  if (t.shape === 'round') return <>{[0, 90, 180, 270].map((a) => <circle key={a} fill={fill} r={8} cx={Math.cos((a + 45) * Math.PI / 180) * 46} cy={Math.sin((a + 45) * Math.PI / 180) * 46} />)}</>
  if (t.shape === 'low') return <>{[-36, 0, 36].flatMap((x) => [<rect key={'a' + x} fill={fill} x={x - 13} y={-56} width={26} height={16} rx={3} />, <rect key={'b' + x} fill={fill} x={x - 13} y={40} width={26} height={16} rx={3} />])}</>
  return null
}

function TableShape({ t, status, selected, onPick }: { t: TableDef; status: TableStatus; selected: boolean; onPick: () => void }) {
  const free = status === 'livre'
  const res = status === 'reservada'
  const short = t.id.startsWith('B') ? t.id.slice(1) : t.label.replace(/\D/g, '') || t.id
  const reach = t.shape === 'low' ? 80 : t.shape === 'stool' ? 24 : 54
  return (
    <g transform={`translate(${t.x} ${t.y})`}>
      <g
        className={cn('tbl cursor-pointer outline-none', free && 'is-free', res && 'is-res')}
        style={{ transformBox: 'fill-box', transformOrigin: 'center', ['--d' as string]: `${(hash(t.id) % 25) / 10}s` }}
        role="button" tabIndex={0}
        aria-label={`${t.label}, ${t.seats} ${t.seats === 1 ? 'lugar' : 'lugares'}, ${STATUS_LABEL[status].toLowerCase()}`}
        aria-pressed={selected}
        onClick={onPick}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onPick())}
      >
        <Chairs t={t} status={status} />
        <g className="tbl-in" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          {free && (
            <>
              <g className="hot" style={{ filter: 'url(#glow-hot)' }}><Shape t={t} stroke={RED} strokeWidth={8} fill="none" /></g>
              <g style={{ filter: 'url(#glow)' }}><Shape t={t} stroke={RED} strokeWidth={4} fill="rgba(255,45,31,.12)" /></g>
              <Shape t={t} className="core" stroke={CORE} strokeWidth={1.5} fill="none" />
              {t.shape !== 'stool' && <Shape t={t} inset={9} stroke={RED} strokeOpacity={0.5} strokeWidth={1} fill="none" />}
            </>
          )}
          {res && (
            <g className="res-blink" style={{ filter: 'url(#glow-soft)' }}>
              <Shape t={t} stroke={RED} strokeWidth={2} strokeDasharray="5 4" fill="rgba(255,45,31,.05)" />
            </g>
          )}
          {status === 'ocupada' && <Shape t={t} fill="#1b0608" stroke="#3d0c11" strokeWidth={1.5} />}
          <text textAnchor="middle" dy={t.shape === 'stool' ? 4.5 : 1} style={free ? { filter: 'url(#glow-soft)' } : undefined}
            className={cn('pointer-events-none font-display text-[15px] font-extrabold', free ? 'fill-[#ffe6e1]' : res ? 'fill-shu/75' : 'fill-[#5c1b21]')}>{short}</text>
          {t.shape !== 'stool' && <text textAnchor="middle" dy={16} className={cn('pointer-events-none text-[10px]', free ? 'fill-[#ffb3a8]' : res ? 'fill-shu/50' : 'fill-[#4a1519]')}>{t.seats} lug.</text>}
        </g>
        {free && <circle r={reach - 6} className="free-pulse fill-none stroke-shu" strokeWidth={1} opacity={0} />}
        <circle className="focus fill-none stroke-shu opacity-0" r={reach + 4} strokeWidth={2} />
        {selected && <circle r={reach + 4} className="sel-ring fill-none stroke-[#ffd9d2]" strokeWidth={1.6} strokeDasharray="3 6" style={{ filter: 'url(#glow-soft)' }} />}
      </g>
    </g>
  )
}

const NeonText = ({ children, ...p }: { children: string } & SVGProps<SVGTextElement>) => (
  <g className="zone-neon">
    <text {...p} style={{ filter: 'url(#glow)' }} className={cn(p.className, 'fill-shu')} opacity={0.7}>{children}</text>
    <text {...p} className={cn(p.className, 'fill-[#ffd9d2]')} opacity={0.85}>{children}</text>
  </g>
)

function Plan({ map, selected, onPick }: { map: TableMap; selected: string | null; onPick: (id: string) => void }) {
  const open = openStatus().open
  return (
    <svg viewBox="0 0 900 560" className="w-full min-w-[640px]" role="group" aria-label="Mapa do salão do Kenko">
      <defs>
        <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="a" /><feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="a" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-hot" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="10" /></filter>
        <filter id="glow-soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="a" /><feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="a" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="floor-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26" /></filter>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="rgba(255,45,31,.07)" strokeWidth="1" /></pattern>
        <linearGradient id="sweep" x1="0" x2="1"><stop offset="0" stopColor={RED} stopOpacity="0" /><stop offset=".5" stopColor="#ff6b5c" stopOpacity=".16" /><stop offset="1" stopColor={RED} stopOpacity="0" /></linearGradient>
      </defs>
      <style>{`
        .free-pulse{animation:fp 2.8s ease-out infinite;transform-box:fill-box;transform-origin:center}
        @keyframes fp{0%{opacity:.6;transform:scale(.75)}100%{opacity:0;transform:scale(1.3)}}
        .core{animation:breathe 3.2s ease-in-out infinite;animation-delay:var(--d,0s)}
        @keyframes breathe{0%,100%{opacity:.82}50%{opacity:1}}
        .res-blink{animation:rb 3.6s steps(1,end) infinite;animation-delay:var(--d,0s)}
        @keyframes rb{0%{opacity:.85}46%{opacity:.85}48%{opacity:.3}50%{opacity:.85}52%{opacity:.4}54%,100%{opacity:.85}}
        .hot{opacity:0;transition:opacity .35s}
        .tbl:hover .hot,.tbl:focus-visible .hot{opacity:.95}
        .tbl-in{transition:transform .4s cubic-bezier(.16,1,.3,1)}
        .tbl:hover .tbl-in{transform:scale(1.07)}
        .tbl:focus-visible .focus{opacity:1}
        .sel-ring{transform-box:fill-box;transform-origin:center;animation:spin-slow 9s linear infinite}
        .sweep{animation:sw 9s linear infinite}
        @keyframes sw{0%{transform:translateX(-220px)}55%,100%{transform:translateX(1000px)}}
        .sign-on{animation:flick 7s steps(1,end) infinite}
        @keyframes flick{0%,100%{opacity:1}61%{opacity:1}62%{opacity:.25}63%{opacity:1}64%{opacity:.5}65%{opacity:1}}
        @media (prefers-reduced-motion:reduce){.free-pulse,.core,.res-blink,.sel-ring,.sweep,.sign-on{animation:none}}
      `}</style>

      {/* chão: grade e manchas de luz */}
      <rect x="14" y="14" width="872" height="532" fill="url(#grid)" />
      <g filter="url(#floor-blur)" fill={RED}>
        <ellipse cx="310" cy="80" rx="210" ry="30" opacity=".22" />
        <ellipse cx="258" cy="350" rx="215" ry="130" opacity=".13" />
        <ellipse cx="640" cy="275" rx="140" ry="160" opacity=".15" />
        <ellipse cx="710" cy="485" rx="160" ry="48" opacity=".12" />
      </g>
      <rect className="zone-neon" x="14" y="14" width="872" height="532" fill="none" stroke="rgba(255,45,31,.45)" strokeWidth="1.5" style={{ filter: 'url(#glow-soft)' }} />

      {/* letreiro */}
      <g className="zone-neon">
        <g className={open ? 'sign-on' : undefined} opacity={open ? 1 : 0.35}>
          <rect x="650" y="26" width="200" height="64" rx="8" fill="none" stroke={RED} strokeWidth="3" style={{ filter: 'url(#glow)' }} />
          <rect x="650" y="26" width="200" height="64" rx="8" fill="none" stroke={CORE} strokeWidth="1.2" />
          <text x="750" y="73" textAnchor="middle" className="font-display text-[34px] font-extrabold" fill={RED} style={{ filter: 'url(#glow)' }}>{open ? '営業中' : '準備中'}</text>
          <text x="750" y="73" textAnchor="middle" className="font-display text-[34px] font-extrabold" fill="#ffe6e1">{open ? '営業中' : '準備中'}</text>
        </g>
      </g>

      {/* balcão */}
      <NeonText x="120" y="40" className="font-display text-[13px] italic">{ZONES.balcao.name}</NeonText>
      <rect className="zone-neon" x="116" y="60" width="388" height="36" fill="rgba(255,45,31,.06)" stroke={RED} strokeWidth="1.6" style={{ filter: 'url(#glow-soft)' }} />
      <NeonText x="516" y="84" className="font-display text-[18px] font-extrabold">{ZONES.balcao.jp}</NeonText>

      {/* salão */}
      <rect className="zone-neon" x="64" y="204" width="388" height="292" fill="none" stroke="rgba(255,45,31,.5)" strokeDasharray="2 7" strokeWidth="1.5" style={{ filter: 'url(#glow-soft)' }} />
      <NeonText x="76" y="228" className="font-display text-[13px] italic">{ZONES.salao.name}</NeonText>
      <text x="438" y="486" textAnchor="end" className="fill-shu/[.09] font-display text-[64px] font-extrabold">{ZONES.salao.jp}</text>

      {/* tatame */}
      <rect className="zone-neon" x="520" y="130" width="240" height="290" fill="rgba(255,45,31,.04)" stroke={RED} strokeOpacity=".6" strokeWidth="1.5" style={{ filter: 'url(#glow-soft)' }} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="528" y={138 + i * 56} width="224" height="50" fill="none" stroke="rgba(255,45,31,.14)" />)}
      <NeonText x="528" y="120" className="font-display text-[13px] italic">{ZONES.tatame.name + ', sem sapatos'}</NeonText>
      <text x="752" y="412" textAnchor="end" className="fill-shu/[.1] font-display text-[56px] font-extrabold">{ZONES.tatame.jp}</text>

      {/* varanda */}
      <rect className="zone-neon" x="560" y="438" width="300" height="94" fill="none" stroke={RED} strokeOpacity=".5" strokeDasharray="7 6" strokeWidth="1.5" style={{ filter: 'url(#glow-soft)' }} />
      <NeonText x="852" y="526" textAnchor="end" className="font-display text-[13px] italic">{ZONES.varanda.name}</NeonText>
      {[836, 590].map((x) => <circle key={x} cx={x} cy={512} r={9} fill="rgba(255,45,31,.18)" stroke="rgba(255,45,31,.45)" />)}

      {/* entrada */}
      <g className="zone-neon">
        <path d="M40 546h90" stroke={RED} strokeWidth="4" style={{ filter: 'url(#glow)' }} />
        <path d="M40 546h90" stroke={CORE} strokeWidth="1.4" />
        <text x="52" y="533" className="fill-[#ffb3a8] text-[12px]">Entrada</text>
      </g>

      {/* varredura de luz */}
      <rect className="sweep" x="0" y="14" width="200" height="532" fill="url(#sweep)" pointerEvents="none" style={{ mixBlendMode: 'screen' }} />

      {TABLES.map((t) => <TableShape key={t.id} t={t} status={map[t.id] ?? 'livre'} selected={selected === t.id} onPick={() => onPick(t.id)} />)}
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
      <p className={cn('mt-4 inline-flex items-center gap-2 border px-3 py-1 text-sm font-medium', status === 'livre' ? 'border-washi/40 text-washi' : 'border-beni text-shu')}>
        <span className={cn('h-2 w-2 rounded-full', status === 'livre' ? 'bg-washi' : 'bg-beni')} /> {STATUS_LABEL[status]} agora
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
            {([['livre', 'Livres', 'text-[#ffe6e1] [text-shadow:0_0_6px_#ff2d1f,0_0_22px_#ff2d1f,0_0_48px_rgba(255,45,31,.7)]'], ['reservada', 'Reservadas', 'text-shu/80 [text-shadow:0_0_14px_rgba(255,45,31,.6)]'], ['ocupada', 'Ocupadas', 'text-[#6b1f26]']] as const).map(([k, l, c]) => (
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
            <div className="scroll-x relative -mx-1"><Plan map={map} selected={sel} onPick={(id) => setSel(id)} /></div>
            <p className="mt-2 text-xs text-ash md:hidden">Deslize o mapa para os lados para ver todo o salão.</p>
            <ul className="relative mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-washi/70">
              <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 border border-[#ffd9d2] bg-shu/15 shadow-[0_0_10px_2px_rgba(255,45,31,.8)]" /> Livre, acesa</li>
              <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 border border-dashed border-shu shadow-[0_0_6px_rgba(255,45,31,.6)]" /> Reservada, tracejada</li>
              <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 border border-[#3d0c11] bg-[#1b0608]" /> Ocupada, apagada</li>
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
                  <p className="mx-auto mt-2 max-w-xs text-washi/70">As mesas livres acendem em neon. Escolha uma para ver os detalhes e reservar.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
