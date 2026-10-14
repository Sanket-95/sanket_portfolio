import { useRef, useState } from 'react';
import { Bell, ChevronRight, ClipboardList, LayoutDashboard, Minus, Plus, RotateCcw, Search, UtensilsCrossed, X, type LucideIcon } from 'lucide-react';
import {
  earlierSales, itemById, menu, menuCategories, orderFlow, orderTotal, seedOrders, tables,
  type MenuCategory, type Order, type OrderStatus,
} from '@/data/cafe';
import { PhoneFrame } from './DeviceFrames';

type Tab = 'menu' | 'orders' | 'dashboard';

const statusStyle: Record<OrderStatus, string> = {
  New: 'bg-[#dbeafe] text-[#1d4ed8]',
  Preparing: 'bg-[#fef3c7] text-[#b45309]',
  Ready: 'bg-[#dcfce7] text-[#15803d]',
  Served: 'bg-[#f1f5f9] text-[#64748b]',
};
const nextAction: Partial<Record<OrderStatus, string>> = { New: 'Start preparing', Preparing: 'Mark ready', Ready: 'Mark served' };

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;
// The app's clock: seeded orders run up to 9:55 AM, and each new order lands two minutes after the last.
const FIRST_NEW_ID = 1044;
const orderTime = (id: number) => `10:${String(((id - FIRST_NEW_ID) * 2) % 60).padStart(2, '0')} AM`;

