import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, Matrix4, Quaternion, Shape, Vector3, type Group, type Mesh } from 'three';
import { partLayout, monumentLayout, obstacles, RADIUS, runtime, shipDir, startDir } from './layout';
import { treeDirs } from './Environment';
import { BOARD } from './Spaceship';
import { burst } from './Burst';
import { actions, getState } from '../hooks/useGameStore';
import { input, readAxes } from '../hooks/useControls';
import { sfx } from '../audio';

const SPEED = 4.6;
const TURN_SPEED = 2.5;
const JUMP_SPEED = 6.2;
const GRAVITY = 15;
const CAMERA_DISTANCE = 6.2;
const CAMERA_HEIGHT = 3.4;
const NEAR_MONUMENT = 3.3;
const PICKUP = 1.5;
const AT_SHIP = 3;

const SUIT = '#f8fafc';
const VISOR = '#1e3a8a';
const ACCENT = '#f97316';

const allObstacles = [...obstacles, ...treeDirs.map((dir) => ({ dir, radius: 0.55 }))];

// Scratch objects, reused every frame.
const up = new Vector3();
const right = new Vector3();
const back = new Vector3();
const surface = new Vector3();
const diff = new Vector3();
const target = new Vector3();
const toTarget = new Vector3();
const camGoal = new Vector3();
const lookAt = new Vector3();
const basis = new Matrix4();
const facing = new Quaternion();

