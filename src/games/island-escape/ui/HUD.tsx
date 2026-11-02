import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, LogOut, Volume2, VolumeX } from 'lucide-react';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { brandIcons } from '@/data/brandIcons';
import { copy, sites, symbols } from '../data/island';
import { projectInfo } from '../data/projectInfo';
import { actions, elapsed, formatTime, isComplete, useGame } from '../hooks/useGameStore';
import { MiniMap } from './MiniMap';

function Timer() {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 100);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{formatTime(elapsed())}</span>;
}

const pill = 'rounded-xl border border-white/15 bg-ink/70 backdrop-blur-md';
const iconButton = `${pill} grid h-11 w-11 place-items-center text-white transition-colors hover:bg-white/15`;

/** Counters, collection grid, timer, mute / exit, mini-map, the site prompt and hints. */
export function HUD({ isTouch }: { isTouch: boolean }) {
  const collected = useGame((s) => s.collected);
  const visited = useGame((s) => s.visited);
  const near = useGame((s) => s.nearSite);
  const muted = useGame((s) => s.muted);
  const playing = useGame((s) => s.phase === 'playing');
  const done = useGame((s) => isComplete(s));
  const nearSite = sites.find((s) => s.id === near);
  const [toast, setToast] = useState<string | null>(null);

  // Briefly announce each symbol as it is collected.
  useEffect(() => {
    const key = collected.at(-1) as keyof typeof brandIcons | undefined;
    if (!key) return;
    setToast(`Collected: ${brandIcons[key].title}`);
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [collected]);

  const hint = !playing
    ? null
    : done
      ? copy.boatReady
      : collected.length === symbols.length
        ? 'All tech collected. Visit the remaining project sites!'
        : visited.length === sites.length
          ? 'All projects visited. Collect the remaining tech!'
          : null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      <div className="flex items-start justify-between gap-2 p-2.5 sm:p-4">
        <div className={`${pill} max-w-[60vw] px-3 py-2 text-white sm:max-w-none sm:px-4 sm:py-2.5`}>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 text-sm">
            <p>
              <span className="text-[11px] font-semibold tracking-widest text-slate-300 uppercase">Tech </span>
              <span className="font-bold tabular-nums" aria-live="polite">
                {collected.length}/{symbols.length}
              </span>
            </p>
            <p>
              <span className="text-[11px] font-semibold tracking-widest text-slate-300 uppercase">Projects </span>
              <span className="font-bold tabular-nums" aria-live="polite">
                {visited.length}/{sites.length}
              </span>
            </p>
            <p className="text-slate-300">
              <Timer />
            </p>
          </div>
          <ul className="ie-grid mt-2" aria-label="Tech symbols">
            {symbols.map((s) => {
              const got = collected.includes(s.key);
              return (
                <li key={s.key} title={brandIcons[s.key].title} className={got ? '' : 'opacity-30'}>
                  <BrandIcon name={s.key} size={16} tone={got ? 'brand' : 'mono'} className={got ? '' : 'text-slate-300'} />
                  <span className="sr-only">
                    {brandIcons[s.key].title}: {got ? 'collected' : 'not collected'}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="pointer-events-auto flex gap-2">
            <button type="button" onClick={actions.toggleMute} className={iconButton} aria-label={muted ? 'Unmute sound' : 'Mute sound'} aria-pressed={muted}>
              {muted ? <VolumeX size={19} aria-hidden="true" /> : <Volume2 size={19} aria-hidden="true" />}
            </button>
            <Link to="/#demos" className={iconButton} aria-label="Exit game">
              <LogOut size={19} aria-hidden="true" />
            </Link>
          </div>
          <MiniMap />
        </div>
      </div>

      <div className={`absolute inset-x-0 flex flex-col items-center gap-2 px-4 ${isTouch ? 'bottom-40 landscape:bottom-6' : 'bottom-6'}`}>
        {toast && (
          <p className={`${pill} ie-pop px-4 py-2 text-sm font-semibold text-white`} role="status">
            {toast}
          </p>
        )}
        {nearSite && playing ? (
          <button
            type="button"
            onClick={() => actions.openCard(nearSite.id)}
            className={`${pill} ie-pop pointer-events-auto inline-flex max-w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15`}
          >
            <Eye size={17} aria-hidden="true" style={{ color: nearSite.color }} />
            <span className="truncate">{projectInfo(nearSite).title}</span>
            <span className="shrink-0 text-slate-300">— {isTouch ? 'Tap to view' : 'Press E to view'}</span>
          </button>
        ) : hint ? (
          <p className={`${pill} px-4 py-2 text-center text-sm font-medium text-white`} role="status">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
