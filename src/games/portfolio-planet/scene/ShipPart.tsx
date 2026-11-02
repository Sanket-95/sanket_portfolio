import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, type Group, type Vector3 } from 'three';
import type { PartKind } from '../data/projects';
import { useGame } from '../hooks/useGameStore';
import { RADIUS, uprightAt } from './layout';

const HULL = '#e5e7eb';

/** The geometry of one ship part, in the ship's local frame (also used on the ship itself). */
export function PartMesh({ kind, color, glow = 0.7 }: { kind: PartKind; color: string; glow?: number }) {
  const accent = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} flatShading roughness={0.35} />;
  switch (kind) {
    case 'nose':
      return (
        <mesh castShadow>
          <coneGeometry args={[0.55, 1.1, 8]} />
          {accent}
        </mesh>
      );
    case 'wing-left':
    case 'wing-right': {
      const side = kind === 'wing-left' ? -1 : 1;
      return (
        <mesh castShadow rotation={[0, 0, side * -0.5]}>
          <boxGeometry args={[1.1, 0.75, 0.12]} />
          {accent}
        </mesh>
      );
    }
    case 'dish':
      return (
        <group>
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.12, 0.2, 10]} />
            {accent}
          </mesh>
          <mesh position={[0, 0, 0.22]}>
            <sphereGeometry args={[0.08, 6, 4]} />
            <meshStandardMaterial color={HULL} />
          </mesh>
        </group>
      );
    case 'thruster':
      return (
        <mesh castShadow>
          <cylinderGeometry args={[0.32, 0.5, 0.6, 8]} />
          {accent}
        </mesh>
      );
  }
}

/** A collectable part floating next to its monument, with a light beam to spot it from afar. */
export function ShipPart({ id, kind, color, dir }: { id: string; kind: PartKind; color: string; dir: Vector3 }) {
  const collected = useGame((s) => s.collected.includes(id));
  const float = useRef<Group>(null);
  const root = useRef<Group>(null);
  const pop = useRef(0);
  const quaternion = useMemo(() => uprightAt(dir), [dir]);
  const position = useMemo(() => dir.clone().multiplyScalar(RADIUS), [dir]);

  useFrame(({ clock }, dt) => {
    const g = float.current!;
    g.position.y = 1.15 + Math.sin(clock.elapsedTime * 2.2 + position.x) * 0.15;
    g.rotation.y += dt * 1.4;
    if (collected) {
      // Pop: swell, then shrink away.
      pop.current = Math.min(1, pop.current + dt / 0.4);
      const p = pop.current;
      root.current!.scale.setScalar(p < 0.35 ? 1 + p * 1.6 : Math.max(0, 1.56 * (1 - (p - 0.35) / 0.65)));
      root.current!.visible = p < 1;
    }
  });

  return (
    <group ref={root} position={position} quaternion={quaternion}>
      <group ref={float}>
        <PartMesh kind={kind} color={color} glow={1.1} />
        <mesh>
          <sphereGeometry args={[0.85, 12, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.16} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
      {/* Beam */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.12, 0.3, 8, 8, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
