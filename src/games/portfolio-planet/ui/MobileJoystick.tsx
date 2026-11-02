import { useRef, useState, type PointerEvent } from 'react';
import { ArrowUp } from 'lucide-react';
import { input } from '../hooks/useControls';

const RADIUS = 48;

/** On-screen joystick (move/turn) and jump button for touch devices. */
export function MobileJoystick() {
  const pad = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const update = (e: PointerEvent) => {
    const r = pad.current!.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    input.joyX = dx / RADIUS;
    input.joyY = -dy / RADIUS;
  };

  const release = () => {
    pointer.current = null;
    setKnob({ x: 0, y: 0 });
    input.joyX = 0;
    input.joyY = 0;
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-5">
      <div
        ref={pad}
        className="pp-joystick pointer-events-auto"
        onPointerDown={(e) => {
          pointer.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          update(e);
        }}
        onPointerMove={(e) => pointer.current === e.pointerId && update(e)}
        onPointerUp={release}
        onPointerCancel={release}
        aria-hidden="true"
      >
        <div className="pp-joystick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
      </div>
      <button
        type="button"
        className="pp-jump pointer-events-auto"
        onPointerDown={(e) => {
          e.preventDefault();
          input.jump = true;
        }}
        aria-label="Jump"
      >
        <ArrowUp size={28} aria-hidden="true" />
      </button>
    </div>
  );
}
