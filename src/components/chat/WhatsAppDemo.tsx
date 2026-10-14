import { useState, type FormEvent } from 'react';
import { ArrowLeft, Check, CheckCheck, MoreVertical, Paperclip, Phone, RotateCcw, SendHorizontal, Smile, Video } from 'lucide-react';
import { whatsappBot } from '@/data/chatbots';
import { PhoneFrame } from '@/components/demo/DeviceFrames';
import { formatText, useAutoScroll, useChatBot } from './useChatBot';

/** A WhatsApp-style bot running inside a phone mockup. */
export function WhatsAppDemo() {
  const { messages, options, typing, choose, send, reset } = useChatBot(whatsappBot);
  const [draft, setDraft] = useState('');
  const logRef = useAutoScroll<HTMLDivElement>([messages.length, typing, options.length]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
    setDraft('');
  };

  return (
    <div className="mx-auto w-full max-w-[340px]">
      <PhoneFrame screenClass="bg-[#efeae2] text-[#111b21]" statusClass="bg-[#008069] text-white">
          {/* Chat header */}
          <div className="flex shrink-0 items-center gap-2 bg-[#008069] px-2 pt-1 pb-2.5 text-white">
            <ArrowLeft size={20} aria-hidden="true" />
            <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dff6ee] text-sm font-bold text-[#008069]">
              M
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="flex items-center gap-1 truncate text-[15px] font-semibold">
                CareWell Clinic
                <span aria-label="Verified business" className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-[#25d366]">
                  <Check size={9} strokeWidth={4} aria-hidden="true" />
                </span>
              </p>
              <p className="text-xs text-white/80">{typing ? 'typing…' : 'Meera · online'}</p>
            </div>
            <Video size={19} aria-hidden="true" className="mx-1" />
            <Phone size={17} aria-hidden="true" className="mx-1" />
            <MoreVertical size={19} aria-hidden="true" />
          </div>

          {/* Messages */}
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="WhatsApp conversation with Meera"
            className="wa-wallpaper flex-1 space-y-1.5 overflow-y-auto overscroll-contain px-3 py-3"
          >
            <p className="mx-auto mb-2 w-fit rounded-lg bg-white/90 px-3 py-1 text-[11px] font-medium text-[#54656f] shadow-sm">TODAY</p>
            <p className="mx-auto mb-3 max-w-[90%] rounded-lg bg-[#fff5c4] px-3 py-1.5 text-center text-[11px] leading-snug text-[#54656f] shadow-sm">
              🔒 This business uses a secure service to manage this chat. Demo only — no messages are sent.
            </p>

            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`chat-pop relative max-w-[82%] rounded-lg px-2.5 pt-1.5 pb-1 text-[14px] leading-snug whitespace-pre-line shadow-[0_1px_0.5px_rgb(11_20_26/0.13)] ${
                    m.from === 'user' ? 'rounded-tr-none bg-[#d9fdd3]' : 'rounded-tl-none bg-white'
                  }`}
                >
                  {formatText(m.text)}
                  <span className="float-right mt-1.5 ml-2 flex translate-y-0.5 items-center gap-0.5 text-[10px] text-[#667781]">
                    {m.time}
                    {m.from === 'user' && <CheckCheck size={14} aria-label="Read" className="text-[#53bdeb]" />}
                  </span>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-lg rounded-tl-none bg-white px-3 py-3 shadow-sm" aria-label="Meera is typing">
                  <span className="typing-dot bg-[#8696a0]" />
                  <span className="typing-dot bg-[#8696a0] [animation-delay:150ms]" />
                  <span className="typing-dot bg-[#8696a0] [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* WhatsApp interactive reply buttons */}
            {!typing && options.length > 0 && (
              <div className="chat-pop flex max-w-[82%] flex-col gap-px overflow-hidden rounded-lg shadow-[0_1px_0.5px_rgb(11_20_26/0.13)]">
                {options.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => choose(o)}
                    className="bg-white px-3 py-2 text-center text-[14px] font-medium text-[#008069] transition-colors hover:bg-[#f5f6f6] active:bg-[#e9edef]"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <form onSubmit={onSubmit} className="flex shrink-0 items-center gap-1.5 bg-transparent px-2 pt-1 pb-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
              <Smile size={20} aria-hidden="true" className="shrink-0 text-[#54656f]" />
              <label htmlFor="wa-input" className="sr-only">
                Message Meera
              </label>
              <input
                id="wa-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[#111b21] outline-none placeholder:text-[#8696a0]"
              />
              <Paperclip size={18} aria-hidden="true" className="shrink-0 text-[#54656f]" />
            </div>
            <button
              type="submit"
              aria-label="Send"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#00a884] text-white transition-colors hover:bg-[#008f72]"
            >
              <SendHorizontal size={19} aria-hidden="true" />
            </button>
          </form>
      </PhoneFrame>

      <button
        type="button"
        onClick={reset}
        className="mx-auto mt-5 flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
      >
        <RotateCcw size={14} aria-hidden="true" />
        Restart chat
      </button>
    </div>
  );
}
