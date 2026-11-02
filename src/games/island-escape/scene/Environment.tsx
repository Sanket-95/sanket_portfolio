import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Color, Fog, Object3D, Vector3, type DirectionalLight, type Group, type HemisphereLight } from 'three';
import { runtime } from './runtime';

// A slow day cycle: bright day → golden hour → dusk (stars) → dawn. Sky gradient
// (top, horizon) and light colours. The horizon colour is also the fog colour, so the
// sea fades seamlessly into the sky.
const CYCLE_SECONDS = 200;
const KEYS = [
  { top: '#3a86e0', bottom: '#cdeeff', sun: '#fff4dc', sunI: 2.7, sky: '#d6eeff', ground: '#6b8f4e', hemiI: 1.15, night: 0 },
  { top: '#4a78c9', bottom: '#ffd9a8', sun: '#ffcf8a', sunI: 2.4, sky: '#ffe2c0', ground: '#6b7a45', hemiI: 1.05, night: 0 },
  { top: '#2b2f6e', bottom: '#f39a7c', sun: '#ff9e70', sunI: 1.6, sky: '#d9a7b5', ground: '#45405a', hemiI: 0.95, night: 1 },
  { top: '#4b65b5', bottom: '#ffd0c0', sun: '#ffdcc2', sunI: 2.2, sky: '#ead6e6', ground: '#5b6b4a', hemiI: 1.05, night: 0 },
].map((k) => ({
  ...k,
  topC: new Color(k.top),
  bottomC: new Color(k.bottom),
  sunC: new Color(k.sun),
  skyC: new Color(k.sky),
  groundC: new Color(k.ground),
}));

const SUN_DIR = new Vector3(-0.45, 1, 0.55).normalize();
const tmpA = new Color();
const tmpB = new Color();

/** Lights, fog, stars and the CSS gradient sky behind the transparent canvas. */
export function Environment({ shadowSize }: { shadowSize: number }) {
  const sun = useRef<DirectionalLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const stars = useRef<Group>(null);
  const canvas = useThree((s) => s.gl.domElement);
  const scene = useThree((s) => s.scene);
  const target = useMemo(() => new Object3D(), []);
  const fog = useMemo(() => new Fog('#cdeeff', 34, 64), []);
  const lastSky = useRef('');

  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  useFrame(({ clock }) => {
    const phase = ((clock.elapsedTime / CYCLE_SECONDS) % 1) * KEYS.length;
    const i = Math.floor(phase);
    const f = phase - i;
    const ease = f * f * (3 - 2 * f);
    const a = KEYS[i];
    const b = KEYS[(i + 1) % KEYS.length];

    // The sun and its small shadow map follow the player.
    const l = sun.current!;
    target.position.copy(runtime.focus);
    l.position.copy(runtime.focus).addScaledVector(SUN_DIR, 40);
    l.color.lerpColors(a.sunC, b.sunC, ease);
    l.intensity = a.sunI + (b.sunI - a.sunI) * ease;
    hemi.current!.color.lerpColors(a.skyC, b.skyC, ease);
    hemi.current!.groundColor.lerpColors(a.groundC, b.groundC, ease);
    hemi.current!.intensity = a.hemiI + (b.hemiI - a.hemiI) * ease;

    tmpA.lerpColors(a.topC, b.topC, ease);
    tmpB.lerpColors(a.bottomC, b.bottomC, ease);
    fog.color.copy(tmpB);
    stars.current!.visible = a.night + (b.night - a.night) * ease > 0.35;

    // Update the CSS sky only when its colour actually changes.
    const sky = `linear-gradient(to bottom, #${tmpA.getHexString()} 0%, #${tmpB.getHexString()} 55%)`;
    if (sky !== lastSky.current) {
      lastSky.current = sky;
      canvas.style.background = sky;
    }
  });

  const extent = 20;
  return (
    <>
      <hemisphereLight ref={hemi} intensity={1.1} />
      <primitive object={target} />
      <directionalLight
        ref={sun}
        target={target}
        castShadow
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
        shadow-camera-near={5}
        shadow-camera-far={80}
      />
      <group ref={stars} visible={false}>
        <Stars radius={110} depth={30} count={1200} factor={4} saturation={0} fade speed={0.5} />
      </group>
    </>
  );
}
