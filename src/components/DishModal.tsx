import { useEffect, useMemo, useRef, useState } from 'react'
import { animate } from 'animejs'
import { Clock, Flame, Leaf, Minus, Plus, Sparkles, ChefHat, Users, UtensilsCrossed, X } from 'lucide-react'
import { Photo, cropFor } from './Photo'
import { categoryById, type Product, type Tag } from '../data/menu'
import { useCart } from '../lib/cart'
import { flyToCart } from '../lib/fly'
import { cn, money, reducedMotion } from '../lib/utils'

export const TAG_META: Record<Tag, { label: string; icon?: typeof Flame; cls: string }> = {
  picante: { label: 'Picante', icon: Flame, cls: 'text-shu' },
  vegetariano: { label: 'Vegetariano', icon: Leaf, cls: 'text-emerald-400' },
  chef: { label: 'Escolha do sushiman', icon: ChefHat, cls: 'text-washi' },
  novo: { label: 'Novo', icon: Sparkles, cls: 'text-washi' },
  frito: { label: 'Frito', cls: 'text-ash' },
  cru: { label: 'Contém peixe cru', cls: 'text-ash' },
}

export function TagChip({ t }: { t: Tag }) {
  const m = TAG_META[t]
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', m.cls)}>
      {m.icon && <m.icon size={13} />} {m.label}
    </span>
  )
}

const PREP: Record<string, string> = {
  combinados: '25 a 35 min', niguiris: '15 a 25 min', sashimis: '15 a 25 min', uramakis: '20 a 30 min', hots: '25 a 35 min',
  temakis: '15 a 25 min', quentes: '25 a 35 min', entradas: '15 a 25 min', sobremesas: '10 a 15 min', bebidas: 'Na hora',
}

function servesOf(p: Product) {
  const n = parseInt(p.pieces ?? '', 10)
  if (p.cat === 'combinados') return n <= 20 ? '1 a 2 pessoas' : n <= 30 ? '2 a 3 pessoas' : n <= 40 ? '3 a 4 pessoas' : '4 a 6 pessoas'
  if (['temakis', 'niguiris', 'sobremesas', 'bebidas'].includes(p.cat)) return '1 pessoa'
  return '1 a 2 pessoas'
}

/** Sugestões de outras categorias para completar o pedido. */
const PAIRS: Record<string, string[]> = {
  combinados: ['entradas', 'bebidas', 'sobremesas'], niguiris: ['entradas', 'bebidas'], sashimis: ['entradas', 'bebidas'],
  uramakis: ['entradas', 'bebidas'], hots: ['entradas', 'bebidas'], temakis: ['entradas', 'bebidas'],
  quentes: ['entradas', 'bebidas'], entradas: ['combinados', 'bebidas'], sobremesas: ['bebidas'], bebidas: ['entradas', 'sobremesas'],
}

function Stat({ icon: I, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[.03] px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-xs text-ash"><I size={13} /> {label}</p>
      <p className="mt-0.5 text-sm font-semibold leading-snug">{value}</p>
    </div>
  )
}

