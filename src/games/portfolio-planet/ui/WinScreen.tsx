import { Link } from 'react-router-dom';
import { Mail, RotateCcw, Trophy } from 'lucide-react';
import { copy } from '../data/projects';
import { formatTime, useGame } from '../hooks/useGameStore';

const secondary =
  'inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10';

export function WinScreen({ onRestart }: { onRestart: () => void }) {
  const finalTime = useGame((s) => s.finalTime);
  const best = useGame((s) => s.best);
  const newBest = useGame((s) => s.newBest);

  return (
    <div className="pp-fade absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-ink/40 p-4">
      <div className="pp-pop w-full max-w-md rounded-2xl border border-white/15 bg-ink/85 p-6 text-center shadow-2xl backdrop-blur-md sm:p-8">
        <Trophy size={36} className="mx-auto text-amber-300" aria-hidden="true" />
        <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Ship repaired — you’re off!</h2>
        <p className="mt-2 text-[15px] text-slate-300">You found every part and launched into space.</p>

        <dl className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <dt className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Your time</dt>
            <dd className="mt-1 text-2xl font-bold text-white tabular-nums">{formatTime(finalTime ?? 0)}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <dt className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Best time</dt>
            <dd className="mt-1 text-2xl font-bold text-white tabular-nums">{best ? formatTime(best) : '—'}</dd>
          </div>
        </dl>
        {newBest && <p className="mt-3 text-sm font-semibold text-amber-300">New best time!</p>}

        <button
          type="button"
          onClick={onRestart}
          autoFocus
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          <RotateCcw size={18} aria-hidden="true" /> Play again
        </button>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Link to="/#demos" className={secondary}>
            {copy.viewProjects}
          </Link>
          <Link to="/#contact" className={secondary}>
            <Mail size={16} aria-hidden="true" /> {copy.contact}
          </Link>
        </div>
      </div>
    </div>
  );
}
