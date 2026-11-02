import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, Shape, Vector3, type Group } from 'three';
import { techColor } from '@/games/shared/TechSymbol';
import { forEachObstacleNear, sitePlaces, symbolPlaces } from '../world/layout';
import { boatSpot, startSpot, terrainHeight } from '../world/terrain';
import { tracker } from '../world/tracker';
import { actions, getState, isComplete } from '../hooks/useGameStore';
import { input, readAxes } from '../hooks/useControls';
import { sfx } from '../audio';
import { burst } from './Burst';
import { BOARD_AT, BOARD_TIME } from './Boat';
import { forwardOf, resetRuntime, runtime } from './runtime';

const SPEED = 6.5;
const TURN_SPEED = 2.6;
const JUMP_SPEED = 7.4;
const GRAVITY = 19;
const RADIUS = 0.35;
/** Rocks lower than this above the feet are stepped onto without jumping. */
const STEP = 0.35;
/** Steeper terrain than this (rise per unit) cannot be walked up. */
const MAX_SLOPE = 1.5;
/** Deeper than this the sea stops the player. */
const SEA_LIMIT = -0.35;
const PICKUP = 1.4;
const AT_BOAT = 4.2;

const SKIN = '#c98b5e';
const SHIRT = '#f97316';
const SHORTS = '#1d4ed8';
const HAIR = '#2b1b12';

const dir = new Vector3();
const tmp = new Vector3();

/** Ground height under the feet, including rocks the player is standing on. */
function groundAt(x: number, z: number, feet: number) {
  let h = terrainHeight(x, z);
  forEachObstacleNear(x, z, (o) => {
    if (!o.platform || feet < o.top - STEP) return;
    if ((x - o.x) ** 2 + (z - o.z) ** 2 < o.r * o.r) h = Math.max(h, o.top);
  });
  return h;
}

/** Moves the player by (dx, dz), sliding along obstacles, the sea and steep slopes. */
function tryMove(dx: number, dz: number) {
  const p = runtime.player;
  const here = terrainHeight(p.x, p.z);
  for (const [mx, mz] of [
    [dx, dz],
    [dx, 0],
    [0, dz],
  ]) {
    if (!mx && !mz) continue;
    let nx = p.x + mx;
    let nz = p.z + mz;
    forEachObstacleNear(nx, nz, (o) => {
      if (o.platform && p.y >= o.top - STEP) return; // on top of (or stepping onto) a rock
      const ox = nx - o.x;
      const oz = nz - o.z;
      const d = Math.hypot(ox, oz);
      const min = o.r + RADIUS;
      if (d < min && d > 1e-4) {
        nx = o.x + (ox / d) * min;
        nz = o.z + (oz / d) * min;
      }
    });
    const h = terrainHeight(nx, nz);
    if (h < SEA_LIMIT) continue;
    const run = Math.hypot(nx - p.x, nz - p.z);
    if (run > 1e-5 && (h - here) / run > MAX_SLOPE && p.y < h) continue;
    p.x = nx;
    p.z = nz;
    return;
  }
}

