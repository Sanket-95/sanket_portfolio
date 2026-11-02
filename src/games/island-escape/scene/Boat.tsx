import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  CircleGeometry,
  Color,
  DoubleSide,
  Matrix4,
  MeshBasicMaterial,
  Quaternion,
  Shape,
  Vector3,
  type Group,
  type InstancedMesh,
  type Mesh,
} from 'three';
import { TechSymbol, techColor } from '@/games/shared/TechSymbol';
import type { BrandKey } from '@/data/brandIcons';
import { symbols } from '../data/island';
import { boatOut, boatSpot } from '../world/terrain';
import { actions, getState, isComplete, useGame } from '../hooks/useGameStore';
import { sfx } from '../audio';
import { mat } from './pool';
import { runtime, waveHeight } from './runtime';

// Timeline of the ending, in seconds since the player reached the boat (runtime.sequence).
const N = symbols.length;
const FLY_START = 0.6;
const FLY_STEP = Math.min(0.22, 4 / N);
const FLY_TIME = 0.55;
const landAt = (i: number) => FLY_START + i * FLY_STEP + FLY_TIME;
const REPAIRED_AT = landAt(N - 1) + 0.4;
export const BOARD_AT = REPAIRED_AT + 0.4;
export const BOARD_TIME = 0.8;
const SAIL_AT = BOARD_AT + BOARD_TIME + 0.4;
const WIN_AFTER = 7;

const WOOD = '#9a6a3c';
const DARK_WOOD = '#6b4423';
const TILT = 0.34;
/** Height of the hull bottom while it lies on the sand. */
const BASE_Y = 0.08;

/** The boat parts the symbols turn into, in order. Local space: bow along +z. */
interface Slot {
  p: [number, number, number];
  node: (color: string) => ReactNode;
}

const plank = (side: number, row: number): Slot => ({
  p: [side * (0.66 + row * 0.07), 0.3 + row * 0.17, 0],
  node: (c) => (
    <mesh receiveShadow rotation={[0, 0, side * 0.22]} material={mat(c)} castShadow>
      <boxGeometry args={[0.09, 0.19, 4.6 - row * 0.15]} />
    </mesh>
  ),
});

const sail = (() => {
  const s = new Shape();
  s.moveTo(0, 1.05);
  s.lineTo(0, 4.3);
  s.lineTo(2.05, 1.15);
  s.closePath();
  return s;
})();

const SLOTS: Slot[] = [
  ...Array.from({ length: 10 }, (_, i) => plank(i % 2 ? 1 : -1, Math.floor(i / 2))),
  ...[-1.5, -0.45, 1.5].map(
    (z): Slot => ({
      p: [0, 0.62, z],
      node: (c) => (
        <mesh material={mat(c)} castShadow receiveShadow>
          <boxGeometry args={[1.35, 0.07, 0.85]} />
        </mesh>
      ),
    }),
  ),
  {
    p: [0, 0.75, 2.75],
    node: (c) => (
      <mesh receiveShadow rotation={[Math.PI / 2, Math.PI / 4, 0]} material={mat(c)} castShadow>
        <coneGeometry args={[0.62, 0.9, 4]} />
      </mesh>
    ),
  },
  {
    p: [0, 2.6, 0.4],
    node: () => (
      <mesh receiveShadow material={mat('#d6b48a')} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 4.2, 6]} />
      </mesh>
    ),
  },
  {
    p: [0, 1.15, -0.6],
    node: () => (
      <mesh receiveShadow rotation={[Math.PI / 2, 0, 0]} material={mat('#d6b48a')}>
        <cylinderGeometry args={[0.05, 0.05, 2.1, 5]} />
      </mesh>
    ),
  },
  {
    p: [0, 0, 0.4],
    node: (c) => (
      <group>
        <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
          <shapeGeometry args={[sail]} />
          <meshStandardMaterial color="#fffaf0" side={DoubleSide} flatShading />
        </mesh>
        <mesh position={[0, 2.4, -0.55]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.32, 10]} />
          <meshBasicMaterial color={c} side={DoubleSide} />
        </mesh>
      </group>
    ),
  },
  {
    p: [0, 4.5, 0.12],
    node: (c) => (
      <mesh receiveShadow material={mat(c, 0.3)}>
        <boxGeometry args={[0.03, 0.3, 0.55]} />
      </mesh>
    ),
  },
  {
    p: [0, 0.9, -2.72],
    node: (c) => (
      <group>
        <mesh receiveShadow material={mat('#334155')} castShadow>
          <boxGeometry args={[0.45, 0.6, 0.42]} />
        </mesh>
        <mesh receiveShadow position={[0, 0.33, 0]} material={mat(c)}>
          <boxGeometry args={[0.47, 0.1, 0.44]} />
        </mesh>
      </group>
    ),
  },
  {
    p: [0, 0.22, -2.85],
    node: () => (
      <group name="propeller">
        {[0, Math.PI / 2].map((r) => (
          <mesh receiveShadow key={r} rotation={[0, 0, r]} material={mat('#cbd5e1', 0, 0.6)}>
            <boxGeometry args={[0.5, 0.08, 0.03]} />
          </mesh>
        ))}
      </group>
    ),
  },
];

