import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import { AdditiveBlending, Group, Quaternion, Vector3, type Mesh } from 'three';
import type { PartKind } from '../data/projects';
import { actions, getState, useGame } from '../hooks/useGameStore';
import { sfx } from '../audio';
import { PartMesh } from './ShipPart';
import { partLayout, RADIUS, runtime, shipDir, tangentAt, uprightAt } from './layout';

const HULL = '#eef0f4';
const TRIM = '#64748b';

/** Where each part sits on the repaired ship (ship-local coordinates). */
const SLOTS: Record<PartKind, [number, number, number]> = {
  nose: [0, 3.55, 0],
  thruster: [0, 0.3, 0],
  'wing-left': [-0.95, 1.15, 0],
  'wing-right': [0.95, 1.15, 0],
  dish: [0, 2.35, 0.62],
};

// Sequence timings (seconds since the player reached the ship with every part).
const PART_START = 0.3;
const PART_GAP = 0.35;
const PART_FLIGHT = 0.8;
const STRAIGHTEN = [2.2, 2.9] as const;
export const BOARD = [2.9, 3.5] as const;
const LAUNCH_AT = 3.6;
const LAUNCH_LENGTH = 3.8;

const CRASH_TILT = 0.42;
const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

const side = tangentAt(shipDir);
const across = new Vector3().crossVectors(shipDir, side);
const camGoal = new Vector3();
const lookGoal = new Vector3();

/** The crashed ship. Runs the repair → board → launch sequence and its camera. */
export function Spaceship() {
  const phase = useGame((s) => s.phase);
  const root = useRef<Group>(null);
  const tilt = useRef<Group>(null);
  const flame = useRef<Mesh>(null);
  const partRefs = useRef<(Group | null)[]>([]);
  const starts = useRef<Vector3[] | null>(null);
  const launched = useRef(false);

  const base = useMemo(() => shipDir.clone().multiplyScalar(RADIUS - 0.1), []);
  const quaternion = useMemo(() => uprightAt(shipDir).multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), 0.6)), []);

  useFrame(({ camera }, dt) => {
    const s = getState();
    const r = root.current!;
    runtime.shipWorld.copy(r.position);
    if (s.phase !== 'repairing' && s.phase !== 'launching' && s.phase !== 'won') return;

    runtime.sequenceTime += dt;
    const t = runtime.sequenceTime;

    // Parts fly from the player into their slots, one after another.
    if (!starts.current) {
      r.updateMatrixWorld();
      starts.current = partLayout.map(() => tilt.current!.worldToLocal(runtime.playerPos.clone().addScaledVector(runtime.playerUp, 0.8)));
      sfx.repair();
    }
    partLayout.forEach(({ part }, i) => {
      const g = partRefs.current[i];
      if (!g) return;
      const k = smooth(PART_START + i * PART_GAP, PART_START + i * PART_GAP + PART_FLIGHT, t);
      g.visible = t > PART_START + i * PART_GAP;
      g.position.lerpVectors(starts.current![i], new Vector3(...SLOTS[part.kind]), k);
      g.position.y += Math.sin(k * Math.PI) * 1.5;
    });

    // The ship rights itself, then lifts off.
    const straight = smooth(STRAIGHTEN[0], STRAIGHTEN[1], t);
    tilt.current!.rotation.x = CRASH_TILT * (1 - straight);
    tilt.current!.position.y = -0.35 * (1 - straight);

    if (t >= LAUNCH_AT && !launched.current) {
      launched.current = true;
      sfx.launch();
      actions.launch();
    }
    const lt = Math.max(0, t - LAUNCH_AT);
    r.position.copy(base).addScaledVector(shipDir, 3.2 * lt * lt + (lt > 0 ? Math.sin(lt * 40) * 0.02 : 0));
    flame.current!.visible = lt > 0;
    flame.current!.scale.set(1, 0.8 + Math.random() * 0.5, 1);
    if (lt > LAUNCH_LENGTH && s.phase === 'launching') {
      sfx.win();
      actions.win();
    }

    // Camera: a side view of the repair, then chase the ship up into space.
    if (lt === 0) {
      camGoal.copy(base).addScaledVector(shipDir, 4.2).addScaledVector(side, 8.5).addScaledVector(across, 3);
      lookGoal.copy(base).addScaledVector(shipDir, 1.8);
    } else {
      camGoal.copy(r.position).addScaledVector(shipDir, -2 + Math.min(lt, 2) * 2).addScaledVector(side, 8.5 + lt * 1.5).addScaledVector(across, 3);
      lookGoal.copy(r.position).addScaledVector(shipDir, 1.5);
    }
    const k = 1 - Math.exp(-dt * (lt > 0 ? 4 : 2.2));
    camera.position.lerp(camGoal, k);
    camera.up.lerp(shipDir, k).normalize();
    camera.lookAt(lookGoal);
  });

  return (
    <group ref={root} position={base} quaternion={quaternion}>
      <group ref={tilt} rotation={[CRASH_TILT, 0, 0]} position={[0, -0.35, 0]}>
        {/* Hull */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.62, 2.4, 10]} />
          <meshStandardMaterial color={HULL} flatShading roughness={0.5} metalness={0.15} />
        </mesh>
        <mesh position={[0, 2.95, 0]} castShadow>
          <cylinderGeometry args={[0.42, 0.55, 0.3, 10]} />
          <meshStandardMaterial color={TRIM} flatShading />
        </mesh>
        <mesh position={[0, 0.66, 0]} castShadow>
          <cylinderGeometry args={[0.62, 0.5, 0.15, 10]} />
          <meshStandardMaterial color={TRIM} flatShading />
        </mesh>
        {/* Window */}
        <mesh position={[0, 2.0, 0.52]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.12, 12]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.5} roughness={0.2} />
        </mesh>

        {/* Repaired parts, hidden until they fly in. */}
        {partLayout.map(({ part, color }, i) => (
          <group
            key={part.id}
            ref={(g) => {
              partRefs.current[i] = g;
            }}
            position={SLOTS[part.kind]}
            visible={false}
          >
            <PartMesh kind={part.kind} color={color} glow={0.35} />
          </group>
        ))}

        {/* Engine flame */}
        <mesh ref={flame} position={[0, -0.45, 0]} rotation={[Math.PI, 0, 0]} visible={false}>
          <coneGeometry args={[0.38, 1.2, 8]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
        {(phase === 'launching' || phase === 'won') && (
          <Trail width={3} length={10} color="#fde68a" attenuation={(w) => w * w}>
            <mesh position={[0, -0.6, 0]}>
              <sphereGeometry args={[0.05, 4, 4]} />
              <meshBasicMaterial color="#fde68a" />
            </mesh>
          </Trail>
        )}
      </group>
    </group>
  );
}
