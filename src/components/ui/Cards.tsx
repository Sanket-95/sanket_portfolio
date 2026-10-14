// The link's ::after covers the whole card, so a click anywhere on it follows the link.
export const cardLinkClass =
  "mt-auto inline-flex items-center gap-1.5 pt-7 text-sm font-semibold text-white transition-colors group-hover:text-accent-soft after:absolute after:inset-0 after:rounded-2xl after:content-['']";

export const cardClass =
  'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel/70 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/40';

/** Small outlined labels under a card's summary. */
export function Tags({ items, label = 'Highlights' }: { items: readonly string[]; label?: string }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-2" aria-label={label}>
      {items.map((h) => (
        <li key={h} className="rounded-md border border-line bg-ink/60 px-2.5 py-1 text-xs font-medium text-slate-300">
          {h}
        </li>
      ))}
    </ul>
  );
}

/** A screenshot under a small browser address bar. Decorative: the card's heading names the page. */
export function BrowserPreview({ address, image, aspect }: { address: string; image: string; aspect: string }) {
  return (
    <div aria-hidden="true" className="relative border-b border-line bg-ink">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <span className="flex-1 truncate rounded-md bg-white/[0.05] px-3 py-1 text-[11px] text-slate-400">{address}</span>
      </div>
      <div className={`relative overflow-hidden bg-panel ${aspect}`}>
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          width={960}
          height={aspect === 'aspect-[16/9]' ? 540 : 600}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
      </div>
    </div>
  );
}
