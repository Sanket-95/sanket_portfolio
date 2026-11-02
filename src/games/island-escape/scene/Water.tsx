import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, Color, MeshStandardMaterial, PlaneGeometry, type WebGLProgramParametersWithUniforms } from 'three';
import { terrainHeight } from '../world/terrain';

const SIZE = 420;
const SEGMENTS = 105;

const DEEP = new Color('#145a96');
const MID = new Color('#1f86b8');
const SHALLOW = new Color('#3fc6c6');
const FOAM = new Color('#e6fbff');

/**
 * The sea: one faceted plane with vertex waves (in the shader) and colours baked from the
 * depth of the sea floor, so shallow water around the island is turquoise with a foam edge.
 */
export function Water() {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
    g.rotateX(-Math.PI / 2);
    const pos = g.getAttribute('position');
    const colors = new Float32Array(pos.count * 3);
    const c = new Color();
    for (let i = 0; i < pos.count; i++) {
      const depth = -terrainHeight(pos.getX(i), pos.getZ(i));
      if (depth < 0.45) c.copy(SHALLOW).lerp(FOAM, Math.min(1, (0.45 - depth) / 0.45) * 0.85);
      else if (depth < 2) c.copy(SHALLOW).lerp(MID, (depth - 0.45) / 1.55);
      else c.copy(MID).lerp(DEEP, Math.min(1, (depth - 2) / 1.5));
      c.toArray(colors, i * 3);
    }
    g.setAttribute('color', new BufferAttribute(colors, 3));
    return g;
  }, []);

  const material = useMemo(() => {
    const m = new MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.3, metalness: 0.05 });
    m.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uTime = { value: 0 };
      m.userData.shader = shader;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          transformed.y += sin(position.x * 0.35 + uTime * 1.3) * 0.1 + cos(position.z * 0.28 + uTime * 1.1) * 0.08;`,
        );
    };
    return m;
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ clock }) => {
    const shader = material.userData.shader as WebGLProgramParametersWithUniforms | undefined;
    if (shader) shader.uniforms.uTime.value = clock.elapsedTime;
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}
