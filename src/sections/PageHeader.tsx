import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

/** Hero band for inner pages; owns the page's h1. */
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line pt-[72px]">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="bg-grid mask-radial absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_60%_at_50%_0%,rgb(37_99_235/0.15),transparent)]" />
      </div>
      <Container className="py-20 sm:py-24">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-slate-400">
            <li>
              <Link to="/" className="transition-colors hover:text-white">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} />
            </li>
            <li aria-current="page" className="text-slate-300">
              {eyebrow}
            </li>
          </ol>
        </nav>
        <h1
          className="enter-move mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.02em] text-balance text-white sm:text-5xl lg:text-6xl"
        >
          {title}
        </h1>
        <p
          className="enter-move mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted"
        >
          {description}
        </p>
      </Container>
    </section>
  );
}
