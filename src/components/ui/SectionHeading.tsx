import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  /** Use h1 when the heading is the page's primary heading. */
  level?: 'h1' | 'h2';
}

export function SectionHeading({ id, eyebrow, title, description, align = 'left', level = 'h2' }: SectionHeadingProps) {
  const Heading = level;
  const alignClass = align === 'center' ? 'mx-auto text-center items-center' : '';
  return (
    <Reveal variant="blur" className={`flex max-w-3xl flex-col ${alignClass}`}>
      <p className="eyebrow">
        <span aria-hidden="true" className="h-px w-6 bg-accent-soft/70" />
        {eyebrow}
      </p>
      <Heading
        id={id}
        className="mt-4 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
      >
        {title}
      </Heading>
      {description && <p className="mt-5 text-base leading-relaxed text-pretty text-muted sm:text-lg">{description}</p>}
    </Reveal>
  );
}