/** Which symbol fills slot `i` (works for any number of symbols). */
const symbolForSlot = (i: number) => Math.min(N - 1, Math.floor((i * N) / SLOTS.length));
const easeOutBack = (k: number) => 1 + 2.7 * (k - 1) ** 3 + 1.7 * (k - 1) ** 2;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const local = new Vector3();
const from = new Vector3();
const wakeMatrix = new Matrix4();
const flat = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
const wakeScale = new Vector3();
const wakePos = new Vector3();

const WAKE = 48;

/** Foam discs dropped behind the boat while it sails; they spread and fade out. */
function Wake({ boat }: { boat: RefObject<Group | null> }) {
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new CircleGeometry(0.5, 8), []);
  const material = useMemo(() => new MeshBasicMaterial({ color: '#f0fbff', transparent: true, opacity: 0.75, depthWrite: false }), []);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  const drops = useRef(Array.from({ length: WAKE }, () => ({ x: 0, z: 0, born: -99, side: 0 })));
  const next = useRef(0);
  const last = useRef(0);

  useFrame(({ clock }) => {
    const mesh = ref.current!;
    const now = clock.elapsedTime;
    const sailing = getState().phase === 'sailing';
    if (sailing && boat.current && now - last.current > 0.07) {
      last.current = now;
      local.set(((next.current % 2) * 2 - 1) * 0.35, 0, -2.9);
      boat.current.localToWorld(local);
      drops.current[next.current] = { x: local.x, z: local.z, born: now, side: (next.current % 2) * 2 - 1 };
      next.current = (next.current + 1) % WAKE;
    }
    drops.current.forEach((d, i) => {
      // The clock restarts when the render loop pauses, so guard against negative ages.
      const k = (now - d.born) / 2;
      const size = k < 0 || k >= 1 ? 0 : (0.6 + k * 2.4) * (1 - k * k);
      wakePos.set(d.x, 0.06 + waveHeight(d.x, d.z, now), d.z);
      wakeMatrix.compose(wakePos, flat, wakeScale.set(size, size, size));
      mesh.setMatrixAt(i, wakeMatrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geometry, material, WAKE]} frustumCulled={false} />;
}

/** The wrecked boat on the beach, its repair, and the voyage home. */
export function Boat() {
  const group = useRef<Group>(null);
  const slots = useRef<(Group | null)[]>([]);
  const flyers = useRef<(Group | null)[]>([]);
  const ring = useRef<Mesh>(null);
  const phase = useGame((s) => s.phase);
  const collected = useGame((s) => s.collected);
  const sequenceActive = phase === 'repairing' || phase === 'sailing' || phase === 'won';
  const landed = useRef(0);
  const yaw = Math.atan2(boatOut.x, boatOut.z);

  const colorFor = (i: number) => {
    const key = collected[symbolForSlot(i)] as BrandKey | undefined;
    return key ? `#${new Color(WOOD).lerp(new Color(techColor(key)), 0.55).getHexString()}` : WOOD;
  };

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = getState();
    const g = group.current!;
    if (s.phase === 'repairing' || s.phase === 'sailing') runtime.sequence += dt;
    const t = sequenceActive ? runtime.sequence : 0;

    // Repair progress rights the boat; sailing moves it out to sea.
    const repaired = sequenceActive ? clamp01((t - FLY_START) / (REPAIRED_AT - FLY_START)) : 0;
    const sailT = Math.max(0, t - SAIL_AT);
    const dist = sailT < 3.6 ? 1.25 * sailT * sailT : 16.2 + 9 * (sailT - 3.6);
    const x = boatSpot.x + boatOut.x * dist;
    const z = boatSpot.z + boatOut.z * dist;
    const afloat = clamp01(sailT / 1.5);
    const now = clock.elapsedTime;
    g.position.set(x, BASE_Y + afloat * (-0.15 + waveHeight(x, z, now) - BASE_Y), z);
    g.rotation.set(Math.sin(now * 2) * 0.04 * afloat, yaw, TILT * (1 - repaired));

    runtime.boat.copy(g.position);
    runtime.boatYaw = yaw;
    g.updateMatrixWorld();
    runtime.deck.set(0, 0.66, -0.95);
    g.localToWorld(runtime.deck);

    // Parts appear as their symbol lands.
    let count = 0;
    SLOTS.forEach((_, i) => {
      const slot = slots.current[i];
      if (!slot) return;
      const at = landAt(symbolForSlot(i));
      const k = sequenceActive ? clamp01((t - at) / 0.25) : 0;
      if (k > 0) count++;
      slot.visible = k > 0;
      slot.scale.setScalar(Math.max(0.001, easeOutBack(k)));
      if (sailT > 0) {
        const prop = slot.getObjectByName('propeller');
        if (prop) prop.rotation.z += dt * 30;
      }
    });
    if (s.phase === 'repairing' && count > landed.current) {
      landed.current = count;
      sfx.fit(count);
      if (count === SLOTS.length) sfx.ready();
    }

    // Collected symbols fly from the player into their slot.
    flyers.current.forEach((f, i) => {
      if (!f) return;
      const start = FLY_START + i * FLY_STEP;
      const k = (t - start) / FLY_TIME;
      f.visible = s.phase === 'repairing' && k > 0 && k < 1;
      if (!f.visible) return;
      const slotIndex = SLOTS.findIndex((_, si) => symbolForSlot(si) === i);
      local.set(...SLOTS[Math.max(0, slotIndex)].p);
      g.localToWorld(local);
      const a = (i / N) * Math.PI * 2;
      from.set(runtime.player.x + Math.cos(a) * 0.8, runtime.player.y + 1.6, runtime.player.z + Math.sin(a) * 0.8);
      f.position.lerpVectors(from, local, k);
      f.position.y += Math.sin(Math.PI * k) * 2.4;
      f.scale.setScalar(1 - k * 0.6);
    });

    // A pulsing ring around the boat once it can be repaired.
    const r = ring.current!;
    r.visible = s.phase === 'playing' && isComplete(s);
    if (r.visible) (r.material as MeshBasicMaterial).opacity = 0.5 + Math.sin(now * 4) * 0.3;

    if (s.phase === 'repairing' && t >= SAIL_AT) {
      actions.sail();
      sfx.sail();
    } else if (s.phase === 'sailing' && sailT >= WIN_AFTER) {
      actions.win();
      sfx.win();
    }
  });

  return (
    <>
      <group ref={group} position={[boatSpot.x, BASE_Y, boatSpot.z]}>
        {/* What is left of the wreck: keel, hull floor, ribs, transom and a broken mast. */}
        <mesh receiveShadow position={[0, 0.1, 0]} material={mat(DARK_WOOD)} castShadow>
          <boxGeometry args={[0.22, 0.2, 5.4]} />
        </mesh>
        <mesh position={[0, 0.22, 0]} material={mat(DARK_WOOD)} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.1, 4.4]} />
        </mesh>
        {[-1.7, -0.6, 0.5, 1.6].flatMap((z) =>
          [-1, 1].map((side) => (
            <mesh receiveShadow key={`${z}${side}`} position={[side * 0.8, 0.6, z]} rotation={[0, 0, side * 0.22]} material={mat(DARK_WOOD)} castShadow>
              <boxGeometry args={[0.1, 0.85, 0.12]} />
            </mesh>
          )),
        )}
        <mesh receiveShadow position={[0, 0.55, -2.45]} material={mat(DARK_WOOD)} castShadow>
          <boxGeometry args={[1.5, 0.75, 0.1]} />
        </mesh>
        <mesh receiveShadow position={[0, 0.75, 2.5]} rotation={[0.3, 0, 0]} material={mat(DARK_WOOD)} castShadow>
          <boxGeometry args={[0.15, 1.1, 0.15]} />
        </mesh>
        {!sequenceActive && (
          <mesh receiveShadow position={[0.15, 0.85, 0.4]} rotation={[0, 0, -0.35]} material={mat('#d6b48a')} castShadow>
            <cylinderGeometry args={[0.08, 0.09, 1.2, 6]} />
          </mesh>
        )}
        {SLOTS.map((slot, i) => (
          <group
            key={i}
            ref={(el) => {
              slots.current[i] = el;
            }}
            position={slot.p}
            visible={false}
          >
            {slot.node(colorFor(i))}
          </group>
        ))}
      </group>

      {phase === 'repairing' &&
        collected.map((key, i) => (
          <group
            key={key}
            ref={(el) => {
              flyers.current[i] = el;
            }}
            visible={false}
          >
            <TechSymbol name={key as BrandKey} size={0.9} glow={0.9} spin={4} />
          </group>
        ))}

      <mesh ref={ring} position={[boatSpot.x, 0.35, boatSpot.z]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[3.2, 3.6, 40]} />
        <meshBasicMaterial color="#4ade80" transparent depthWrite={false} side={DoubleSide} />
      </mesh>

      <Wake boat={group} />
    </>
  );
}
