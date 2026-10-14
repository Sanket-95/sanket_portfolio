import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';

/** Phone mockup. `screenClass` sets the app's background; `statusClass` colours the status bar to match its header. */
export function PhoneFrame({
  children,
  screenClass = 'bg-white',
  statusClass = 'bg-white text-[#111827]',
}: {
  children: ReactNode;
  screenClass?: string;
  statusClass?: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[340px] rounded-[2.75rem] border border-white/15 bg-[#0b0b0f] p-2.5 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] ring-1 ring-black">
      <span aria-hidden="true" className="absolute top-24 -left-[3px] h-10 w-[3px] rounded-l bg-white/15" />
      <span aria-hidden="true" className="absolute top-36 -left-[3px] h-14 w-[3px] rounded-l bg-white/15" />
      <span aria-hidden="true" className="absolute top-28 -right-[3px] h-16 w-[3px] rounded-r bg-white/15" />

      <div className={`relative flex h-[640px] max-h-[80vh] min-h-[500px] flex-col overflow-hidden rounded-[2.2rem] font-sans ${screenClass}`}>
        <div aria-hidden="true" className={`relative flex h-8 shrink-0 items-center justify-between px-6 text-[11px] font-semibold ${statusClass}`}>
          <span>10:00</span>
          <span className="absolute top-1.5 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <span className="flex items-end gap-px">
              {[3, 5, 7, 9].map((h) => (
                <span key={h} className="w-[3px] rounded-sm bg-current" style={{ height: h }} />
              ))}
            </span>
            <span className="ml-1 h-2.5 w-5 rounded-[3px] border border-current p-px">
              <span className="block h-full w-3/4 rounded-[1px] bg-current" />
            </span>
          </span>
        </div>
        {children}
        <span aria-hidden="true" className="pointer-events-none absolute bottom-1 left-1/2 z-50 h-1 w-28 -translate-x-1/2 rounded-full bg-black/70" />
      </div>
    </div>
  );
}

/** Desktop browser window mockup with traffic lights and an address bar. */
export function BrowserFrame({ url, children, bodyClass = '' }: { url: string; children: ReactNode; bodyClass?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#1e1f24] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]">
      <div className="flex items-center gap-3 border-b border-black/40 px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-black/30 px-3 py-1 text-xs text-slate-300">
          <Lock size={11} aria-hidden="true" className="shrink-0 text-slate-400" />
          <span className="truncate">{url}</span>
        </span>
      </div>
      <div className={`relative overflow-hidden font-sans ${bodyClass}`}>{children}</div>
    </div>
  );
}

/** Label, heading and blurb above a demo mockup. */
export function DemoIntro({ icon, label, title, text, align = 'responsive' }: { icon: ReactNode; label: string; title: string; text: string; align?: 'responsive' | 'left' }) {
  const center = align === 'responsive' ? 'text-center lg:text-left' : '';
  return (
    <div className={`mb-8 ${center}`}>
      <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-accent-soft uppercase">
        {icon}
        {label}
      </p>
      <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
      <p className={`mt-2 max-w-md text-[15px] leading-relaxed text-muted ${align === 'responsive' ? 'mx-auto lg:mx-0' : ''}`}>{text}</p>
    </div>
  );
}
