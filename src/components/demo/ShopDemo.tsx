import { useMemo, useRef, useState } from 'react';
import {
  Activity, ArrowLeft, Backpack, CircleCheck, Coffee, Footprints, Glasses, Headphones, Heart, Lamp, Minus, Music, Plus,
  RotateCcw, Search, Shirt, ShieldCheck, ShoppingBag, Speaker, Sprout, Star, Trash2, Truck, Watch, X,
  type LucideIcon,
} from 'lucide-react';
import { formatINR, products, shopCategories, type Product, type ShopCategory } from '@/data/shop';
import { BrowserFrame } from './DeviceFrames';

const icons: Record<Product['icon'], LucideIcon> = {
  headphones: Headphones, speaker: Speaker, earbuds: Music, watch: Watch, glasses: Glasses, fitness: Activity,
  shirt: Shirt, shoe: Footprints, backpack: Backpack, lamp: Lamp, coffee: Coffee, plant: Sprout,
};

const FREE_DELIVERY = 999;
const DELIVERY_FEE = 49;
const COUPON = 'WELCOME10';

type Sort = 'popular' | 'low' | 'high' | 'rating';
type CartStep = 'cart' | 'checkout' | 'done';

/** A single-page store: browse, filter, wishlist, cart, coupon and a dummy checkout. All data is local. */
export function ShopDemo() {
  const [category, setCategory] = useState<ShopCategory | 'All'>('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('popular');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep] = useState<CartStep>('cart');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [payment, setPayment] = useState<'upi' | 'cod'>('upi');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>(0);
  const scroller = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => (category === 'All' || p.category === category) && (!q || p.name.toLowerCase().includes(q)));
    const sorted = [...list];
    if (sort === 'low') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'high') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    if (sort === 'popular') sorted.sort((a, b) => b.reviews - a.reviews);
    return sorted;
  }, [category, query, sort]);

  const lines = products.filter((p) => cart[p.id]).map((p) => ({ product: p, qty: cart[p.id] }));
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.qty * l.product.price, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY ? 0 : DELIVERY_FEE;
  const total = subtotal - discount + delivery;

  const flash = (text: string) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  };

  const setQty = (id: string, qty: number) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });

  const add = (p: Product) => {
    setQty(p.id, (cart[p.id] ?? 0) + 1);
    flash(`Added “${p.name}” to cart`);
  };

  const toggleWish = (id: string) => setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));

  const openCart = () => {
    setStep('cart');
    setCartOpen(true);
  };

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === COUPON) {
      setCouponApplied(true);
      flash('Coupon applied — 10% off');
    } else flash('Invalid coupon. Try WELCOME10');
  };

  const placeOrder = () => {
    setStep('done');
    setCart({});
    setCouponApplied(false);
    setCoupon('');
  };

  const reset = () => {
    setCategory('All');
    setQuery('');
    setSort('popular');
    setCart({});
    setWishlist([]);
    setCartOpen(false);
    setStep('cart');
    setCoupon('');
    setCouponApplied(false);
    scroller.current?.scrollTo({ top: 0 });
  };

  return (
    <div>
      <BrowserFrame url="kartly.example" bodyClass="h-[760px] max-h-[85vh] min-h-[520px] bg-[#f8fafc] text-[#0f172a]">
        <div ref={scroller} className="h-full overflow-y-auto overscroll-contain">
          {/* Store header */}
          <header className="sticky top-0 z-20 border-b border-[#e2e8f0] bg-white/95 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
              <span className="flex shrink-0 items-center gap-1.5 text-lg font-extrabold tracking-tight">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0f766e] text-white">
                  <ShoppingBag size={16} aria-hidden="true" />
                </span>
                <span className="hidden sm:inline">Kartly</span>
              </span>
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[#f1f5f9] px-3.5 py-2 text-sm focus-within:ring-2 focus-within:ring-[#5eead4]">
                <Search size={15} aria-hidden="true" className="shrink-0 text-[#64748b]" />
                <span className="sr-only">Search products</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products"
                  className="min-w-0 flex-1 bg-transparent text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
                />
              </label>
              <span className="hidden items-center gap-1 text-sm font-medium text-[#475569] md:flex">
                <Heart size={16} aria-hidden="true" className={wishlist.length ? 'fill-[#f43f5e] text-[#f43f5e]' : ''} />
                {wishlist.length}
                <span className="sr-only">items in wishlist</span>
              </span>
              <button
                type="button"
                onClick={openCart}
                className="relative flex shrink-0 items-center gap-2 rounded-full bg-[#0f172a] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e293b]"
              >
                <ShoppingBag size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Cart</span>
                <span aria-label={`${count} items`} className="grid h-5 min-w-5 place-items-center rounded-full bg-[#14b8a6] px-1 text-[11px]">
                  {count}
                </span>
              </button>
            </div>
          </header>

          {/* Hero */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[#134e4a] via-[#0f766e] to-[#0d9488] px-5 py-9 text-white sm:px-8 sm:py-12">
            <div aria-hidden="true" className="absolute -top-16 -right-10 h-64 w-64 rounded-full bg-white/10" />
            <div aria-hidden="true" className="absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-[#5eead4]/20" />
            <p className="relative text-xs font-semibold tracking-widest text-[#99f6e4] uppercase">Festive sale · Up to 40% off</p>
            <h3 className="relative mt-2 max-w-md text-2xl leading-tight font-bold sm:text-4xl">Everyday gear you’ll actually love.</h3>
            <p className="relative mt-3 max-w-md text-sm text-[#ccfbf1]">
              Use code <strong className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-white">{COUPON}</strong> for an extra 10% off your first order.
            </p>
            <div className="relative mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#ccfbf1]">
              <span className="flex items-center gap-1.5"><Truck size={14} aria-hidden="true" /> Free delivery over {formatINR(FREE_DELIVERY)}</span>
              <span className="flex items-center gap-1.5"><RotateCcw size={14} aria-hidden="true" /> 7-day returns</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} aria-hidden="true" /> Secure checkout</span>
            </div>
          </section>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-6 sm:px-6">
            <div role="group" aria-label="Category" className="flex flex-wrap gap-2">
              {(['All', ...shopCategories] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={category === c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    category === c ? 'bg-[#0f172a] text-white' : 'bg-white text-[#334155] ring-1 ring-[#e2e8f0] hover:bg-[#f1f5f9]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-[13px] text-[#475569]">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-lg bg-white px-2.5 py-1.5 text-[13px] text-[#0f172a] ring-1 ring-[#e2e8f0] outline-none [&>option]:bg-white [&>option]:text-[#0f172a]"
              >
                <option value="popular">Popularity</option>
                <option value="rating">Top rated</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>

          {/* Products */}
          <ul className="grid grid-cols-2 gap-3 px-4 py-5 sm:grid-cols-3 sm:gap-4 sm:px-6 lg:grid-cols-4">
            {visible.map((p) => {
              const Icon = icons[p.icon];
              const wished = wishlist.includes(p.id);
              const inCart = cart[p.id] ?? 0;
              return (
                <li key={p.id} className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-[#e2e8f0] transition-shadow hover:shadow-lg">
                  <div className={`relative grid aspect-square place-items-center bg-gradient-to-br ${p.tint}`}>
                    <Icon size={56} strokeWidth={1.4} aria-hidden="true" className="text-[#0f172a]/70" />
                    {p.badge && (
                      <span className="absolute top-2 left-2 rounded-md bg-[#0f172a] px-1.5 py-0.5 text-[10px] font-semibold text-white">{p.badge}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleWish(p.id)}
                      aria-pressed={wished}
                      aria-label={`${wished ? 'Remove' : 'Add'} ${p.name} ${wished ? 'from' : 'to'} wishlist`}
                      className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm transition-transform hover:scale-110"
                    >
                      <Heart size={15} aria-hidden="true" className={wished ? 'fill-[#f43f5e] text-[#f43f5e]' : 'text-[#475569]'} />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="text-[11px] font-medium text-[#64748b]">{p.category}</p>
                    <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-snug font-semibold">{p.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-[#64748b]">
                      <Star size={12} aria-hidden="true" className="fill-[#f59e0b] text-[#f59e0b]" />
                      <span className="font-semibold text-[#0f172a]">{p.rating}</span> ({p.reviews.toLocaleString('en-IN')})
                    </p>
                    <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
                      <span className="text-[15px] font-bold">{formatINR(p.price)}</span>
                      {p.mrp && <s className="text-[11px] text-[#94a3b8]">{formatINR(p.mrp)}</s>}
                    </p>
                    {inCart ? (
                      <div className="mt-auto flex items-center justify-between rounded-lg bg-[#f0fdfa] pt-0 ring-1 ring-[#99f6e4]">
                        <button type="button" onClick={() => setQty(p.id, inCart - 1)} aria-label={`Remove one ${p.name}`} className="grid h-8 w-9 place-items-center text-[#0f766e]">
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span className="text-sm font-semibold text-[#0f766e]">{inCart}</span>
                        <button type="button" onClick={() => setQty(p.id, inCart + 1)} aria-label={`Add one ${p.name}`} className="grid h-8 w-9 place-items-center text-[#0f766e]">
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => add(p)}
                        className="mt-auto h-8 rounded-lg bg-[#0f766e] text-[13px] font-semibold text-white transition-colors hover:bg-[#115e59]"
                      >
                        Add to cart
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {visible.length === 0 && <p className="px-6 pb-10 text-center text-sm text-[#64748b]">No products match “{query}”.</p>}

          <footer className="mt-4 border-t border-[#e2e8f0] bg-white px-6 py-6 text-center text-xs text-[#94a3b8]">
            © Kartly — a demo store by Sanket Sathe. Products and prices are dummy data.
          </footer>
        </div>

        {/* Toast */}
        {toast && (
          <p role="status" className="chat-pop absolute bottom-4 left-1/2 z-40 w-max max-w-[90%] -translate-x-1/2 rounded-full bg-[#0f172a] px-4 py-2 text-center text-[13px] text-white shadow-lg">
            {toast}
          </p>
        )}

        {/* Cart drawer */}
        {cartOpen && (
          <div className="absolute inset-0 z-30 flex justify-end">
            <button type="button" aria-label="Close cart" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-[#0f172a]/40" />
            <aside aria-label="Shopping cart" className="drawer-in relative flex h-full w-full max-w-[380px] flex-col bg-white shadow-2xl">
              <div className="flex items-center gap-2 border-b border-[#e2e8f0] px-4 py-3.5">
                {step === 'checkout' && (
                  <button type="button" onClick={() => setStep('cart')} aria-label="Back to cart" className="rounded-full p-1 hover:bg-[#f1f5f9]">
                    <ArrowLeft size={18} aria-hidden="true" />
                  </button>
                )}
                <p className="flex-1 text-base font-bold">{step === 'checkout' ? 'Checkout' : step === 'done' ? 'Order placed' : `Your cart (${count})`}</p>
                <button type="button" onClick={() => setCartOpen(false)} aria-label="Close cart" className="rounded-full p-1 hover:bg-[#f1f5f9]">
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {step === 'done' ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                  <span className="chat-pop grid h-16 w-16 place-items-center rounded-full bg-[#ccfbf1] text-[#0f766e]">
                    <CircleCheck size={34} aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-lg font-bold">Thank you for your order!</p>
                  <p className="mt-1 text-sm text-[#64748b]">
                    Order <strong className="text-[#0f172a]">#KRT-58213</strong> is confirmed and will arrive in 3–5 days.
                  </p>
                  <button type="button" onClick={() => setCartOpen(false)} className="mt-6 rounded-lg bg-[#0f172a] px-5 py-2.5 text-sm font-semibold text-white">
                    Continue shopping
                  </button>
                </div>
              ) : lines.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-[#64748b]">
                  <ShoppingBag size={40} strokeWidth={1.4} aria-hidden="true" />
                  <p className="mt-3 text-sm">Your cart is empty.</p>
                  <button type="button" onClick={() => setCartOpen(false)} className="mt-4 text-sm font-semibold text-[#0f766e]">
                    Browse products
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-4 py-3">
                    {step === 'cart' ? (
                      <>
                        <FreeDeliveryBar subtotal={subtotal} />
                        <ul className="mt-3 divide-y divide-[#f1f5f9]">
                          {lines.map(({ product: p, qty }) => {
                            const Icon = icons[p.icon];
                            return (
                              <li key={p.id} className="flex gap-3 py-3">
                                <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${p.tint}`}>
                                  <Icon size={26} strokeWidth={1.5} aria-hidden="true" className="text-[#0f172a]/70" />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[13.5px] font-semibold">{p.name}</p>
                                  <p className="text-[13px] text-[#64748b]">{formatINR(p.price)}</p>
                                  <div className="mt-1.5 flex items-center gap-2">
                                    <span className="flex items-center rounded-md ring-1 ring-[#e2e8f0]">
                                      <button type="button" onClick={() => setQty(p.id, qty - 1)} aria-label={`Remove one ${p.name}`} className="grid h-7 w-7 place-items-center">
                                        <Minus size={12} aria-hidden="true" />
                                      </button>
                                      <span className="w-6 text-center text-[13px] font-semibold">{qty}</span>
                                      <button type="button" onClick={() => setQty(p.id, qty + 1)} aria-label={`Add one ${p.name}`} className="grid h-7 w-7 place-items-center">
                                        <Plus size={12} aria-hidden="true" />
                                      </button>
                                    </span>
                                    <button type="button" onClick={() => setQty(p.id, 0)} aria-label={`Remove ${p.name}`} className="ml-auto rounded p-1 text-[#94a3b8] hover:text-[#e11d48]">
                                      <Trash2 size={15} aria-hidden="true" />
                                    </button>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                        <div className="mt-2 flex gap-2">
                          <label htmlFor="shop-coupon" className="sr-only">Coupon code</label>
                          <input
                            id="shop-coupon"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                            disabled={couponApplied}
                            placeholder={couponApplied ? `${COUPON} applied` : 'Coupon code'}
                            className="min-w-0 flex-1 rounded-lg bg-[#f1f5f9] px-3 py-2 text-[13px] uppercase outline-none placeholder:normal-case placeholder:text-[#94a3b8] disabled:text-[#0f766e]"
                          />
                          <button type="button" onClick={applyCoupon} disabled={couponApplied} className="rounded-lg px-3 text-[13px] font-semibold text-[#0f766e] ring-1 ring-[#99f6e4] disabled:opacity-50">
                            Apply
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold tracking-wide text-[#64748b] uppercase">Deliver to</p>
                          <div className="mt-1.5 rounded-lg p-3 text-[13px] ring-1 ring-[#e2e8f0]">
                            <p className="font-semibold">Demo Customer</p>
                            <p className="text-[#475569]">221, Lake View Apartments, FC Road, Pune 411004</p>
                          </div>
                        </div>
                        <fieldset>
                          <legend className="text-xs font-semibold tracking-wide text-[#64748b] uppercase">Payment</legend>
                          <div className="mt-1.5 space-y-2">
                            {([['upi', 'UPI', 'Pay with any UPI app'], ['cod', 'Cash on delivery', 'Pay when it arrives']] as const).map(([v, label, hint]) => (
                              <label key={v} className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 text-[13px] ring-1 ${payment === v ? 'bg-[#f0fdfa] ring-[#14b8a6]' : 'ring-[#e2e8f0]'}`}>
                                <input type="radio" name="shop-payment" value={v} checked={payment === v} onChange={() => setPayment(v)} className="accent-[#0f766e]" />
                                <span>
                                  <span className="block font-semibold">{label}</span>
                                  <span className="text-[#64748b]">{hint}</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                        <p className="text-[11px] text-[#94a3b8]">Demo checkout — no payment is taken and no order is sent.</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#e2e8f0] px-4 py-3.5 text-[13px]">
                    <dl className="space-y-1">
                      <div className="flex justify-between"><dt className="text-[#64748b]">Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
                      {discount > 0 && <div className="flex justify-between text-[#0f766e]"><dt>Coupon ({COUPON})</dt><dd>−{formatINR(discount)}</dd></div>}
                      <div className="flex justify-between"><dt className="text-[#64748b]">Delivery</dt><dd>{delivery ? formatINR(delivery) : 'Free'}</dd></div>
                      <div className="flex justify-between pt-1 text-base font-bold"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
                    </dl>
                    <button
                      type="button"
                      onClick={step === 'cart' ? () => setStep('checkout') : placeOrder}
                      className="mt-3 h-11 w-full rounded-lg bg-[#0f766e] text-sm font-semibold text-white transition-colors hover:bg-[#115e59]"
                    >
                      {step === 'cart' ? 'Proceed to checkout' : `Place order · ${formatINR(total)}`}
                    </button>
                  </div>
                </>
              )}
            </aside>
          </div>
        )}
      </BrowserFrame>

      <button type="button" onClick={reset} className="mx-auto mt-5 flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white">
        <RotateCcw size={14} aria-hidden="true" />
        Reset store
      </button>
    </div>
  );
}

function FreeDeliveryBar({ subtotal }: { subtotal: number }) {
  const pct = Math.min(100, (subtotal / FREE_DELIVERY) * 100);
  return (
    <div className="rounded-lg bg-[#f0fdfa] p-3 text-[12.5px] text-[#115e59]">
      <p className="flex items-center gap-1.5">
        <Truck size={14} aria-hidden="true" />
        {subtotal >= FREE_DELIVERY ? 'You’ve unlocked free delivery!' : `Add ${formatINR(FREE_DELIVERY - subtotal)} more for free delivery`}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ccfbf1]">
        <div className="h-full rounded-full bg-[#14b8a6] transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
