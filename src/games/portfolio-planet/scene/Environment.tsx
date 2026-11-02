import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import {
  Color,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  Matrix4,
  Object3D,
  Quaternion,
  Vector3,
  type DirectionalLight,
  type HemisphereLight,
  type InstancedMesh,
} from 'three';
import { angleBetween, monumentLayout, partLayout, RADIUS, seeded, shipDir, startDir, uprightAt } from './layout';

const TREE_COUNT = 46;
const ROCK_COUNT = 34;

/** Scatter points on the sphere, away from monuments, parts, the ship and each other. */
function scatter(count: number, seed: number, minGap: number, keepClear: { dir: Vector3; deg: number }[]) {
  const rand = seeded(seed);
  const out: Vector3[] = [];
  for (let tries = 0; out.length < count && tries < count * 60; tries++) {
    const u = rand() * 2 - 1;
    const t = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    const d = new Vector3(r * Math.cos(t), u, r * Math.sin(t));
    if (keepClear.some((k) => angleBetween(d, k.dir) < k.deg)) continue;
    if (out.some((o) => angleBetween(d, o) < minGap)) continue;
    out.push(d);
  }
  return out;
}

const clearZones = [
  { dir: shipDir, deg: 16 },
  { dir: startDir, deg: 9 },
  ...monumentLayout.map((m) => ({ dir: m.dir, deg: 13 })),
  ...partLayout.map((p) => ({ dir: p.dir, deg: 6 })),
];

export const treeDirs = scatter(TREE_COUNT, 7, 7, clearZones);
const rockDirs = scatter(ROCK_COUNT, 21, 5, [...clearZones, ...treeDirs.map((dir) => ({ dir, deg: 3 }))]);

