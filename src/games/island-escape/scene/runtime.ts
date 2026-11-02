import { Vector3 } from 'three';
import { startSpot } from '../world/terrain';

/**
 * Mutable per-frame state shared by the scene components (player, boat, camera,
 * chunks). Never stored in React state, so moving around causes no re-renders.
 */
export const runtime = {
  /** The player's feet. */
  player: new Vector3(),
  /** Facing angle around +y; 0 looks north (−z). */
  yaw: 0,
  /** Centre for chunk loading and the shadow camera. */
  focus: new Vector3(),
  /** Extra camera yaw / pitch from dragging (eases back while walking). */
  camYaw: 0,
  camPitch: 0,
  /** The boat's position and heading, written by the boat every frame. */
  boat: new Vector3(),
  boatYaw: 0,
  /** Where the player stands on deck, in world space. */
  deck: new Vector3(),
  /** Seconds since the repair began (repair + sailing sequence). */
  sequence: 0,
};

export function resetRuntime() {
  runtime.player.set(startSpot.x, 0, startSpot.z);
  runtime.focus.copy(runtime.player);
  runtime.camYaw = 0;
  runtime.camPitch = 0;
  runtime.sequence = 0;
}

/** Forward direction for a yaw angle (0 = north / −z). */
export const forwardOf = (yaw: number, out: Vector3) => out.set(-Math.sin(yaw), 0, -Math.cos(yaw));

/** Height of the sea surface at a point (matches the wave shader in Water.tsx). */
export function waveHeight(x: number, z: number, t: number) {
  return Math.sin(x * 0.35 + t * 1.3) * 0.1 + Math.cos(z * 0.28 + t * 1.1) * 0.08;
}
