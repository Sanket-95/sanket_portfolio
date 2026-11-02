import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { actions, setState, useGame } from '../hooks/useGameStore';
import { Planet } from './Planet';
import { Environment } from './Environment';
import { Monument } from './Monument';
import { ShipPart } from './ShipPart';
import { Spaceship } from './Spaceship';
import { Player } from './Player';
import { Burst } from './Burst';
import { monumentLayout, partLayout } from './layout';

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

/** The 3D scene. Loaded lazily so three.js only downloads on the game page. */
export default function World() {
  const run = useGame((s) => s.run);
  const idle = useGame((s) => !!s.openMonument || s.phase === 'won');
  const visible = usePageVisible();

  useEffect(() => () => setState({ ready: false }), []);

  return (
    <Canvas
      className="pp-canvas"
      dpr={[1, 1.5]}
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 55, near: 0.1, far: 250, position: [0, 9, 27] }}
      // Stop drawing when nothing moves: hidden tab, project card open or game over.
      frameloop={!visible ? 'never' : idle ? 'demand' : 'always'}
      onCreated={() => actions.markReady()}
    >
      <Environment />
      <Planet />
      {monumentLayout.map(({ monument, dir }) => (
        <Monument key={monument.id} monument={monument} dir={dir} />
      ))}
      <group key={run}>
        {partLayout.map(({ part, dir, color }) => (
          <ShipPart key={part.id} id={part.id} kind={part.kind} color={color} dir={dir} />
        ))}
        <Spaceship />
        <Player />
        <Burst />
      </group>
    </Canvas>
  );
}
