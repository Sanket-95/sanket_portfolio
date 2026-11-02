import { Quaternion, Vector3 } from 'three';
import { monuments, shipParts, shipSite, type LatLon } from '../data/projects';

/** Planet radius in world units. Everything else is sized relative to it. */
export const RADIUS = 10;

const Y = new Vector3(0, 1, 0);
const DEG = Math.PI / 180;

/** Unit vector for a latitude/longitude in degrees. */
export function latLonToDir({ lat, lon }: LatLon, out = new Vector3()) {
  const la = lat * DEG;
  const lo = lon * DEG;
  return out.set(Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo));
}

/** Rotation that stands an object upright on the surface at `dir` (local +Y = surface normal). */
export const uprightAt = (dir: Vector3, out = new Quaternion()) => out.setFromUnitVectors(Y, dir);

/** A tangent "north-ish" direction at `dir`, used to give placed objects a consistent facing. */
export function tangentAt(dir: Vector3, out = new Vector3()) {
  const ref = Math.abs(dir.y) > 0.95 ? new Vector3(1, 0, 0) : Y;
  return out.copy(ref).addScaledVector(dir, -ref.dot(dir)).normalize();
}

/** Deterministic pseudo-random numbers so the planet looks the same on every visit. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rotate `dir` by `angle` degrees toward a random tangent direction (used to offset parts). */
function offsetDir(dir: Vector3, angleDeg: number, bearing: number) {
  const t = tangentAt(dir);
  const b = new Vector3().crossVectors(dir, t);
  const axis = t.multiplyScalar(Math.cos(bearing)).addScaledVector(b, Math.sin(bearing)).normalize();
  const rotAxis = new Vector3().crossVectors(dir, axis).normalize();
  return dir.clone().applyAxisAngle(rotAxis, angleDeg * DEG).normalize();
}

// ---- Fixed layout, derived once from data/projects.ts --------------------------------

export const shipDir = latLonToDir(shipSite);

export const monumentLayout = monuments.map((m) => ({ monument: m, dir: latLonToDir(m.position) }));

export const partLayout = shipParts.map((part, i) => {
  const home = monumentLayout.find((m) => m.monument.id === part.monument) ?? monumentLayout[i % monumentLayout.length];
  return {
    part,
    color: home.monument.color,
    dir: offsetDir(home.dir, 11, i * 2.1 + 0.7),
  };
});

/** Where the player appears: a few steps from the ship, facing away from it. */
export const startDir = offsetDir(shipDir, 13, Math.PI);

/** Things the player cannot walk through: a surface direction and a radius (world units). */
export interface Obstacle {
  dir: Vector3;
  radius: number;
}

export const obstacles: Obstacle[] = [
  { dir: shipDir, radius: 1.6 },
  ...monumentLayout.map((m) => ({ dir: m.dir, radius: 1.25 })),
];

/** Angular distance in degrees between two unit vectors. */
export const angleBetween = (a: Vector3, b: Vector3) => Math.acos(Math.min(1, Math.max(-1, a.dot(b)))) / DEG;

/**
 * Mutable runtime state shared between scene components (player position, sequence
 * timers). Reset at the start of each run.
 */
export const runtime = {
  playerPos: new Vector3(),
  playerUp: new Vector3(0, 1, 0),
  heading: new Vector3(0, 0, -1),
  /** Seconds since the repair sequence started. */
  sequenceTime: 0,
  shipWorld: new Vector3(),
};
