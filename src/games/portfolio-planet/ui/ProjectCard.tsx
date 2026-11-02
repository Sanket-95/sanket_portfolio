import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Code, X } from 'lucide-react';
import type { Monument } from '../data/projects';
import { actions } from '../hooks/useGameStore';
import { sfx } from '../audio';

const linkClass =
  'inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10';

/** Project details shown when the player views a monument. Closes on Esc or outside click. */
export function ProjectCard({ monument }: { monument: Monument }) {
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    sfx.open();
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') actions.closeCard();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const internal = monument.link?.startsWith('/');

  return (
    <div className="pp-fade absolute inset-0 z-30 flex items-center justify-center bg-ink/55 p-4" onClick={actions.closeCard}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pp-card-title"
        className="pp-pop relative w-full max-w-md rounded-2xl border border-white/15 bg-panel/95 p-6 shadow-2xl backdrop-blur-md sm:p-7"
        style={{ borderTopColor: monument.color, borderTopWidth: 4 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={close}
          type="button"
          onClick={actions.closeCard}
          className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X size={18} aria-hidden="true" />
        </button>
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: monument.color }}>
          Project monument
        </p>
        <h2 id="pp-card-title" className="mt-2 pr-8 text-xl font-semibold text-white">
          {monument.title}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-300">{monument.description}</p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tech and highlights">
          {monument.tech.map((t) => (
            <li key={t} className="rounded-md border border-line bg-ink/60 px-2.5 py-1 text-xs font-medium text-slate-300">
              {t}
            </li>
          ))}
        </ul>
        {(monument.link || monument.github) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {monument.link &&
              (internal ? (
                <Link to={monument.link} className={linkClass}>
                  Open it <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              ) : (
                <a href={monument.link} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Visit site <ArrowUpRight size={16} aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ))}
            {monument.github && (
              <a href={monument.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <Code size={16} aria-hidden="true" /> GitHub
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}
          </div>
        )}
        <p className="mt-6 text-xs text-slate-500">Press Esc to keep exploring.</p>
      </div>
    </div>
  );
}
