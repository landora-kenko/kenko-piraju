import { useState, type ReactNode } from 'react'
import { ArrowUpRight, Minus, Plus } from 'lucide-react'
import { DELIVERY_ZONES, MIN_DELIVERY_ORDER, RESTAURANT, waLink } from '../lib/config'
import { useReveal } from '../hooks/useReveal'
import { useSplit } from '../hooks/useSplit'
import { cn, money } from '../lib/utils'

const InstaIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
  </svg>
)
const WhatsIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 8 19.5L3 21z" /><path d="M9 9.5c.3 2.6 2.4 4.7 5 5l1.3-1.3-1.8-1-.8.7c-.8-.3-1.6-1.1-2-2l.7-.8-1-1.8L9 9.5z" />
  </svg>
)

/** Bloco de informação: kanji discreto, título em serifa e conteúdo em linhas finas. */
function Block({ kanji, title, children }: { kanji: string; title: string; children: ReactNode }) {
  return (
    <div data-reveal className="grid grid-cols-[2.25rem_1fr] gap-x-5">
      <span aria-hidden className="pt-0.5 font-display text-2xl font-bold leading-none text-beni">{kanji}</span>
      <div className="min-w-0">
        <h3 className="font-display text-xl font-semibold tracking-wide">{title}</h3>
        <div className="mt-1 h-px w-10 bg-beni/70" />
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

/** Linha com pontilhado entre o nome e o valor. */
function Row({ label, hint, value, muted }: { label: string; hint?: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 py-[7px] text-[15px]">
      <dt className="text-washi/80">{label}{hint && <span className="ml-2 text-[13px] text-ash">{hint}</span>}</dt>
      <span aria-hidden className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-white/20" />
      <dd className={cn('tabular-nums', muted ? 'text-ash' : 'text-washi')}>{value}</dd>
    </div>
  )
}

/** Mapa que não arrasta: só zoom pelos botões (ou toque duplo). */
function MapBox() {
  const [z, setZ] = useState(14)
  const src = `https://www.google.com/maps?q=${encodeURIComponent(RESTAURANT.mapQuery)}&z=${z}&output=embed`
  const zoom = (d: number) => setZ((v) => Math.min(18, Math.max(11, v + d)))
  return (
    <div className="cut relative aspect-[4/3] w-full overflow-hidden border border-white/10 bg-[#120606] lg:aspect-auto lg:h-full lg:min-h-[480px]">
      <iframe
        title="Mapa de Piraju, SP" loading="lazy" src={src} tabIndex={-1}
        className="pointer-events-none absolute inset-0 h-full w-full select-none border-0"
        style={{ filter: 'invert(.92) hue-rotate(180deg) saturate(.35) contrast(1.05) brightness(.9)' }}
      />
      <div className="absolute inset-0 z-10 cursor-zoom-in" onDoubleClick={() => zoom(1)} aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-beni/10 mix-blend-color" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,.8)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
        <span className="hanko h-12 w-12 text-2xl shadow-[0_0_40px_rgba(211,17,28,.8)]">健</span>
      </div>
      <div className="absolute bottom-4 right-4 z-30 flex flex-col border border-white/15 bg-black/70 backdrop-blur" role="group" aria-label="Zoom do mapa">
        <button onClick={() => zoom(1)} disabled={z >= 18} aria-label="Aproximar" className="grid h-10 w-10 place-items-center transition-colors hover:bg-beni disabled:opacity-30 disabled:hover:bg-transparent"><Plus size={17} strokeWidth={1.6} /></button>
        <span className="h-px bg-white/15" />
        <button onClick={() => zoom(-1)} disabled={z <= 11} aria-label="Afastar" className="grid h-10 w-10 place-items-center transition-colors hover:bg-beni disabled:opacity-30 disabled:hover:bg-transparent"><Minus size={17} strokeWidth={1.6} /></button>
      </div>
    </div>
  )
}

export function Visit() {
  const root = useReveal<HTMLElement>()
  const title = useSplit<HTMLHeadingElement>()
  const wa = waLink('Olá, Kenko! Vim pelo site.')
  return (
    <section id="visite" ref={root} className="relative px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-14 flex items-end justify-between gap-6">
          <h2 ref={title} className="font-display text-[clamp(2.4rem,5.4vw,4.6rem)] font-extrabold leading-[1.05] tracking-tight">Venha comer com a gente.</h2>
          <span className="vertical hidden font-display text-5xl font-extrabold text-beni md:block" aria-hidden>来店</span>
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-11 lg:col-span-5">
            <Block kanji="所" title="Onde estamos">
              <p className="font-display text-2xl leading-snug text-washi">{RESTAURANT.address}</p>
            </Block>

            <Block kanji="時" title="Horários">
              <dl>{RESTAURANT.hoursText.map(([d, h]) => <Row key={d} label={d} value={h} muted={h === 'Fechado'} />)}</dl>
            </Block>

            <Block kanji="配" title="Entrega em Piraju">
              <dl>{DELIVERY_ZONES.map((z) => <Row key={z.id} label={z.label} hint={z.eta} value={money(z.fee)} />)}</dl>
              <p className="mt-3 text-[13px] text-ash">Pedido mínimo para entrega: {money(MIN_DELIVERY_ORDER)}.</p>
            </Block>

            <div data-reveal className="flex flex-wrap gap-3 pl-0 sm:pl-[3.25rem]">
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn-lux btn-lux-solid"><WhatsIcon /> Chamar no WhatsApp</a>}
              {RESTAURANT.instagram && <a href={`https://instagram.com/${RESTAURANT.instagram}`} target="_blank" rel="noreferrer" className="btn-lux"><InstaIcon /> Instagram</a>}
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RESTAURANT.mapQuery)}`} target="_blank" rel="noreferrer" className="btn-lux">Abrir no mapa <ArrowUpRight size={16} strokeWidth={1.6} /></a>
            </div>
          </div>

          <div data-reveal className="relative lg:col-span-7"><MapBox /></div>
        </div>
      </div>
    </section>
  )
}