/** The castaway developer: movement, jumping, pick-ups, site prompts, compass and boarding. */
export function Player() {
  const body = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const compass = useRef<Group>(null);
  // Chevron lying flat on the ground, pointing along local −z.
  const chevron = useMemo(() => {
    const sh = new Shape();
    sh.moveTo(0, 0.42);
    sh.lineTo(0.36, -0.12);
    sh.lineTo(0, 0.04);
    sh.lineTo(-0.36, -0.12);
    sh.closePath();
    return sh;
  }, []);
  const st = useRef({ vy: 0, grounded: true, stride: 0, init: false, boardFrom: new Vector3() });

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = getState();
    const p = runtime.player;
    const me = st.current;
    const g = body.current!;

    if (!me.init) {
      me.init = true;
      resetRuntime();
      p.y = terrainHeight(p.x, p.z);
      // Face inland, with the wrecked boat behind.
      runtime.yaw = Math.atan2(startSpot.x, startSpot.z);
    }

    // ---- Boarding and sailing: the boat carries the player ----
    if (s.phase === 'repairing' || s.phase === 'sailing' || s.phase === 'won') {
      const t = runtime.sequence;
      if (t < BOARD_AT) {
        // Land first if the repair started mid-jump.
        const ground = groundAt(p.x, p.z, p.y);
        me.vy = p.y > ground ? me.vy - GRAVITY * dt : 0;
        p.y = Math.max(ground, p.y + me.vy * dt);
        me.boardFrom.copy(p);
        runtime.yaw = Math.atan2(-(boatSpot.x - p.x), -(boatSpot.z - p.z));
      } else {
        const k = Math.min(1, (t - BOARD_AT) / BOARD_TIME);
        p.lerpVectors(me.boardFrom, runtime.deck, k);
        p.y += Math.sin(Math.PI * k) * 1.6;
        if (k >= 1) runtime.yaw = runtime.boatYaw + Math.PI;
      }
      g.position.copy(p);
      g.rotation.y = runtime.yaw;
      compass.current!.visible = false;
      return;
    }

    // ---- Walking ----
    const playing = s.phase === 'playing' && !s.openSite;
    let moving = false;
    if (playing) {
      const { forward, turn } = readAxes();
      runtime.yaw -= turn * TURN_SPEED * dt;
      const speed = forward * SPEED * (forward < 0 ? 0.55 : 1);
      if (speed) {
        forwardOf(runtime.yaw, dir);
        tryMove(dir.x * speed * dt, dir.z * speed * dt);
        moving = true;
        me.stride += Math.abs(speed) * dt * 2.4;
        // Walking straightens the camera out again after dragging it around.
        runtime.camYaw *= Math.exp(-dt * 1.6);
      }
      if (input.jump && me.grounded) {
        me.vy = JUMP_SPEED;
        me.grounded = false;
        sfx.jump();
      }
    }
    input.jump = false;

    const ground = groundAt(p.x, p.z, p.y);
    me.vy -= GRAVITY * dt;
    p.y += me.vy * dt;
    if (p.y <= ground) {
      p.y = ground;
      me.vy = 0;
      me.grounded = true;
    } else if (me.grounded && me.vy <= 0 && p.y - ground < 0.45) {
      // Stick to the ground walking downhill instead of hopping.
      p.y = ground;
      me.vy = 0;
    } else {
      me.grounded = false;
    }

    g.position.copy(p);
    g.rotation.y = runtime.yaw;
    runtime.focus.copy(p);
    tracker.x = p.x;
    tracker.z = p.z;
    tracker.yaw = runtime.yaw;

    // Walk cycle (arms swing against the legs).
    const swing = moving && me.grounded ? Math.sin(me.stride) * 0.7 : 0;
    const ease = Math.min(1, dt * 12);
    legL.current!.rotation.x += (swing - legL.current!.rotation.x) * ease;
    legR.current!.rotation.x += (-swing - legR.current!.rotation.x) * ease;
    armL.current!.rotation.x += (-swing * 0.8 - armL.current!.rotation.x) * ease;
    armR.current!.rotation.x += (swing * 0.8 - armR.current!.rotation.x) * ease;

    if (s.phase !== 'playing') {
      compass.current!.visible = false;
      return;
    }

    // ---- Pick-ups ----
    for (const sym of symbolPlaces) {
      if (s.collected.includes(sym.key)) continue;
      const dy = sym.y - (p.y + 0.9);
      if ((sym.x - p.x) ** 2 + dy * dy + (sym.z - p.z) ** 2 < PICKUP * PICKUP) {
        actions.collect(sym.key);
        sfx.collect();
        burst.emit(tmp.set(sym.x, sym.y, sym.z), techColor(sym.key));
      }
    }

    // ---- Project site prompt ----
    let near: string | null = null;
    let nearest = Infinity;
    for (const place of sitePlaces) {
      const d = Math.hypot(place.site.x - p.x, place.site.z - p.z);
      if (d < place.interact && d < nearest) {
        nearest = d;
        near = place.site.id;
      }
    }
    actions.setNear(near);

    // ---- Everything done: board the boat ----
    const done = isComplete(s);
    if (done && Math.hypot(boatSpot.x - p.x, boatSpot.z - p.z) < AT_BOAT) {
      actions.beginRepair();
      return;
    }

    // ---- Compass: nearest missing symbol or unvisited site, then the boat ----
    let gx = boatSpot.x;
    let gz = boatSpot.z;
    if (!done) {
      let best = Infinity;
      for (const sym of symbolPlaces) {
        if (s.collected.includes(sym.key)) continue;
        const d = (sym.x - p.x) ** 2 + (sym.z - p.z) ** 2;
        if (d < best) [best, gx, gz] = [d, sym.x, sym.z];
      }
      for (const place of sitePlaces) {
        if (s.visited.includes(place.site.id)) continue;
        const d = (place.site.x - p.x) ** 2 + (place.site.z - p.z) ** 2;
        if (d < best) [best, gx, gz] = [d, place.site.x, place.site.z];
      }
    }
    const c = compass.current!;
    const dist = Math.hypot(gx - p.x, gz - p.z);
    c.visible = dist > 3.5;
    if (c.visible) {
      const ux = (gx - p.x) / dist;
      const uz = (gz - p.z) / dist;
      const cx = p.x + ux * 1.15;
      const cz = p.z + uz * 1.15;
      c.position.set(cx, Math.max(terrainHeight(cx, cz), me.grounded ? p.y : -Infinity) + 0.1, cz);
      c.rotation.y = Math.atan2(-ux, -uz);
    }
  });

  return (
    <>
      <group ref={body}>
        {/* Legs, pivoting at the hips */}
        {[-0.12, 0.12].map((x, i) => (
          <group key={x} ref={i === 0 ? legL : legR} position={[x, 0.78, 0]}>
            <mesh position={[0, -0.18, 0]} castShadow>
              <boxGeometry args={[0.2, 0.32, 0.22]} />
              <meshStandardMaterial color={SHORTS} flatShading />
            </mesh>
            <mesh position={[0, -0.5, 0]} castShadow>
              <capsuleGeometry args={[0.075, 0.35, 2, 6]} />
              <meshStandardMaterial color={SKIN} flatShading />
            </mesh>
          </group>
        ))}
        {/* Torso and laptop bag */}
        <mesh position={[0, 1.12, 0]} castShadow>
          <boxGeometry args={[0.5, 0.6, 0.3]} />
          <meshStandardMaterial color={SHIRT} flatShading />
        </mesh>
        <mesh position={[0, 1.1, 0.2]} castShadow>
          <boxGeometry args={[0.38, 0.42, 0.1]} />
          <meshStandardMaterial color="#334155" flatShading />
        </mesh>
        <mesh position={[0, 1.12, -0.16]} rotation={[0, 0, 0.75]}>
          <boxGeometry args={[0.06, 0.78, 0.03]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Arms, pivoting at the shoulders */}
        {[-0.32, 0.32].map((x, i) => (
          <group key={x} ref={i === 0 ? armL : armR} position={[x, 1.36, 0]}>
            <mesh position={[0, -0.25, 0]} castShadow>
              <capsuleGeometry args={[0.065, 0.36, 2, 6]} />
              <meshStandardMaterial color={SKIN} flatShading />
            </mesh>
            <mesh position={[0, -0.05, 0]}>
              <boxGeometry args={[0.15, 0.16, 0.17]} />
              <meshStandardMaterial color={SHIRT} flatShading />
            </mesh>
          </group>
        ))}
        {/* Head, hair and headband */}
        <mesh position={[0, 1.66, 0]} castShadow>
          <icosahedronGeometry args={[0.22, 1]} />
          <meshStandardMaterial color={SKIN} flatShading />
        </mesh>
        <mesh position={[0, 1.76, 0.03]} scale={[1, 0.6, 1]}>
          <icosahedronGeometry args={[0.235, 1]} />
          <meshStandardMaterial color={HAIR} flatShading />
        </mesh>
        <mesh position={[0, 1.72, 0]}>
          <cylinderGeometry args={[0.232, 0.232, 0.06, 10]} />
          <meshStandardMaterial color="#ef4444" flatShading />
        </mesh>
        {[-0.08, 0.08].map((x) => (
          <mesh key={x} position={[x, 1.67, -0.2]}>
            <boxGeometry args={[0.05, 0.05, 0.03]} />
            <meshBasicMaterial color="#111827" />
          </mesh>
        ))}
      </group>

      {/* Compass arrow at the player's feet */}
      <group ref={compass} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={1.3} renderOrder={2}>
          <shapeGeometry args={[chevron]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.92} depthWrite={false} side={DoubleSide} />
        </mesh>
      </group>
    </>
  );
}
