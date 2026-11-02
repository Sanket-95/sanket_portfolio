import { useEffect, useRef, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, X } from 'lucide-react';
import type { Site } from '../data/island';
import { projectInfo } from '../data/projectInfo';
import { actions } from '../hooks/useGameStore';
import { sfx } from '../audio';

const linkClass =
  'inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover';

/** Project details shown at a site. A modal dialog: Esc or an outside click closes it. */
export function ProjectCard({ site }: { site: Site }) {
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const info = projectInfo(site);
  const { link } = site;

  useEffect(() => {
    sfx.open();
    close.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') actions.closeCard();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Keep keyboard focus inside the dialog while it is open.
  const trapFocus = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialog.current) return;
    const items = dialog.current.querySelectorAll<HTMLElement>('a[href], button');
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="ie-fade absolute inset-0 z-30 flex items-center justify-center bg-ink/55 p-3 sm:p-4" onClick={actions.closeCard}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ie-card-title"
        className="ie-pop relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/15 bg-panel/95 shadow-2xl backdrop-blur-md"
        style={{ borderTopColor: site.color, borderTopWidth: 4 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={trapFocus}
      >
        <button
          ref={close}
          type="button"
          onClick={actions.closeCard}
          className="absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X size={18} aria-hidden="true" />
        </button>
        <div className="overflow-y-auto p-5 sm:p-7">
          <p className="pr-10 text-xs font-semibold tracking-widest uppercase" style={{ color: site.color }}>
            {info.eyebrow}
          </p>
          <h2 id="ie-card-title" className="mt-2 pr-8 text-xl font-semibold text-white">
            {info.title}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-300">{info.summary}</p>
          {info.points.length > 0 && (
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300 marker:text-slate-500">
              {info.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tech and highlights">
            {info.tags.map((t) => (
              <li key={t} className="rounded-md border border-line bg-ink/60 px-2.5 py-1 text-xs font-medium text-slate-300">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            {link &&
              (link.newTab ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {link.label} <ArrowUpRight size={16} aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <Link to={link.href} className={linkClass}>
                  {link.label} <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              ))}
            <p className="text-xs text-slate-500">Press Esc to keep exploring.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
