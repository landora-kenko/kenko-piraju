import { useEffect, useRef, useState } from 'react'
import { Bell, Check, ChefHat, ClipboardList, LayoutGrid, LogOut, Receipt, UtensilsCrossed } from 'lucide-react'
import { CATEGORIES, PRODUCTS } from '../data/menu'
import { TABLES, ZONES, type TableStatus } from '../data/tables'
import { store, type Order, type OrderStatus, type Overrides, type Reservation, type TableMap } from '../lib/store'
import { cn, money } from '../lib/utils'

type Tab = 'pedidos' | 'reservas' | 'mesas' | 'cardapio' | 'comandas'
const TABS: { id: Tab; label: string; icon: typeof Bell }[] = [
  { id: 'pedidos', label: 'Pedidos', icon: ClipboardList },
  { id: 'reservas', label: 'Reservas', icon: Bell },
  { id: 'mesas', label: 'Mesas', icon: LayoutGrid },
  { id: 'cardapio', label: 'Cardápio', icon: UtensilsCrossed },
  { id: 'comandas', label: 'Comandas', icon: Receipt },
]
const field = 'h-11 w-full border border-white/15 bg-white/[.04] px-3 outline-none focus:border-beni'
const time = (n: number) => new Date(n).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

function beep() {
  try {
    const ctx = new AudioContext()
    ;[880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.frequency.value = f; o.connect(g); g.connect(ctx.destination)
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.16)
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + i * 0.16 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.16 + 0.3)
      o.start(ctx.currentTime + i * 0.16); o.stop(ctx.currentTime + i * 0.16 + 0.32)
    })
  } catch { /* navegador sem áudio */ }
}

function Login() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <div className="grid min-h-screen place-items-center bg-black px-5">
      <form
        className="cut w-full max-w-sm space-y-5 border border-white/15 bg-[#0a0505] p-8"
        onSubmit={async (e) => {
          e.preventDefault(); setBusy(true); setErr('')
          try { await store.signIn(email, pw) } catch { setErr('E-mail ou senha incorretos.') } finally { setBusy(false) }
        }}
      >
        <div className="flex items-center gap-3"><span className="hanko h-10 w-10 text-xl">健</span><h1 className="font-display text-2xl font-extrabold">Painel Kenko</h1></div>
        <label className="block"><span className="mb-1.5 block text-sm text-washi/80">E-mail</span><input className={field} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="block"><span className="mb-1.5 block text-sm text-washi/80">Senha</span><input className={field} type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required /></label>
        {err && <p role="alert" className="text-sm text-shu">{err}</p>}
        <button className="btn btn-primary w-full justify-between" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}<span className="dot"><Check size={17} /></span></button>
        <a href="/" className="block text-center text-sm text-ash hover:text-white">Voltar ao site</a>
      </form>
    </div>
  )
}

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  novo: { to: 'preparo', label: 'Iniciar preparo' },
  preparo: { to: 'pronto', label: 'Marcar pronto' },
  pronto: { to: 'entregue', label: 'Concluir' },
}
const COLS: { id: OrderStatus; label: string }[] = [
  { id: 'novo', label: 'Novos' }, { id: 'preparo', label: 'Em preparo' }, { id: 'pronto', label: 'Prontos' }, { id: 'entregue', label: 'Concluídos' },
]

function OrderCard({ o }: { o: Order }) {
  const next = NEXT[o.status]
  return (
    <article className="border border-white/12 bg-white/[.03] p-4">
      <div className="flex items-baseline justify-between"><p className="font-display text-xl font-extrabold">{o.code}</p><p className="text-sm text-ash">{time(o.createdAt)}</p></div>
      <p className="mt-0.5 text-sm"><span className="bg-beni px-1.5 py-0.5 text-xs font-bold">{o.mode === 'entrega' ? 'Entrega' : o.mode === 'retirada' ? 'Retirada' : `Mesa ${TABLES.find((t) => t.id === o.tableId)?.label ?? ''}`}</span> {o.customer.name}, {o.customer.phone}</p>
      {o.address && <p className="mt-1 text-sm text-washi/70">{o.address.street}, {o.address.number}. {o.address.zone}{o.address.ref ? `, ${o.address.ref}` : ''}</p>}
      <ul className="mt-3 space-y-0.5 border-y border-white/10 py-2 text-sm">
        {o.items.map((i, k) => <li key={k}>{i.qty}x {i.name}{i.addons.length ? <span className="text-ash"> ({i.addons.map((a) => a.name).join(', ')})</span> : null}</li>)}
      </ul>
      <p className="mt-2 flex justify-between text-sm"><span className="text-washi/70">{o.payment.method === 'pix' ? 'Pix' : o.payment.method === 'cartao' ? 'Cartão' : `Dinheiro${o.payment.change ? `, troco p/ ${o.payment.change}` : ''}`}{o.hashi ? ', com hashi' : ''}</span><strong>{money(o.total)}</strong></p>
      {o.notes && <p className="mt-2 border-l-2 border-beni pl-2 text-sm text-washi/80">{o.notes}</p>}
      {(next || o.status !== 'entregue') && (
        <div className="mt-3 flex gap-2">
          {next && <button className="btn btn-primary btn-sm flex-1 justify-between" onClick={() => store.updateOrderStatus(o.id!, next.to)}>{next.label}<span className="dot"><Check size={14} /></span></button>}
          {o.status === 'novo' && <button className="border border-white/15 px-3 text-sm hover:border-shu hover:text-shu" onClick={() => store.updateOrderStatus(o.id!, 'cancelado')}>Cancelar</button>}
        </div>
      )}
    </article>
  )
}

