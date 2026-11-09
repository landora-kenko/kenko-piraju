import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { BookOpen, Home, Info, LayoutGrid, MapPin, ShoppingBag } from 'lucide-react'
import { useCart } from '../lib/cart'
import { cn } from '../lib/utils'

const LINKS = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'sobre', label: 'Sobre', icon: Info },
  { id: 'cardapio', label: 'Cardápio', icon: BookOpen },
  { id: 'mesas', label: 'Mesas', icon: LayoutGrid },
  { id: 'visite', label: 'Visite', icon: MapPin },
]

export function Logo({ className }: { className?: string }) {
  return (
    <a href="/" className={cn('flex items-center gap-2.5', className)} aria-label="Kenko, página inicial">
      <span className="hanko h-8 w-8 text-lg">健</span>
      <span className="font-display text-xl font-extrabold tracking-tight">Kenko</span>
    </a>
  )
}

export function Nav() {
  const { count, setOpen, pulse } = useCart()
  const [active, setActive] = useState('inicio')
  const [stuck, setStuck] = useState(false)
  const badge = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    LINKS.forEach((l) => { const el = document.getElementById(l.id); if (el) io.observe(el) })
    return () => { window.removeEventListener('scroll', onScroll); io.disconnect() }
  }, [])

  useEffect(() => {
    if (pulse && badge.current) animate(badge.current, { scale: [1, 1.5, 1], duration: 520, ease: 'outBack' })
  }, [pulse])

  const cartBtn = (
    <button
      data-cart-btn
      onClick={() => setOpen(true)}
      className="relative flex h-11 items-center gap-2 bg-beni pl-4 pr-3 text-sm font-bold text-white transition-colors hover:bg-shu"
      aria-label={`Abrir sacola, ${count} ${count === 1 ? 'item' : 'itens'}`}
    >
      <span className="hidden sm:inline">Sacola</span>
      <ShoppingBag size={18} />
      <span ref={badge} className="grid h-5 min-w-5 place-items-center rounded-full bg-black px-1 text-[11px] font-bold tabular-nums">{count}</span>
    </button>
  )

  return (
    <>
      {/* topo */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <nav
          aria-label="Principal"
          className={cn(
            'pointer-events-auto flex w-full max-w-4xl items-center justify-between gap-3 border py-1.5 pl-4 pr-1.5 transition-all duration-500 md:w-auto md:gap-8 md:pl-5',
            stuck ? 'border-white/10 bg-black/75 backdrop-blur-xl' : 'border-white/5 bg-black/35 backdrop-blur-md',
          )}
        >
          <Logo />
          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className={cn('relative px-3.5 py-2 text-sm font-medium text-washi/70 transition-colors hover:text-white', active === l.id && 'text-white')}
                >
                  {l.label}
                  <span className={cn('absolute inset-x-3.5 -bottom-0.5 h-px origin-left bg-beni transition-transform duration-500', active === l.id ? 'scale-x-100' : 'scale-x-0')} />
                </a>
              </li>
            ))}
          </ul>
          {cartBtn}
        </nav>
      </header>

      {/* dock mobile */}
      <nav aria-label="Atalhos" className="fixed inset-x-3 bottom-3 z-50 border border-white/10 bg-black/80 backdrop-blur-xl md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <ul className="grid grid-cols-5">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} className={cn('flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-washi/60', active === l.id && 'text-white')}>
                <l.icon size={19} className={active === l.id ? 'text-shu' : ''} />
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