/** Instanced low-poly trees and rocks. */
function Scenery() {
  const trunks = useRef<InstancedMesh>(null);
  const crowns = useRef<InstancedMesh>(null);
  const rocks = useRef<InstancedMesh>(null);

  const geos = useMemo(
    () => ({
      trunk: new CylinderGeometry(0.1, 0.15, 0.7, 5).translate(0, 0.35, 0),
      crown: new ConeGeometry(0.62, 1.5, 6).translate(0, 1.35, 0),
      rock: new DodecahedronGeometry(0.32, 0),
    }),
    [],
  );
  useEffect(() => () => Object.values(geos).forEach((g) => g.dispose()), [geos]);

  useLayoutEffect(() => {
    const rand = seeded(3);
    const m = new Matrix4();
    const q = new Quaternion();
    const spin = new Quaternion();
    const s = new Vector3();
    const p = new Vector3();
    const c = new Color();
    const yAxis = new Vector3(0, 1, 0);

    treeDirs.forEach((dir, i) => {
      uprightAt(dir, q).multiply(spin.setFromAxisAngle(yAxis, rand() * 6.28));
      const size = 0.8 + rand() * 0.55;
      m.compose(p.copy(dir).multiplyScalar(RADIUS - 0.05), q, s.setScalar(size));
      trunks.current!.setMatrixAt(i, m);
      crowns.current!.setMatrixAt(i, m);
      crowns.current!.setColorAt(i, c.setHSL(0.3 + rand() * 0.08, 0.5, 0.3 + rand() * 0.1));
    });
    rockDirs.forEach((dir, i) => {
      uprightAt(dir, q).multiply(spin.setFromAxisAngle(yAxis, rand() * 6.28));
      s.set(0.7 + rand() * 0.9, 0.5 + rand() * 0.5, 0.7 + rand() * 0.9);
      m.compose(p.copy(dir).multiplyScalar(RADIUS + 0.05), q, s);
      rocks.current!.setMatrixAt(i, m);
      rocks.current!.setColorAt(i, c.setHSL(0.08, 0.06, 0.48 + rand() * 0.16));
    });
    for (const mesh of [trunks.current!, crowns.current!, rocks.current!]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, []);

  return (
    <>
      <instancedMesh ref={trunks} args={[geos.trunk, undefined, treeDirs.length]} castShadow>
        <meshStandardMaterial color="#7a4e2d" flatShading roughness={1} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[geos.crown, undefined, treeDirs.length]} castShadow>
        <meshStandardMaterial flatShading roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={rocks} args={[geos.rock, undefined, rockDirs.length]} castShadow receiveShadow>
        <meshStandardMaterial flatShading roughness={1} />
      </instancedMesh>
    </>
  );
}

// Day → dusk → night → dawn, looping. Sky gradient (top, bottom) and light colours.
const CYCLE_SECONDS = 120;
const KEYS = [
  { top: '#3b6fd8', bottom: '#a5d8ff', sun: '#fff1d6', sunI: 2.6, sky: '#cfe8ff', ground: '#4b6b3a', hemiI: 1.1 },
  { top: '#3a3f8f', bottom: '#f6a77a', sun: '#ffb380', sunI: 2.0, sky: '#f0c3a8', ground: '#4b4a3a', hemiI: 0.95 },
  { top: '#0b1030', bottom: '#2a2f6b', sun: '#9fb4ff', sunI: 1.1, sky: '#6d7fc9', ground: '#2a3550', hemiI: 0.85 },
  { top: '#3d4c9a', bottom: '#f3b7c5', sun: '#ffd1b8', sunI: 1.9, sky: '#e3c9e6', ground: '#4b5a3a', hemiI: 0.95 },
].map((k) => ({
  ...k,
  topC: new Color(k.top),
  bottomC: new Color(k.bottom),
  sunC: new Color(k.sun),
  skyC: new Color(k.sky),
  groundC: new Color(k.ground),
}));

const tmpA = new Color();
const tmpB = new Color();
const sunDir = new Vector3();
const camRight = new Vector3();
const camBack = new Vector3();

/** Lights, stars, the gradient sky (CSS behind a transparent canvas) and scenery. */
export function Environment() {
  const sun = useRef<DirectionalLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const canvas = useThree((s) => s.gl.domElement);
  const target = useMemo(() => new Object3D(), []);
  const lastSky = useRef(-1);

  useFrame(({ camera, clock }) => {
    const phase = ((clock.elapsedTime / CYCLE_SECONDS) % 1) * KEYS.length;
    const i = Math.floor(phase);
    const f = phase - i;
    const ease = f * f * (3 - 2 * f);
    const a = KEYS[i];
    const b = KEYS[(i + 1) % KEYS.length];

    // The sun sits above, behind and to the side of the camera, so the visible side is always lit.
    camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
    camBack.set(0, 0, 1).applyQuaternion(camera.quaternion);
    sunDir.copy(camera.up).addScaledVector(camBack, 0.9).addScaledVector(camRight, 0.6).normalize();
    sun.current!.position.copy(sunDir).multiplyScalar(30);
    sun.current!.color.lerpColors(a.sunC, b.sunC, ease);
    sun.current!.intensity = a.sunI + (b.sunI - a.sunI) * ease;
    hemi.current!.color.lerpColors(a.skyC, b.skyC, ease);
    hemi.current!.groundColor.lerpColors(a.groundC, b.groundC, ease);
    hemi.current!.intensity = a.hemiI + (b.hemiI - a.hemiI) * ease;
    hemi.current!.position.copy(camera.up);

    // Update the CSS sky a few times a second, not every frame.
    const step = Math.floor(clock.elapsedTime * 4);
    if (step !== lastSky.current) {
      lastSky.current = step;
      tmpA.lerpColors(a.topC, b.topC, ease);
      tmpB.lerpColors(a.bottomC, b.bottomC, ease);
      canvas.style.background = `linear-gradient(to bottom, #${tmpA.getHexString()}, #${tmpB.getHexString()})`;
    }
  });

  return (
    <>
      <hemisphereLight ref={hemi} intensity={1} />
      <primitive object={target} />
      <directionalLight
        ref={sun}
        target={target}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0008}
        shadow-normalBias={0.03}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={13}
        shadow-camera-bottom={-13}
        shadow-camera-near={5}
        shadow-camera-far={60}
      />
      <Stars radius={90} depth={40} count={1400} factor={4} saturation={0} fade speed={0.6} />
      <Scenery />
    </>
  );
}
