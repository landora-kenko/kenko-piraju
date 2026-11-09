import { lazy, Suspense, useState } from 'react'
import { CartSheet } from './components/CartSheet'
import { CartProvider } from './lib/cart'
import { About } from './sections/About'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Marquee } from './sections/Marquee'
import { Menu } from './sections/Menu'
import { Nav } from './sections/Nav'
import { Preloader } from './sections/Preloader'
import { Tables } from './sections/Tables'
import { Visit } from './sections/Visit'

const Admin = lazy(() => import('./pages/Admin'))

export default function App() {
  const [revealed, setRevealed] = useState(false)
  const [doorsOpen, setDoorsOpen] = useState(false)

  if (location.pathname.startsWith('/admin')) {
    return <Suspense fallback={<div className="grid min-h-screen place-items-center bg-black text-ash">Carregando…</div>}><Admin /></Suspense>
  }

  return (
    <CartProvider>
      <Preloader onReveal={() => setRevealed(true)} onDone={() => setDoorsOpen(true)} />
      <Nav />
      <main>
        <Hero revealed={revealed} />
        <Marquee />
        <About />
        <Menu />
        <Tables />
        <Visit />
      </main>
      <Footer />
      <CartSheet />
      <div className="tex tex-wash" aria-hidden style={{ visibility: doorsOpen ? 'visible' : 'hidden' }} />
      <div className="tex tex-grain" aria-hidden style={{ visibility: doorsOpen ? 'visible' : 'hidden' }} />
    </CartProvider>
  )
}
