import { useEffect, useRef } from 'react'
import { reducedMotion } from '../../lib/utils'

/** Brasas e pétalas vermelhas subindo lentamente (canvas, pausa fora da tela). */
export function Embers({ count = 46, className }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current!
    const ctx = c.getContext('2d')!
    if (!ctx || reducedMotion()) return
    let w = 0, h = 0, raf = 0, vis = true
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      w = c.clientWidth; h = c.clientHeight
      c.width = w * dpr; c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const mk = (init = false) => ({
      x: Math.random() * w, y: init ? Math.random() * h : h + 10,
      r: 0.8 + Math.random() * 2.4, vy: 0.15 + Math.random() * 0.5, vx: (Math.random() - 0.5) * 0.25,
      ph: Math.random() * 6.28, petal: Math.random() > 0.78, a: 0.25 + Math.random() * 0.6,
    })
    const ps = Array.from({ length: count }, () => mk(true))
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      if (!vis) return
      ctx.clearRect(0, 0, w, h)
      for (const p of ps) {
        p.y -= p.vy; p.x += p.vx + Math.sin(t / 1400 + p.ph) * 0.18
        if (p.y < -12) Object.assign(p, mk())
        const fade = Math.min(1, p.y / (h * 0.25), (h - p.y) / (h * 0.1))
        ctx.globalAlpha = Math.max(0, p.a * fade)
        if (p.petal) {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(t / 900 + p.ph)
          ctx.fillStyle = '#d3111c'
          ctx.beginPath(); ctx.ellipse(0, 0, p.r * 2.6, p.r * 1.3, 0, 0, 6.28); ctx.fill(); ctx.restore()
        } else {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
          g.addColorStop(0, '#ff5a3a'); g.addColorStop(1, 'rgba(255,40,20,0)')
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.28); ctx.fill()
        }
      }
    }
    raf = requestAnimationFrame(tick)
    const io = new IntersectionObserver(([e]) => (vis = e.isIntersecting))
    io.observe(c)
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('resize', resize) }
  }, [count])

  return <canvas ref={ref} className={className} aria-hidden />
}
