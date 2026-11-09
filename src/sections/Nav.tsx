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

export function Logo({ className, tagline, size = 'md' }: { className?: string; tagline?: boolean; size?: 'md' | 'lg' }) {
  return (
    <a href="/" className={cn('group flex items-center gap-3', className)} aria-label="Kenko Sushi Bar, página inicial">
      <img
        src={size === 'lg' ? '/img/logo-wide.webp' : '/img/logo-wide-sm.webp'} alt=""
        width={size === "lg" ? 300 : 140} height={size === "lg" ? 111 : 52}
        className={cn('shrink-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]', size === 'lg' ? 'h-auto w-[min(78vw,300px)]' : 'h-[52px] w-auto -my-1')}
      />
      {tagline && (
        <>
          <span className="hidden h-4 w-px bg-white/20 lg:block" />
          <span className="hidden text-[11px] tracking-[.28em] text-ash lg:block">PIRAJU</span>
        </>
      )}
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
      className="group relative flex h-10 items-center gap-2.5 border border-white/20 pl-4 pr-1.5 text-[13px] font-semibold transition-colors duration-300 hover:border-beni hover:bg-beni"
      aria-label={`Abrir sacola, ${count} ${count === 1 ? 'item' : 'itens'}`}
    >
      <ShoppingBag size={16} />
      <span className="hidden sm:inline">Sacola</span>
      <span ref={badge} className={cn('grid h-6 min-w-6 place-items-center rounded-full px-1 text-[11px] font-bold tabular-nums transition-colors', count ? 'bg-beni group-hover:bg-black' : 'bg-white/10')}>{count}</span>
    </button>
  )

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-500',
          stuck ? 'border-white/10 bg-black/90' : 'border-transparent bg-gradient-to-b from-black/70 to-transparent',
        )}
      >
        <nav aria-label="Principal" className="mx-auto grid h-16 max-w-[1500px] grid-cols-[1fr_auto] items-center gap-4 px-5 md:grid-cols-[1fr_auto_1fr] md:px-10">
          <Logo tagline />
          <ul className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className={cn('group/l relative block py-2 text-[13px] font-medium tracking-[.08em] text-washi/60 transition-colors duration-300 hover:text-white', active === l.id && 'text-white')}
                >
                  {l.label}
                  <span className={cn('absolute inset-x-0 bottom-0 h-px origin-center bg-beni transition-transform duration-500 ease-[var(--ease-out-expo)]', active === l.id ? 'scale-x-100' : 'scale-x-0 group-hover/l:scale-x-50')} />
                </a>
              </li>
            ))}
          </ul>
          <div className="justify-self-end">{cartBtn}</div>
        </nav>
      </header>

      {/* dock mobile */}
      <nav aria-label="Atalhos" className="fixed inset-x-3 bottom-3 z-50 border border-white/10 bg-black/80 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
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
