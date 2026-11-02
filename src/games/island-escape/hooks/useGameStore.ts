import { useSyncExternalStore } from 'react';
import { sites, symbols } from '../data/island';

// A tiny external store: React components subscribe with useGame(selector); the
// 3D scene reads getState() inside useFrame so per-frame work never re-renders React.

export type Phase = 'intro' | 'playing' | 'repairing' | 'sailing' | 'won';

export interface GameState {
  phase: Phase;
  /** True once the 3D scene has loaded and can be played. */
  ready: boolean;
  /** Increments on every new run; scene parts are keyed by it so they reset. */
  run: number;
  /** Brand keys of the collected tech symbols, in pick-up order. */
  collected: string[];
  /** Ids of the project sites whose card has been opened. */
  visited: string[];
  nearSite: string | null;
  openSite: string | null;
  muted: boolean;
  /** Play time banked before the current running stretch (ms). */
  banked: number;
  /** performance.now() when the timer last resumed, or null while paused. */
  runningSince: number | null;
  finalTime: number | null;
  best: number | null;
  newBest: boolean;
}

const BEST_KEY = 'island-escape-best';
const MUTE_KEY = 'island-escape-muted';

const initial: GameState = {
  phase: 'intro',
  ready: false,
  run: 0,
  collected: [],
  visited: [],
  nearSite: null,
  openSite: null,
  muted: false,
  banked: 0,
  runningSince: null,
  finalTime: null,
  best: null,
  newBest: false,
};

let state = initial;
const listeners = new Set<() => void>();

export const getState = () => state;

export function setState(patch: Partial<GameState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useGame<T>(selector: (s: GameState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initial),
  );
}

function readNumber(key: string): number | null {
  try {
    const v = Number(localStorage.getItem(key));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode, blocked): the game works without it.
  }
}

export const elapsed = (s: GameState = state) =>
  s.banked + (s.runningSince === null ? 0 : performance.now() - s.runningSince);

const pause = (s: GameState) => ({ banked: elapsed(s), runningSince: null });

/** Every symbol collected and every project site visited: the boat can be repaired. */
export const isComplete = (s: GameState = state) => s.collected.length === symbols.length && s.visited.length === sites.length;

export const actions = {
  /** Client-only setup: restore the best time and mute setting. */
  hydrate() {
    setState({ best: readNumber(BEST_KEY), muted: readNumber(MUTE_KEY) === 1 });
  },
  markReady() {
    setState({ ready: true });
  },
  start() {
    setState({
      phase: 'playing',
      run: state.run + 1,
      collected: [],
      visited: [],
      nearSite: null,
      openSite: null,
      banked: 0,
      runningSince: performance.now(),
      finalTime: null,
      newBest: false,
    });
  },
  collect(key: string) {
    if (state.collected.includes(key)) return;
    setState({ collected: [...state.collected, key] });
  },
  setNear(id: string | null) {
    if (state.nearSite !== id) setState({ nearSite: id });
  },
  /** Opening a site's card counts as visiting it. The timer pauses while it is open. */
  openCard(id: string | null = state.nearSite) {
    if (!id || state.phase !== 'playing' || state.openSite) return;
    const visited = state.visited.includes(id) ? state.visited : [...state.visited, id];
    setState({ openSite: id, visited, ...pause(state) });
  },
  closeCard() {
    if (!state.openSite) return;
    setState({ openSite: null, runningSince: performance.now() });
  },
  /** The player reached the boat with everything done: stop the clock and repair. */
  beginRepair() {
    const finalTime = elapsed();
    const newBest = state.best === null || finalTime < state.best;
    if (newBest) write(BEST_KEY, String(Math.round(finalTime)));
    setState({
      phase: 'repairing',
      nearSite: null,
      ...pause(state),
      finalTime,
      newBest,
      best: newBest ? finalTime : state.best,
    });
  },
  sail() {
    setState({ phase: 'sailing' });
  },
  win() {
    setState({ phase: 'won' });
  },
  toggleMute() {
    write(MUTE_KEY, state.muted ? '0' : '1');
    setState({ muted: !state.muted });
  },
  /** Leaving the route: forget the run but keep settings. */
  reset() {
    state = { ...initial, best: state.best, muted: state.muted };
    listeners.forEach((l) => l());
  },
};

export function formatTime(ms: number) {
  const total = Math.max(0, ms) / 1000;
  const m = Math.floor(total / 60);
  const s = Math.floor(total % 60);
  const t = Math.floor((total * 10) % 10);
  return `${m}:${String(s).padStart(2, '0')}.${t}`;
}
