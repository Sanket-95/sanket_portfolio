import { useEffect } from 'react';
import { actions, getState } from './useGameStore';

/**
 * Shared, mutable input state. Keyboard and the touch joystick write to it; the
 * player reads it every frame. Kept outside React so input never causes re-renders.
 */
export const input = {
  keys: new Set<string>(),
  joyX: 0,
  joyY: 0,
  /** Set on press, consumed by the player on the next frame. */
  jump: false,
};

const KEYMAP: Record<string, string> = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'back', ArrowDown: 'back',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
};

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/** Forward/back (-1…1) and turn (-1 left … 1 right) from keyboard plus joystick. */
export function readAxes() {
  const k = input.keys;
  const forward = clamp((k.has('forward') ? 1 : 0) - (k.has('back') ? 1 : 0) + input.joyY);
  const turn = clamp((k.has('right') ? 1 : 0) - (k.has('left') ? 1 : 0) + input.joyX);
  return { forward, turn };
}

export function resetInput() {
  input.keys.clear();
  input.joyX = 0;
  input.joyY = 0;
  input.jump = false;
}

/** Keyboard controls: WASD / arrows to move, Space to jump, E to view a project site. */
export function useControls() {
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const s = getState();
      if (s.phase !== 'playing' || s.openSite) return;
      // Let Space / Enter activate a focused button instead of jumping.
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, a, input, textarea, select')) {
        if (e.code === 'Space' || e.code === 'Enter') return;
      }
      const dir = KEYMAP[e.code];
      if (dir) {
        input.keys.add(dir);
        e.preventDefault();
      } else if (e.code === 'Space') {
        if (!e.repeat) input.jump = true;
        e.preventDefault();
      } else if (e.code === 'KeyE') {
        actions.openCard();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const dir = KEYMAP[e.code];
      if (dir) input.keys.delete(dir);
    };
    // Releasing keys while the window is in the background never fires keyup.
    const onBlur = () => resetInput();

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
      resetInput();
    };
  }, []);
}
