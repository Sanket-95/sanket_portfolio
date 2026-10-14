import { useState, type FormEvent } from 'react';
import { Bath, BedDouble, MapPin, MessageCircle, RotateCcw, Search, SendHorizontal, Sparkles, X } from 'lucide-react';
import { BrowserFrame } from '@/components/demo/DeviceFrames';
import { websiteBot } from '@/data/chatbots';
import { formatText, useAutoScroll, useChatBot } from './useChatBot';

/** A custom website chat widget running on a dummy real-estate site inside a browser frame. */
export function WebsiteBotDemo() {
  const { messages, options, typing, choose, send, reset } = useChatBot(websiteBot);
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState('');
  const logRef = useAutoScroll<HTMLDivElement>([messages.length, typing, options.length, open]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
    setDraft('');
  };

  return (
    <div className="w-full">
      <BrowserFrame url="urbannest.example" bodyClass="h-[600px] max-h-[78vh] min-h-[480px] bg-[#f7f5f2] text-[#1f2937]">
        {/* Dummy website */}
          <div aria-hidden="true" className="h-full overflow-hidden">
            <header className="flex items-center justify-between bg-white px-5 py-3.5 shadow-sm">
              <span className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-[#1f2937]">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-[#f97316] to-[#e11d48] text-xs text-white">U</span>
                UrbanNest
              </span>
              <nav className="hidden gap-5 text-[13px] font-medium text-[#4b5563] sm:flex">
                <span>Buy</span>
                <span>Rent</span>
                <span>Sell</span>
                <span>Agents</span>
              </nav>
              <span className="rounded-full bg-[#1f2937] px-3.5 py-1.5 text-xs font-semibold text-white">Sign in</span>
            </header>

            <section className="relative overflow-hidden bg-gradient-to-br from-[#fde68a] via-[#fdba74] to-[#fb7185] px-5 pt-8 pb-10 sm:px-8">
              <div className="absolute -right-10 -bottom-16 h-56 w-56 rounded-full bg-white/25" />
              <p className="relative text-[11px] font-semibold tracking-widest text-[#7c2d12] uppercase">Find your next home</p>
              <h3 className="relative mt-2 max-w-sm text-2xl leading-tight font-bold text-[#1f2937] sm:text-3xl">Homes you’ll love, in neighbourhoods you’ll love more.</h3>
              <div className="relative mt-5 flex max-w-md items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] text-[#6b7280] shadow-md">
                <Search size={15} />
                <span className="flex-1">Search Baner, Wakad, Kharadi…</span>
                <span className="rounded-full bg-[#e11d48] px-3 py-1 text-xs font-semibold text-white">Search</span>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 px-5 py-6 sm:grid-cols-3 sm:px-8">
              {[
                { name: 'Skyline Residency', place: 'Baner', price: '₹78 L', bed: 2, from: 'from-[#a5b4fc]', to: 'to-[#818cf8]' },
                { name: 'Green Acres', place: 'Wakad', price: '₹96 L', bed: 3, from: 'from-[#86efac]', to: 'to-[#34d399]' },
                { name: 'Riverside Lofts', place: 'Kharadi', price: '₹1.2 Cr', bed: 3, from: 'from-[#fcd34d]', to: 'to-[#fb923c]' },
              ].map((h) => (
                <div key={h.name} className="overflow-hidden rounded-xl bg-white shadow-sm">
                  <div className={`relative h-24 bg-gradient-to-br ${h.from} ${h.to}`}>
                    <div className="absolute bottom-0 left-1/2 h-14 w-20 -translate-x-1/2 rounded-t-md bg-white/50" />
                    <div className="absolute bottom-14 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[48px] border-b-[26px] border-x-transparent border-b-white/60" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold">{h.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6b7280]">
                      <MapPin size={11} /> {h.place}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-[#e11d48]">{h.price}</span>
                      <span className="flex items-center gap-2 text-[#6b7280]">
                        <span className="flex items-center gap-0.5"><BedDouble size={12} /> {h.bed}</span>
                        <span className="flex items-center gap-0.5"><Bath size={12} /> 2</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* Chat widget */}
          {open && (
            <div className="chat-pop absolute inset-x-3 top-3 bottom-20 flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-10px_rgb(15_23_42/0.45)] ring-1 ring-black/5 sm:inset-x-auto sm:top-auto sm:right-5 sm:bottom-24 sm:h-[460px] sm:w-[340px]">
              <div className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-[#6d28d9] to-[#4f46e5] px-4 py-3 text-white">
                <span aria-hidden="true" className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20">
                  <Sparkles size={18} />
                  <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-[#4ade80] ring-2 ring-[#5b2ee0]" />
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="text-[15px] font-semibold">Leo</p>
                  <p className="text-xs text-white/75">{typing ? 'Leo is typing…' : 'UrbanNest assistant · replies instantly'}</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Minimize chat" className="rounded-full p-1.5 transition-colors hover:bg-white/15">
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div
                ref={logRef}
                role="log"
                aria-live="polite"
                aria-label="Website chat with Leo"
                className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[#f8fafc] px-3.5 py-4"
              >
                {messages.map((m) =>
                  m.from === 'bot' ? (
                    <div key={m.id} className="chat-pop flex items-end gap-2">
                      <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#6d28d9] to-[#4f46e5] text-white">
                        <Sparkles size={13} />
                      </span>
                      <div className="max-w-[80%]">
                        <p className="rounded-2xl rounded-bl-md bg-white px-3.5 py-2 text-[13.5px] leading-snug whitespace-pre-line text-[#1f2937] shadow-sm ring-1 ring-black/5">
                          {formatText(m.text)}
                        </p>
                        <p className="mt-1 pl-1 text-[10px] text-[#94a3b8]">Leo · {m.time}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="chat-pop flex flex-col items-end">
                      <p className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-[#6d28d9] to-[#4f46e5] px-3.5 py-2 text-[13.5px] leading-snug text-white">
                        {m.text}
                      </p>
                      <p className="mt-1 pr-1 text-[10px] text-[#94a3b8]">You · {m.time}</p>
                    </div>
                  ),
                )}

                {typing && (
                  <div className="flex items-end gap-2" aria-label="Leo is typing">
                    <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#6d28d9] to-[#4f46e5] text-white">
                      <Sparkles size={13} />
                    </span>
                    <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm ring-1 ring-black/5">
                      <span className="typing-dot bg-[#a78bfa]" />
                      <span className="typing-dot bg-[#a78bfa] [animation-delay:150ms]" />
                      <span className="typing-dot bg-[#a78bfa] [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                {!typing && options.length > 0 && (
                  <div className="chat-pop flex flex-wrap gap-2 pl-9">
                    {options.map((o) => (
                      <button
                        key={o.label}
                        type="button"
                        onClick={() => choose(o)}
                        className="rounded-full border border-[#c4b5fd] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#5b21b6] transition-colors hover:bg-[#ede9fe] active:bg-[#ddd6fe]"
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={onSubmit} className="flex shrink-0 items-center gap-2 border-t border-[#e2e8f0] bg-white px-3 py-2.5">
                <label htmlFor="web-bot-input" className="sr-only">
                  Message Leo
                </label>
                <input
                  id="web-bot-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type your message…"
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-full bg-[#f1f5f9] px-4 py-2 text-[14px] text-[#1f2937] outline-none placeholder:text-[#94a3b8] focus:ring-2 focus:ring-[#c4b5fd]"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#4f46e5] text-white transition-colors hover:bg-[#4338ca]"
                >
                  <SendHorizontal size={16} aria-hidden="true" />
                </button>
              </form>
              <p className="shrink-0 bg-white pb-1.5 text-center text-[10px] text-[#94a3b8]">Built by Sanket Sathe</p>
            </div>
          )}

          {/* Launcher */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close chat' : 'Open chat'}
            aria-expanded={open}
            className="absolute right-4 bottom-4 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#6d28d9] to-[#4f46e5] text-white shadow-lg transition-transform hover:scale-105 sm:right-5 sm:bottom-5"
          >
            {open ? <X size={24} aria-hidden="true" /> : <MessageCircle size={24} aria-hidden="true" />}
            {!open && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#f43f5e] ring-2 ring-white" />}
          </button>
      </BrowserFrame>

      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="mx-auto mt-5 flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
      >
        <RotateCcw size={14} aria-hidden="true" />
        Restart chat
      </button>
    </div>
  );
}