/** The astronaut: movement on the sphere, collisions, pickups, the follow camera and the compass. */
export function Player() {
  const body = useRef<Group>(null);
  const legL = useRef<Mesh>(null);
  const legR = useRef<Mesh>(null);
  const compass = useRef<Group>(null);
  // Chevron lying flat on the ground, pointing along local -Z.
  const chevron = useMemo(() => {
    const sh = new Shape();
    sh.moveTo(0, 0.42);
    sh.lineTo(0.36, -0.12);
    sh.lineTo(0, 0.04);
    sh.lineTo(-0.36, -0.12);
    sh.closePath();
    return sh;
  }, []);
  const state = useRef({ height: 0, vy: 0, stride: 0, introAngle: 0, initialised: false });

  useFrame(({ camera }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = getState();
    const p = state.current;
    const g = body.current!;

    if (!p.initialised) {
      p.initialised = true;
      runtime.playerPos.copy(startDir).multiplyScalar(RADIUS);
      // Face the crashed ship: the first view shows what needs fixing.
      runtime.heading.copy(shipDir).addScaledVector(startDir, -shipDir.dot(startDir)).normalize();
      runtime.sequenceTime = 0;
    }

    up.copy(runtime.playerPos).normalize();
    const playing = s.phase === 'playing' && !s.openMonument;

    if (playing) {
      const { forward, turn } = readAxes();
      runtime.heading.applyAxisAngle(up, -turn * TURN_SPEED * dt);
      const speed = forward * SPEED * (forward < 0 ? 0.6 : 1);
      surface.copy(up).multiplyScalar(RADIUS).addScaledVector(runtime.heading, speed * dt);

      // Slide around obstacles: push the player out of any circle they walked into.
      for (const o of allObstacles) {
        diff.copy(surface).sub(target.copy(o.dir).multiplyScalar(RADIUS));
        const d = diff.length();
        if (d < o.radius && d > 1e-5) surface.copy(target).addScaledVector(diff, o.radius / d);
      }
      up.copy(surface).normalize();
      p.stride += Math.abs(speed) * dt * 3.2;

      if (input.jump && p.height === 0) {
        p.vy = JUMP_SPEED;
        sfx.jump();
      }
    }
    input.jump = false;

    // Jumping: simple gravity toward the planet centre.
    p.vy -= GRAVITY * dt;
    p.height = Math.max(0, p.height + p.vy * dt);
    if (p.height === 0) p.vy = 0;

    // Keep the heading tangent to the surface after moving.
    runtime.heading.addScaledVector(up, -runtime.heading.dot(up)).normalize();
    runtime.playerUp.copy(up);
    runtime.playerPos.copy(up).multiplyScalar(RADIUS + p.height);

    // Orient the body: local +Y = up, local -Z = heading.
    right.crossVectors(runtime.heading, up).normalize();
    back.copy(runtime.heading).negate();
    facing.setFromRotationMatrix(basis.makeBasis(right, up, back));
    g.quaternion.slerp(facing, 1 - Math.exp(-dt * 14));
    g.position.copy(runtime.playerPos);

    // Walk cycle.
    const swing = playing && readAxes().forward !== 0 && p.height === 0 ? Math.sin(p.stride) * 0.6 : 0;
    legL.current!.rotation.x += (swing - legL.current!.rotation.x) * Math.min(1, dt * 12);
    legR.current!.rotation.x += (-swing - legR.current!.rotation.x) * Math.min(1, dt * 12);

    // Boarding: shrink into the ship's hatch.
    if (s.phase === 'repairing' || s.phase === 'launching' || s.phase === 'won') {
      const k = Math.min(1, Math.max(0, (runtime.sequenceTime - BOARD[0]) / (BOARD[1] - BOARD[0])));
      g.position.lerp(target.copy(runtime.shipWorld).addScaledVector(shipDir, 1.4), k);
      g.scale.setScalar(1 - k);
      g.visible = k < 1;
      compass.current!.visible = false;
      return;
    }

    // ---- Gameplay checks ----
    if (s.phase === 'playing') {
      let nearest: string | null = null;
      let nearestD = NEAR_MONUMENT;
      for (const m of monumentLayout) {
        const d = target.copy(m.dir).multiplyScalar(RADIUS).distanceTo(runtime.playerPos);
        if (d < nearestD) {
          nearestD = d;
          nearest = m.monument.id;
        }
      }
      actions.setNear(nearest);

      for (const { part, dir, color } of partLayout) {
        if (s.collected.includes(part.id)) continue;
        target.copy(dir).multiplyScalar(RADIUS + 1.15);
        if (target.distanceTo(runtime.playerPos.clone().addScaledVector(up, 0.6)) < PICKUP) {
          actions.collect(part.id);
          sfx.collect();
          burst.emit(target, color);
        }
      }

      if (actions.allCollected && runtime.playerPos.distanceTo(target.copy(shipDir).multiplyScalar(RADIUS)) < AT_SHIP) {
        actions.beginRepair();
      }
    }

    // Compass: points along the surface to the nearest missing part, or to the ship.
    let goal: Vector3 | null = null;
    let best = Infinity;
    for (const { part, dir } of partLayout) {
      if (s.collected.includes(part.id)) continue;
      const d = dir.distanceTo(up);
      if (d < best) {
        best = d;
        goal = dir;
      }
    }
    goal ??= shipDir;
    toTarget.copy(goal).addScaledVector(up, -goal.dot(up));
    const c = compass.current!;
    c.visible = s.phase === 'playing' && goal.distanceTo(up) * RADIUS > 3.2 && toTarget.lengthSq() > 1e-6;
    if (c.visible) {
      toTarget.normalize();
      c.position.copy(up).multiplyScalar(RADIUS + 0.16).addScaledVector(toTarget, 1.05);
      right.crossVectors(toTarget, up).normalize();
      back.copy(toTarget).negate();
      c.quaternion.setFromRotationMatrix(basis.makeBasis(right, up, back));
    }

    // ---- Camera ----
    if (s.phase === 'intro') {
      // Slow orbit around the whole planet behind the intro screen.
      p.introAngle += dt * 0.12;
      camGoal.set(Math.sin(p.introAngle) * 27, 9, Math.cos(p.introAngle) * 27);
      camera.position.lerp(camGoal, 1 - Math.exp(-dt * 2));
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 0, 0);
      return;
    }
    camGoal
      .copy(up)
      .multiplyScalar(RADIUS + CAMERA_HEIGHT)
      .addScaledVector(runtime.heading, -CAMERA_DISTANCE);
    // Lift the camera over the ship and monuments instead of passing through them.
    for (const o of obstacles) {
      const d = target.copy(o.dir).multiplyScalar(RADIUS + CAMERA_HEIGHT).distanceTo(camGoal);
      if (d < 3) camGoal.addScaledVector(up, (3 - d) * 1.4);
    }
    const k = 1 - Math.exp(-dt * 4.5);
    camera.position.lerp(camGoal, k);
    camera.up.lerp(up, k).normalize();
    lookAt.copy(runtime.playerPos).addScaledVector(up, 1.1).addScaledVector(runtime.heading, 2.5);
    camera.lookAt(lookAt);
  });

  return (
    <>
      <group ref={body}>
        {/* Legs (pivot at the hips) */}
        {[-0.13, 0.13].map((x, i) => (
          <group key={x} position={[x, 0.42, 0]}>
            <mesh ref={i === 0 ? legL : legR} castShadow>
              <capsuleGeometry args={[0.09, 0.22, 3, 6]} />
              <meshStandardMaterial color={SUIT} flatShading />
            </mesh>
          </group>
        ))}
        {/* Torso */}
        <mesh position={[0, 0.72, 0]} castShadow>
          <capsuleGeometry args={[0.24, 0.25, 4, 8]} />
          <meshStandardMaterial color={SUIT} flatShading roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.72, -0.24]}>
          <boxGeometry args={[0.16, 0.1, 0.04]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.4} />
        </mesh>
        {/* Backpack */}
        <mesh position={[0, 0.78, 0.26]} castShadow>
          <boxGeometry args={[0.36, 0.42, 0.16]} />
          <meshStandardMaterial color="#cbd5e1" flatShading />
        </mesh>
        {/* Helmet and visor */}
        <mesh position={[0, 1.18, 0]} castShadow>
          <icosahedronGeometry args={[0.27, 1]} />
          <meshStandardMaterial color={SUIT} flatShading roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.18, -0.12]} scale={[1, 0.75, 0.6]}>
          <sphereGeometry args={[0.22, 10, 8]} />
          <meshStandardMaterial color={VISOR} roughness={0.15} metalness={0.4} emissive="#3b82f6" emissiveIntensity={0.25} />
        </mesh>
      </group>

      {/* Compass arrow */}
      <group ref={compass} visible={false}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} scale={1.35} renderOrder={2}>
          <shapeGeometry args={[chevron]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.92} depthWrite={false} side={DoubleSide} />
        </mesh>
      </group>
    </>
  );
}
