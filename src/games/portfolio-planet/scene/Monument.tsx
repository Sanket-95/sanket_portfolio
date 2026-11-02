import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, MeshStandardMaterial, type Group, type Vector3 } from 'three';
import type { Monument as MonumentData } from '../data/projects';
import { useGame } from '../hooks/useGameStore';
import { RADIUS, uprightAt } from './layout';
import { TechSymbol } from '@/games/shared/TechSymbol';
import { ScreenshotBoard } from '@/games/shared/ScreenshotBoard';

const STONE = '#e7e2d6';

/** A project monument: a stone plinth with a distinct, softly glowing shape on top. */
export function Monument({ monument, dir }: { monument: MonumentData; dir: Vector3 }) {
  const spinner = useRef<Group>(null);
  const near = useGame((s) => s.nearMonument === monument.id);
  const accent = useMemo(() => new Color(monument.color), [monument.color]);
  // One shared glowing material per monument, so every accent piece pulses together.
  const glow = useMemo(
    () => new MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.6, flatShading: true, roughness: 0.4 }),
    [accent],
  );
  useEffect(() => () => glow.dispose(), [glow]);
  const quaternion = useMemo(() => uprightAt(dir), [dir]);
  const position = useMemo(() => dir.clone().multiplyScalar(RADIUS - 0.05), [dir]);

  useFrame(({ clock }, dt) => {
    const pulse = 0.55 + Math.sin(clock.elapsedTime * 2 + position.x) * 0.2;
    const m = glow;
    m.emissiveIntensity += ((near ? 1.4 : pulse) - m.emissiveIntensity) * Math.min(1, dt * 6);
    if (spinner.current) spinner.current.rotation.y += dt * 0.6;
  });

  return (
    <group position={position} quaternion={quaternion}>
      {/* Plinth */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.05, 1.2, 0.4, 8]} />
        <meshStandardMaterial color={STONE} flatShading roughness={0.9} />
      </mesh>

      {monument.shape === 'tower' && (
        <group position={[0, 0.4, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.45 + i * 0.75, 0]} castShadow>
              <boxGeometry args={[0.9 - i * 0.2, 0.75, 0.9 - i * 0.2]} />
              <meshStandardMaterial color={STONE} flatShading roughness={0.85} />
            </mesh>
          ))}
          <mesh position={[0, 2.75, 0]} castShadow material={glow}>
            <coneGeometry args={[0.3, 0.6, 4]} />
          </mesh>
        </group>
      )}

      {monument.shape === 'crystal' && (
        <group ref={spinner} position={[0, 1.8, 0]}>
          <mesh scale={[0.75, 1.5, 0.75]} castShadow material={glow}>
            <octahedronGeometry args={[1, 0]} />
          </mesh>
        </group>
      )}

      {monument.shape === 'pillar' && (
        <group position={[0, 0.4, 0]}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.4, 2.2, 7]} />
            <meshStandardMaterial color={STONE} flatShading roughness={0.85} />
          </mesh>
          <group ref={spinner} position={[0, 2.6, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow material={glow}>
              <torusGeometry args={[0.6, 0.1, 6, 16]} />
            </mesh>
            <mesh material={glow}>
              <icosahedronGeometry args={[0.28, 0]} />
            </mesh>
          </group>
        </group>
      )}

      {monument.shape === 'arch' && (
        <group position={[0, 0.4, 0]}>
          {[-0.65, 0.65].map((x) => (
            <mesh key={x} position={[x, 0.85, 0]} castShadow>
              <boxGeometry args={[0.35, 1.7, 0.45]} />
              <meshStandardMaterial color={STONE} flatShading roughness={0.85} />
            </mesh>
          ))}
          <mesh position={[0, 1.7, 0]} castShadow material={glow}>
            <torusGeometry args={[0.65, 0.2, 6, 12, Math.PI]} />
          </mesh>
        </group>
      )}

      {monument.shape === 'dome' && (
        <group position={[0, 0.4, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.95, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={STONE} flatShading roughness={0.85} />
          </mesh>
          <mesh position={[0, 1.15, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.5, 5]} />
            <meshStandardMaterial color={STONE} flatShading />
          </mesh>
          <group ref={spinner} position={[0, 1.55, 0]}>
            <mesh castShadow material={glow}>
              <dodecahedronGeometry args={[0.3, 0]} />
            </mesh>
          </group>
        </group>
      )}

      {monument.icon && (
        <TechSymbol name={monument.icon} size={0.9} position={[0, 3.9, 0]} />
      )}
      {monument.image && <ScreenshotBoard image={monument.image} width={2.2} position={[1.9, 0, 0.6]} />}

      {/* Ground ring that brightens when the player is close. */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.45, 1.75, 24]} />
        <meshBasicMaterial color={accent} transparent opacity={near ? 0.75 : 0.25} />
      </mesh>
    </group>
  );
}
