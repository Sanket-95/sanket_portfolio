import { WORLD, boat, cliff, hills, sites } from '../data/island';

// The island's shape as plain functions (no three.js), so the scene, the collision code
// and the mini-map all agree. Water level is y = 0.

/** Deterministic pseudo-random numbers (mulberry32). */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = seeded(WORLD.seed * 7919);
const phase = Array.from({ length: 8 }, () => rand() * Math.PI * 2);

const PLATEAU = 1.2;
const BEACH_TOP = 0.45;
const SEA_FLOOR = -3;
/** Radius of the flat pad under each project site. */
const PAD_RADIUS = 7;

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Distance from the centre to the shoreline in a given direction. */
export function shoreRadius(theta: number) {
  return (
    WORLD.islandRadius *
    (1 + 0.1 * Math.sin(3 * theta + phase[0]) + 0.06 * Math.sin(5 * theta + phase[1]) + 0.035 * Math.sin(8 * theta + phase[2]))
  );
}

/** 0…1: how much of the coast in this direction is cliff instead of beach. */
function cliffAmount(theta: number) {
  let d = Math.abs(theta - cliff.angle) % (Math.PI * 2);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return 1 - smoothstep(cliff.width * 0.45, cliff.width, d);
}

/** Gentle rolling ground, roughly −1…1. */
function noise(x: number, z: number) {
  return (
    Math.sin(x * 0.13 + phase[3]) * Math.cos(z * 0.11 + phase[4]) * 0.55 +
    Math.sin((x + z) * 0.07 + phase[5]) * 0.3 +
    Math.sin(x * 0.31 - z * 0.27 + phase[6]) * 0.15
  );
}

function hillHeight(x: number, z: number) {
  let h = 0;
  for (const hill of hills) {
    const k = Math.hypot(x - hill.x, z - hill.z) / hill.radius;
    if (k < 1) h += hill.height * (0.5 + 0.5 * Math.cos(Math.PI * k));
  }
  return h;
}

/** Normalised distance from the centre: 0 at the centre, 1 on the shoreline. */
export function shoreDistance(x: number, z: number) {
  return Math.hypot(x, z) / shoreRadius(Math.atan2(z, x));
}

function rawHeight(x: number, z: number) {
  const theta = Math.atan2(z, x);
  const d = Math.hypot(x, z) / shoreRadius(theta);
  const c = cliffAmount(theta);
  const inland = 1 - smoothstep(0.68, 0.86, d);
  const top = PLATEAU + inland * (hillHeight(x, z) + noise(x, z) * 0.3) + c * cliff.height * smoothstep(0.5, 0.92, d);

  let beach: number;
  if (d < 0.8) beach = top;
  else if (d < 0.9) beach = lerp(top, BEACH_TOP, smoothstep(0.8, 0.9, d));
  else if (d < 1) beach = lerp(BEACH_TOP, 0, (d - 0.9) / 0.1);
  else beach = lerp(0, SEA_FLOOR, Math.min(1, (d - 1) / 0.18));

  const rocky = d < 0.95 ? top : lerp(top, SEA_FLOOR, Math.min(1, (d - 0.95) / 0.06));
  return lerp(beach, rocky, c);
}

// Flat pads under the project sites, so buildings never float or sink.
const pads = sites.map((s) => ({ x: s.x, z: s.z, h: rawHeight(s.x, s.z) }));

/** Ground height at a point (y), without rocks or other objects. */
export function terrainHeight(x: number, z: number) {
  let h = rawHeight(x, z);
  for (const p of pads) {
    const dx = x - p.x;
    const dz = z - p.z;
    if (dx * dx + dz * dz > PAD_RADIUS * PAD_RADIUS) continue;
    const w = 1 - smoothstep(PAD_RADIUS * 0.55, PAD_RADIUS, Math.hypot(dx, dz));
    h = lerp(h, p.h, w);
  }
  return h;
}

/** Steepness (rise per unit) of the terrain at a point. */
export function slopeAt(x: number, z: number) {
  const e = 0.5;
  const dx = terrainHeight(x + e, z) - terrainHeight(x - e, z);
  const dz = terrainHeight(x, z + e) - terrainHeight(x, z - e);
  return Math.hypot(dx, dz) / (2 * e);
}

// ---- The boat and the start point: on the beach in the direction `boat.angle`. ----
const boatDir = { x: Math.cos(boat.angle), z: Math.sin(boat.angle) };
function findShore() {
  for (let r = shoreRadius(boat.angle) * 0.75; r < WORLD.islandRadius * 1.5; r += 0.25) {
    if (terrainHeight(boatDir.x * r, boatDir.z * r) < 0.22) return r;
  }
  return shoreRadius(boat.angle);
}
const shoreR = findShore();

/** The wreck, half on the sand; it faces out to sea along `boatOut`. */
export const boatSpot = { x: boatDir.x * shoreR, z: boatDir.z * shoreR };
export const boatOut = boatDir;
/** The player starts on the beach a few steps inland from the boat. */
export const startSpot = { x: boatDir.x * (shoreR - 7), z: boatDir.z * (shoreR - 7) };

/** Island outline for the mini-map: `count` points on the shoreline. */
export function outline(count = 96, scale = 1) {
  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * Math.PI * 2;
    const r = shoreRadius(t) * scale;
    return { x: Math.cos(t) * r, z: Math.sin(t) * r };
  });
}
