import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace, type Group, type Mesh } from 'three';
import type { Landmark as LandmarkKind } from '../data/island';
import { mat } from './pool';

// Low-poly landmarks, one per kind of project site, built from primitives.
// Local space: the ground is y = 0 and the front faces +z.

type V3 = [number, number, number];
interface Part {
  p: V3;
  c: string;
  r?: V3;
  /** Emissive intensity (screens, lamps). */
  e?: number;
  metal?: number;
}

const Box = ({ s, p, c, r, e, metal }: Part & { s: V3 }) => (
  <mesh position={p} rotation={r} material={mat(c, e, metal)} castShadow receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);

const Cyl = ({ a, p, c, r, e, metal }: Part & { a: [number, number, number, number?] }) => (
  <mesh position={p} rotation={r} material={mat(c, e, metal)} castShadow receiveShadow>
    <cylinderGeometry args={[a[0], a[1], a[2], a[3] ?? 8]} />
  </mesh>
);

const Cone = ({ a, p, c, r }: Part & { a: [number, number, number] }) => (
  <mesh receiveShadow position={p} rotation={r} material={mat(c)} castShadow>
    <coneGeometry args={a} />
  </mesh>
);

const Ball = ({ a, p, c, e, s }: Part & { a: number; s?: V3 }) => (
  <mesh receiveShadow position={p} scale={s} material={mat(c, e)} castShadow>
    <icosahedronGeometry args={[a, 1]} />
  </mesh>
);

