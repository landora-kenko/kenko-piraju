import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { animate, stagger } from 'animejs'
import { ChevronDown, Plus, Search, X } from 'lucide-react'
import { CATEGORIES, categoryById, type Product, type Tag } from '../data/menu'
import { Photo, cropFor } from '../components/Photo'
import { DishModal, TAG_META, TagChip } from '../components/DishModal'
import { useCart } from '../lib/cart'
import { flyToCart } from '../lib/fly'
import { useReveal } from '../hooks/useReveal'
import { useSplit } from '../hooks/useSplit'
import { cn, money, reducedMotion } from '../lib/utils'

type P = Product & { available: boolean }
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const FILTERS: Tag[] = ['picante', 'vegetariano', 'chef', 'novo']
const SHORT: Record<string, string> = {
  todos: 'Tudo', combinados: 'Combos', niguiris: 'Niguiris', sashimis: 'Sashimis', uramakis: 'Makis', hots: 'Hot rolls',
  temakis: 'Temakis', quentes: 'Quentes', entradas: 'Entradas', sobremesas: 'Doces', bebidas: 'Bebidas',
}
const SHORT_TAG: Partial<Record<Tag, string>> = { chef: 'Sushiman' }
const LIMIT = 4 // 4 por linha no desktop, 2 colunas x 2 linhas no celular

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
      className={cn('dish spot group relative mt-12 cursor-pointer border bg-white/[.03] px-3 pb-3 pt-16 transition-colors duration-500 sm:mt-16 sm:px-5 sm:pb-5 sm:pt-28', chef ? 'border-beni/50' : 'border-white/10 hover:border-beni/60', !p.available && 'opacity-60')}
      onClick={onOpen}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--sx', `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty('--sy', `${e.clientY - r.top}px`)
      }}
    >
      <div className={cn('absolute -top-10 left-1/2 w-24 -translate-x-1/2 transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:-translate-y-2 group-hover:rotate-[14deg] group-hover:scale-110 sm:-top-14 sm:w-40', !p.available && 'grayscale')}>
        <Photo crop={cropFor(p.kind, p.id, p.photo)} alt={p.name} className="neon-disc w-full rounded-full" />
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-base font-bold leading-tight sm:text-xl">
          <button className="text-left after:absolute after:inset-0 focus-visible:outline-offset-8" onClick={(e) => { e.stopPropagation(); onOpen() }}>{p.name}</button>
        </h3>
        {p.jp && <span className="hidden shrink-0 font-display text-sm italic text-ash sm:inline">{p.jp}</span>}
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-washi/65 sm:mt-2 sm:min-h-[2.9rem] sm:text-sm">{p.desc}</p>
      <div className="mt-2 hidden min-h-5 flex-wrap gap-x-3 sm:flex">{p.tags?.filter((t) => t !== 'chef').slice(0, 2).map((t) => <TagChip key={t} t={t} />)}</div>
      <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3 sm:mt-4 sm:pt-4">
        <div>
          <p className="font-display text-lg font-bold tabular-nums sm:text-2xl">{money(p.price)}</p>
          {p.pieces && <p className="text-[11px] text-ash sm:text-xs">{p.pieces}</p>}
        </div>
        {p.available ? (
          <button
            ref={btn}
            onClick={(e) => { e.stopPropagation(); add(p); flyToCart(btn.current) }}
            aria-label={`Adicionar ${p.name} à sacola`}
            className="relative z-10 grid h-9 w-9 place-items-center rounded-full bg-beni transition-all duration-500 hover:rotate-90 hover:bg-shu active:scale-90 sm:h-11 sm:w-11"
          >
            <Plus size={18} />
          </button>
        ) : (
          <span className="text-xs font-medium text-ash sm:text-sm">Esgotado hoje</span>
        )}
      </div>
      {chef && <p className="-mx-3 -mb-3 mt-3 bg-beni px-3 py-1.5 text-center text-[11px] font-bold tracking-wide sm:-mx-5 sm:-mb-5 sm:mt-4 sm:text-xs">Escolha do sushiman</p>}
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
  const [more, setMore] = useState<Record<string, boolean>>({})
  const bar = useRef<HTMLDivElement>(null)

  const filtering = q.trim() !== '' || tags.length > 0
  const filtered = useMemo(
    () => products.filter((p) => (!q.trim() || norm(p.name + ' ' + p.desc + ' ' + (p.jp ?? '')).includes(norm(q.trim()))) && tags.every((t) => p.tags?.includes(t))),
    [products, q, tags],
  )
  const groups = filtering
    ? [{ id: 'busca', name: `${filtered.length} ${filtered.length === 1 ? 'resultado' : 'resultados'}`, blurb: '', items: filtered }]
    : CATEGORIES.filter((c) => cat === 'todos' || c.id === cat).map((c) => ({ ...c, items: products.filter((p) => p.cat === c.id) }))

  const showAll = (id: string) => filtering || cat !== 'todos' || !!more[id]

  const pick = (id: string) => {
    setCat(id)
    setQ(''); setTags([])
    document.getElementById('cardapio-grid')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }
  const openProduct = products.find((p) => p.id === open)

  return (
    <section id="cardapio" ref={root} className="relative pt-14 md:pt-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="flex items-end gap-6">
            <span className="vertical hidden font-display text-5xl font-extrabold text-beni md:block" aria-hidden>品書</span>
            <div>
              <h2 ref={title} className="font-display text-[clamp(2.8rem,7vw,6rem)] font-extrabold leading-[1] tracking-tight">Cardápio</h2>
              <p data-reveal className="mt-3 max-w-md text-lg text-washi/70">Toque em um prato para ver detalhes. Pedidos para entrega, retirada ou para a sua mesa.</p>
            </div>
          </div>
          <div data-reveal className="hidden w-full md:block md:max-w-sm">
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

      <div className="sticky top-12 z-40 border-b border-white/10 bg-[#0b0506] px-5 py-2 md:hidden">
            <label className="relative block">
              <span className="sr-only">Buscar no cardápio</span>
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" />
              <input
                value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar: salmão, hot, gyoza…"
                className="h-10 w-full border border-white/15 bg-white/[.04] pl-11 pr-10 outline-none transition-colors placeholder:text-ash/70 focus:border-beni"
              />
              {q && <button onClick={() => setQ('')} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-white"><X size={18} /></button>}
            </label>
          </div>


      {/* categorias */}
      <div className="mt-6 border-y border-white/10 bg-black md:sticky md:top-16 md:z-40 md:mt-10">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div ref={bar} className="flex flex-wrap justify-center gap-x-1 gap-y-0 py-1 md:flex-nowrap md:gap-1 md:py-2 md:justify-start md:overflow-x-auto md:[scrollbar-width:none]" role="tablist" aria-label="Categorias do cardápio">
            {[{ id: 'todos', name: 'Tudo', kanji: '全' }, ...CATEGORIES].map((c) => {
              const on = !filtering && cat === c.id
              return (
                <button
                  key={c.id} role="tab" aria-selected={on} onClick={() => pick(c.id)}
                  className={cn('group relative flex w-[calc((100%-1.25rem)/6)] min-w-0 flex-col items-center gap-0 px-0.5 py-1 transition-colors md:w-auto md:min-w-[5.5rem] md:shrink-0 md:px-4 md:py-2', on ? 'bg-beni text-white' : 'text-washi/70 hover:bg-white/[.06] hover:text-white')}
                >
                  <span className={cn('font-display text-sm font-extrabold leading-none md:text-xl', on ? 'text-white' : 'text-beni')}>{c.kanji}</span>
                  <span className="whitespace-nowrap text-[10px] font-medium md:hidden">{SHORT[c.id] ?? c.name}</span>
                  <span className="hidden whitespace-nowrap text-[13px] font-medium md:inline">{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div id="cardapio-grid" className="mx-auto max-w-[1400px] scroll-mt-28 px-5 md:scroll-mt-36 pb-8 md:px-10">
        <div className="mt-6 grid grid-cols-4 items-center gap-1.5 md:flex md:flex-wrap md:gap-2" aria-label="Filtros">
          <span className="mr-1 hidden text-sm text-ash md:inline">Filtrar:</span>
          {FILTERS.map((t) => {
            const on = tags.includes(t)
            const I = TAG_META[t].icon
            return (
              <button key={t} aria-pressed={on} onClick={() => setTags((s) => (on ? s.filter((x) => x !== t) : [...s, t]))}
                className={cn('flex flex-col items-center justify-center gap-1 border px-1 py-2 text-[11px] leading-none transition-colors md:flex-row md:gap-1.5 md:px-3 md:py-1.5 md:text-sm', on ? 'border-beni bg-beni text-white' : 'border-white/15 text-washi/80 hover:border-white/40')}>
                {I && <I size={14} />}
                <span className="md:hidden">{SHORT_TAG[t] ?? TAG_META[t].label}</span>
                <span className="hidden md:inline">{TAG_META[t].label}</span>
              </button>
            )
          })}
          {filtering && <button onClick={() => { setQ(''); setTags([]) }} className="col-span-4 px-2 py-1.5 text-sm text-ash underline underline-offset-4 hover:text-white">Limpar filtros</button>}
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
              <>
                {(() => {
                  const shown = showAll(g.id) ? g.items : g.items.slice(0, LIMIT)
                  const titled = showAll(g.id) && g.id !== 'busca' && new Set(g.items.map((p) => p.group)).size > 1
                  const subs: { name: string; items: P[] }[] = []
                  for (const p of shown) {
                    const n = titled ? (p.group ?? '') : ''
                    const last = subs[subs.length - 1]
                    if (last && last.name === n) last.items.push(p)
                    else subs.push({ name: n, items: [p] })
                  }
                  return subs.map((s) => (
                    <div key={s.name} className={titled ? 'mt-8 first:mt-6' : ''}>
                      {titled && s.name && <h4 className="mb-1 font-display text-lg font-bold text-beni md:text-xl">{s.name}</h4>}
                      <RevealGrid className="grid grid-cols-2 gap-x-3 gap-y-0 sm:gap-x-6 lg:grid-cols-4">
                        {s.items.map((p) => <DishCard key={p.id} p={p} onOpen={() => setOpen(p.id)} />)}
                      </RevealGrid>
                    </div>
                  ))
                })()}
                {!filtering && cat === 'todos' && g.items.length > LIMIT && (
                  <div className="mt-8 flex justify-center">
                    <button className="btn btn-ghost btn-sm" aria-expanded={!!more[g.id]} onClick={() => setMore((m) => ({ ...m, [g.id]: !m[g.id] }))}>
                      {more[g.id] ? 'Ver menos' : `Ver todos (${g.items.length})`}
                      <span className="dot"><ChevronDown size={16} className={cn('transition-transform duration-500', more[g.id] && 'rotate-180')} /></span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-8 border border-dashed border-white/20 p-10 text-center">
                <p className="font-display text-2xl font-bold">Nenhum prato com esses filtros.</p>
                <p className="mt-2 text-washi/70">Tire algum filtro ou busque por outro nome.</p>
                <button className="btn btn-ghost mt-6" onClick={() => { setQ(''); setTags([]) }}>Ver todo o cardápio <span className="dot"><X size={16} /></span></button>
              </div>
            )}
          </div>
        ))}
        <p className="mt-16 text-center text-sm text-ash">Fotos ilustrativas. Pratos podem variar conforme a disponibilidade do dia.</p>
      </div>

      {openProduct && <DishModal product={openProduct} onClose={() => setOpen(null)} />}
    </section>
  )
}
