import { useState } from 'react'
import data from '../data/photos.json'
import { cn } from '../lib/utils'
import { PRODUCTS, type Kind } from '../data/menu'

type CropId = keyof typeof data.crops
type SourceId = keyof typeof data.sources

/**
 * Foto real recortada por foco + zoom (sem gerar um arquivo por recorte).
 * O recorte é sempre quadrado; use `rounded-full` para virar prato.
 */
export function Photo({ crop, alt, className }: { crop: string; alt: string; className?: string; eager?: boolean }) {
  const [retry, setRetry] = useState(0)
  const c = data.crops[crop as CropId]
  const s = data.sources[c.s as SourceId]
  return (
    <span role="img" aria-label={alt} className={cn('relative block aspect-square overflow-hidden bg-[#120506] [isolation:isolate] [transform:translateZ(0)]', className)}>
      <img
        src={retry ? `${s.url}?r=${retry}` : s.url} alt="" draggable={false}
        onError={() => retry < 3 && setTimeout(() => setRetry((n) => n + 1), 600 * (retry + 1))}
        loading="eager" decoding="async"
        className="pointer-events-none absolute max-w-none select-none"
        style={{ width: `${(s.w / c.size) * 100}%`, left: `${(0.5 - c.cx / c.size) * 100}%`, top: `${(0.5 - c.cy / c.size) * 100}%` }}
      />
    </span>
  )
}

const pools = data.pools as Record<string, string[]>
/** Distribui as fotos do pool na ordem do cardápio, para pratos vizinhos do mesmo tipo não repetirem a foto. */
const assigned = (() => {
  const m = new Map<string, string>(), n: Record<string, number> = {}
  for (const p of PRODUCTS) {
    const pool = pools[p.kind] ?? pools.combo
    m.set(p.id, pool[(n[p.kind] = (n[p.kind] ?? -1) + 1) % pool.length])
  }
  return m
})()

export function cropFor(kind: Kind, id: string, override?: string): string {
  if (override && override in data.crops) return override
  return assigned.get(id) ?? (pools[kind] ?? pools.combo)[0]
}
