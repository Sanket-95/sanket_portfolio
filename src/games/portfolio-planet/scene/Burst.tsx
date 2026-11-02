import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Vector3, type PointsMaterial } from 'three';

const COUNT = 48;
const WHITE = new Color('#ffffff');

/** One reusable sparkle burst. Call `burst.emit(position, color)` to fire it. */
export const burst = {
  pending: null as { at: Vector3; color: string } | null,
  emit(at: Vector3, color: string) {
    this.pending = { at: at.clone(), color };
  },
};

export function Burst() {
  const material = useRef<PointsMaterial>(null);
  const life = useRef(1);
  const velocities = useMemo(() => Array.from({ length: COUNT }, () => new Vector3()), []);
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(COUNT * 3), 3));
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, dt) => {
    const pos = geometry.getAttribute('position') as BufferAttribute;
    const p = burst.pending;
    if (p) {
      burst.pending = null;
      life.current = 0;
      material.current!.color.set(p.color).lerp(WHITE, 0.35);
      for (let i = 0; i < COUNT; i++) {
        pos.setXYZ(i, p.at.x, p.at.y, p.at.z);
        velocities[i].randomDirection().multiplyScalar(2 + Math.random() * 3.5);
      }
    }
    if (life.current >= 1) return;
    life.current = Math.min(1, life.current + dt / 0.9);
    for (let i = 0; i < COUNT; i++) {
      velocities[i].multiplyScalar(1 - dt * 2.5);
      pos.setXYZ(i, pos.getX(i) + velocities[i].x * dt, pos.getY(i) + velocities[i].y * dt, pos.getZ(i) + velocities[i].z * dt);
    }
    pos.needsUpdate = true;
    material.current!.opacity = 1 - life.current;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial ref={material} size={0.22} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} />
    </points>
  );
}
