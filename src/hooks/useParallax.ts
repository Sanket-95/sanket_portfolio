import { useEffect, useRef } from 'react';

/**
 * Drifts the ref'd element's `--parallax-y` custom property by `strength` x scrollY,
 * for a lightweight depth effect. Skipped entirely under prefers-reduced-motion.
 */
export function useParallax<T extends HTMLElement>(strength = 0.2) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    const update = () => {
      el.style.setProperty('--parallax-y', `${window.scrollY * strength}px`);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [strength]);

  return ref;
}
