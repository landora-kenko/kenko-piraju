import { useEffect, useMemo, useRef, useState } from 'react'
import { animate, stagger } from 'animejs'
import { Check, Users, X } from 'lucide-react'
import { TABLES, ZONES, type TableDef, type TableStatus } from '../data/tables'
import { RESERVATION_SLOTS, RESTAURANT, waLink } from '../lib/config'
import { store, type TableMap } from '../lib/store'
import { useReveal } from '../hooks/useReveal'
import { useSplit } from '../hooks/useSplit'
import { cn, reducedMotion } from '../lib/utils'

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

function Chairs({ t }: { t: TableDef }) {
  const c = 'fill-white/25'
  if (t.shape === 'square') return <><circle className={c} cx={-40} cy={0} r={9} /><circle className={c} cx={40} cy={0} r={9} /></>
  if (t.shape === 'round') return <>{[0, 90, 180, 270].map((a) => <circle key={a} className={c} r={9} cx={Math.cos((a + 45) * Math.PI / 180) * 47} cy={Math.sin((a + 45) * Math.PI / 180) * 47} />)}</>
  if (t.shape === 'low') return <>{[-36, 0, 36].flatMap((x) => [<rect key={'a' + x} className="fill-beni/40" x={x - 13} y={-58} width={26} height={20} rx={3} />, <rect key={'b' + x} className="fill-beni/40" x={x - 13} y={38} width={26} height={20} rx={3} />])}</>
  return null
}

function TableShape({ t, status, selected, onPick }: { t: TableDef; status: TableStatus; selected: boolean; onPick: () => void }) {
  const fill = status === 'ocupada' ? 'fill-beni' : status === 'reservada' ? 'fill-beni/10' : 'fill-white/10'
  const stroke = status === 'livre' ? 'stroke-washi' : 'stroke-beni'
  const dash = status === 'reservada' ? '5 4' : undefined
  const short = t.id.startsWith('B') ? t.id.slice(1) : t.label.replace(/\D/g, '') || t.id
  return (
    <g transform={`translate(${t.x} ${t.y})`}>
    <g
      className="tbl cursor-pointer outline-none [&:focus-visible_.focus]:opacity-100"
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      role="button" tabIndex={0}
      aria-label={`${t.label}, ${t.seats} ${t.seats === 1 ? 'lugar' : 'lugares'}, ${STATUS_LABEL[status].toLowerCase()}`}
      aria-pressed={selected}
      onClick={onPick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onPick())}
    >
      <Chairs t={t} />
      <g className="transition-transform duration-300 hover:scale-[1.06]" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {t.shape === 'stool' && <circle r={16} className={cn(fill, stroke)} strokeWidth={1.6} strokeDasharray={dash} />}
        {t.shape === 'square' && <rect x={-28} y={-28} width={56} height={56} rx={4} className={cn(fill, stroke)} strokeWidth={1.6} strokeDasharray={dash} />}
        {t.shape === 'round' && <circle r={32} className={cn(fill, stroke)} strokeWidth={1.6} strokeDasharray={dash} />}
        {t.shape === 'low' && <rect x={-60} y={-32} width={120} height={64} rx={3} className={cn(fill, stroke)} strokeWidth={1.6} strokeDasharray={dash} />}
        <text textAnchor="middle" dy={t.shape === 'stool' ? 4.5 : 1} className={cn('pointer-events-none font-display text-[15px] font-extrabold', status === 'ocupada' ? 'fill-black' : 'fill-washi')}>{short}</text>
        {t.shape !== 'stool' && <text textAnchor="middle" dy={16} className={cn('pointer-events-none text-[10px]', status === 'ocupada' ? 'fill-black/80' : 'fill-washi/60')}>{t.seats} lug.</text>}
      </g>
      {status === 'livre' && <circle r={t.shape === 'low' ? 78 : t.shape === 'stool' ? 22 : 46} className="free-pulse fill-none stroke-shu" strokeWidth={1} opacity={0} />}
      <circle className="focus fill-none stroke-shu opacity-0" r={t.shape === 'low' ? 82 : t.shape === 'stool' ? 24 : 54} strokeWidth={2} />
      {selected && <circle r={t.shape === 'low' ? 82 : t.shape === 'stool' ? 24 : 54} className="fill-none stroke-shu" strokeWidth={2} strokeDasharray="4 5" />}
    </g>
    </g>
  )
}

