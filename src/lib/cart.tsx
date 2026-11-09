import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PRODUCTS, productById, type Addon, type Product } from '../data/menu'
import { store, type Overrides } from './store'

export interface CartLine {
  key: string
  id: string
  qty: number
  addons: Addon[]
  note?: string
  unit: number
}

interface Ctx {
  products: (Product & { available: boolean })[]
  find: (id: string) => (Product & { available: boolean }) | undefined
  lines: CartLine[]
  count: number
  subtotal: number
  add: (p: Product, qty?: number, addons?: Addon[], note?: string) => void
  setQty: (key: string, qty: number) => void
  clear: () => void
  open: boolean
  setOpen: (v: boolean) => void
  pulse: number
}

const C = createContext<Ctx>(null as never)
export const useCart = () => useContext(C)

const KEY = 'kenko:cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Overrides>({})
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]')
    } catch {
      return []
    }
  })
  const [open, setOpen] = useState(false)
  const [pulse, setPulse] = useState(0)

  useEffect(() => store.subscribeOverrides(setOverrides), [])
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines))
    } catch {
      /* ignora */
    }
  }, [lines])

  const products = useMemo(
    () =>
      PRODUCTS.map((p) => ({
        ...p,
        price: overrides[p.id]?.price ?? p.price,
        available: overrides[p.id]?.available ?? true,
      })),
    [overrides],
  )
  const find = useCallback((id: string) => products.find((p) => p.id === id), [products])

  const add = useCallback((p: Product, qty = 1, addons: Addon[] = [], note = '') => {
    const n = note.trim().slice(0, 120)
    const price = (overrides[p.id]?.price ?? p.price) + addons.reduce((s, a) => s + a.price, 0)
    const key = p.id + '|' + addons.map((a) => a.id).sort().join(',') + (n ? '|' + n : '')
    setLines((ls) => {
      const i = ls.findIndex((l) => l.key === key)
      if (i >= 0) return ls.map((l, j) => (j === i ? { ...l, qty: l.qty + qty } : l))
      return [...ls, { key, id: p.id, qty, addons, unit: price, ...(n ? { note: n } : {}) }]
    })
    setPulse((n) => n + 1)
  }, [overrides])

  const setQty = useCallback(
    (key: string, qty: number) =>
      setLines((ls) => (qty <= 0 ? ls.filter((l) => l.key !== key) : ls.map((l) => (l.key === key ? { ...l, qty } : l)))),
    [],
  )
  const clear = useCallback(() => setLines([]), [])

  const valid = lines.filter((l) => productById(l.id))
  const count = valid.reduce((s, l) => s + l.qty, 0)
  const subtotal = valid.reduce((s, l) => s + l.qty * l.unit, 0)

  return (
    <C.Provider value={{ products, find, lines: valid, count, subtotal, add, setQty, clear, open, setOpen, pulse }}>
      {children}
    </C.Provider>
  )
}