export function DishModal({ product, onClose }: { product: Product & { available: boolean }; onClose: () => void }) {
  const { add, products } = useCart()
  const cat = categoryById(product.cat)
  const [qty, setQty] = useState(1)
  const [sel, setSel] = useState<string[]>([])
  const [note, setNote] = useState('')
  const panel = useRef<HTMLDivElement>(null)
  const addBtn = useRef<HTMLButtonElement>(null)

  const allAddons = [...(cat.addons ?? []), ...(product.addons ?? [])]
  const addons = allAddons.filter((a) => sel.includes(a.id))
  const unit = product.price + addons.reduce((s, a) => s + a.price, 0)

  const suggestions = useMemo(() => {
    const cats = PAIRS[product.cat] ?? []
    return cats
      .map((c) => products.find((p) => p.cat === c && p.available && (p.tags?.includes('chef') || p.featured)) ?? products.find((p) => p.cat === c && p.available))
      .filter((p): p is NonNullable<typeof p> => !!p)
      .slice(0, 3)
  }, [products, product.cat])

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('[data-close]')?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, textarea, [href]')
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', key)
    if (!reducedMotion()) {
      animate(panel.current!, { opacity: [0, 1], y: [40, 0], duration: 600, ease: 'outExpo' })
      animate(panel.current!.querySelector('.m-plate')!, { rotate: [-80, 0], scale: [0.6, 1], duration: 1200, ease: 'outExpo' })
    }
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = ''; prev?.focus() }
  }, [])

  return (
    <div className="fixed inset-0 z-[80] grid place-items-end md:place-items-center" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="absolute inset-0 bg-black/85" onClick={onClose} />
      <div ref={panel} className="cut relative grid max-h-[94svh] w-full max-w-5xl overflow-y-auto border border-white/15 bg-[#0a0505] md:grid-cols-[1fr_1.05fr]">
        <button data-close onClick={onClose} aria-label="Fechar" className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center bg-black/60 hover:bg-beni"><X size={20} /></button>

        {/* foto */}
        <div className="relative flex flex-col items-center gap-6 overflow-hidden bg-gradient-to-b from-wine/70 to-black p-8 md:p-10">
          <div className="absolute left-1/2 top-[34%] h-[70%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-shu/40 blur-[70px]" />
          <Photo crop={cropFor(product.kind, product.id, product.photo)} alt={product.name} eager className="m-plate neon-disc relative w-[min(62vw,340px)] rounded-full" />
          {!!suggestions.length && (
            <div className="relative hidden w-full md:block">
              <p className="mb-2 font-display text-lg font-bold">Combina com</p>
              <ul className="space-y-2">
                {suggestions.map((sg) => (
                  <li key={sg.id} className="flex items-center gap-3 border border-white/10 bg-black/40 p-2 pr-3">
                    {sg.kind === 'drink' || sg.kind === 'dessert'
                      ? <span className="hanko h-11 w-11 shrink-0 text-xl" aria-hidden>{categoryById(sg.cat).kanji[0]}</span>
                      : <Photo crop={cropFor(sg.kind, sg.id, sg.photo)} alt="" className="neon-disc w-11 shrink-0 rounded-full" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{sg.name}</p>
                      <p className="text-xs tabular-nums text-ash">{money(sg.price)}</p>
                    </div>
                    <button
                      aria-label={`Adicionar ${sg.name} à sacola`}
                      onClick={(e) => { add(sg); flyToCart(e.currentTarget) }}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-beni transition-colors hover:bg-shu"
                    ><Plus size={16} /></button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* detalhes */}
        <div className="flex min-w-0 flex-col">
          <div className="p-6 pb-2 md:p-9 md:pb-2">
            <p className="text-sm text-ash">Cardápio <span className="px-1 text-white/25">/</span> {cat.name}</p>
            <h3 className="mt-2 font-display text-3xl font-extrabold leading-tight md:text-4xl">{product.name}</h3>
            {product.jp && <p className="mt-1 font-display text-lg italic text-ash">{product.jp}</p>}
            <p className="mt-4 text-washi/80">{product.desc}</p>
            {!!product.tags?.length && <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">{product.tags.map((t) => <TagChip key={t} t={t} />)}</div>}

            <div className="mt-6 grid grid-cols-3 gap-2">
              <Stat icon={UtensilsCrossed} label="Porção" value={product.pieces ?? 'Individual'} />
              <Stat icon={Users} label="Serve" value={servesOf(product)} />
              <Stat icon={Clock} label="Preparo" value={PREP[product.cat] ?? 'Na hora'} />
            </div>

            {!!allAddons.length && (
              <fieldset className="mt-7">
                <legend className="mb-1 font-display text-xl font-bold">Quer incrementar?</legend>
                <p className="mb-3 text-sm text-ash">Escolha quantos adicionais quiser. O valor entra no total.</p>
                <div className="space-y-1.5">
                  {allAddons.map((a) => {
                    const on = sel.includes(a.id)
                    return (
                      <label key={a.id} className={cn('flex cursor-pointer items-center justify-between gap-3 border px-3.5 py-2.5 transition-colors', on ? 'border-beni bg-beni/10' : 'border-white/12 hover:border-white/30')}>
                        <span className="flex items-center gap-3">
                          <input type="checkbox" className="peer sr-only" checked={on} onChange={() => setSel((s) => (on ? s.filter((x) => x !== a.id) : [...s, a.id]))} />
                          <span className={cn('grid h-5 w-5 place-items-center border peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-shu', on ? 'border-beni bg-beni' : 'border-white/40')}>{on && <span className="h-2 w-2 bg-white" />}</span>
                          {a.name}
                        </span>
                        <span className="text-sm tabular-nums text-washi/70">{a.price ? `+ ${money(a.price)}` : 'Grátis'}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            )}

            <label className="mt-7 block">
              <span className="mb-1.5 block font-display text-xl font-bold">Alguma observação?</span>
              <textarea
                value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} rows={2}
                placeholder="Ex.: sem cebolinha, molho à parte, alergia a camarão"
                className="w-full resize-none border border-white/15 bg-white/[.04] px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-ash/70 focus:border-beni"
              />
              <span className="mt-1 block text-right text-xs text-ash">{note.length}/120</span>
            </label>
            <p className="mt-2 text-xs leading-relaxed text-ash">Pode conter traços de glúten, soja, crustáceos e gergelim. Em caso de alergia, avise na observação.</p>
          </div>

          <div className="sticky bottom-0 z-10 mt-auto flex items-center gap-4 border-t border-white/10 bg-[#0a0505] p-4 md:px-9 md:py-5">
            <div className="flex items-center border border-white/15" role="group" aria-label="Quantidade">
              <button className="grid h-12 w-11 place-items-center hover:bg-white/10" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir"><Minus size={16} /></button>
              <span className="w-8 text-center font-bold tabular-nums" aria-live="polite">{qty}</span>
              <button className="grid h-12 w-11 place-items-center hover:bg-white/10" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Aumentar"><Plus size={16} /></button>
            </div>
            <button
              ref={addBtn}
              disabled={!product.available}
              onClick={() => { add(product, qty, addons, note); flyToCart(addBtn.current); onClose() }}
              className="btn btn-primary flex-1 justify-between"
            >
              {product.available ? <><span className="sm:hidden">Adicionar</span><span className="hidden sm:inline">Adicionar à sacola</span></> : 'Esgotado hoje'}
              {product.available && <span className="pr-4 font-display text-lg tabular-nums">{money(unit * qty)}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
