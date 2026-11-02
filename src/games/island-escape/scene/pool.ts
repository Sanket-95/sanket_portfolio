import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  DodecahedronGeometry,
  DoubleSide,
  IcosahedronGeometry,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  SpriteMaterial,
  type Material,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { disposeTechGeometries } from '@/games/shared/TechSymbol';

// Geometries, materials and textures shared by every chunk and site. Created once,
// on first use, and disposed together when the game unmounts (disposePool).

/** A curved, tapering palm trunk with coconuts under the crown. */
function palmTrunk() {
  const parts: BufferGeometry[] = [];
  const segments = 5;
  for (let i = 0; i < segments; i++) {
    const r0 = 0.2 - i * 0.02;
    const seg = new CylinderGeometry(r0 - 0.02, r0, 0.95, 6);
    seg.rotateZ(-0.05 - i * 0.03);
    seg.translate(0.035 * i * i + 0.02, 0.45 + i * 0.9, 0);
    parts.push(seg);
  }
  const top = { x: 0.035 * 16 + 0.1, y: 4.45 };
  for (let i = 0; i < 3; i++) {
    const nut = new SphereGeometry(0.16, 6, 4);
    const a = (i / 3) * Math.PI * 2;
    nut.translate(top.x + Math.cos(a) * 0.2, top.y - 0.2, Math.sin(a) * 0.2);
    parts.push(nut);
  }
  const merged = mergeGeometries(parts.map((p) => p.toNonIndexed()));
  parts.forEach((p) => p.dispose());
  return merged;
}

/** Drooping palm fronds: creased diamond blades around the trunk top. */
function palmLeaves() {
  const blade = new BufferGeometry();
  // base, left, ridge, right, tip
  const v = [
    [0, 0, 0],
    [-0.42, -0.08, 1],
    [0, 0.12, 1],
    [0.42, -0.08, 1],
    [0, -0.35, 2.4],
  ];
  const tris = [0, 1, 2, 0, 2, 3, 1, 4, 2, 2, 4, 3];
  blade.setAttribute('position', new BufferAttribute(new Float32Array(tris.flatMap((i) => v[i])), 3));
  const parts: BufferGeometry[] = [];
  const count = 8;
  for (let i = 0; i < count; i++) {
    const b = blade.clone();
    b.rotateX(0.32 + (i % 2) * 0.25);
    b.rotateY((i / count) * Math.PI * 2 + (i % 2) * 0.3);
    b.translate(0.035 * 16 + 0.1, 4.5, 0);
    parts.push(b);
  }
  const merged = mergeGeometries(parts);
  merged.computeVertexNormals();
  parts.forEach((p) => p.dispose());
  blade.dispose();
  return merged;
}

function canvasTexture(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d')!);
  return new CanvasTexture(canvas);
}

function createPool() {
  const glow = canvasTexture(64, 64, (c) => {
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.22, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
  });
  // Bright at the bottom, transparent at the top (alpha maps read the green channel).
  const fade = canvasTexture(4, 64, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, '#000');
    g.addColorStop(1, '#fff');
    c.fillStyle = g;
    c.fillRect(0, 0, 4, 64);
  });

  return {
    geometry: {
      palmTrunk: palmTrunk(),
      palmLeaves: palmLeaves(),
      rock: new DodecahedronGeometry(1, 0),
      bush: new IcosahedronGeometry(0.7, 0).scale(1, 0.75, 1).translate(0, 0.3, 0),
    },
    material: {
      terrain: new MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }),
      trunk: new MeshStandardMaterial({ color: '#8b5e34', flatShading: true, roughness: 1 }),
      leaves: new MeshStandardMaterial({ flatShading: true, roughness: 0.85, side: DoubleSide }),
      rock: new MeshStandardMaterial({ flatShading: true, roughness: 1 }),
      bush: new MeshStandardMaterial({ flatShading: true, roughness: 0.9 }),
      beam: new MeshBasicMaterial({
        alphaMap: fade,
        transparent: true,
        opacity: 0.55,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide,
        fog: false,
      }),
    },
    /**
     * Shadow-pass materials for instanced meshes (with and without per-instance colours).
     * Without them three.js shares one depth material between instanced and plain meshes
     * and re-derives its shader program each time it switches between them, every frame.
     */
    depth: { instanced: new MeshDepthMaterial(), instancedColor: new MeshDepthMaterial() },
    texture: { glow, fade },
    colors: new Map<string, MeshStandardMaterial>(),
    sprites: new Map<string, SpriteMaterial>(),
  };
}

type Pool = ReturnType<typeof createPool>;
let current: Pool | null = null;

export const pool = (): Pool => (current ??= createPool());

/** A shared flat-shaded material for a colour (optionally glowing / metallic). */
export function mat(color: string, emissive = 0, metal = 0) {
  const key = `${color}|${emissive}|${metal}`;
  const p = pool();
  let m = p.colors.get(key);
  if (!m) {
    m = new MeshStandardMaterial({
      color,
      flatShading: true,
      roughness: metal ? 0.25 : 0.85,
      metalness: metal,
      emissive: emissive ? color : '#000000',
      emissiveIntensity: emissive,
    });
    p.colors.set(key, m);
  }
  return m;
}

/** A shared additive glow sprite material for a colour. */
export function glowMaterial(color: string) {
  const p = pool();
  let m = p.sprites.get(color);
  if (!m) {
    m = new SpriteMaterial({ map: p.texture.glow, color, blending: AdditiveBlending, depthWrite: false, transparent: true });
    p.sprites.set(color, m);
  }
  return m;
}

export function disposePool() {
  if (!current) return;
  const p = current;
  current = null;
  Object.values(p.geometry).forEach((g) => g.dispose());
  const materials: Material[] = [...Object.values(p.material), ...Object.values(p.depth), ...p.colors.values(), ...p.sprites.values()];
  materials.forEach((m) => m.dispose());
  Object.values(p.texture).forEach((t) => t.dispose());
  disposeTechGeometries();
}