function Plan({ map, selected, onPick }: { map: TableMap; selected: string | null; onPick: (id: string) => void }) {
  return (
    <svg viewBox="0 0 900 560" className="w-full min-w-[640px]" role="group" aria-label="Mapa do salão do Kenko">
      <style>{`.free-pulse{animation:fp 2.6s ease-out infinite}@keyframes fp{0%{opacity:.7;transform:scale(.8)}100%{opacity:0;transform:scale(1.25)}}.free-pulse{transform-box:fill-box;transform-origin:center}@media (prefers-reduced-motion:reduce){.free-pulse{animation:none}}`}</style>
      <rect x="14" y="14" width="872" height="532" fill="none" stroke="rgba(241,235,227,.16)" strokeWidth="1.5" />

      {/* balcão */}
      <text x="120" y="38" className="fill-washi/40 font-display text-[13px] italic">{ZONES.balcao.name}</text>
      <rect x="116" y="60" width="388" height="36" fill="#0b0505" stroke="#d3111c" strokeWidth="1.5" />
      {[0, 1, 2].map((i) => <circle key={i} cx={190 + i * 120} cy={78} r={7} className="fill-beni/70" />)}
      <text x="516" y="84" className="fill-beni/80 font-display text-[18px] font-extrabold">{ZONES.balcao.jp}</text>

      {/* salão */}
      <rect x="64" y="204" width="388" height="292" fill="rgba(255,255,255,.02)" stroke="rgba(241,235,227,.12)" strokeDasharray="2 6" />
      <text x="76" y="228" className="fill-washi/40 font-display text-[13px] italic">{ZONES.salao.name}</text>
      <text x="438" y="486" textAnchor="end" className="fill-washi/[.07] font-display text-[64px] font-extrabold">{ZONES.salao.jp}</text>

      {/* tatame */}
      <rect x="520" y="130" width="240" height="290" fill="#0d0707" stroke="rgba(241,235,227,.2)" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="528" y={138 + i * 56} width="224" height="50" fill="none" stroke="rgba(241,235,227,.08)" />)}
      <text x="528" y="120" className="fill-washi/40 font-display text-[13px] italic">{ZONES.tatame.name}, sem sapatos</text>
      <text x="752" y="412" textAnchor="end" className="fill-washi/[.08] font-display text-[56px] font-extrabold">{ZONES.tatame.jp}</text>

      {/* varanda */}
      <rect x="560" y="438" width="300" height="94" fill="none" stroke="rgba(241,235,227,.22)" strokeDasharray="7 6" />
      <text x="852" y="526" textAnchor="end" className="fill-washi/40 font-display text-[13px] italic">{ZONES.varanda.name}</text>
      {[836, 590].map((x) => <circle key={x} cx={x} cy={512} r={10} className="fill-emerald-900/70" />)}

      {/* entrada */}
      <path d="M40 546h90" stroke="#000" strokeWidth="6" />
      <text x="52" y="535" className="fill-washi/50 text-[12px]">Entrada</text>

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
    <div className="cut border border-white/15 bg-[#0a0505] p-6 md:p-7">
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

  useEffect(() => {
    const el = plan.current
    if (!el || reducedMotion()) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      animate(el.querySelectorAll('.tbl'), { opacity: [0, 1], scale: [0.4, 1], duration: 900, ease: 'outBack', delay: stagger(45, { from: 'center' }) })
    }, { threshold: 0.25 })
    el.querySelectorAll('.tbl').forEach((n) => ((n as SVGElement).style.opacity = '0'))
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
            {([['livre', 'Livres', 'text-white'], ['reservada', 'Reservadas', 'text-shu'], ['ocupada', 'Ocupadas', 'text-shu']] as const).map(([k, l, c]) => (
              <div key={k} className="min-w-24 flex-1 bg-black px-5 py-3">
                <p className={cn('font-display text-4xl font-extrabold', c)}><CountUp value={counts[k]} /></p>
                <p className="text-sm text-ash">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_400px]">
          <div data-reveal ref={plan} className="relative border border-white/10 bg-black p-3 md:p-6">
            <div className="scroll-x -mx-1"><Plan map={map} selected={sel} onPick={(id) => setSel(id)} /></div>
            <p className="mt-2 text-xs text-ash md:hidden">Deslize o mapa para os lados para ver todo o salão.</p>
            <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-washi/70">
              <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 border border-washi bg-white/10" /> Livre</li>
              <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 border border-dashed border-beni bg-beni/10" /> Reservada</li>
              <li className="flex items-center gap-2"><span className="h-3.5 w-3.5 bg-beni" /> Ocupada</li>
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
                  <p className="mx-auto mt-2 max-w-xs text-washi/70">As mesas livres pulsam em vermelho. Escolha uma para ver os detalhes e reservar.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
