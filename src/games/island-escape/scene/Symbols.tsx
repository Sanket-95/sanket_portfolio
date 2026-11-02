import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, CylinderGeometry, Matrix4, Quaternion, Vector3, type Group, type InstancedMesh, type Sprite } from 'three';
import { TechSymbol, techColor } from '@/games/shared/TechSymbol';
import { WORLD } from '../data/island';
import { symbolPlaces, type SymbolPlace } from '../world/layout';
import { getState } from '../hooks/useGameStore';
import { glowMaterial, pool } from './pool';
import { runtime } from './runtime';

const DETAIL = WORLD.symbolDetailDistance;

/**
 * A collectible tech symbol. Far away it is only a glowing sprite; within
 * `symbolDetailDistance` the extruded 3D logo is mounted. Pops and vanishes when collected
 * (the pick-up itself is detected by the player).
 */
export function Pickup({ place }: { place: SymbolPlace }) {
  const group = useRef<Group>(null);
  const halo = useRef<Sprite>(null);
  const [near, setNear] = useState(false);
  const nearRef = useRef(false);
  // Already collected when this chunk mounts: stay hidden, no pop.
  const pop = useRef(getState().collected.includes(place.key) ? 1 : -1);
  const color = techColor(place.key);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const got = getState().collected.includes(place.key);
    if (!got) pop.current = -1;
    else if (pop.current < 0) pop.current = 0;

    if (pop.current >= 1) {
      g.visible = false;
      return;
    }
    g.visible = true;
    const t = clock.elapsedTime;
    g.position.y = place.y + Math.sin(t * 2 + place.index) * 0.18;
    if (pop.current >= 0) {
      pop.current = Math.min(1, pop.current + dt / 0.35);
      const k = pop.current;
      g.scale.setScalar(k < 0.4 ? 1 + k * 1.2 : 1.48 * (1 - (k - 0.4) / 0.6));
    } else {
      g.scale.setScalar(1);
    }
    halo.current!.material.rotation = t * 0.5;

    // Level of detail with a little hysteresis, so it does not flicker on the boundary.
    const d = Math.hypot(runtime.player.x - place.x, runtime.player.z - place.z);
    const want = nearRef.current ? d < DETAIL + 3 : d < DETAIL;
    if (want !== nearRef.current) {
      nearRef.current = want;
      setNear(want);
    }
  });

  return (
    <group ref={group} position={[place.x, place.y, place.z]}>
      <sprite ref={halo} material={glowMaterial(color)} scale={near ? 2 : 2.6} />
      {near && <TechSymbol name={place.key} size={1.15} glow={0.75} spin={1.6} />}
    </group>
  );
}

const m4 = new Matrix4();
const q = new Quaternion();
const p = new Vector3();
const s = new Vector3();
const c = new Color();

/**
 * Soft light beams above every uncollected symbol, so they can be found from across the
 * island. One instanced mesh for the whole island (one draw call), unaffected by fog.
 */
export function Beams() {
  const ref = useRef<InstancedMesh>(null);
  const shown = useRef('');
  const shared = pool();
  const geometry = useMemo(() => new CylinderGeometry(0.45, 0.45, 18, 10, 1, true).translate(0, 9, 0), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useLayoutEffect(() => {
    const mesh = ref.current!;
    symbolPlaces.forEach((sym, i) => mesh.setColorAt(i, c.set(techColor(sym.key))));
    mesh.instanceColor!.needsUpdate = true;
  }, []);

  useFrame(() => {
    const collected = getState().collected;
    const sig = collected.join();
    if (sig === shown.current) return;
    shown.current = sig;
    const mesh = ref.current!;
    symbolPlaces.forEach((sym, i) => {
      const scale = collected.includes(sym.key) ? 0 : 1;
      m4.compose(p.set(sym.x, sym.y, sym.z), q, s.set(scale, scale, scale));
      mesh.setMatrixAt(i, m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  });

  return (
    <instancedMesh ref={ref} args={[geometry, shared.material.beam, symbolPlaces.length]} frustumCulled={false} renderOrder={1} />
  );
}
