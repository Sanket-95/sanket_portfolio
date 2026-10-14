import { Suspense, type ReactNode } from 'react';
import { Container } from './Container';

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Alternate background band to separate adjacent sections. */
  tone?: 'default' | 'raised';
  labelledBy?: string;
}

export function Section({ id, children, className = '', tone = 'default', labelledBy }: SectionProps) {
  const toneClass = tone === 'raised' ? 'bg-panel-2/40 border-y border-line' : '';
  return (
    <section id={id} aria-labelledby={labelledBy} className={`relative py-20 sm:py-24 lg:py-28 ${toneClass} ${className}`}>
      {/* A boundary per section lets React hydrate the pre-rendered page in small,
          interruptible chunks instead of one long main-thread task. */}
      <Suspense fallback={null}>
        <Container>{children}</Container>
      </Suspense>
    </section>
  );
}
