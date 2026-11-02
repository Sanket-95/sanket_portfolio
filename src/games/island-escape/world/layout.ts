import { WORLD, paths, sites, symbols, type Landmark, type Site, type SymbolSpot } from '../data/island';
import { boatSpot, seeded, shoreDistance, slopeAt, startSpot, terrainHeight } from './terrain';

// Everything placed on the island, computed once from data/island.ts. Plain numbers only:
// the 3D scene, the collision code and the mini-map read these arrays, React never
// re-renders because of them.

/** Height of the big rocks that carry some symbols. */
export const ROCK_TOP = 1.05;
/** How far a symbol floats above the ground (or its rock). */
export const SYMBOL_LIFT = 1.25;

/** Footprint radius and roof height of each landmark (used for collisions and the camera). */
export const landmarkSize: Record<Landmark, { r: number; top: number }> = {
  warehouse: { r: 3.3, top: 4.2 },
  pharma: { r: 2.9, top: 4.6 },
  tower: { r: 1.7, top: 8.5 },
  'support-hut': { r: 2.2, top: 5.2 },
  press: { r: 2.5, top: 3.8 },
  office: { r: 2.2, top: 7.6 },
  temple: { r: 2.7, top: 6.8 },
  iot: { r: 1.7, top: 5.2 },
  'food-stall': { r: 2.1, top: 3 },
  'cashew-stall': { r: 2.1, top: 3 },
  shop: { r: 2.1, top: 3 },
  cafe: { r: 2.1, top: 3 },
};

/** A circle the player cannot walk through. Platforms (rocks) can be jumped onto. */
export interface Obstacle {
  x: number;
  z: number;
  r: number;
  top: number;
  platform: boolean;
  /** Tall enough that the camera should rise over it. */
  camera: boolean;
}

export interface Prop {
  x: number;
  y: number;
  z: number;
  rot: number;
  /** Uniform scale (palms, bushes) or x/z scale (rocks). */
  scale: number;
  /** Rocks only: vertical scale. */
  height: number;
  /** 0…1, used to vary colours. */
  tint: number;
}

export interface SitePlace {
  site: Site;
  index: number;
  y: number;
  /** Rotation so the landmark's front (+z) faces the beach where the player starts. */
  rotation: number;
  size: { r: number; top: number };
  /** Within this distance the player can view the project. */
  interact: number;
}

export interface SymbolPlace extends SymbolSpot {
  index: number;
  ground: number;
  y: number;
}

export const sitePlaces: SitePlace[] = sites.map((site, index) => ({
  site,
  index,
  y: terrainHeight(site.x, site.z),
  rotation: Math.atan2(startSpot.x - site.x, startSpot.z - site.z),
  size: landmarkSize[site.landmark],
  interact: landmarkSize[site.landmark].r + 3.2,
}));

export const symbolPlaces: SymbolPlace[] = symbols.map((s, index) => {
  const ground = terrainHeight(s.x, s.z);
  return { ...s, index, ground, y: ground + (s.rock ? ROCK_TOP : 0) + SYMBOL_LIFT };
});

// ---- Paths ----
const anchors = new Map<string, { x: number; z: number }>([['start', startSpot], ...sites.map((s) => [s.id, s] as const)]);
export const pathSegments = paths.flatMap((chain) =>
  chain.slice(1).flatMap((id, i) => {
    const a = anchors.get(chain[i]);
    const b = anchors.get(id);
    return a && b ? [{ ax: a.x, az: a.z, bx: b.x, bz: b.z }] : [];
  }),
);

type Segment = (typeof pathSegments)[number];

/** Path segments that pass within `margin` of a rectangle (to test fewer of them). */
export function pathSegmentsNear(x0: number, z0: number, x1: number, z1: number, margin: number) {
  return pathSegments.filter(
    (s) =>
      Math.max(s.ax, s.bx) > x0 - margin &&
      Math.min(s.ax, s.bx) < x1 + margin &&
      Math.max(s.az, s.bz) > z0 - margin &&
      Math.min(s.az, s.bz) < z1 + margin,
  );
}

/** Distance from a point to the nearest path (optionally only among `segments`). */
export function pathDistance(x: number, z: number, segments: Segment[] = pathSegments) {
  let best = Infinity;
  for (const s of segments) {
    const dx = s.bx - s.ax;
    const dz = s.bz - s.az;
    const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / (dx * dx + dz * dz)));
    best = Math.min(best, Math.hypot(x - (s.ax + dx * t), z - (s.az + dz * t)));
  }
  return best;
}

// ---- Scatter palms, rocks and bushes, away from sites, symbols, paths and the boat ----
const clear = [
  ...sitePlaces.map((p) => ({ x: p.site.x, z: p.site.z, r: p.size.r + 6 })),
  ...symbolPlaces.map((s) => ({ x: s.x, z: s.z, r: 2.6 })),
  { x: startSpot.x, z: startSpot.z, r: 5 },
  { x: boatSpot.x, z: boatSpot.z, r: 6.5 },
];

const placed: { x: number; z: number; r: number }[] = [];

