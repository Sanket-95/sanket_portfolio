import { lazy, Suspense, useEffect, useState } from 'react';
import { Seo, breadcrumb } from '@/components/seo/Seo';
import { sites } from './data/island';
import { actions, useGame } from './hooks/useGameStore';
import { resetInput, useControls } from './hooks/useControls';
import { closeAudio, unlockAudio } from './audio';
import { IntroScreen } from './ui/IntroScreen';
import { HUD } from './ui/HUD';
import { ProjectCard } from './ui/ProjectCard';
import { WinScreen } from './ui/WinScreen';
import { MobileJoystick } from './ui/MobileJoystick';
import './styles.css';

// three.js and the scene load in their own chunk, only on this page and only in the browser.
const World = lazy(() => import('./scene/World'));

function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setTouch(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return touch;
}

/** Route component for /island: the 3D scene with the game UI on top. */
export default function IslandEscape() {
  const phase = useGame((s) => s.phase);
  const ready = useGame((s) => s.ready);
  const openId = useGame((s) => s.openSite);
  const isTouch = useIsTouch();
  // The canvas is client-only; the pre-rendered page shows the intro while it loads.
  const [mounted, setMounted] = useState(false);
  useControls();

  useEffect(() => {
    setMounted(true);
    actions.hydrate();
    return () => {
      actions.reset();
      resetInput();
      closeAudio();
    };
  }, []);

  const start = () => {
    unlockAudio();
    actions.start();
  };

  const open = sites.find((s) => s.id === openId);

  return (
    <div className="ie-root fixed inset-0 overflow-hidden bg-gradient-to-b from-[#3a86e0] to-[#cdeeff]">
      <Seo path="/island" jsonLd={[breadcrumb('Island Escape', '/island')]} />
      {mounted && (
        <Suspense fallback={null}>
          <World />
        </Suspense>
      )}

      {phase === 'intro' && <IntroScreen ready={ready} isTouch={isTouch} onStart={start} />}
      {(phase === 'playing' || phase === 'repairing' || phase === 'sailing') && <HUD isTouch={isTouch} />}
      {phase === 'playing' && isTouch && !open && <MobileJoystick />}
      {open && <ProjectCard site={open} />}
      {phase === 'won' && <WinScreen onRestart={start} />}
    </div>
  );
}
