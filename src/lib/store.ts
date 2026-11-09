/**
 * Camada de dados do Kenko.
 *  - Com variáveis VITE_FIREBASE_* configuradas: usa Firestore + Auth (tempo real).
 *  - Sem elas: usa um modo de demonstração em localStorage (funciona offline e
 *    sincroniza entre abas, então dá para testar site + /admin lado a lado).
 */
import { DEMO_STATUS, TABLES, type TableStatus } from '../data/tables'
import type { Addon } from '../data/menu'

export type OrderStatus = 'novo' | 'preparo' | 'pronto' | 'entregue' | 'cancelado'
export type OrderMode = 'entrega' | 'retirada' | 'mesa'

export interface OrderItem {
  id: string
  name: string
  qty: number
  unit: number
  addons: Addon[]
  total: number
}

export interface Order {
  id?: string
  code: string
  createdAt: number
  status: OrderStatus
  mode: OrderMode
  customer: { name: string; phone: string }
  address?: { street: string; number: string; zone: string; ref: string }
  tableId?: string
  items: OrderItem[]
  subtotal: number
  fee: number
  total: number
  payment: { method: 'pix' | 'cartao' | 'dinheiro'; change?: string }
  hashi: boolean
  notes?: string
}

export interface Reservation {
  id?: string
  tableId: string
  name: string
  phone: string
  people: number
  time: string
  status: 'pendente' | 'confirmada' | 'recusada'
  createdAt: number
}

export type Overrides = Record<string, { available?: boolean; price?: number }>
export type TableMap = Record<string, TableStatus>
type Unsub = () => void

export interface Store {
  demo: boolean
  subscribeTables(cb: (m: TableMap) => void): Unsub
  setTableStatus(id: string, s: TableStatus): Promise<void>
  subscribeOverrides(cb: (m: Overrides) => void): Unsub
  setOverride(id: string, patch: { available?: boolean; price?: number }): Promise<void>
  createOrder(o: Omit<Order, 'id'>): Promise<void>
  subscribeOrders(cb: (o: Order[]) => void): Unsub
  updateOrderStatus(id: string, s: OrderStatus): Promise<void>
  createReservation(r: Omit<Reservation, 'id'>): Promise<void>
  subscribeReservations(cb: (r: Reservation[]) => void): Unsub
  updateReservation(id: string, patch: Partial<Reservation>): Promise<void>
  // auth (somente /admin)
  onAuth(cb: (user: { email: string } | null) => void): Unsub
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
}

const env = import.meta.env
export const FIREBASE_CONFIGURED = Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID)

/* ------------------------------------------------------------------ */
/* Modo demonstração (localStorage)                                    */
/* ------------------------------------------------------------------ */
function local(): Store {
  const listeners = new Map<string, Set<() => void>>()
  const read = <T,>(k: string, fallback: T): T => {
    try {
      const v = localStorage.getItem('kenko:' + k)
      return v ? (JSON.parse(v) as T) : fallback
    } catch {
      return fallback
    }
  }
  const write = (k: string, v: unknown) => {
    try {
      localStorage.setItem('kenko:' + k, JSON.stringify(v))
    } catch {
      /* sem armazenamento: mantém só em memória nesta sessão */
    }
    listeners.get(k)?.forEach((f) => f())
  }
  const sub = <T,>(k: string, fallback: T, cb: (v: T) => void): Unsub => {
    const fire = () => cb(read(k, fallback))
    if (!listeners.has(k)) listeners.set(k, new Set())
    listeners.get(k)!.add(fire)
    const onStorage = (e: StorageEvent) => e.key === 'kenko:' + k && fire()
    window.addEventListener('storage', onStorage)
    fire()
    return () => {
      listeners.get(k)!.delete(fire)
      window.removeEventListener('storage', onStorage)
    }
  }
  const defaultTables = (): TableMap =>
    Object.fromEntries(TABLES.map((t) => [t.id, DEMO_STATUS[t.id] ?? 'livre']))

  return {
    demo: true,
    subscribeTables: (cb) => sub<TableMap>('tables', defaultTables(), cb),
    setTableStatus: async (id, s) => write('tables', { ...read('tables', defaultTables()), [id]: s }),
    subscribeOverrides: (cb) => sub<Overrides>('overrides', {}, cb),
    setOverride: async (id, patch) => {
      const cur = read<Overrides>('overrides', {})
      write('overrides', { ...cur, [id]: { ...cur[id], ...patch } })
    },
    createOrder: async (o) => {
      const list = read<Order[]>('orders', [])
      write('orders', [{ ...o, id: o.code }, ...list].slice(0, 200))
    },
    subscribeOrders: (cb) => sub<Order[]>('orders', [], cb),
    updateOrderStatus: async (id, status) =>
      write('orders', read<Order[]>('orders', []).map((o) => (o.id === id ? { ...o, status } : o))),
    createReservation: async (r) => {
      const list = read<Reservation[]>('reservations', [])
      write('reservations', [{ ...r, id: 'r' + r.createdAt }, ...list].slice(0, 200))
    },
    subscribeReservations: (cb) => sub<Reservation[]>('reservations', [], cb),
    updateReservation: async (id, patch) =>
      write('reservations', read<Reservation[]>('reservations', []).map((r) => (r.id === id ? { ...r, ...patch } : r))),
    onAuth: (cb) => {
      cb({ email: 'demonstração' })
      return () => {}
    },
    signIn: async () => {},
    signOut: async () => {},
  }
}

