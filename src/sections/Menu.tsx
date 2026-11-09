import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { animate, stagger } from 'animejs'
import { Plus, Search, X } from 'lucide-react'
import { CATEGORIES, categoryById, type Product, type Tag } from '../data/menu'
import { DishArt } from '../components/art/DishArt'
import { DishModal, TAG_META, TagChip } from '../components/DishModal'
import { useCart } from '../lib/cart'
import { flyToCart } from '../lib/fly'
import { useReveal } from '../hooks/useReveal'
import { useSplit } from '../hooks/useSplit'
import { cn, money, reducedMotion } from '../lib/utils'

type P = Product & { available: boolean }
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const FILTERS: Tag[] = ['picante', 'vegetariano', 'chef', 'novo']

/** Grade que revela os pratos em cascata quando entra na tela. */
function RevealGrid({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = ref.current!
    if (reducedMotion()) return
    const kids = Array.from(el.children) as HTMLElement[]
    kids.forEach((k) => (k.style.opacity = '0'))
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      animate(kids, { opacity: [0, 1], y: [48, 0], rotate: [1.2, 0], duration: 1000, ease: 'outExpo', delay: stagger(55) })
    }, { threshold: 0.08 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={className}>{children}</div>
}

function DishCard({ p, onOpen }: { p: P; onOpen: () => void }) {
  const { add } = useCart()
  const btn = useRef<HTMLButtonElement>(null)
  const chef = p.tags?.includes('chef')
  return (
    <article
      className={cn('dish spot group relative mt-3 flex cursor-pointer gap-4 border bg-white/[.03] p-4 transition-colors duration-500 sm:mt-16 sm:block sm:px-5 sm:pb-5 sm:pt-28', chef ? 'border-beni/50' : 'border-white/10 hover:border-beni/60', !p.available && 'opacity-60')}
      onClick={onOpen}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--sx', `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty('--sy', `${e.clientY - r.top}px`)
      }}
    >
      <div className={cn('relative w-28 shrink-0 self-start transition-transform sm:absolute sm:-top-14 sm:left-1/2 sm:w-40 sm:-translate-x-1/2 duration-[900ms] ease-[var(--ease-out-expo)] group-hover:-translate-y-2 group-hover:rotate-[14deg] group-hover:scale-110', !p.available && 'grayscale')}>
        <DishArt kind={p.kind} tint={p.tint} id={p.id} className="w-full drop-shadow-[0_16px_18px_rgba(0,0,0,.65)]" />
      </div>
      <div className="min-w-0 flex-1">
      {chef && <span className="absolute left-0 top-0 bg-beni px-2.5 py-1 text-xs font-bold">Escolha do sushiman</span>}
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl font-bold leading-tight">
          <button className="text-left after:absolute after:inset-0 focus-visible:outline-offset-8" onClick={(e) => { e.stopPropagation(); onOpen() }}>{p.name}</button>
        </h3>
        {p.jp && <span className="shrink-0 font-display text-sm italic text-ash">{p.jp}</span>}
      </div>
      <p className="mt-2 line-clamp-2 text-sm sm:min-h-[2.9rem] leading-relaxed text-washi/65">{p.desc}</p>
      <div className="mt-3 flex min-h-5 flex-wrap gap-x-3">{p.tags?.filter((t) => t !== 'chef').slice(0, 2).map((t) => <TagChip key={t} t={t} />)}</div>
      <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
        <div>
          <p className="font-display text-2xl font-bold tabular-nums">{money(p.price)}</p>
          {p.pieces && <p className="text-xs text-ash">{p.pieces}</p>}
        </div>
        {p.available ? (
          <button
            ref={btn}
            onClick={(e) => { e.stopPropagation(); add(p); flyToCart(btn.current) }}
            aria-label={`Adicionar ${p.name} à sacola`}
            className="relative z-10 grid h-11 w-11 place-items-center rounded-full bg-beni transition-all duration-500 hover:rotate-90 hover:bg-shu active:scale-90"
          >
            <Plus size={20} />
          </button>
        ) : (
          <span className="text-sm font-medium text-ash">Esgotado hoje</span>
        )}
      </div>
      </div>
    </article>
  )
}

