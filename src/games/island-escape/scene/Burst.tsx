import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, Vector3, type PointsMaterial } from 'three';

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
  // Round, soft sparkles instead of square points.
  const sprite = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    const c = canvas.getContext('2d')!;
    const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.8)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 32, 32);
    return new CanvasTexture(canvas);
  }, []);
  useEffect(
    () => () => {
      geometry.dispose();
      sprite.dispose();
    },
    [geometry, sprite],
  );

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
      <pointsMaterial ref={material} map={sprite} size={0.32} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} />
    </points>
  );
}