/* ------------------------------------------------------------------ */
/* Firebase                                                            */
/* ------------------------------------------------------------------ */
function remote(): Store {
  const boot = (async () => {
    const [{ initializeApp }, fs, au] = await Promise.all([
      import('firebase/app'),
      import('firebase/firestore'),
      import('firebase/auth'),
    ])
    const app = initializeApp({
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    })
    return { fs, au, db: fs.getFirestore(app), auth: au.getAuth(app) }
  })()

  const lazySub = (fn: (b: Awaited<typeof boot>) => Unsub): Unsub => {
    let off: Unsub = () => {}
    let dead = false
    boot.then((b) => {
      if (!dead) off = fn(b)
    })
    return () => {
      dead = true
      off()
    }
  }

  return {
    demo: false,
    subscribeTables: (cb) =>
      lazySub(({ fs, db }) =>
        fs.onSnapshot(
          fs.collection(db, 'tables'),
          (snap) => {
            const m: TableMap = Object.fromEntries(TABLES.map((t) => [t.id, 'livre' as TableStatus]))
            snap.forEach((d) => (m[d.id] = d.data().status as TableStatus))
            cb(m)
          },
          () => {},
        ),
      ),
    setTableStatus: async (id, status) => {
      const { fs, db } = await boot
      await fs.setDoc(fs.doc(db, 'tables', id), { status, updatedAt: Date.now() })
    },
    subscribeOverrides: (cb) =>
      lazySub(({ fs, db }) =>
        fs.onSnapshot(
          fs.collection(db, 'menuOverrides'),
          (snap) => {
            const m: Overrides = {}
            snap.forEach((d) => (m[d.id] = d.data() as Overrides[string]))
            cb(m)
          },
          () => {},
        ),
      ),
    setOverride: async (id, patch) => {
      const { fs, db } = await boot
      await fs.setDoc(fs.doc(db, 'menuOverrides', id), patch, { merge: true })
    },
    createOrder: async (o) => {
      const { fs, db } = await boot
      await fs.addDoc(fs.collection(db, 'orders'), o)
    },
    subscribeOrders: (cb) =>
      lazySub(({ fs, db }) =>
        fs.onSnapshot(
          fs.query(fs.collection(db, 'orders'), fs.orderBy('createdAt', 'desc'), fs.limit(100)),
          (snap) => cb(snap.docs.map((d) => ({ ...(d.data() as Order), id: d.id }))),
          () => {},
        ),
      ),
    updateOrderStatus: async (id, status) => {
      const { fs, db } = await boot
      await fs.updateDoc(fs.doc(db, 'orders', id), { status })
    },
    createReservation: async (r) => {
      const { fs, db } = await boot
      await fs.addDoc(fs.collection(db, 'reservations'), r)
    },
    subscribeReservations: (cb) =>
      lazySub(({ fs, db }) =>
        fs.onSnapshot(
          fs.query(fs.collection(db, 'reservations'), fs.orderBy('createdAt', 'desc'), fs.limit(100)),
          (snap) => cb(snap.docs.map((d) => ({ ...(d.data() as Reservation), id: d.id }))),
          () => {},
        ),
      ),
    updateReservation: async (id, patch) => {
      const { fs, db } = await boot
      await fs.updateDoc(fs.doc(db, 'reservations', id), patch as Record<string, unknown>)
    },
    onAuth: (cb) =>
      lazySub(({ au, auth }) => au.onAuthStateChanged(auth, (u) => cb(u ? { email: u.email ?? '' } : null))),
    signIn: async (email, password) => {
      const { au, auth } = await boot
      await au.signInWithEmailAndPassword(auth, email, password)
    },
    signOut: async () => {
      const { au, auth } = await boot
      await au.signOut(auth)
    },
  }
}

export const store: Store = FIREBASE_CONFIGURED ? remote() : local()
