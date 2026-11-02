import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { forEachObstacleNear } from '../world/layout';
import { boatSpot, startSpot, terrainHeight } from '../world/terrain';
import { getState } from '../hooks/useGameStore';
import { forwardOf, runtime } from './runtime';

const DISTANCE = 7.2;
const HEIGHT = 3.6;

const goal = new Vector3();
const head = new Vector3();
const look = new Vector3();
const fwd = new Vector3();
const side = new Vector3();
const probe = new Vector3();

/** Lowest camera height so the line from the player's head to it clears the ground and landmarks. */
function clearance(cam: Vector3) {
  let needed = cam.y;
  for (const t of [0.35, 0.6, 0.85, 1]) {
    probe.lerpVectors(head, cam, t);
    let top = terrainHeight(probe.x, probe.z) + 0.7;
    forEachObstacleNear(probe.x, probe.z, (o) => {
      if (o.camera && (probe.x - o.x) ** 2 + (probe.z - o.z) ** 2 < (o.r + 0.6) ** 2) top = Math.max(top, o.top + 0.6);
    });
    if (probe.y < top) needed = Math.max(needed, head.y + (top - head.y) / t);
  }
  return needed;
}

/** Pulls the camera in front of any palm trunk standing between it and the player. */
function pullIn(cam: Vector3) {
  let keep = 1;
  for (const t of [0.3, 0.45, 0.6, 0.75, 0.9, 1]) {
    probe.lerpVectors(head, cam, t);
    let hit = false;
    forEachObstacleNear(probe.x, probe.z, (o) => {
      if (!o.camera && !o.platform && probe.y < o.top && (probe.x - o.x) ** 2 + (probe.z - o.z) ** 2 < (o.r + 0.45) ** 2) hit = true;
    });
    if (hit) {
      keep = Math.max(0.3, t - 0.12);
      break;
    }
  }
  if (keep < 1) cam.lerpVectors(head, cam, keep);
}

/** Drag (any mouse button, or a finger outside the joystick) to look around. */
function useOrbitDrag() {
  const canvas = useThree((s) => s.gl.domElement);
  useEffect(() => {
    let pointer: number | null = null;
    let lastX = 0;
    let lastY = 0;
    const down = (e: PointerEvent) => {
      if (getState().phase !== 'playing') return;
      pointer = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      runtime.camYaw -= (e.clientX - lastX) * 0.006;
      runtime.camPitch = Math.max(-0.35, Math.min(0.9, runtime.camPitch + (e.clientY - lastY) * 0.004));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId === pointer) pointer = null;
    };
    const menu = (e: Event) => e.preventDefault();
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    canvas.addEventListener('contextmenu', menu);
    return () => {
      canvas.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      canvas.removeEventListener('contextmenu', menu);
    };
  }, [canvas]);
}

/** Third-person camera: behind the player, lifted over obstacles; cinematic shots for the ending. */
export function CameraRig() {
  const intro = useRef(0);
  const smoothLook = useRef(new Vector3(startSpot.x, 1, startSpot.z));
  useOrbitDrag();

  useFrame(({ camera }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = getState();
    const p = runtime.player;
    let speed = 5;

    if (s.phase === 'intro') {
      // Slow circle around the beach, the wreck and the castaway.
      intro.current += dt * 0.12;
      const a = intro.current + 2.4;
      goal.set(startSpot.x + Math.sin(a) * 16, 8 + Math.sin(intro.current * 0.7) * 1.5, startSpot.z + Math.cos(a) * 16);
      look.set((startSpot.x + boatSpot.x) / 2, 1.2, (startSpot.z + boatSpot.z) / 2);
      speed = 2;
    } else if (s.phase === 'repairing') {
      // Side-on shot of the boat as it is rebuilt.
      side.set(Math.cos(runtime.boatYaw), 0, -Math.sin(runtime.boatYaw));
      goal.copy(runtime.boat).addScaledVector(side, 8.5).add(probe.set(0, 4.2, 0));
      goal.addScaledVector(fwd.set(Math.sin(runtime.boatYaw), 0, Math.cos(runtime.boatYaw)), -3);
      look.copy(runtime.boat).add(probe.set(0, 1.4, 0));
      speed = 2.5;
    } else if (s.phase === 'sailing' || s.phase === 'won') {
      // Ahead of the boat, looking back at it and the island fading into the haze.
      fwd.set(Math.sin(runtime.boatYaw), 0, Math.cos(runtime.boatYaw));
      side.set(fwd.z, 0, -fwd.x);
      goal.copy(runtime.boat).addScaledVector(fwd, 10).addScaledVector(side, 6).add(probe.set(0, 4.5, 0));
      look.copy(runtime.boat).add(probe.set(0, 1.5, 0));
      speed = 1.8;
    } else {
      const yaw = runtime.yaw + runtime.camYaw;
      forwardOf(yaw, fwd);
      head.set(p.x, p.y + 1.5, p.z);
      const dist = DISTANCE * (1 - runtime.camPitch * 0.15);
      goal.copy(p).addScaledVector(fwd, -dist);
      goal.y = p.y + HEIGHT + runtime.camPitch * 4;
      goal.y = clearance(goal);
      pullIn(goal);
      forwardOf(runtime.yaw, look);
      look.multiplyScalar(2).add(head);
    }

    const k = 1 - Math.exp(-dt * speed);
    camera.position.lerp(goal, k);
    smoothLook.current.lerp(look, 1 - Math.exp(-dt * speed * 1.6));
    camera.lookAt(smoothLook.current);
  });

  return null;
}
