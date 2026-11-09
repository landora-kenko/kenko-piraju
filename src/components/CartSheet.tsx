import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { animate, svg } from 'animejs'
import { ArrowLeft, Bike, Check, Copy, Minus, Plus, Store, Trash2, UtensilsCrossed, X } from 'lucide-react'
import { DishArt } from './art/DishArt'
import { useCart } from '../lib/cart'
import { DELIVERY_ZONES, MIN_DELIVERY_ORDER, RESTAURANT, waLink } from '../lib/config'
import { store, type Order, type OrderMode } from '../lib/store'
import { TABLES, type TableStatus } from '../data/tables'
import { cn, money, reducedMotion, uid } from '../lib/utils'

type Step = 'bag' | 'details' | 'pay' | 'done'
const STEPS: { id: Step; label: string }[] = [
  { id: 'bag', label: 'Sacola' },
  { id: 'details', label: 'Entrega' },
  { id: 'pay', label: 'Pagamento' },
]
const PIX_KEY = (import.meta.env.VITE_PIX_KEY as string | undefined) ?? ''

const loadCustomer = () => {
  try { return JSON.parse(localStorage.getItem('kenko:customer') || '{}') } catch { return {} }
}

function Field({ label, error, children, hint }: { label: string; error?: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-washi/80">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ash">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-sm text-shu">{error}</span>}
    </label>
  )
}
const input = 'h-12 w-full border border-white/15 bg-white/[.04] px-3.5 outline-none transition-colors placeholder:text-ash/60 focus:border-beni'

