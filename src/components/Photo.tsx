import data from '../data/photos.json'
import { cn } from '../lib/utils'
import { PRODUCTS, type Kind } from '../data/menu'

type CropId = keyof typeof data.crops
type SourceId = keyof typeof data.sources

/**
 * Foto real recortada por foco + zoom (sem gerar um arquivo por recorte).
 * O recorte é sempre quadrado; use `rounded-full` para virar prato.
 */
export function Photo({ crop, alt, className, eager }: { crop: string; alt: string; className?: string; eager?: boolean }) {
  const c = data.crops[crop as CropId]
  const s = data.sources[c.s as SourceId]
  return (
    <span role="img" aria-label={alt} className={cn('relative block aspect-square overflow-hidden bg-[#120506]', className)}>
      <img
        src={s.url} alt="" draggable={false}
        loading={eager ? 'eager' : 'lazy'} decoding="async"
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
