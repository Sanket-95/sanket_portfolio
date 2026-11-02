import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { actions, getState, setState, useGame } from '../hooks/useGameStore';
import { Environment } from './Environment';
import { Water } from './Water';
import { Chunks } from './Chunks';
import { Beams } from './Symbols';
import { Boat } from './Boat';
import { Player } from './Player';
import { CameraRig } from './CameraRig';
import { Burst } from './Burst';
import { disposePool } from './pool';
import { resetRuntime, runtime } from './runtime';
import { sitePlaces, symbolPlaces } from '../world/layout';
import { boatOut, boatSpot } from '../world/terrain';

/** Pause rendering while the tab is hidden. */
function usePageVisible() {
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  return visible;
}

let mounted = 0;

const coarse = () => window.matchMedia('(pointer: coarse)').matches;

/** The 3D scene. Loaded lazily so three.js only downloads on the game page. */
export default function World() {
  const run = useGame((s) => s.run);
  const idle = useGame((s) => !!s.openSite || s.phase === 'won');
  const visible = usePageVisible();
  // Phones get a smaller shadow map.
  const [shadowSize] = useState(() => (coarse() ? 512 : 1024));
  // Place the player before the first chunks mount, so they load around the start.
  useState(resetRuntime);

  useEffect(() => {
    mounted++;
    // Development-only handle for automated play-testing (stripped from production builds).
    if (import.meta.env.DEV) Object.assign(window, { __island: { runtime, actions, getState, sitePlaces, symbolPlaces, boatSpot, boatOut } });
    return () => {
      mounted--;
      setState({ ready: false });
      // The canvas disposes its own objects; free the shared pool too. Deferred, so the
      // StrictMode unmount/remount in development does not throw away a pool in use.
      setTimeout(() => {
        if (mounted === 0) disposePool();
      }, 0);
    };
  }, []);

  return (
    <Canvas
      className="ie-canvas"
      dpr={[1, 1.5]}
      shadows="percentage"
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 55, near: 0.1, far: 190, position: [0, 12, 70] }}
      // Stop drawing when nothing moves: hidden tab, project card open or game over.
      frameloop={!visible ? 'never' : idle ? 'demand' : 'always'}
      onCreated={(state) => {
        actions.markReady();
        if (import.meta.env.DEV) Object.assign(window, { __r3f: state });
      }}
    >
      <Environment shadowSize={shadowSize} />
      <Water />
      <Chunks />
      <Beams />
      <group key={run}>
        <Boat />
        <Player />
        <Burst />
      </group>
      <CameraRig />
    </Canvas>
  );
}
