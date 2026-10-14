import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'li' | 'article';
  /** Entrance style: up (default), scale-in, slide from a side, or blur-to-focus. */
  variant?: 'up' | 'scale' | 'left' | 'right' | 'blur';
}

// One observer shared by every Reveal keeps scroll work and hydration cost low.
let observer: IntersectionObserver | null = null;

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer?.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -60px 0px' },
    );
  }
  return observer;
}

/** Animates content in once when it scrolls into view (CSS-driven; see .reveal in index.css). */
export function Reveal({ children, className = '', delay = 0, as: Tag = 'div', variant = 'up' }: RevealProps) {
  // Intersection type satisfies the ref prop of every supported tag.
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  const style = delay ? ({ '--reveal-delay': `${delay}s` } as CSSProperties) : undefined;

  return (
    <Tag ref={ref} className={`reveal reveal-${variant} ${className}`} style={style}>
      {children}
    </Tag>
  );
}
