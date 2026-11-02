import { useEffect, useMemo } from 'react';
import { BufferAttribute, Color, IcosahedronGeometry, Vector3 } from 'three';
import { RADIUS } from './layout';

const GRASS = ['#6cc24a', '#5fb043', '#79cc52', '#58a83e'].map((c) => new Color(c));
const MEADOW = new Color('#a3d65c');
const SAND = new Color('#e8cf8a');

/** Smooth, cheap 3D noise from sines: enough for colour patches and gentle bumps. */
const wave = (v: Vector3) =>
  Math.sin(v.x * 0.9 + 1.3) * Math.sin(v.y * 1.1 + 0.4) * Math.sin(v.z * 0.8 + 2.1);

/** Low-poly planet: a faceted icosphere with tiny bumps and per-face colours. */
export function Planet() {
  const geometry = useMemo(() => {
    const geo = new IcosahedronGeometry(RADIUS, 6);
    const pos = geo.getAttribute('position');
    const v = new Vector3();

    // Bump each vertex by a function of its position, so shared corners move together.
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = v.clone().normalize();
      const bump = 0.08 * Math.sin(n.x * 23.1 + n.y * 17.3) * Math.cos(n.z * 19.7 - n.x * 7.1);
      v.copy(n).multiplyScalar(RADIUS + bump);
      pos.setXYZ(i, v.x, v.y, v.z);
    }

    // One colour per triangle for the faceted look.
    const colors = new Float32Array(pos.count * 3);
    const a = new Vector3();
    const b = new Vector3();
    const c = new Vector3();
    const color = new Color();
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i);
      b.fromBufferAttribute(pos, i + 1);
      c.fromBufferAttribute(pos, i + 2);
      const centre = a.add(b).add(c).divideScalar(3);
      const w = wave(centre);
      color.copy(GRASS[(i / 3) % GRASS.length]);
      if (w > 0.35) color.lerp(SAND, 0.75);
      else if (w > 0.18) color.lerp(MEADOW, 0.6);
      for (let k = 0; k < 3; k++) color.toArray(colors, (i + k) * 3);
    }
    geo.setAttribute('color', new BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors flatShading roughness={0.95} />
    </mesh>
  );
}
