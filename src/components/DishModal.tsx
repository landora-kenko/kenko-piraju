import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { Flame, Leaf, Minus, Plus, Sparkles, ChefHat, X } from 'lucide-react'
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

export function DishModal({ product, onClose }: { product: Product & { available: boolean }; onClose: () => void }) {
  const { add } = useCart()
  const cat = categoryById(product.cat)
  const [qty, setQty] = useState(1)
  const [sel, setSel] = useState<string[]>([])
  const panel = useRef<HTMLDivElement>(null)
  const addBtn = useRef<HTMLButtonElement>(null)

  const addons = (cat.addons ?? []).filter((a) => sel.includes(a.id))
  const unit = product.price + addons.reduce((s, a) => s + a.price, 0)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('[data-close]')?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, [href]')
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div ref={panel} className="cut relative grid max-h-[92svh] w-full max-w-4xl overflow-y-auto border border-white/15 bg-[#0a0505] md:grid-cols-2">
        <button data-close onClick={onClose} aria-label="Fechar" className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center bg-black/60 hover:bg-beni"><X size={20} /></button>

        <div className="relative grid place-items-center overflow-hidden bg-gradient-to-b from-wine/70 to-black p-8 md:p-10">
          <div className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-shu/40 blur-[70px]" />
          <Photo crop={cropFor(product.kind, product.id, product.photo)} alt={product.name} eager className="m-plate neon-disc relative w-[min(70vw,360px)] rounded-full" />
        </div>

        <div className="flex flex-col p-6 md:p-9">
          <p className="text-sm text-ash">{cat.name}{product.pieces ? `, ${product.pieces}` : ''}</p>
          <h3 className="mt-1 font-display text-3xl font-extrabold leading-tight md:text-4xl">{product.name}</h3>
          {product.jp && <p className="mt-1 font-display text-lg italic text-ash">{product.jp}</p>}
          <p className="mt-4 text-washi/80">{product.desc}</p>
          {!!product.tags?.length && <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">{product.tags.map((t) => <TagChip key={t} t={t} />)}</div>}

          {!!cat.addons?.length && (
            <fieldset className="mt-6">
              <legend className="mb-2 font-display text-lg font-bold">Quer incrementar?</legend>
              <div className="space-y-1.5">
                {cat.addons.map((a) => {
                  const on = sel.includes(a.id)
                  return (
                    <label key={a.id} className={cn('flex cursor-pointer items-center justify-between gap-3 border px-3.5 py-2.5 transition-colors', on ? 'border-beni bg-beni/10' : 'border-white/12 hover:border-white/30')}>
                      <span className="flex items-center gap-3">
                        <input type="checkbox" className="peer sr-only" checked={on} onChange={() => setSel((s) => (on ? s.filter((x) => x !== a.id) : [...s, a.id]))} />
                        <span className={cn('grid h-5 w-5 place-items-center border', on ? 'border-beni bg-beni' : 'border-white/40')}>{on && <span className="h-2 w-2 bg-white" />}</span>
                        {a.name}
                      </span>
                      <span className="text-sm tabular-nums text-washi/70">+ {money(a.price)}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
          )}

          <div className="mt-auto flex items-center gap-4 pt-8">
            <div className="flex items-center border border-white/15" role="group" aria-label="Quantidade">
              <button className="grid h-12 w-11 place-items-center hover:bg-white/10" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir"><Minus size={16} /></button>
              <span className="w-8 text-center font-bold tabular-nums" aria-live="polite">{qty}</span>
              <button className="grid h-12 w-11 place-items-center hover:bg-white/10" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Aumentar"><Plus size={16} /></button>
            </div>
            <button
              ref={addBtn}
              disabled={!product.available}
              onClick={() => { add(product, qty, addons); flyToCart(addBtn.current); onClose() }}
              className="btn btn-primary flex-1 justify-between"
            >
              {product.available ? 'Adicionar' : 'Esgotado hoje'}
              {product.available && <span className="pr-4 font-display text-lg tabular-nums">{money(unit * qty)}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