/** A small text plate (canvas texture), e.g. the tank sizes at Cipla. */
function Label({ text, p, color = '#0f172a', width = 0.9 }: { text: string; p: V3; color?: string; width?: number }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const c = canvas.getContext('2d')!;
    c.fillStyle = '#f8fafc';
    c.fillRect(0, 0, 128, 64);
    c.fillStyle = color;
    c.font = 'bold 40px system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(text, 64, 34);
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [text, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={p}>
      <planeGeometry args={[width, width / 2]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

/** Pulses an emissive part (warning lights, signal rings). */
function Blink({ children, speed = 3 }: { children: ReactNode; speed?: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    const on = Math.sin(clock.elapsedTime * speed) > 0;
    ref.current?.traverse((o) => {
      if ((o as Mesh).isMesh) o.visible = on;
    });
  });
  return <group ref={ref}>{children}</group>;
}

function Warehouse({ color }: { color: string }) {
  const bale = '#f5f5f4';
  return (
    <group>
      <Box s={[6, 3, 4]} p={[0, 1.5, -0.6]} c="#d6d3d1" />
      <Box s={[6.04, 0.45, 4.04]} p={[0, 2.55, -0.6]} c={color} />
      <Box s={[6.4, 0.14, 2.5]} p={[0, 3.45, 0.42]} r={[0.42, 0, 0]} c="#64748b" />
      <Box s={[6.4, 0.14, 2.5]} p={[0, 3.45, -1.62]} r={[-0.42, 0, 0]} c="#64748b" />
      <Box s={[2.2, 2.1, 0.06]} p={[-0.8, 1.05, 1.42]} c="#78716c" />
      {/* Conveyor with bales */}
      <Box s={[1.1, 0.16, 3.2]} p={[2.1, 0.8, 2.9]} c="#475569" />
      {[2, 3.8].map((z) => (
        <Box key={z} s={[0.12, 0.72, 0.12]} p={[2.1, 0.36, z]} c="#334155" />
      ))}
      {[2.2, 3.5].map((z) => (
        <Box key={z} s={[0.85, 0.6, 0.85]} p={[2.1, 1.18, z]} c={bale} />
      ))}
      {/* Stacked bales */}
      {[-2.6, -1.7].map((x) => (
        <Box key={x} s={[0.85, 0.65, 0.85]} p={[x, 0.33, 2.4]} c={bale} />
      ))}
      <Box s={[0.85, 0.65, 0.85]} p={[-2.15, 0.98, 2.4]} c={bale} />
      <Box s={[0.87, 0.1, 0.87]} p={[-2.15, 0.98, 2.4]} c={color} />
    </group>
  );
}

function Pharma({ color }: { color: string }) {
  const tanks: [number, number, string][] = [
    [-1.8, 3.6, '15K'],
    [0, 2.6, '10K'],
    [1.8, 3.0, '12K'],
  ];
  return (
    <group>
      <Box s={[5.6, 0.25, 3.6]} p={[0, 0.12, 0.2]} c="#cbd5e1" />
      {tanks.map(([x, h, label]) => (
        <group key={label} position={[x, 0.25, 0.6]}>
          <Cyl a={[0.75, 0.75, h, 10]} p={[0, h / 2, 0]} c="#e2e8f0" metal={0.5} />
          <Ball a={0.75} p={[0, h, 0]} s={[1, 0.55, 1]} c="#e2e8f0" />
          <Cyl a={[0.78, 0.78, 0.22, 10]} p={[0, h * 0.62, 0]} c={color} />
          <Label text={label} p={[0, h * 0.4, 0.76]} width={0.8} />
          {[-0.5, 0.5].map((lx) => (
            <Box key={lx} s={[0.1, 0.3, 0.1]} p={[lx, -0.05, 0]} c="#64748b" />
          ))}
        </group>
      ))}
      <Cyl a={[0.1, 0.1, 3.6, 6]} p={[0, 1.3, -0.2]} r={[0, 0, Math.PI / 2]} c="#94a3b8" />
      <Box s={[1.6, 1.4, 1.1]} p={[0, 0.95, -1.4]} c="#f8fafc" />
      <Box s={[1.2, 0.5, 0.04]} p={[0, 1.2, -0.84]} c="#38bdf8" e={0.6} />
    </group>
  );
}

function Tower({ color }: { color: string }) {
  return (
    <group>
      <Box s={[2.6, 0.4, 2.6]} p={[0, 0.2, 0]} c="#94a3b8" />
      <Cyl a={[0.45, 0.7, 5.6, 6]} p={[0, 3.1, 0]} c="#cbd5e1" />
      <Box s={[2.7, 1.6, 2.7]} p={[0, 6.6, 0]} c="#1e293b" />
      <Box s={[2.3, 0.95, 0.05]} p={[0, 6.7, 1.36]} c={color} e={1.1} />
      <Box s={[0.05, 0.95, 2.3]} p={[1.36, 6.7, 0]} c={color} e={0.8} />
      <Box s={[0.05, 0.95, 2.3]} p={[-1.36, 6.7, 0]} c={color} e={0.8} />
      <Box s={[3.1, 0.2, 3.1]} p={[0, 7.5, 0]} c="#334155" />
      <Cyl a={[0.04, 0.04, 1.4, 4]} p={[0.8, 8.3, 0.8]} c="#e2e8f0" />
      <Blink>
        <Ball a={0.12} p={[0.8, 9.05, 0.8]} c="#ef4444" e={2} />
      </Blink>
    </group>
  );
}

function SupportHut({ color }: { color: string }) {
  return (
    <group>
      <Box s={[3, 2.1, 2.6]} p={[0, 1.05, -0.2]} c="#e7c98a" />
      <Cone a={[2.5, 1.5, 4]} p={[0, 2.85, -0.2]} r={[0, Math.PI / 4, 0]} c="#a16207" />
      <Box s={[0.85, 1.45, 0.06]} p={[0, 0.72, 1.12]} c="#78350f" />
      <Box s={[0.7, 0.55, 0.06]} p={[-1, 1.3, 1.12]} c="#bae6fd" e={0.2} />
      {/* The chat bubble */}
      <group position={[0, 4.6, 0]}>
        <Ball a={1} s={[1.7, 1.15, 0.55]} p={[0, 0, 0]} c={color} e={0.25} />
        <Cone a={[0.35, 0.8, 4]} p={[-0.95, -0.95, 0]} r={[0, 0, 0.7]} c={color} />
        {[-0.6, 0, 0.6].map((x) => (
          <Ball key={x} a={0.17} p={[x, 0, 0.5]} c="#ffffff" e={0.3} />
        ))}
      </group>
    </group>
  );
}

function Press({ color }: { color: string }) {
  return (
    <group>
      <Box s={[4.4, 0.3, 3.4]} p={[0, 0.15, 0]} c="#e2e8f0" />
      <Box s={[4.2, 2.6, 2.4]} p={[0, 1.6, -0.5]} c="#f8fafc" />
      <Box s={[4.7, 0.28, 3.4]} p={[0, 3.0, 0]} c="#cbd5e1" />
      <Box s={[3.6, 0.6, 0.15]} p={[0, 3.45, 1.2]} c={color} e={0.2} />
      {[-1.6, -0.55, 0.55, 1.6].map((x) => (
        <Cyl key={x} a={[0.14, 0.14, 2.6, 8]} p={[x, 1.6, 1.3]} c="#f1f5f9" />
      ))}
      <Box s={[1, 1.8, 0.06]} p={[0, 1.2, 0.73]} c="#334155" />
      {/* Newspaper stand */}
      <Box s={[1.1, 0.8, 0.6]} p={[2.6, 0.4, 2]} c="#475569" />
      {[0, 1, 2].map((i) => (
        <Box key={i} s={[0.9, 0.08, 0.45]} p={[2.6, 0.84 + i * 0.09, 2]} r={[0, i * 0.2, 0]} c={i === 1 ? color : '#f1f5f9'} />
      ))}
    </group>
  );
}

function Office({ color }: { color: string }) {
  return (
    <group>
      <Box s={[3.4, 0.3, 3.2]} p={[0, 0.15, 0]} c="#cbd5e1" />
      <Box s={[2.8, 6.8, 2.6]} p={[0, 3.7, 0]} c="#7dd3fc" metal={0.6} />
      {[1.4, 2.7, 4, 5.3, 6.6].map((y) => (
        <Box key={y} s={[2.9, 0.12, 2.7]} p={[0, y, 0]} c="#e2e8f0" />
      ))}
      <Box s={[1.8, 0.12, 1]} p={[0, 1.25, 1.75]} c={color} />
      <Box s={[1.2, 0.6, 1.2]} p={[0, 7.4, 0]} c="#94a3b8" />
      <Box s={[0.9, 1, 0.06]} p={[0, 0.8, 1.32]} c="#0f172a" />
    </group>
  );
}

function Temple({ color }: { color: string }) {
  return (
    <group>
      <Box s={[5, 0.35, 5]} p={[0, 0.17, 0]} c="#e7e5e4" />
      <Box s={[4, 0.35, 4]} p={[0, 0.52, 0]} c="#d6d3d1" />
      <Box s={[3, 0.35, 3]} p={[0, 0.87, 0]} c="#e7e5e4" />
      <Box s={[2.1, 1.9, 2.1]} p={[0, 2, 0]} c="#fef3c7" />
      <Box s={[0.75, 1.2, 0.06]} p={[0, 1.65, 1.06]} c="#7c2d12" />
      <Cone a={[1.35, 2.9, 8]} p={[0, 4.4, 0]} c="#f97316" />
      <Ball a={0.22} p={[0, 5.95, 0]} c="#facc15" e={0.4} />
      <Cyl a={[0.03, 0.03, 0.9, 4]} p={[0, 6.5, 0]} c="#78716c" />
      <Box s={[0.55, 0.32, 0.03]} p={[0.28, 6.78, 0]} c={color} />
      {[-1.25, 1.25].map((x) => (
        <Cyl key={x} a={[0.12, 0.12, 1.9, 6]} p={[x, 2, 1.25]} c="#fde68a" />
      ))}
    </group>
  );
}

function Iot({ color }: { color: string }) {
  return (
    <group>
      <Box s={[2.6, 0.25, 2]} p={[0, 0.12, 0]} c="#94a3b8" />
      <Box s={[2.2, 1.6, 1.5]} p={[0, 1.05, 0]} c="#64748b" />
      <Box s={[1.4, 0.8, 0.05]} p={[-0.2, 1.15, 0.77]} c="#0f172a" />
      <Blink speed={5}>
        <Ball a={0.07} p={[-0.6, 1.3, 0.8]} c="#22c55e" e={2} />
      </Blink>
      <Ball a={0.07} p={[-0.35, 1.3, 0.8]} c="#f59e0b" e={1.5} />
      <Box s={[0.35, 0.35, 0.05]} p={[0.75, 1.05, 0.77]} c={color} e={0.5} />
      {/* Antenna mast */}
      <Cyl a={[0.06, 0.08, 3.2, 6]} p={[0.7, 3.4, -0.4]} c="#cbd5e1" />
      <Cone a={[0.45, 0.25, 8]} p={[0.7, 4.6, -0.4]} r={[Math.PI, 0, 0]} c="#e2e8f0" />
      <Blink speed={2}>
        <mesh receiveShadow position={[0.7, 5.05, -0.4]} rotation={[Math.PI / 2, 0, 0]} material={mat(color, 1.2)}>
          <torusGeometry args={[0.45, 0.04, 4, 16]} />
        </mesh>
        <mesh receiveShadow position={[0.7, 5.05, -0.4]} rotation={[Math.PI / 2, 0, 0]} material={mat(color, 0.8)}>
          <torusGeometry args={[0.8, 0.035, 4, 20]} />
        </mesh>
      </Blink>
      <Ball a={0.1} p={[0.7, 5.05, -0.4]} c="#ef4444" e={2} />
    </group>
  );
}

/** Market stall shared by the food, cashew, shop and café sites; `children` is its goods. */
function Stall({ color, children }: { color: string; children?: ReactNode }) {
  return (
    <group>
      <Box s={[2.8, 0.95, 1.1]} p={[0, 0.48, 0.45]} c="#a16207" />
      <Box s={[2.9, 0.08, 1.2]} p={[0, 0.98, 0.45]} c="#d6a35c" />
      <Box s={[2.8, 2.2, 0.1]} p={[0, 1.1, -0.85]} c="#b45309" />
      {[-1.3, 1.3].flatMap((x) =>
        [-0.8, 1].map((z) => <Cyl key={`${x}${z}`} a={[0.06, 0.06, 2.4, 5]} p={[x, 1.2, z]} c="#78350f" />),
      )}
      {[-1.05, -0.35, 0.35, 1.05].map((x, i) => (
        <Box key={x} s={[0.7, 0.08, 2.3]} p={[x, 2.45, 0.15]} r={[0.22, 0, 0]} c={i % 2 ? '#ffffff' : color} />
      ))}
      {children}
    </group>
  );
}

function FoodStall({ color }: { color: string }) {
  const fruit = ['#ef4444', '#f59e0b', '#facc15', '#84cc16', '#f97316', '#dc2626'];
  return (
    <Stall color={color}>
      {fruit.map((c, i) => (
        <Ball key={c} a={0.16} p={[-1 + (i % 3) * 0.32, 1.17, 0.3 + Math.floor(i / 3) * 0.32]} c={c} />
      ))}
      {[0.6, 1.1].map((x) => (
        <Box key={x} s={[0.42, 0.3, 0.42]} p={[x, 1.17, 0.45]} c="#d97706" />
      ))}
      {[-0.6, 0.2].map((x) => (
        <Box key={x} s={[0.6, 0.45, 0.5]} p={[x, 0.23, 1.6]} c="#92400e" />
      ))}
    </Stall>
  );
}

function CashewStall({ color }: { color: string }) {
  const nut = '#e8d3a8';
  return (
    <Stall color={color}>
      {[-0.8, 0, 0.8].map((x) => (
        <group key={x} position={[x, 1.02, 0.45]}>
          <Cyl a={[0.32, 0.22, 0.2, 10]} p={[0, 0.1, 0]} c="#7c2d12" />
          {[0, 1, 2, 3].map((i) => (
            <mesh receiveShadow key={i} position={[Math.cos(i * 1.6) * 0.14, 0.22, Math.sin(i * 1.6) * 0.14]} rotation={[Math.PI / 2, 0, i]} material={mat(nut)}>
              <torusGeometry args={[0.09, 0.05, 4, 6, Math.PI]} />
            </mesh>
          ))}
        </group>
      ))}
      <Ball a={0.55} s={[1, 1.2, 1]} p={[1.9, 0.6, 1.2]} c="#c2a26b" />
      <Ball a={0.45} s={[1, 1.15, 1]} p={[-1.9, 0.5, 1.3]} c="#b8955a" />
    </Stall>
  );
}

function Shop({ color }: { color: string }) {
  return (
    <Stall color={color}>
      {/* A giant shopping bag */}
      <group position={[1.9, 0, 1.4]}>
        <Box s={[0.95, 1.2, 0.55]} p={[0, 0.6, 0]} c={color} />
        <mesh receiveShadow position={[0, 1.25, 0]} material={mat('#1e3a8a')}>
          <torusGeometry args={[0.25, 0.04, 4, 10, Math.PI]} />
        </mesh>
      </group>
      {[-0.9, -0.3, 0.3].map((x, i) => (
        <Box key={x} s={[0.45, 0.35 + i * 0.1, 0.4]} p={[x, 1.2 + i * 0.05, 0.45]} c={['#f8fafc', '#fbbf24', '#60a5fa'][i]} />
      ))}
    </Stall>
  );
}

function Cafe({ color }: { color: string }) {
  return (
    <Stall color={color}>
      {/* Giant coffee cup on the roof */}
      <group position={[0, 2.75, -0.3]}>
        <Cyl a={[0.5, 0.38, 0.85, 10]} p={[0, 0.42, 0]} c="#ffffff" />
        <Cyl a={[0.46, 0.46, 0.04, 10]} p={[0, 0.83, 0]} c="#6f3d1e" />
        <mesh receiveShadow position={[0.5, 0.45, 0]} material={mat('#ffffff')}>
          <torusGeometry args={[0.22, 0.06, 4, 10]} />
        </mesh>
      </group>
      {/* Table with two stools */}
      <group position={[2.3, 0, 1.6]}>
        <Cyl a={[0.5, 0.5, 0.06, 10]} p={[0, 0.75, 0]} c="#f5f5f4" />
        <Cyl a={[0.05, 0.05, 0.75, 5]} p={[0, 0.37, 0]} c="#57534e" />
        {[-0.75, 0.75].map((x) => (
          <Cyl key={x} a={[0.2, 0.2, 0.45, 8]} p={[x, 0.23, 0]} c={color} />
        ))}
      </group>
    </Stall>
  );
}

const builders: Record<LandmarkKind, (p: { color: string }) => ReactNode> = {
  warehouse: Warehouse,
  pharma: Pharma,
  tower: Tower,
  'support-hut': SupportHut,
  press: Press,
  office: Office,
  temple: Temple,
  iot: Iot,
  'food-stall': FoodStall,
  'cashew-stall': CashewStall,
  shop: Shop,
  cafe: Cafe,
};

/** The detailed model of a project site. */
export function Landmark({ kind, color }: { kind: LandmarkKind; color: string }) {
  const Build = builders[kind];
  return <Build color={color} />;
}
