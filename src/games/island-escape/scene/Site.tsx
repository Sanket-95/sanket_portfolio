import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, type Group, type Mesh, type MeshBasicMaterial } from 'three';
import { TechSymbol } from '@/games/shared/TechSymbol';
import { ScreenshotBoard } from '@/games/shared/ScreenshotBoard';
import { WORLD } from '../data/island';
import type { SitePlace } from '../world/layout';
import { terrainHeight } from '../world/terrain';
import { useGame } from '../hooks/useGameStore';
import { Landmark } from './Landmarks';
import { mat } from './pool';
import { runtime } from './runtime';

const DETAIL = WORLD.siteDetailDistance;
const VISITED = '#4ade80';

/** The project's tech logos circling slowly above its landmark. */
function OrbitingLogos({ place }: { place: SitePlace }) {
  const ref = useRef<Group>(null);
  const { logos } = place.site;
  const radius = place.size.r + 1.3;
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.25;
  });
  return (
    <group ref={ref} position={[0, Math.max(2.6, place.size.top * 0.6), 0]}>
      {logos.map((key, i) => {
        const a = (i / logos.length) * Math.PI * 2;
        return <TechSymbol key={key} name={key} size={0.75} glow={0.55} spin={0.9} position={[Math.cos(a) * radius, (i % 2) * 0.5, Math.sin(a) * radius]} />;
      })}
    </group>
  );
}

/** Simple stand-in shown while the player is far away: a block in the site's colours. */
function Placeholder({ place }: { place: SitePlace }) {
  const { r, top } = place.size;
  return (
    <mesh receiveShadow position={[0, top * 0.35, 0]} material={mat('#e2e8f0')} castShadow>
      <boxGeometry args={[r * 1.3, top * 0.7, r * 1.1]} />
    </mesh>
  );
}

/** Ground ring that marks the interaction zone; pulses until the site is visited. */
function ZoneRing({ place, visited }: { place: SitePlace; visited: boolean }) {
  const ref = useRef<Mesh>(null);
  const radius = place.size.r + 1.1;
  useFrame(({ clock }) => {
    const m = ref.current?.material as MeshBasicMaterial | undefined;
    if (m) m.opacity = visited ? 0.65 : 0.45 + Math.sin(clock.elapsedTime * 3) * 0.25;
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]} renderOrder={1}>
      <ringGeometry args={[radius - 0.3, radius, 40]} />
      <meshBasicMaterial color={visited ? VISITED : place.site.color} transparent depthWrite={false} side={DoubleSide} polygonOffset polygonOffsetFactor={-2} />
    </mesh>
  );
}

/** A flag pole beside the site: the site's colour, green once visited. Visible from afar. */
function Flag({ place, visited }: { place: SitePlace; visited: boolean }) {
  const height = place.size.top + 1.6;
  const x = -(place.size.r + 0.7);
  return (
    <group position={[x, 0, place.size.r * 0.4]}>
      <mesh receiveShadow position={[0, height / 2, 0]} material={mat('#e2e8f0')}>
        <cylinderGeometry args={[0.05, 0.06, height, 5]} />
      </mesh>
      <mesh receiveShadow position={[0.45, height - 0.35, 0]} material={mat(visited ? VISITED : place.site.color, 0.35)} castShadow>
        <boxGeometry args={[0.9, 0.55, 0.04]} />
      </mesh>
    </group>
  );
}

/**
 * A project site: landmark, screenshot board, floating logos, zone ring and flag.
 * Within `siteDetailDistance` the full model is mounted and the screenshot texture
 * loads; further away only a placeholder block is drawn and the texture is freed.
 */
export function SiteArea({ place }: { place: SitePlace }) {
  const { site } = place;
  const [near, setNear] = useState(false);
  const nearRef = useRef(false);
  const visited = useGame((s) => s.visited.includes(site.id));
  // The screenshot board stands beside the landmark, on the ground (which may slope there).
  const board = useMemo(() => {
    const bx = place.size.r + 1.3;
    const bz = 1.2;
    const sin = Math.sin(place.rotation);
    const cos = Math.cos(place.rotation);
    const y = terrainHeight(site.x + bx * cos + bz * sin, site.z - bx * sin + bz * cos) - place.y - 0.05;
    return [bx, y, bz] as [number, number, number];
  }, [place, site]);

  useFrame(() => {
    const d = Math.hypot(runtime.player.x - site.x, runtime.player.z - site.z);
    const want = nearRef.current ? d < DETAIL + 4 : d < DETAIL;
    if (want !== nearRef.current) {
      nearRef.current = want;
      setNear(want);
    }
  });

  return (
    <group position={[site.x, place.y, site.z]}>
      <ZoneRing place={place} visited={visited} />
      <group rotation={[0, place.rotation, 0]}>
        {near ? <Landmark kind={site.landmark} color={site.color} /> : <Placeholder place={place} />}
        <Flag place={place} visited={visited} />
        {near && site.image && <ScreenshotBoard image={site.image} width={2.8} position={board} />}
      </group>
      {near && site.logos.length > 0 && <OrbitingLogos place={place} />}
    </group>
  );
}
