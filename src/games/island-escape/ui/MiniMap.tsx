import { useEffect, useMemo, useRef } from 'react';
import { brandIcons } from '@/data/brandIcons';
import { sites, symbols } from '../data/island';
import { boatSpot, outline } from '../world/terrain';
import { useGame } from '../hooks/useGameStore';
import { tracker } from '../world/tracker';

const VIEW = 82;
const toPath = (pts: { x: number; z: number }[]) => `M${pts.map((p) => `${p.x.toFixed(1)} ${p.z.toFixed(1)}`).join('L')}Z`;

/**
 * Corner map of the island: sites (squares, green once visited), uncollected symbols
 * (dots), the boat and the player. The player marker is moved directly in the DOM each
 * animation frame, so the map never re-renders while walking.
 */
export function MiniMap() {
  const collected = useGame((s) => s.collected);
  const visited = useGame((s) => s.visited);
  const player = useRef<SVGGElement>(null);
  const shapes = useMemo(() => ({ shore: toPath(outline(72)), grass: toPath(outline(72, 0.86)) }), []);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      if (player.current) {
        const deg = (-tracker.yaw * 180) / Math.PI;
        player.current.setAttribute('transform', `translate(${tracker.x.toFixed(1)} ${tracker.z.toFixed(1)}) rotate(${deg.toFixed(1)})`);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <svg
      viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}
      className="ie-minimap"
      role="img"
      aria-label={`Island map: ${symbols.length - collected.length} tech symbols and ${sites.length - visited.length} project sites left`}
    >
      <circle r={VIEW} fill="#1f7fb4" />
      <path d={shapes.shore} fill="#e9d49c" />
      <path d={shapes.grass} fill="#5f9d3c" />
      {symbols
        .filter((s) => !collected.includes(s.key))
        .map((s) => (
          <circle key={s.key} cx={s.x} cy={s.z} r={3} fill={brandIcons[s.key].hex} stroke="#fff" strokeWidth={1.2} />
        ))}
      {sites.map((s) => {
        const done = visited.includes(s.id);
        return <rect key={s.id} x={s.x - 4.5} y={s.z - 4.5} width={9} height={9} rx={2} fill={done ? '#4ade80' : s.color} stroke="#0f172a" strokeWidth={1.5} />;
      })}
      <path d={`M${boatSpot.x - 6} ${boatSpot.z - 2}h12l-3 5h-6z`} fill="#7c4a1e" stroke="#fff" strokeWidth={1.2} />
      <g ref={player}>
        <path d="M0 -8 L6 6 L0 3 L-6 6 Z" fill="#fde047" stroke="#0f172a" strokeWidth={1.5} />
      </g>
    </svg>
  );
}
