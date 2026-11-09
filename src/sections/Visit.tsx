import { Clock, MapPin, MessageCircle, Truck } from 'lucide-react'
import { DELIVERY_ZONES, MIN_DELIVERY_ORDER, RESTAURANT, waLink } from '../lib/config'
import { useReveal } from '../hooks/useReveal'
import { useSplit } from '../hooks/useSplit'
import { money } from '../lib/utils'

const InstaIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
  </svg>
)

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

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-5">
            <div data-reveal className="flex gap-4">
              <MapPin className="mt-1 shrink-0 text-shu" />
              <div>
                <h3 className="font-display text-xl font-bold">Onde estamos</h3>
                <p className="mt-1 text-washi/75">{RESTAURANT.address}</p>
              </div>
            </div>

            <div data-reveal className="flex gap-4">
              <Clock className="mt-1 shrink-0 text-shu" />
              <div className="w-full">
                <h3 className="font-display text-xl font-bold">Horários</h3>
                <dl className="mt-2 divide-y divide-white/10 border-y border-white/10">
                  {RESTAURANT.hoursText.map(([d, h]) => (
                    <div key={d} className="flex justify-between py-2.5 text-washi/80"><dt>{d}</dt><dd className={h === 'Fechado' ? 'text-ash' : ''}>{h}</dd></div>
                  ))}
                </dl>
              </div>
            </div>

            <div data-reveal className="flex gap-4">
              <Truck className="mt-1 shrink-0 text-shu" />
              <div className="w-full">
                <h3 className="font-display text-xl font-bold">Entrega em Piraju</h3>
                <ul className="mt-2 divide-y divide-white/10 border-y border-white/10">
                  {DELIVERY_ZONES.map((z) => (
                    <li key={z.id} className="flex items-baseline justify-between gap-4 py-2.5 text-washi/80">
                      <span>{z.label} <span className="text-sm text-ash">({z.eta})</span></span>
                      <span className="tabular-nums text-washi">{money(z.fee)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-ash">Pedido mínimo para entrega: {money(MIN_DELIVERY_ORDER)}.</p>
              </div>
            </div>

            <div data-reveal className="flex flex-wrap gap-3">
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn btn-primary">Chamar no WhatsApp <span className="dot"><MessageCircle size={17} /></span></a>}
              {RESTAURANT.instagram && <a href={`https://instagram.com/${RESTAURANT.instagram}`} target="_blank" rel="noreferrer" className="btn btn-ghost">Instagram <span className="dot"><InstaIcon /></span></a>}
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RESTAURANT.mapQuery)}`} target="_blank" rel="noreferrer" className="btn btn-ghost">Abrir no mapa <span className="dot"><MapPin size={16} /></span></a>
            </div>
          </div>

          <div data-reveal className="relative lg:col-span-7">
            <div className="cut relative aspect-[4/3] w-full overflow-hidden border border-white/10 bg-[#120606] lg:aspect-auto lg:h-full lg:min-h-[480px]">
              <iframe
                title="Mapa de Piraju, SP"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(RESTAURANT.mapQuery)}&output=embed`}
                className="absolute inset-0 h-full w-full border-0"
                style={{ filter: 'invert(.92) hue-rotate(180deg) saturate(.35) contrast(1.05) brightness(.9)' }}
              />
              <div className="pointer-events-none absolute inset-0 bg-beni/10 mix-blend-color" />
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,.8)]" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="hanko h-12 w-12 text-2xl shadow-[0_0_40px_rgba(211,17,28,.8)]">健</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