export function Menu() {
  const { products } = useCart()
  const root = useReveal<HTMLElement>({ y: 24 })
  const title = useSplit<HTMLHeadingElement>()
  const [cat, setCat] = useState('todos')
  const [q, setQ] = useState('')
  const [tags, setTags] = useState<Tag[]>([])
  const [open, setOpen] = useState<string | null>(null)
  const bar = useRef<HTMLDivElement>(null)

  const filtering = q.trim() !== '' || tags.length > 0
  const filtered = useMemo(
    () => products.filter((p) => (!q.trim() || norm(p.name + ' ' + p.desc + ' ' + (p.jp ?? '')).includes(norm(q.trim()))) && tags.every((t) => p.tags?.includes(t))),
    [products, q, tags],
  )
  const groups = filtering
    ? [{ id: 'busca', name: `${filtered.length} ${filtered.length === 1 ? 'resultado' : 'resultados'}`, blurb: '', items: filtered }]
    : CATEGORIES.filter((c) => cat === 'todos' || c.id === cat).map((c) => ({ ...c, items: products.filter((p) => p.cat === c.id) }))

  const pick = (id: string) => {
    setCat(id)
    setQ(''); setTags([])
    document.getElementById('cardapio-lista')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }
  const openProduct = products.find((p) => p.id === open)

  return (
    <section id="cardapio" ref={root} className="relative pt-24 md:pt-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="flex items-end gap-6">
            <span className="vertical hidden font-display text-5xl font-extrabold text-beni md:block" aria-hidden>品書</span>
            <div>
              <h2 ref={title} className="font-display text-[clamp(2.8rem,7vw,6rem)] font-extrabold leading-[1] tracking-tight">Cardápio</h2>
              <p data-reveal className="mt-3 max-w-md text-lg text-washi/70">Toque em um prato para ver detalhes. Pedidos para entrega, retirada ou para a sua mesa.</p>
            </div>
          </div>
          <div data-reveal className="w-full md:max-w-sm">
            <label className="relative block">
              <span className="sr-only">Buscar no cardápio</span>
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
              <input
                value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar: salmão, hot, gyoza…"
                className="h-12 w-full border border-white/15 bg-white/[.04] pl-11 pr-10 outline-none transition-colors placeholder:text-ash/70 focus:border-beni"
              />
              {q && <button onClick={() => setQ('')} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-white"><X size={18} /></button>}
            </label>
          </div>
        </div>
      </div>

      {/* categorias */}
      <div id="cardapio-lista" className="sticky top-[4.3rem] z-30 mt-10 border-y border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div ref={bar} className="scroll-x flex gap-1 py-2" role="tablist" aria-label="Categorias do cardápio">
            {[{ id: 'todos', name: 'Tudo', kanji: '全' }, ...CATEGORIES].map((c) => {
              const on = !filtering && cat === c.id
              return (
                <button
                  key={c.id} role="tab" aria-selected={on} onClick={() => pick(c.id)}
                  className={cn('group relative flex min-w-[5.5rem] shrink-0 flex-col items-center gap-0.5 px-4 py-2 transition-colors', on ? 'bg-beni text-white' : 'text-washi/70 hover:bg-white/[.06] hover:text-white')}
                >
                  <span className={cn('font-display text-xl font-extrabold leading-none', on ? 'text-white' : 'text-beni')}>{c.kanji}</span>
                  <span className="whitespace-nowrap text-[13px] font-medium">{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 pb-8 md:px-10">
        <div className="mt-6 flex flex-wrap items-center gap-2" aria-label="Filtros">
          <span className="mr-1 text-sm text-ash">Filtrar:</span>
          {FILTERS.map((t) => {
            const on = tags.includes(t)
            return (
              <button key={t} aria-pressed={on} onClick={() => setTags((s) => (on ? s.filter((x) => x !== t) : [...s, t]))}
                className={cn('flex items-center gap-1.5 border px-3 py-1.5 text-sm transition-colors', on ? 'border-beni bg-beni text-white' : 'border-white/15 text-washi/80 hover:border-white/40')}>
                {TAG_META[t].icon && (() => { const I = TAG_META[t].icon!; return <I size={14} /> })()}
                {TAG_META[t].label}
              </button>
            )
          })}
          {filtering && <button onClick={() => { setQ(''); setTags([]) }} className="px-2 py-1.5 text-sm text-ash underline underline-offset-4 hover:text-white">Limpar filtros</button>}
        </div>

        {groups.map((g) => (
          <div key={g.id + '-' + cat + '-' + tags.join() + q} className="mt-10 md:mt-14">
            {g.id !== 'busca' && (
              <div className="flex items-end justify-between gap-6 border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-3xl font-extrabold md:text-4xl">{g.name}</h3>
                  <p className="mt-1 text-washi/60">{g.blurb}</p>
                </div>
                <span className="font-display text-5xl font-extrabold text-beni/90 md:text-6xl" aria-hidden>{categoryById(g.id).kanji}</span>
              </div>
            )}
            {g.id === 'busca' && <p className="text-washi/70" aria-live="polite">{g.name}</p>}
            {g.items.length ? (
              <RevealGrid className="grid grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {g.items.map((p) => <DishCard key={p.id} p={p} onOpen={() => setOpen(p.id)} />)}
              </RevealGrid>
            ) : (
              <div className="mt-8 border border-dashed border-white/20 p-10 text-center">
                <p className="font-display text-2xl font-bold">Nenhum prato com esses filtros.</p>
                <p className="mt-2 text-washi/70">Tire algum filtro ou busque por outro nome.</p>
                <button className="btn btn-ghost mt-6" onClick={() => { setQ(''); setTags([]) }}>Ver todo o cardápio <span className="dot"><X size={16} /></span></button>
              </div>
            )}
          </div>
        ))}
        <p className="mt-16 text-center text-sm text-ash">Imagens ilustrativas. Pratos podem variar conforme a disponibilidade do dia.</p>
      </div>

      {openProduct && <DishModal product={openProduct} onClose={() => setOpen(null)} />}
    </section>
  )
}
