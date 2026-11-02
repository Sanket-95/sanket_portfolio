import { Link } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { copy } from '../data/island';

const keys = [
  ['W A S D / Arrows', 'Walk and turn'],
  ['Space', 'Jump'],
  ['E', 'View a project site'],
  ['Drag', 'Look around'],
];
const touch = [
  ['Joystick', 'Walk and turn'],
  ['Jump button', 'Jump'],
  ['Tap the prompt', 'View a project site'],
  ['Drag', 'Look around'],
];

export function IntroScreen({ ready, isTouch, onStart }: { ready: boolean; isTouch: boolean; onStart: () => void }) {
  return (
    <div className="ie-fade absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-ink/35 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-ink/80 p-6 text-center shadow-2xl backdrop-blur-md sm:p-8">
        <p className="eyebrow justify-center">3D portfolio game</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{copy.title}</h1>
        <div className="mt-4 space-y-1 text-[15px] leading-relaxed text-slate-300">
          {copy.story.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-left text-sm">
          {(isTouch ? touch : keys).map(([key, action]) => (
            <div key={key} className="contents">
              <dt>
                <kbd className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 font-sans text-xs font-semibold text-white">{key}</kbd>
              </dt>
              <dd className="text-slate-300">{action}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={onStart}
          disabled={!ready}
          autoFocus
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70"
        >
          {ready ? (
            <>
              <Play size={18} aria-hidden="true" /> Start
            </>
          ) : (
            <>
              <span className="ie-spinner" aria-hidden="true" /> Loading island…
            </>
          )}
        </button>
        <Link to="/#demos" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white">
          <ArrowLeft size={15} aria-hidden="true" /> Back to the site
        </Link>
      </div>
    </div>
  );
}
