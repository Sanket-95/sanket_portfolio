import { useMemo, useRef } from 'react';
import { ExtrudeGeometry, type BufferGeometry, type Mesh } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { brandIcons, type BrandKey } from '@/data/brandIcons';

// 3D tech logos: the same SVG marks the site shows in its tech stack (src/data/brandIcons.ts),
// extruded into solid symbols. Geometries are built once per logo and shared.

const cache = new Map<BrandKey, BufferGeometry>();

/** Extruded, centred geometry for a brand logo, 1 unit wide/tall, 0.2 deep. */
export function techGeometry(name: BrandKey): BufferGeometry {
  const hit = cache.get(name);
  if (hit) return hit;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${brandIcons[name].path}"/></svg>`;
  const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p));
  const geo = new ExtrudeGeometry(shapes, { depth: 4.8, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.3, bevelSegments: 1, curveSegments: 6 });
  // SVG y points down: flip it, centre the logo and scale 24 units to 1.
  geo.center();
  geo.scale(1 / 24, -1 / 24, 1 / 24);
  geo.computeVertexNormals();
  cache.set(name, geo);
  return geo;
}

/** Frees every cached logo geometry (call when the game unmounts). */
export function disposeTechGeometries() {
  cache.forEach((geo) => geo.dispose());
  cache.clear();
}

/** Colour of a logo, brightened where the brand colour is too dark to read in 3D. */
export function techColor(name: BrandKey) {
  const dark: Partial<Record<BrandKey, string>> = { threejs: '#f5f5f5', mqtt: '#c561c5', dotnet: '#9b7bff', nodejs: '#6cc24a' };
  return dark[name] ?? brandIcons[name].hex;
}

type GroupProps = ThreeElements['group'];

/** A glowing 3D tech logo that slowly spins. `size` is its width in world units. */
export function TechSymbol({ name, size = 1, glow = 0.45, spin = 0.8, ...props }: { name: BrandKey; size?: number; glow?: number; spin?: number } & GroupProps) {
  const geometry = useMemo(() => techGeometry(name), [name]);
  const mesh = useRef<Mesh>(null);
  const color = techColor(name);
  useFrame((_, dt) => {
    if (mesh.current) mesh.current.rotation.y += dt * spin;
  });
  return (
    <group {...props}>
      <mesh ref={mesh} geometry={geometry} scale={size} castShadow>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} metalness={0.2} roughness={0.35} />
      </mesh>
    </group>
  );
}
