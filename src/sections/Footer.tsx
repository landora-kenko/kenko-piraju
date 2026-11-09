import { Logo } from './Nav'
import { RESTAURANT } from '../lib/config'

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 px-5 pb-28 pt-20 md:px-10 md:pb-10">
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
      <div aria-hidden className="pointer-events-none mx-auto mt-16 max-w-[1400px] select-none overflow-hidden text-center">
        <span className="block whitespace-nowrap font-display font-extrabold leading-[1] text-transparent" style={{ fontSize: 'min(17vw, 17rem)', WebkitTextStroke: '1.5px rgba(211,17,28,.55)' }}>
          ありがとう
        </span>
      </div>
      <div className="mx-auto mt-6 flex max-w-[1400px] flex-col justify-between gap-2 border-t border-white/10 pt-6 text-sm text-ash md:flex-row">
        <p>© {new Date().getFullYear()} Kenko. Todos os direitos reservados.</p>
        <p>Preços e disponibilidade sujeitos a alteração.</p>
      </div>
    </footer>
  )
}