export function CartSheet() {
  const { open, setOpen, lines, find, subtotal, setQty, clear } = useCart()
  const [step, setStep] = useState<Step>('bag')
  const [tried, setTried] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [placed, setPlaced] = useState<Order | null>(null)
  const [tables, setTables] = useState<Record<string, TableStatus>>({})
  const saved = useMemo(loadCustomer, [])
  const [f, setF] = useState({
    mode: 'entrega' as OrderMode, name: saved.name ?? '', phone: saved.phone ?? '', zone: saved.zone ?? 'centro',
    street: saved.street ?? '', number: saved.number ?? '', ref: saved.ref ?? '', tableId: '',
    payment: 'pix' as 'pix' | 'cartao' | 'dinheiro', change: '', notes: '', hashi: true,
  })
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }))
  const panel = useRef<HTMLDivElement>(null)
  const check = useRef<SVGSVGElement>(null)

  useEffect(() => store.subscribeTables(setTables), [])

  const zone = DELIVERY_ZONES.find((z) => z.id === f.zone) ?? DELIVERY_ZONES[0]
  const fee = f.mode === 'entrega' ? zone.fee : 0
  const total = subtotal + fee
  const freeTables = TABLES.filter((t) => tables[t.id] === 'livre')

  /* abrir / fechar */
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    if (step === 'done') { setStep('bag'); setPlaced(null) }
    if (!reducedMotion() && panel.current) animate(panel.current, { x: ['100%', '0%'], duration: 650, ease: 'outExpo' })
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', key)
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = '' }
  }, [open])

  /* troca de etapa */
  useEffect(() => {
    panel.current?.querySelector('[data-scroll]')?.scrollTo({ top: 0 })
    if (step === 'done' && check.current && !reducedMotion()) {
      const [c, t] = svg.createDrawable(check.current.querySelectorAll('circle, path'))
      animate(c, { draw: ['0 0', '0 1'], duration: 900, ease: 'inOutQuart' })
      animate(t, { draw: ['0 0', '0 1'], duration: 600, delay: 700, ease: 'outQuad' })
    }
  }, [step])

  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    if (f.name.trim().length < 2) e.name = 'Informe seu nome.'
    if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Informe um WhatsApp com DDD, por exemplo (14) 99999-9999.'
    if (f.mode === 'entrega') {
      if (f.street.trim().length < 3) e.street = 'Informe a rua.'
      if (!f.number.trim()) e.number = 'Informe o número.'
      if (subtotal < MIN_DELIVERY_ORDER) e.min = `Pedido mínimo para entrega: ${money(MIN_DELIVERY_ORDER)}. Faltam ${money(MIN_DELIVERY_ORDER - subtotal)}.`
    }
    if (f.mode === 'mesa' && !f.tableId) e.table = freeTables.length ? 'Escolha uma mesa livre.' : 'Nenhuma mesa livre agora. Escolha retirada ou entrega.'
    return e
  }, [f, subtotal, freeTables.length])

  const close = () => {
    if (reducedMotion() || !panel.current) return setOpen(false)
    animate(panel.current, { x: ['0%', '100%'], duration: 380, ease: 'inQuart', onComplete: () => setOpen(false) })
  }

  const next = () => {
    if (step === 'bag') return setStep('details')
    if (step === 'details') {
      setTried(true)
      if (Object.keys(errors).length) return
      setTried(false)
      return setStep('pay')
    }
  }

  const submit = async () => {
    setBusy(true); setErr('')
    const order: Omit<Order, 'id'> = {
      code: 'K' + uid(4), createdAt: Date.now(), status: 'novo', mode: f.mode,
      customer: { name: f.name.trim(), phone: f.phone.trim() },
      ...(f.mode === 'entrega' ? { address: { street: f.street.trim(), number: f.number.trim(), zone: zone.label, ref: f.ref.trim() } } : {}),
      ...(f.mode === 'mesa' ? { tableId: f.tableId } : {}),
      items: lines.map((l) => {
        const p = find(l.id)!
        return { id: l.id, name: p.name, qty: l.qty, unit: l.unit, addons: l.addons, total: l.qty * l.unit }
      }),
      subtotal, fee, total,
      payment: { method: f.payment, ...(f.payment === 'dinheiro' && f.change ? { change: f.change } : {}) },
      hashi: f.hashi, ...(f.notes.trim() ? { notes: f.notes.trim() } : {}),
    }
    try {
      await store.createOrder(order)
      try { localStorage.setItem('kenko:customer', JSON.stringify({ name: f.name, phone: f.phone, zone: f.zone, street: f.street, number: f.number, ref: f.ref })) } catch { /* ignora */ }
      setPlaced(order as Order)
      clear()
      setStep('done')
    } catch {
      setErr('Não foi possível enviar o pedido agora. Verifique a conexão e tente de novo.')
    } finally { setBusy(false) }
  }

  const waText = (o: Order) =>
    [
      `*Pedido ${o.code}* (site Kenko)`,
      '',
      ...o.items.map((i) => `${i.qty}x ${i.name}${i.addons.length ? ` (${i.addons.map((a) => a.name).join(', ')})` : ''} - ${money(i.total)}`),
      '',
      `Subtotal: ${money(o.subtotal)}`,
      o.mode === 'entrega' ? `Entrega (${o.address!.zone}): ${money(o.fee)}` : '',
      `*Total: ${money(o.total)}*`,
      '',
      o.mode === 'entrega' ? `Entregar em: ${o.address!.street}, ${o.address!.number}${o.address!.ref ? ` (${o.address!.ref})` : ''}` : o.mode === 'retirada' ? 'Retirada no balcão' : `Mesa: ${TABLES.find((t) => t.id === o.tableId)?.label}`,
      `Pagamento: ${o.payment.method === 'pix' ? 'Pix' : o.payment.method === 'cartao' ? 'Cartão' : `Dinheiro${o.payment.change ? ` (troco para ${o.payment.change})` : ''}`}`,
      o.hashi ? 'Incluir hashi' : 'Sem hashi',
      o.notes ? `Obs.: ${o.notes}` : '',
      `Cliente: ${o.customer.name} - ${o.customer.phone}`,
    ].filter((x) => x !== '').join('\n')

  if (!open) return null
  const idx = STEPS.findIndex((s) => s.id === step)

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Sacola e pedido">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={close} />
      <div ref={panel} className="absolute inset-y-0 right-0 flex w-full max-w-[470px] flex-col border-l border-white/15 bg-[#080303]">
        {/* topo */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            {(step === 'details' || step === 'pay') && (
              <button onClick={() => setStep(step === 'pay' ? 'details' : 'bag')} aria-label="Voltar" className="grid h-9 w-9 place-items-center border border-white/15 hover:bg-white/10"><ArrowLeft size={17} /></button>
            )}
            <h2 className="font-display text-2xl font-extrabold">{step === 'done' ? 'Pedido enviado' : step === 'bag' ? 'Sua sacola' : step === 'details' ? 'Como receber' : 'Pagamento'}</h2>
          </div>
          <button onClick={close} aria-label="Fechar" className="grid h-9 w-9 place-items-center hover:bg-white/10"><X size={20} /></button>
        </div>

        {step !== 'done' && lines.length > 0 && (
          <ol className="grid grid-cols-3 border-b border-white/10 text-sm" aria-label="Etapas do pedido">
            {STEPS.map((s, i) => (
              <li key={s.id} aria-current={i === idx ? 'step' : undefined} className={cn('flex items-center justify-center gap-2 border-b-2 py-3', i === idx ? 'border-beni text-white' : i < idx ? 'border-beni/40 text-washi/70' : 'border-transparent text-ash')}>
                <span className={cn('grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold', i <= idx ? 'bg-beni text-white' : 'bg-white/10')}>{i < idx ? <Check size={12} /> : i + 1}</span>
                {s.label}
              </li>
            ))}
          </ol>
        )}

        {/* conteúdo */}
        <div data-scroll className="flex-1 overflow-y-auto px-5 py-5">
          {step === 'bag' && (lines.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <span className="hanko mx-auto mb-5 h-16 w-16 text-4xl">空</span>
                <p className="font-display text-2xl font-bold">Sua sacola está vazia.</p>
                <p className="mx-auto mt-2 max-w-xs text-washi/70">Escolha seus pratos no cardápio e eles aparecem aqui.</p>
                <a href="#cardapio" onClick={close} className="btn btn-primary mt-7">Ver cardápio <span className="dot"><Plus size={18} /></span></a>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {lines.map((l) => {
                const p = find(l.id)!
                return (
                  <li key={l.key} className="flex gap-4 py-4">
                    <DishArt kind={p.kind} tint={p.tint} id={p.id} className="h-16 w-16 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <p className="font-display text-lg font-bold leading-tight">{p.name}</p>
                        <p className="shrink-0 tabular-nums">{money(l.qty * l.unit)}</p>
                      </div>
                      {p.pieces && <p className="text-xs text-ash">{p.pieces}</p>}
                      {!!l.addons.length && <p className="mt-0.5 text-sm text-washi/60">{l.addons.map((a) => a.name).join(', ')}</p>}
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center border border-white/15">
                          <button className="grid h-8 w-8 place-items-center hover:bg-white/10" onClick={() => setQty(l.key, l.qty - 1)} aria-label={`Diminuir ${p.name}`}>{l.qty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}</button>
                          <span className="w-7 text-center text-sm font-bold tabular-nums">{l.qty}</span>
                          <button className="grid h-8 w-8 place-items-center hover:bg-white/10" onClick={() => setQty(l.key, l.qty + 1)} aria-label={`Aumentar ${p.name}`}><Plus size={14} /></button>
                        </div>
                        <button className="text-sm text-ash underline-offset-4 hover:text-white hover:underline" onClick={() => setQty(l.key, 0)}>Remover</button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          ))}

          {step === 'details' && (
            <div className="space-y-6">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-washi/80">Como você quer receber?</legend>
                <div className="grid grid-cols-3 gap-2">
                  {([['entrega', 'Entrega', Bike], ['retirada', 'Retirada', Store], ['mesa', 'Na mesa', UtensilsCrossed]] as const).map(([id, label, Icon]) => (
                    <label key={id} className={cn('flex cursor-pointer flex-col items-center gap-1.5 border px-2 py-3.5 text-sm font-medium transition-colors', f.mode === id ? 'border-beni bg-beni/15 text-white' : 'border-white/15 text-washi/75 hover:border-white/35')}>
                      <input type="radio" name="mode" className="sr-only" checked={f.mode === id} onChange={() => set('mode', id)} />
                      <Icon size={20} className={f.mode === id ? 'text-shu' : ''} /> {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field label="Seu nome" error={tried ? errors.name : ''}><input className={input} value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" /></Field>
              <Field label="WhatsApp" error={tried ? errors.phone : ''}><input className={input} inputMode="tel" autoComplete="tel" placeholder="(14) 99999-9999" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></Field>

              {f.mode === 'entrega' && (
                <>
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-washi/80">Região de entrega</legend>
                    <div className="space-y-2">
                      {DELIVERY_ZONES.map((z) => (
                        <label key={z.id} className={cn('flex cursor-pointer items-center justify-between gap-3 border px-3.5 py-3 transition-colors', f.zone === z.id ? 'border-beni bg-beni/10' : 'border-white/15 hover:border-white/35')}>
                          <span className="flex items-center gap-3"><input type="radio" name="zone" className="accent-[#d3111c]" checked={f.zone === z.id} onChange={() => set('zone', z.id)} />{z.label}<span className="text-xs text-ash">{z.eta}</span></span>
                          <span className="tabular-nums">{money(z.fee)}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="grid grid-cols-[1fr_6.5rem] gap-3">
                    <Field label="Rua" error={tried ? errors.street : ''}><input className={input} autoComplete="address-line1" value={f.street} onChange={(e) => set('street', e.target.value)} /></Field>
                    <Field label="Número" error={tried ? errors.number : ''}><input className={input} value={f.number} onChange={(e) => set('number', e.target.value)} /></Field>
                  </div>
                  <Field label="Complemento ou ponto de referência" hint="Opcional. Ajuda o entregador."><input className={input} value={f.ref} onChange={(e) => set('ref', e.target.value)} /></Field>
                  {tried && errors.min && <p role="alert" className="border border-shu/50 bg-shu/10 p-3 text-sm">{errors.min}</p>}
                </>
              )}

              {f.mode === 'retirada' && <p className="border border-white/12 bg-white/[.03] p-4 text-sm text-washi/80">Retire no balcão do Kenko, {RESTAURANT.address}. Avisamos pelo WhatsApp quando estiver pronto, em média 25 a 35 minutos.</p>}

              {f.mode === 'mesa' && (
                <Field label="Mesa" error={tried ? errors.table : ''} hint="Mostramos só as mesas livres agora.">
                  <select className={input} value={f.tableId} onChange={(e) => set('tableId', e.target.value)}>
                    <option value="">Escolha uma mesa</option>
                    {freeTables.map((t) => <option key={t.id} value={t.id}>{t.label}, {t.seats} {t.seats === 1 ? 'lugar' : 'lugares'}</option>)}
                  </select>
                </Field>
              )}
            </div>
          )}

          {step === 'pay' && (
            <div className="space-y-6">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-washi/80">Forma de pagamento</legend>
                <div className="space-y-2">
                  {([['pix', 'Pix', 'Enviamos a chave para você pagar na confirmação.'], ['cartao', 'Cartão', f.mode === 'entrega' ? 'Na maquininha, na entrega.' : 'Na maquininha, no balcão ou na mesa.'], ['dinheiro', 'Dinheiro', 'Pagamento na entrega ou no balcão.']] as const).map(([id, label, hint]) => (
                    <label key={id} className={cn('flex cursor-pointer items-start gap-3 border px-3.5 py-3 transition-colors', f.payment === id ? 'border-beni bg-beni/10' : 'border-white/15 hover:border-white/35')}>
                      <input type="radio" name="pay" className="mt-1.5 accent-[#d3111c]" checked={f.payment === id} onChange={() => set('payment', id)} />
                      <span><span className="block font-medium">{label}</span><span className="text-sm text-ash">{hint}</span></span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {f.payment === 'dinheiro' && <Field label="Troco para quanto?" hint="Opcional. Deixe vazio se não precisar de troco."><input className={input} inputMode="decimal" placeholder="R$ 100,00" value={f.change} onChange={(e) => set('change', e.target.value)} /></Field>}
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" className="h-5 w-5 accent-[#d3111c]" checked={f.hashi} onChange={(e) => set('hashi', e.target.checked)} />
                <span>Incluir hashi e acompanhamentos (shoyu, wasabi e gengibre)</span>
              </label>
              <Field label="Observações" hint="Alergias, sem cebolinha, ponto de referência…"><textarea className={cn(input, 'h-24 resize-none py-3')} value={f.notes} onChange={(e) => set('notes', e.target.value)} maxLength={240} /></Field>

              <div className="border border-white/12 bg-white/[.03] p-4 text-sm">
                <p className="mb-2 font-display text-lg font-bold">{f.mode === 'entrega' ? 'Entrega' : f.mode === 'retirada' ? 'Retirada' : 'Na mesa'}</p>
                <p className="text-washi/75">{f.name}, {f.phone}</p>
                {f.mode === 'entrega' && <p className="text-washi/75">{f.street}, {f.number}. {zone.label}, {zone.eta}.</p>}
                {f.mode === 'mesa' && <p className="text-washi/75">{TABLES.find((t) => t.id === f.tableId)?.label}</p>}
              </div>
              {err && <p role="alert" className="border border-shu/50 bg-shu/10 p-3 text-sm">{err}</p>}
            </div>
          )}

          {step === 'done' && placed && (
            <div className="text-center">
              <svg ref={check} viewBox="0 0 120 120" className="mx-auto h-28 w-28" fill="none" stroke="#d3111c" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="60" cy="60" r="50" /><path d="M36 62l16 16 32-36" stroke="#f1ebe3" />
              </svg>
              <p className="mt-4 font-display text-3xl font-extrabold">Recebemos seu pedido.</p>
              <p className="mt-1 text-washi/70">Código <strong className="text-white">{placed.code}</strong></p>
              <p className="mx-auto mt-4 max-w-xs text-washi/80">
                {placed.mode === 'entrega' ? `Entrega em ${DELIVERY_ZONES.find((z) => z.label === placed.address!.zone)?.eta ?? 'breve'}.` : placed.mode === 'retirada' ? 'Fica pronto em 25 a 35 minutos. Avisamos pelo WhatsApp.' : `Vamos levar à ${TABLES.find((t) => t.id === placed.tableId)?.label}.`}
              </p>
              <div className="mx-auto mt-6 max-w-sm border border-white/12 bg-white/[.03] p-4 text-left text-sm">
                {placed.items.map((i, k) => <p key={k} className="flex justify-between gap-3 py-0.5"><span>{i.qty}x {i.name}</span><span className="tabular-nums">{money(i.total)}</span></p>)}
                <p className="mt-2 flex justify-between border-t border-white/10 pt-2 font-bold"><span>Total</span><span className="tabular-nums">{money(placed.total)}</span></p>
              </div>
              {placed.payment.method === 'pix' && PIX_KEY && (
                <button onClick={() => navigator.clipboard?.writeText(PIX_KEY)} className="btn btn-ghost mt-5">Copiar chave Pix <span className="dot"><Copy size={15} /></span></button>
              )}
              <div className="mt-6 flex flex-col items-center gap-3">
                {waLink('x') && <a className="btn btn-primary" target="_blank" rel="noreferrer" href={waLink(waText(placed))}>Enviar pelo WhatsApp <span className="dot"><Check size={17} /></span></a>}
                <button onClick={close} className="btn btn-ghost">Voltar ao cardápio <span className="dot"><ArrowLeft size={16} /></span></button>
              </div>
            </div>
          )}
        </div>

        {/* rodapé */}
        {step !== 'done' && lines.length > 0 && (
          <div className="border-t border-white/10 bg-black px-5 py-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between text-washi/70"><dt>Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
              {step !== 'bag' && f.mode === 'entrega' && <div className="flex justify-between text-washi/70"><dt>Entrega ({zone.label})</dt><dd className="tabular-nums">{money(fee)}</dd></div>}
              <div className="flex justify-between pt-1 font-display text-2xl font-extrabold"><dt>Total</dt><dd className="tabular-nums">{money(step === 'bag' ? subtotal : total)}</dd></div>
            </dl>
            {step === 'pay' ? (
              <button onClick={submit} disabled={busy} className="btn btn-primary mt-3 w-full justify-between">{busy ? 'Enviando…' : 'Finalizar pedido'}<span className="dot"><Check size={18} /></span></button>
            ) : (
              <button onClick={next} className="btn btn-primary mt-3 w-full justify-between">{step === 'bag' ? 'Continuar' : 'Ir para o pagamento'}<span className="dot"><ArrowLeft size={18} className="rotate-180" /></span></button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
