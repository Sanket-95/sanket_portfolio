import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, Color, Euler, Matrix4, PlaneGeometry, Quaternion, Vector3, type InstancedMesh } from 'three';
import { WORLD } from '../data/island';
import { chunkKey, chunkOf, chunks, pathDistance, pathSegmentsNear, visibleChunkKeys, type Chunk as ChunkData, type Prop } from '../world/layout';
import { shoreDistance, smoothstep, terrainHeight } from '../world/terrain';
import { pool } from './pool';
import { runtime } from './runtime';
import { Pickup } from './Symbols';
import { SiteArea } from './Site';

const SIZE = WORLD.chunkSize;

const GRASS = new Color('#5f9d3c');
const GRASS_LIGHT = new Color('#86b84f');
const SAND = new Color('#e9d49c');
const WET_SAND = new Color('#c8ae76');
const ROCK = new Color('#8b8173');
const DIRT = new Color('#bf9659');
const tmp = new Color();

/** Ground colour: sand on the beach, grass inland, rock on steep slopes, dirt on paths. */
function groundColor(x: number, z: number, h: number, slope: number, path: number, out: Color) {
  const d = shoreDistance(x, z);
  const jitter = (Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
  if (h < 0.12) out.copy(WET_SAND);
  else {
    out.copy(GRASS).lerp(GRASS_LIGHT, 0.5 + 0.5 * Math.sin(x * 0.09 + z * 0.12) * Math.cos(z * 0.05));
    const sand = Math.max(1 - smoothstep(0.35, 0.75, h), smoothstep(0.84, 0.9, d) * (1 - smoothstep(1.4, 2, h)));
    out.lerp(SAND, sand);
  }
  out.lerp(ROCK, smoothstep(0.6, 1.1, slope));
  if (h > 0.3) out.lerp(DIRT, (1 - smoothstep(0.7, 1.5, path)) * 0.85);
  return out.offsetHSL(0, 0, jitter * 0.03);
}

/** Terrain mesh for one chunk, in world coordinates. 1 unit per quad. */
function buildTerrain(cx: number, cz: number) {
  const x0 = cx * SIZE;
  const z0 = cz * SIZE;
  // Heights on the vertex grid plus a one-cell border, so slopes need no extra samples.
  const n = SIZE + 3;
  const heights = new Float32Array(n * n);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) heights[j * n + i] = terrainHeight(x0 + i - 1, z0 + j - 1);
  }
  const at = (i: number, j: number) => heights[(j + 1) * n + i + 1];
  const segments = pathSegmentsNear(x0, z0, x0 + SIZE, z0 + SIZE, 2);

  const geo = new PlaneGeometry(SIZE, SIZE, SIZE, SIZE);
  geo.rotateX(-Math.PI / 2);
  geo.translate(x0 + SIZE / 2, 0, z0 + SIZE / 2);
  const pos = geo.getAttribute('position');
  const colors = new Float32Array(pos.count * 3);
  // PlaneGeometry order after the rotation: rows of increasing z, columns of increasing x.
  for (let j = 0, v = 0; j <= SIZE; j++) {
    for (let i = 0; i <= SIZE; i++, v++) {
      const h = at(i, j);
      const slope = Math.hypot(at(i + 1, j) - at(i - 1, j), at(i, j + 1) - at(i, j - 1)) / 2;
      const x = x0 + i;
      const z = z0 + j;
      pos.setY(v, h);
      const path = segments.length ? pathDistance(x, z, segments) : Infinity;
      groundColor(x, z, h, slope, path, tmp).toArray(colors, v * 3);
    }
  }
  geo.setAttribute('color', new BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

const m4 = new Matrix4();
const q = new Quaternion();
const euler = new Euler();
const p = new Vector3();
const s = new Vector3();
const c = new Color();

type Fill = (mesh: InstancedMesh, item: Prop, i: number) => void;

/** One InstancedMesh per prop type and chunk; shared geometry and material from the pool. */
function Instances({ items, geometry, material, fill, shadow = true }: { items: Prop[]; geometry: keyof ReturnType<typeof pool>['geometry']; material: keyof ReturnType<typeof pool>['material']; fill: Fill; shadow?: boolean }) {
  const ref = useRef<InstancedMesh>(null);
  const shared = pool();
  useLayoutEffect(() => {
    const mesh = ref.current!;
    items.forEach((item, i) => fill(mesh, item, i));
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // Correct bounds so the whole group is frustum-culled when off screen.
    mesh.computeBoundingSphere();
  }, [items, fill]);
  return (
    <instancedMesh
      ref={ref}
      args={[shared.geometry[geometry], shared.material[material], items.length]}
      customDepthMaterial={geometry === 'palmTrunk' ? shared.depth.instanced : shared.depth.instancedColor}
      castShadow={shadow}
      receiveShadow
    />
  );
}

const fillTrunk: Fill = (mesh, t, i) => {
  m4.compose(p.set(t.x, t.y - 0.1, t.z), q.setFromEuler(euler.set(0, t.rot, 0)), s.setScalar(t.scale));
  mesh.setMatrixAt(i, m4);
};
const fillLeaves: Fill = (mesh, t, i) => {
  fillTrunk(mesh, t, i);
  mesh.setColorAt(i, c.setHSL(0.27 + t.tint * 0.07, 0.55, 0.32 + t.tint * 0.1));
};
const fillRock: Fill = (mesh, r, i) => {
  m4.compose(p.set(r.x, r.y - 0.08, r.z), q.setFromEuler(euler.set(0, r.rot, 0)), s.set(r.scale, r.height, r.scale * 0.9));
  mesh.setMatrixAt(i, m4);
  mesh.setColorAt(i, c.setHSL(0.08, 0.06, 0.45 + r.tint * 0.15));
};
const fillBush: Fill = (mesh, b, i) => {
  m4.compose(p.set(b.x, b.y - 0.05, b.z), q.setFromEuler(euler.set(0, b.rot, 0)), s.setScalar(b.scale));
  mesh.setMatrixAt(i, m4);
  mesh.setColorAt(i, c.setHSL(0.28 + b.tint * 0.06, 0.5, 0.26 + b.tint * 0.08));
};

/** One chunk: memoised, so adding a neighbour does not re-render the chunks already shown. */
const Chunk = memo(function Chunk({ data }: { data: ChunkData }) {
  const terrain = useMemo(() => (data.land ? buildTerrain(data.cx, data.cz) : null), [data]);
  // Chunk geometry is unique: free it as soon as the chunk leaves the view radius.
  useEffect(() => () => terrain?.dispose(), [terrain]);
  const shared = pool();

  return (
    <group>
      {terrain && <mesh geometry={terrain} material={shared.material.terrain} receiveShadow />}
      {data.palms.length > 0 && (
        <>
          <Instances items={data.palms} geometry="palmTrunk" material="trunk" fill={fillTrunk} />
          <Instances items={data.palms} geometry="palmLeaves" material="leaves" fill={fillLeaves} />
        </>
      )}
      {data.rocks.length > 0 && <Instances items={data.rocks} geometry="rock" material="rock" fill={fillRock} />}
      {data.bushes.length > 0 && <Instances items={data.bushes} geometry="bush" material="bush" fill={fillBush} shadow={false} />}
      {data.symbols.map((sym) => (
        <Pickup key={sym.key} place={sym} />
      ))}
      {data.sites.map((site) => (
        <SiteArea key={site.site.id} place={site} />
      ))}
    </group>
  );
});

/**
 * Mounts the chunks around the player; everything further away is unmounted and freed.
 * New chunks are added one per frame, nearest first, so crossing a chunk border never
 * builds a whole row of terrain in a single frame.
 */
export function Chunks() {
  const [keys, setKeys] = useState<string[]>([]);
  const mounted = useRef<string[]>([]);
  const settled = useRef('');

  useFrame(() => {
    // Nothing to do until the player enters another chunk.
    const here = chunkKey(chunkOf(runtime.focus.x), chunkOf(runtime.focus.z));
    if (here === settled.current) return;
    const want = visibleChunkKeys(runtime.focus.x, runtime.focus.z);
    const kept = mounted.current.filter((k) => want.includes(k));
    const missing = want.filter((k) => !kept.includes(k));
    if (!missing.length && kept.length === mounted.current.length) {
      settled.current = here;
      return;
    }
    const cx = chunkOf(runtime.focus.x);
    const cz = chunkOf(runtime.focus.z);
    const dist = (k: string) => {
      const c = chunks.get(k)!;
      return Math.max(Math.abs(c.cx - cx), Math.abs(c.cz - cz));
    };
    missing.sort((a, b) => dist(a) - dist(b));
    // The player's own chunk and its neighbours are needed at once (e.g. after a restart).
    const add = missing.filter((k, i) => i === 0 || dist(k) === 0 || (kept.length === 0 && dist(k) <= 1));
    mounted.current = [...kept, ...add];
    setKeys(mounted.current);
  });

  return (
    <>
      {keys.map((key) => (
        <Chunk key={key} data={chunks.get(key)!} />
      ))}
    </>
  );
}