function scatter(count: number, seed: number, gap: number, accept: (x: number, z: number, h: number, d: number, r: () => number) => boolean) {
  const r = seeded(WORLD.seed * 1000 + seed);
  const out: Prop[] = [];
  const reach = WORLD.islandRadius * 1.15;
  for (let tries = 0; out.length < count && tries < count * 40; tries++) {
    const x = (r() * 2 - 1) * reach;
    const z = (r() * 2 - 1) * reach;
    const h = terrainHeight(x, z);
    if (!accept(x, z, h, shoreDistance(x, z), r)) continue;
    if (clear.some((c) => (x - c.x) ** 2 + (z - c.z) ** 2 < c.r * c.r)) continue;
    if (placed.some((p) => (x - p.x) ** 2 + (z - p.z) ** 2 < (gap + p.r) ** 2)) continue;
    if (pathDistance(x, z) < 1.8) continue;
    placed.push({ x, z, r: gap * 0.5 });
    out.push({ x, y: h, z, rot: r() * Math.PI * 2, scale: 0.8 + r() * 0.5, height: 0.5 + r() * 0.6, tint: r() });
  }
  return out;
}

export const palms = scatter(WORLD.palms, 1, 2.2, (x, z, h, d, r) => h > 0.3 && slopeAt(x, z) < 0.8 && (d > 0.6 || r() < 0.3));
export const bushes = scatter(WORLD.bushes, 2, 1.2, (_x, _z, h, d) => h > 0.9 && d < 0.86);
const looseRocks = scatter(WORLD.rocks, 3, 1.4, (_x, _z, h) => h > -0.5);

/** Scattered rocks plus the big rocks under some symbols. */
export const rocks: Prop[] = [
  ...looseRocks,
  ...symbolPlaces
    .filter((s) => s.rock)
    .map((s, i) => ({ x: s.x, y: s.ground, z: s.z, rot: i * 1.7, scale: 1.45, height: ROCK_TOP, tint: 0.5 })),
];

// ---- Obstacles ----
const obstacles: Obstacle[] = [
  ...palms.map((p) => ({ x: p.x, z: p.z, r: 0.32 * p.scale, top: p.y + 5, platform: false, camera: false })),
  ...rocks.map((p) => ({ x: p.x, z: p.z, r: 0.95 * p.scale, top: p.y + p.height * 0.92, platform: true, camera: false })),
  ...sitePlaces.map((p) => ({ x: p.site.x, z: p.site.z, r: p.size.r, top: p.y + p.size.top, platform: false, camera: true })),
  { x: boatSpot.x, z: boatSpot.z, r: 1.7, top: 2.5, platform: false, camera: true },
];

// ---- Chunks ----
export interface Chunk {
  key: string;
  cx: number;
  cz: number;
  /** Any land (or shallow sea floor) in this chunk: it needs a terrain mesh. */
  land: boolean;
  palms: Prop[];
  rocks: Prop[];
  bushes: Prop[];
  symbols: SymbolPlace[];
  sites: SitePlace[];
  obstacles: Obstacle[];
}

const size = WORLD.chunkSize;
export const chunkOf = (v: number) => Math.floor(v / size);
export const chunkKey = (cx: number, cz: number) => `${cx},${cz}`;

export const chunks = new Map<string, Chunk>();
const span = Math.ceil((WORLD.islandRadius * 1.3) / size);
for (let cx = -span; cx < span; cx++) {
  for (let cz = -span; cz < span; cz++) {
    let land = false;
    for (let i = 0; i <= 4 && !land; i++) {
      for (let j = 0; j <= 4 && !land; j++) land = terrainHeight((cx + i / 4) * size, (cz + j / 4) * size) > -0.8;
    }
    chunks.set(chunkKey(cx, cz), { key: chunkKey(cx, cz), cx, cz, land, palms: [], rocks: [], bushes: [], symbols: [], sites: [], obstacles: [] });
  }
}

function chunkAt(x: number, z: number) {
  return chunks.get(chunkKey(chunkOf(x), chunkOf(z)));
}

palms.forEach((p) => chunkAt(p.x, p.z)?.palms.push(p));
rocks.forEach((p) => chunkAt(p.x, p.z)?.rocks.push(p));
bushes.forEach((p) => chunkAt(p.x, p.z)?.bushes.push(p));
symbolPlaces.forEach((s) => chunkAt(s.x, s.z)?.symbols.push(s));
sitePlaces.forEach((s) => chunkAt(s.site.x, s.site.z)?.sites.push(s));
obstacles.forEach((o) => chunkAt(o.x, o.z)?.obstacles.push(o));

// Drop chunks with nothing in them (open sea).
for (const [key, c] of chunks) {
  if (!c.land && !c.palms.length && !c.rocks.length && !c.symbols.length && !c.sites.length) chunks.delete(key);
}

/** Calls `fn` for every obstacle in the 3 × 3 chunks around a point. */
export function forEachObstacleNear(x: number, z: number, fn: (o: Obstacle) => void) {
  const cx = chunkOf(x);
  const cz = chunkOf(z);
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) chunks.get(chunkKey(cx + i, cz + j))?.obstacles.forEach(fn);
  }
}

/** Keys of the chunks to mount around a point (the view radius from data/island.ts). */
export function visibleChunkKeys(x: number, z: number) {
  const cx = chunkOf(x);
  const cz = chunkOf(z);
  const keys: string[] = [];
  const n = WORLD.viewRings;
  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      const key = chunkKey(cx + i, cz + j);
      if (chunks.has(key)) keys.push(key);
    }
  }
  return keys;
}
