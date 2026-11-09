import { animate } from 'animejs'
import { reducedMotion } from './utils'

/** Uma brasa vermelha voa do botão até a sacola. */
export function flyToCart(from: Element | null) {
  const target = document.querySelector('[data-cart-btn]')
  if (!from || !target || reducedMotion()) return
  const a = from.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const dot = document.createElement('div')
  Object.assign(dot.style, {
    position: 'fixed', zIndex: '120', left: `${a.left + a.width / 2 - 11}px`, top: `${a.top + a.height / 2 - 11}px`,
    width: '22px', height: '22px', borderRadius: '999px', pointerEvents: 'none',
    background: 'radial-gradient(circle at 35% 30%, #ff6a4a, #d3111c)', boxShadow: '0 0 24px 6px rgba(255,45,31,.6)',
  })
  document.body.appendChild(dot)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  animate(dot, { x: [0, dx], duration: 750, ease: 'inQuad' })
  animate(dot, {
    y: [0, dy], scale: [1, 0.35], opacity: [1, 0.9], duration: 750, ease: 'outQuad',
    onComplete: () => dot.remove(),
  })
}
