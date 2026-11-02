import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, LogOut, Volume2, VolumeX } from 'lucide-react';
import { monuments, shipParts } from '../data/projects';
import { actions, elapsed, formatTime, useGame } from '../hooks/useGameStore';

function Timer() {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 100);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{formatTime(elapsed())}</span>;
}

const partColor = (monumentId: string) => monuments.find((m) => m.id === monumentId)?.color ?? '#ffffff';

const pill = 'rounded-xl border border-white/15 bg-ink/70 backdrop-blur-md';
const iconButton = `${pill} grid h-11 w-11 place-items-center text-white transition-colors hover:bg-white/15`;

/** Parts counter, timer, mute and exit, plus the monument prompt and hints. */
export function HUD({ isTouch }: { isTouch: boolean }) {
  const collected = useGame((s) => s.collected);
  const near = useGame((s) => s.nearMonument);
  const muted = useGame((s) => s.muted);
  const playing = useGame((s) => s.phase === 'playing');
  const nearMonument = monuments.find((m) => m.id === near);
  const allFound = collected.length === shipParts.length;
  const [lastFound, setLastFound] = useState<string | null>(null);

  // Briefly announce each part as it is collected.
  useEffect(() => {
    const id = collected.at(-1);
    if (!id) return;
    setLastFound(shipParts.find((p) => p.id === id)?.name ?? null);
    const t = setTimeout(() => setLastFound(null), 2200);
    return () => clearTimeout(t);
  }, [collected]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      <div className="flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className={`${pill} px-4 py-2.5 text-white`}>
          <p className="text-[11px] font-semibold tracking-widest text-slate-300 uppercase">Ship parts</p>
          <div className="mt-1 flex items-center gap-2.5">
            <span className="text-lg font-bold tabular-nums" aria-live="polite">
              {collected.length}/{shipParts.length}
            </span>
            <span className="flex gap-1" aria-hidden="true">
              {shipParts.map((part) => (
                <span
                  key={part.id}
                  className="h-2.5 w-2.5 rounded-full border border-white/30"
                  style={{ background: collected.includes(part.id) ? partColor(part.monument) : 'transparent' }}
                />
              ))}
            </span>
            <span className="ml-1 text-sm text-slate-300">
              <Timer />
            </span>
          </div>
        </div>

        <div className="pointer-events-auto flex gap-2">
          <button type="button" onClick={actions.toggleMute} className={iconButton} aria-label={muted ? 'Unmute sound' : 'Mute sound'} aria-pressed={muted}>
            {muted ? <VolumeX size={19} aria-hidden="true" /> : <Volume2 size={19} aria-hidden="true" />}
          </button>
          <Link to="/#demos" className={iconButton} aria-label="Exit game">
            <LogOut size={19} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className={`absolute inset-x-0 flex flex-col items-center gap-2 px-4 ${isTouch ? 'bottom-36' : 'bottom-6'}`}>
        {lastFound && (
          <p className={`${pill} pp-pop px-4 py-2 text-sm font-semibold text-white`} role="status">
            Found: {lastFound}
          </p>
        )}
        {nearMonument ? (
          <button
            type="button"
            onClick={() => actions.openCard(nearMonument.id)}
            className={`${pill} pp-pop pointer-events-auto inline-flex max-w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15`}
          >
            <Eye size={17} aria-hidden="true" style={{ color: nearMonument.color }} />
            <span className="truncate">{nearMonument.title}</span>
            <span className="shrink-0 text-slate-300">— {isTouch ? 'Tap to view' : 'Press E to view'}</span>
          </button>
        ) : allFound && playing ? (
          <p className={`${pill} px-4 py-2 text-sm font-medium text-white`}>All parts found. Follow the arrow back to your ship!</p>
        ) : null}
      </div>
    </div>
  );
}
