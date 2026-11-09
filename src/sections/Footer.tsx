import { Logo } from './Nav'
import { RESTAURANT } from '../lib/config'

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/10 px-5 pb-28 pt-20 md:px-10 md:pb-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 flex select-none items-center justify-center overflow-hidden">
        <span className="whitespace-nowrap font-display font-extrabold leading-none text-transparent" style={{ fontSize: 'min(21vw, 22rem)', WebkitTextStroke: '1.5px rgba(211,17,28,.16)' }}>
          ありがとう
        </span>
      </div>
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-5 max-w-sm text-washi/70">Culinária japonesa em {RESTAURANT.city}, {RESTAURANT.state}. Peça no site, retire no balcão ou reserve sua mesa.</p>
        </div>
        <nav aria-label="Rodapé" className="grid grid-cols-2 gap-8 md:col-span-7 md:grid-cols-3">
          <ul className="space-y-2.5 text-washi/75">
            <li className="font-display text-lg font-bold text-washi">Site</li>
            <li><a className="hover:text-white" href="#sobre">Sobre</a></li>
            <li><a className="hover:text-white" href="#cardapio">Cardápio</a></li>
            <li><a className="hover:text-white" href="#mesas">Mesas</a></li>
            <li><a className="hover:text-white" href="#visite">Visite</a></li>
          </ul>
          <ul className="space-y-2.5 text-washi/75">
            <li className="font-display text-lg font-bold text-washi">Pedidos</li>
            <li><a className="hover:text-white" href="#cardapio">Delivery</a></li>
            <li><a className="hover:text-white" href="#cardapio">Retirada</a></li>
            <li><a className="hover:text-white" href="#mesas">Reservar mesa</a></li>
          </ul>
          <ul className="space-y-2.5 text-washi/75">
            <li className="font-display text-lg font-bold text-washi">Equipe</li>
            <li><a className="hover:text-white" href="/admin">Painel do restaurante</a></li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-24 grid max-w-[1400px] gap-2 border-t border-white/10 pt-6 text-center text-sm text-ash md:mt-32 md:grid-cols-3 md:items-center">
        <p className="md:text-left">© {new Date().getFullYear()} Kenko. Todos os direitos reservados.</p>
        <p>Desenvolvido por <strong className="font-bold text-washi">Landora</strong>®</p>
        <span aria-hidden className="hidden md:block" />
      </div>
    </footer>
  )
}