function Panel({ email }: { email: string }) {
  const [tab, setTab] = useState<Tab>('pedidos')
  const [orders, setOrders] = useState<Order[]>([])
  const [res, setRes] = useState<Reservation[]>([])
  const [tables, setTables] = useState<TableMap>({})
  const [ov, setOv] = useState<Overrides>({})
  const seen = useRef<Set<string> | null>(null)

  useEffect(() => {
    const offs = [store.subscribeOrders(setOrders), store.subscribeReservations(setRes), store.subscribeTables(setTables), store.subscribeOverrides(setOv)]
    return () => offs.forEach((f) => f())
  }, [])
  useEffect(() => {
    const ids = new Set(orders.map((o) => o.id!))
    if (seen.current && orders.some((o) => !seen.current!.has(o.id!) && o.status === 'novo')) beep()
    seen.current = ids
  }, [orders])

  const novos = orders.filter((o) => o.status === 'novo').length
  const pend = res.filter((r) => r.status === 'pendente').length

  return (
    <div className="min-h-screen bg-black">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-8 gap-y-2 px-5 py-3">
          <a href="/" className="flex items-center gap-2.5"><span className="hanko h-8 w-8 text-lg">健</span><span className="font-display text-xl font-extrabold">Painel</span></a>
          <nav className="scroll-x flex flex-1 gap-1" aria-label="Seções do painel">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id} className={cn('flex shrink-0 items-center gap-2 px-3.5 py-2 text-sm font-medium', tab === t.id ? 'bg-beni' : 'text-washi/70 hover:bg-white/10')}>
                <t.icon size={16} /> {t.label}
                {t.id === 'pedidos' && novos > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-black">{novos}</span>}
                {t.id === 'reservas' && pend > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-black">{pend}</span>}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm text-ash">
            {store.demo && <span className="border border-white/20 px-2 py-0.5 text-xs">Modo demonstração (dados só neste navegador)</span>}
            <span className="hidden sm:inline">{email}</span>
            {!store.demo && <button onClick={() => store.signOut()} className="flex items-center gap-1.5 hover:text-white"><LogOut size={15} /> Sair</button>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-8">
        {tab === 'pedidos' && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {COLS.map((c) => {
              const list = orders.filter((o) => o.status === c.id).slice(0, c.id === 'entregue' ? 12 : 50)
              return (
                <section key={c.id} aria-label={c.label}>
                  <h2 className="mb-3 flex items-center justify-between border-b border-beni pb-2 font-display text-xl font-bold">{c.label}<span className="text-sm font-normal text-ash">{list.length}</span></h2>
                  <div className="space-y-3">{list.length ? list.map((o) => <OrderCard key={o.id} o={o} />) : <p className="py-6 text-sm text-ash">Nenhum pedido aqui.</p>}</div>
                </section>
              )
            })}
          </div>
        )}

        {tab === 'reservas' && (
          <div className="max-w-3xl space-y-3">
            <h2 className="font-display text-3xl font-extrabold">Pedidos de reserva</h2>
            {res.length === 0 && <p className="py-6 text-ash">Nenhum pedido de reserva ainda.</p>}
            {res.map((r) => (
              <article key={r.id} className="flex flex-wrap items-center justify-between gap-4 border border-white/12 bg-white/[.03] p-4">
                <div>
                  <p className="font-display text-xl font-bold">{TABLES.find((t) => t.id === r.tableId)?.label}, {r.time}, {r.people} {r.people === 1 ? 'pessoa' : 'pessoas'}</p>
                  <p className="text-sm text-washi/70">{r.name}, {r.phone}</p>
                </div>
                {r.status === 'pendente' ? (
                  <div className="flex gap-2">
                    <button className="btn btn-primary btn-sm" onClick={async () => { await store.setTableStatus(r.tableId, 'reservada'); await store.updateReservation(r.id!, { status: 'confirmada' }) }}>Confirmar<span className="dot"><Check size={14} /></span></button>
                    <button className="border border-white/15 px-3 text-sm hover:border-shu hover:text-shu" onClick={() => store.updateReservation(r.id!, { status: 'recusada' })}>Recusar</button>
                  </div>
                ) : <span className={cn('border px-2.5 py-1 text-sm', r.status === 'confirmada' ? 'border-emerald-500 text-emerald-400' : 'border-white/20 text-ash')}>{r.status === 'confirmada' ? 'Confirmada' : 'Recusada'}</span>}
              </article>
            ))}
          </div>
        )}

        {tab === 'mesas' && (
          <div>
            <h2 className="font-display text-3xl font-extrabold">Mesas</h2>
            <p className="mb-6 mt-1 text-washi/70">O que você marcar aqui aparece na hora no mapa do site.</p>
            {(Object.keys(ZONES) as (keyof typeof ZONES)[]).map((z) => (
              <section key={z} className="mb-8"><h3 className="mb-3 font-display text-xl font-bold text-washi/80">{ZONES[z].name}</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {TABLES.filter((t) => t.zone === z).map((t) => {
                    const s = tables[t.id] ?? 'livre'
                    return (
                      <div key={t.id} className={cn('border p-3', s === 'ocupada' ? 'border-beni bg-beni/15' : s === 'reservada' ? 'border-dashed border-beni' : 'border-white/15')}>
                        <p className="font-bold">{t.label} <span className="text-sm font-normal text-ash">{t.seats} lug.</span></p>
                        <div className="mt-2 grid grid-cols-3 gap-1">
                          {(['livre', 'reservada', 'ocupada'] as TableStatus[]).map((x) => (
                            <button key={x} aria-pressed={s === x} onClick={() => store.setTableStatus(t.id, x)} className={cn('py-1.5 text-[11px] font-medium', s === x ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20')}>{x === 'livre' ? 'Livre' : x === 'reservada' ? 'Reserv.' : 'Ocup.'}</button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {tab === 'cardapio' && (
          <div className="max-w-4xl">
            <h2 className="font-display text-3xl font-extrabold">Cardápio</h2>
            <p className="mb-6 mt-1 text-washi/70">Ajuste preço e disponibilidade. Itens esgotados ficam bloqueados no site.</p>
            {CATEGORIES.map((c) => (
              <section key={c.id} className="mb-8">
                <h3 className="mb-2 border-b border-beni pb-1 font-display text-xl font-bold">{c.name}</h3>
                <ul className="divide-y divide-white/10">
                  {PRODUCTS.filter((p) => p.cat === c.id).map((p) => {
                    const o = ov[p.id] ?? {}
                    const on = o.available ?? true
                    return (
                      <li key={p.id} className="flex flex-wrap items-center gap-4 py-2.5">
                        <span className={cn('min-w-0 flex-1', !on && 'text-ash line-through')}>{p.name}{p.pieces ? <span className="text-sm text-ash"> {p.pieces}</span> : null}</span>
                        <label className="flex items-center gap-2 text-sm text-ash">R$
                          <input defaultValue={(o.price ?? p.price).toFixed(2)} key={o.price} inputMode="decimal" className="h-9 w-24 border border-white/15 bg-white/[.04] px-2 text-right tabular-nums text-washi outline-none focus:border-beni"
                            onBlur={(e) => { const v = parseFloat(e.target.value.replace(',', '.')); if (!isNaN(v) && v !== (o.price ?? p.price)) store.setOverride(p.id, { price: v }) }} />
                        </label>
                        <button role="switch" aria-checked={on} onClick={() => store.setOverride(p.id, { available: !on })} className={cn('h-8 w-24 border text-sm font-medium', on ? 'border-emerald-500/60 text-emerald-400' : 'border-beni text-shu')}>{on ? 'Disponível' : 'Esgotado'}</button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        {tab === 'comandas' && (
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold">Comandas</h2>
            <div className="cut mt-5 border border-white/15 bg-white/[.03] p-7">
              <ChefHat className="mb-4 text-shu" />
              <p className="font-display text-2xl font-bold">Em breve: comanda por mesa.</p>
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-washi/75">
                <li>Abrir comanda ao sentar e lançar itens pelo celular do garçom.</li>
                <li>Enviar pedidos direto para a cozinha e o balcão do sushiman.</li>
                <li>Fechar a conta, dividir entre pessoas e liberar a mesa no mapa do site.</li>
              </ul>
              <p className="mt-5 text-sm text-ash">A coleção <code>tabs</code> já existe nas regras do Firestore, reservada para essa etapa.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function Admin() {
  const [user, setUser] = useState<{ email: string } | null | undefined>(undefined)
  useEffect(() => store.onAuth(setUser), [])
  useEffect(() => { document.title = 'Painel | Kenko' }, [])
  if (user === undefined) return <div className="grid min-h-screen place-items-center bg-black text-ash">Carregando…</div>
  if (!user) return <Login />
  return <Panel email={user.email} />
}
