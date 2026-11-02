import { useEffect, useRef, useState } from 'react';
import { SRGBColorSpace, TextureLoader, Vector3, type Group, type Texture } from 'three';
import { useFrame, type ThreeElements } from '@react-three/fiber';

type GroupProps = ThreeElements['group'];

const local = new Vector3();

/**
 * A project's real screenshot (src/assets/previews/*.jpg) on a framed billboard
 * with two posts. The texture loads in the background, so nothing suspends;
 * it is disposed when the board unmounts. Width is in world units, 16:9.
 * The board turns around its own up axis to face the camera.
 */
export function ScreenshotBoard({ image, width = 2.4, frame = '#1e293b', ...props }: { image: string; width?: number; frame?: string } & GroupProps) {
  const [texture, setTexture] = useState<Texture | null>(null);
  const turn = useRef<Group>(null);
  const height = (width * 9) / 16;
  const postHeight = 1.1;

  useEffect(() => {
    let alive = true;
    let loaded: Texture | null = null;
    new TextureLoader().load(image, (t) => {
      t.colorSpace = SRGBColorSpace;
      loaded = t;
      if (alive) setTexture(t);
      else t.dispose();
    });
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, [image]);

  useFrame(({ camera }) => {
    const g = turn.current;
    if (!g?.parent) return;
    g.parent.worldToLocal(local.copy(camera.position));
    g.rotation.y = Math.atan2(local.x - g.position.x, local.z - g.position.z);
  });

  return (
    <group {...props}>
      <group ref={turn}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (width / 2 - 0.15), postHeight / 2, -0.02]} castShadow>
            <boxGeometry args={[0.08, postHeight, 0.08]} />
            <meshStandardMaterial color={frame} />
          </mesh>
        ))}
        <group position={[0, postHeight + height / 2, 0]}>
          <mesh position={[0, 0, -0.04]} castShadow>
            <boxGeometry args={[width + 0.14, height + 0.14, 0.06]} />
            <meshStandardMaterial color={frame} />
          </mesh>
          <mesh>
            <planeGeometry args={[width, height]} />
            {/* Unlit so the screenshot keeps its real colours. Keyed so the shader is rebuilt once the image arrives. */}
            <meshBasicMaterial key={texture ? 'image' : 'blank'} map={texture} color={texture ? '#ffffff' : '#334155'} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
