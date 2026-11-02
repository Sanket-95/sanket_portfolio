import { getState } from './hooks/useGameStore';

// Small synthesized sound effects (Web Audio API, no audio files).

let ctx: AudioContext | null = null;

/** Create/resume the audio context. Call from a user gesture (the Start button). */
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

export function closeAudio() {
  void ctx?.close().catch(() => {});
  ctx = null;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gain = 0.12, endFreq?: number) {
  if (!ctx || getState().muted) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export const sfx = {
  collect() {
    tone(660, 0, 0.12, 'triangle');
    tone(990, 0.08, 0.18, 'triangle');
    tone(1320, 0.16, 0.25, 'sine', 0.08);
  },
  jump() {
    tone(320, 0, 0.16, 'square', 0.04, 620);
  },
  open() {
    tone(520, 0, 0.12, 'sine', 0.06);
  },
  ready() {
    [523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.25, 'triangle', 0.08));
  },
  /** One plank (or sail, or engine) fitted to the boat. */
  fit(step: number) {
    tone(380 + step * 22, 0, 0.09, 'square', 0.035);
  },
  /** Ship's horn and the engine starting. */
  sail() {
    tone(147, 0, 1.1, 'sawtooth', 0.05);
    tone(220, 0, 1.1, 'sawtooth', 0.035);
    tone(70, 1.1, 2.4, 'square', 0.025, 140);
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.35, 'triangle', 0.09));
  },
};