/** "Brew & Bean" — a café order-management app: take orders, track them through the kitchen, see the day's sales. */
export function CafeAppDemo() {
  const [tab, setTab] = useState<Tab>('menu');
  const [category, setCategory] = useState<MenuCategory>('Coffee');
  const [query, setQuery] = useState('');
  const [table, setTable] = useState('T4');
  const [ticket, setTicket] = useState<Record<string, number>>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [orderFilter, setOrderFilter] = useState<'active' | 'done'>('active');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef(0);
  const nextId = useRef(FIRST_NEW_ID);

  const flash = (text: string) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  };

  const setQty = (id: string, qty: number) =>
    setTicket((t) => {
      const next = { ...t };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });

  const ticketItems = Object.entries(ticket).map(([itemId, qty]) => ({ itemId, qty }));
  const ticketCount = ticketItems.reduce((n, l) => n + l.qty, 0);
  const ticketTotal = orderTotal({ items: ticketItems });

  const placeOrder = () => {
    const id = nextId.current++;
    setOrders((o) => [{ id, table, items: ticketItems, status: 'New', time: orderTime(id) }, ...o]);
    setTicket({});
    setSheetOpen(false);
    setOrderFilter('active');
    setTab('orders');
    flash(`Order #${id} sent to kitchen`);
  };

  const advance = (id: number) =>
    setOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, status: orderFlow[Math.min(orderFlow.indexOf(o.status) + 1, orderFlow.length - 1)] } : o)),
    );

  const reset = () => {
    setTab('menu');
    setCategory('Coffee');
    setQuery('');
    setTable('T4');
    setTicket({});
    setSheetOpen(false);
    setOrders(seedOrders);
    setOrderFilter('active');
    nextId.current = FIRST_NEW_ID;
  };

  const activeCount = orders.filter((o) => o.status !== 'Served').length;
  const q = query.trim().toLowerCase();
  const items = menu.filter((m) => (q ? m.name.toLowerCase().includes(q) : m.category === category));

  return (
    <div className="mx-auto w-full max-w-[340px]">
      <PhoneFrame screenClass="bg-[#faf7f2] text-[#2b1d14]" statusClass="bg-[#3b2416] text-white">
        {/* App bar */}
        <div className="shrink-0 bg-[#3b2416] px-4 pt-1 pb-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#e7c9a9]">Brew &amp; Bean · Koregaon Park</p>
              <p className="text-lg font-bold">{tab === 'menu' ? 'New order' : tab === 'orders' ? 'Orders' : 'Today'}</p>
            </div>
            <button type="button" onClick={() => setTab('orders')} aria-label={`${activeCount} active orders`} className="relative rounded-full bg-white/10 p-2">
              <Bell size={18} aria-hidden="true" />
              {activeCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#f59e0b] px-1 text-[10px] font-bold text-[#3b2416]">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
          {tab === 'menu' && (
            <label className="mt-3 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm">
              <Search size={15} aria-hidden="true" className="text-[#e7c9a9]" />
              <span className="sr-only">Search menu</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search menu"
                className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-[#e7c9a9]/70"
              />
            </label>
          )}
        </div>

        {/* Screen content */}
        <div className="relative flex-1 overflow-y-auto overscroll-contain">
          {tab === 'menu' && (
            <div className="px-4 pt-3 pb-24">
              <p className="text-[11px] font-semibold tracking-wide text-[#8a6a52] uppercase">Table</p>
              <div className="no-scrollbar -mx-4 mt-1.5 flex gap-2 overflow-x-auto px-4">
                {tables.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={table === t}
                    onClick={() => setTable(t)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold ring-1 transition-colors ${
                      table === t ? 'bg-[#3b2416] text-white ring-[#3b2416]' : 'bg-white text-[#5c3d2a] ring-[#eadfd3]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {!q && (
                <div role="group" aria-label="Menu category" className="no-scrollbar -mx-4 mt-4 flex gap-4 overflow-x-auto border-b border-[#eadfd3] px-4">
                  {menuCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={category === c}
                      onClick={() => setCategory(c)}
                      className={`shrink-0 border-b-2 pb-2 text-[14px] font-semibold transition-colors ${
                        category === c ? 'border-[#c2410c] text-[#2b1d14]' : 'border-transparent text-[#a08670]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              <ul className="mt-3 space-y-2.5">
                {items.map((m) => {
                  const qty = ticket[m.id] ?? 0;
                  return (
                    <li key={m.id} className="flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-[0_1px_2px_rgb(59_36_22/0.08)] ring-1 ring-[#f0e7dd]">
                      <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#fdf1e4] text-2xl">
                        {m.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-start gap-1.5 text-[14px] leading-tight font-semibold">
                          <span
                            aria-label={m.veg ? 'Vegetarian' : 'Non-vegetarian'}
                            className={`mt-0.5 grid h-3 w-3 shrink-0 place-items-center rounded-[2px] border ${m.veg ? 'border-[#16a34a]' : 'border-[#b91c1c]'}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${m.veg ? 'bg-[#16a34a]' : 'bg-[#b91c1c]'}`} />
                          </span>
                          {m.name}
                        </p>
                        <p className="mt-0.5 text-[13px] font-medium text-[#8a6a52]">{rupees(m.price)}</p>
                      </div>
                      {qty ? (
                        <span className="flex items-center rounded-lg bg-[#c2410c] text-white">
                          <button type="button" onClick={() => setQty(m.id, qty - 1)} aria-label={`Remove one ${m.name}`} className="grid h-8 w-8 place-items-center">
                            <Minus size={14} aria-hidden="true" />
                          </button>
                          <span className="w-4 text-center text-[13px] font-bold">{qty}</span>
                          <button type="button" onClick={() => setQty(m.id, qty + 1)} aria-label={`Add one ${m.name}`} className="grid h-8 w-8 place-items-center">
                            <Plus size={14} aria-hidden="true" />
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setQty(m.id, 1)}
                          className="h-8 rounded-lg px-3.5 text-[13px] font-bold text-[#c2410c] ring-1 ring-[#fdba74] transition-colors hover:bg-[#fff7ed]"
                        >
                          ADD
                        </button>
                      )}
                    </li>
                  );
                })}
                {items.length === 0 && <li className="py-8 text-center text-sm text-[#a08670]">Nothing on the menu matches “{query}”.</li>}
              </ul>
            </div>
          )}

          {tab === 'orders' && (
            <div className="px-4 pt-3 pb-6">
              <div role="group" aria-label="Order filter" className="grid grid-cols-2 rounded-xl bg-[#efe6dc] p-1 text-[13px] font-semibold">
                {(['active', 'done'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={orderFilter === f}
                    onClick={() => setOrderFilter(f)}
                    className={`rounded-lg py-1.5 transition-colors ${orderFilter === f ? 'bg-white text-[#2b1d14] shadow-sm' : 'text-[#8a6a52]'}`}
                  >
                    {f === 'active' ? `Active (${activeCount})` : 'Served'}
                  </button>
                ))}
              </div>
              <ul className="mt-3 space-y-2.5">
                {orders
                  .filter((o) => (orderFilter === 'active' ? o.status !== 'Served' : o.status === 'Served'))
                  .map((o) => (
                    <li key={o.id} className="chat-pop rounded-2xl bg-white p-3.5 ring-1 ring-[#f0e7dd]">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-bold">
                          #{o.id} · {o.table}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyle[o.status]}`}>{o.status}</span>
                      </div>
                      <p className="mt-1 text-[12.5px] leading-snug text-[#5c3d2a]">
                        {o.items.map((l) => `${l.qty}× ${itemById(l.itemId).name}`).join(', ')}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between">
                        <p className="text-[12px] text-[#a08670]">
                          {o.time} · <span className="font-semibold text-[#2b1d14]">{rupees(orderTotal(o))}</span>
                        </p>
                        {nextAction[o.status] && (
                          <button
                            type="button"
                            onClick={() => advance(o.id)}
                            className="flex items-center gap-0.5 rounded-lg bg-[#3b2416] px-2.5 py-1.5 text-[12px] font-semibold text-white"
                          >
                            {nextAction[o.status]}
                            <ChevronRight size={13} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                      <div aria-hidden="true" className="mt-2.5 flex gap-1">
                        {orderFlow.map((s, i) => (
                          <span key={s} className={`h-1 flex-1 rounded-full ${i <= orderFlow.indexOf(o.status) ? 'bg-[#c2410c]' : 'bg-[#efe6dc]'}`} />
                        ))}
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {tab === 'dashboard' && <Dashboard orders={orders} />}
        </div>

        {/* Order bar */}
        {tab === 'menu' && ticketCount > 0 && !sheetOpen && (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="chat-pop absolute inset-x-3 bottom-[76px] z-10 flex items-center justify-between rounded-xl bg-[#c2410c] px-4 py-3 text-white shadow-lg"
          >
            <span className="text-left text-[12px] leading-tight">
              <span className="block font-bold">{ticketCount} item{ticketCount > 1 ? 's' : ''} · {rupees(ticketTotal)}</span>
              <span className="text-[#fed7aa]">Table {table}</span>
            </span>
            <span className="flex items-center gap-0.5 text-[14px] font-bold">
              Review order <ChevronRight size={16} aria-hidden="true" />
            </span>
          </button>
        )}

        {/* Order review sheet */}
        {sheetOpen && (
          <div className="absolute inset-0 z-30 flex flex-col justify-end">
            <button type="button" aria-label="Close order review" onClick={() => setSheetOpen(false)} className="absolute inset-0 bg-black/40" />
            <div role="dialog" aria-label="Review order" className="sheet-up relative rounded-t-3xl bg-white px-4 pt-3 pb-6">
              <span aria-hidden="true" className="mx-auto block h-1 w-10 rounded-full bg-[#e5d9cc]" />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-base font-bold">Order for {table}</p>
                <button type="button" onClick={() => setSheetOpen(false)} aria-label="Close" className="rounded-full p-1 hover:bg-[#f5efe8]">
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <ul className="mt-2 max-h-48 divide-y divide-[#f3ece4] overflow-y-auto">
                {ticketItems.map(({ itemId, qty }) => {
                  const m = itemById(itemId);
                  return (
                    <li key={itemId} className="flex items-center gap-2 py-2 text-[13.5px]">
                      <span aria-hidden="true">{m.emoji}</span>
                      <span className="flex-1">{m.name}</span>
                      <span className="flex items-center rounded-md ring-1 ring-[#eadfd3]">
                        <button type="button" onClick={() => setQty(itemId, qty - 1)} aria-label={`Remove one ${m.name}`} className="grid h-6 w-6 place-items-center">
                          <Minus size={11} aria-hidden="true" />
                        </button>
                        <span className="w-5 text-center text-[12px] font-bold">{qty}</span>
                        <button type="button" onClick={() => setQty(itemId, qty + 1)} aria-label={`Add one ${m.name}`} className="grid h-6 w-6 place-items-center">
                          <Plus size={11} aria-hidden="true" />
                        </button>
                      </span>
                      <span className="w-14 text-right font-semibold">{rupees(m.price * qty)}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 space-y-1 border-t border-[#f3ece4] pt-2 text-[13px]">
                <p className="flex justify-between text-[15px] font-bold"><span>Total</span><span>{rupees(ticketTotal)}</span></p>
                <p className="text-[11px] text-[#a08670]">Menu prices include GST.</p>
              </div>
              <button
                type="button"
                onClick={placeOrder}
                disabled={ticketCount === 0}
                className="mt-4 h-11 w-full rounded-xl bg-[#c2410c] text-sm font-bold text-white transition-colors hover:bg-[#9a3412] disabled:opacity-40"
              >
                Send to kitchen
              </button>
            </div>
          </div>
        )}

        {toast && (
          <p role="status" className="chat-pop absolute top-24 left-1/2 z-40 w-max max-w-[90%] -translate-x-1/2 rounded-full bg-[#2b1d14] px-4 py-2 text-[12.5px] font-medium text-white shadow-lg">
            {toast}
          </p>
        )}

        {/* Bottom navigation */}
        <nav aria-label="App" className="relative z-20 grid shrink-0 grid-cols-3 border-t border-[#eadfd3] bg-white pt-1.5 pb-4">
          {([
            ['menu', 'Menu', UtensilsCrossed],
            ['orders', 'Orders', ClipboardList],
            ['dashboard', 'Dashboard', LayoutDashboard],
          ] as [Tab, string, LucideIcon][]).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              aria-current={tab === id ? 'page' : undefined}
              onClick={() => {
                setTab(id);
                setSheetOpen(false);
              }}
              className={`relative flex flex-col items-center gap-0.5 py-1 text-[11px] font-semibold ${tab === id ? 'text-[#c2410c]' : 'text-[#a08670]'}`}
            >
              <Icon size={20} aria-hidden="true" />
              {label}
              {id === 'orders' && activeCount > 0 && (
                <span className="absolute top-0 left-1/2 ml-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#c2410c] px-1 text-[9px] text-white">{activeCount}</span>
              )}
            </button>
          ))}
        </nav>
      </PhoneFrame>

      <button type="button" onClick={reset} className="mx-auto mt-5 flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white">
        <RotateCcw size={14} aria-hidden="true" />
        Reset app
      </button>
    </div>
  );
}

function Dashboard({ orders }: { orders: Order[] }) {
  const revenue = earlierSales.revenue + orders.reduce((n, o) => n + orderTotal(o), 0);
  const count = earlierSales.orders + orders.length;
  const byStatus = orderFlow.map((s) => ({ s, n: orders.filter((o) => o.status === s).length }));

  const sold = new Map<string, number>();
  for (const o of orders) for (const l of o.items) sold.set(l.itemId, (sold.get(l.itemId) ?? 0) + l.qty);
  const top = [...sold.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxSold = top[0]?.[1] ?? 1;

  // Hourly sales (mock), ending with the current hour's live total.
  const hours = [['8', 1450], ['9', 2380], ['10', 3120], ['11', 1470]] as const;
  const maxHour = Math.max(...hours.map(([, v]) => v));

  return (
    <div className="space-y-3 px-4 pt-3 pb-6">
      <div className="grid grid-cols-2 gap-2.5">
        <Stat label="Revenue" value={rupees(revenue)} hint="+12% vs last week" />
        <Stat label="Orders" value={String(count)} hint={`Avg ${rupees(Math.round(revenue / count))}`} />
      </div>

      <div className="rounded-2xl bg-white p-3.5 ring-1 ring-[#f0e7dd]">
        <p className="text-[13px] font-bold">Sales by hour</p>
        <div className="mt-3 flex h-24 items-end gap-3">
          {hours.map(([h, v], i) => (
            <div key={h} className="flex flex-1 flex-col items-center gap-1">
              <span className={`w-full rounded-t-md ${i === hours.length - 1 ? 'bg-[#c2410c]' : 'bg-[#fdba74]'}`} style={{ height: `${(v / maxHour) * 80}px` }} />
              <span className="text-[10px] text-[#a08670]">{h} AM</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-3.5 ring-1 ring-[#f0e7dd]">
        <p className="text-[13px] font-bold">Kitchen right now</p>
        <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-center">
          {byStatus.map(({ s, n }) => (
            <div key={s} className={`rounded-lg py-2 ${statusStyle[s]}`}>
              <p className="text-base font-bold">{n}</p>
              <p className="text-[10px] font-semibold">{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-3.5 ring-1 ring-[#f0e7dd]">
        <p className="text-[13px] font-bold">Top items today</p>
        <ul className="mt-2 space-y-2">
          {top.map(([id, n]) => {
            const m = itemById(id);
            return (
              <li key={id} className="text-[12.5px]">
                <p className="flex justify-between">
                  <span>
                    {m.emoji} {m.name}
                  </span>
                  <span className="font-semibold">{n} sold</span>
                </p>
                <span className="mt-1 block h-1.5 rounded-full bg-[#f3ece4]">
                  <span className="block h-full rounded-full bg-[#c2410c]" style={{ width: `${(n / maxSold) * 100}%` }} />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-[#3b2416] p-3.5 text-white">
      <p className="text-[11px] text-[#e7c9a9]">{label}</p>
      <p className="mt-0.5 text-xl font-bold">{value}</p>
      <p className="mt-0.5 text-[10.5px] text-[#fdba74]">{hint}</p>
    </div>
  );
}
