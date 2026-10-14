import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { buttonClasses } from '@/components/ui/Button';
import { BrowserPreview, Tags } from '@/components/ui/Cards';
import { caseStudies, type CaseStudy } from '@/data/work';

export function Work() {
  return (
    <Section id="work" labelledBy="work-title">
      <SectionHeading
        id="work-title"
        eyebrow="Selected Work"
        title="Systems I've designed, built and delivered"
        description="Production work for manufacturers, pharma and service businesses — each described by the problem, what I engineered and the stack behind it."
      />

      <div className="mt-14 space-y-6">
        {caseStudies.map((c) => (
          <Reveal key={c.id} as="article" delay={0.05} variant="scale" className="card overflow-hidden">
            {c.image ? <MediaCase study={c} /> : <TextCase study={c} />}
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Meta({ study }: { study: CaseStudy }) {
  return (
    <p className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-slate-400">
      {study.period && (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={14} aria-hidden="true" className="text-accent-soft" />
          {study.period}
        </span>
      )}
      <span className="inline-flex items-center gap-1.5">
        <MapPin size={14} aria-hidden="true" className="text-accent-soft" />
        {study.context}
      </span>
    </p>
  );
}

function Points({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((p) => (
        <li key={p} className="relative pl-6 text-[15px] leading-relaxed text-slate-300">
          <span aria-hidden="true" className="absolute top-[0.6em] left-0.5 h-1.5 w-1.5 rounded-[2px] bg-accent" />
          {p}
        </li>
      ))}
    </ul>
  );
}

function Heading({ study }: { study: CaseStudy }) {
  return (
    <>
      <Meta study={study} />
      <h3 className="mt-4 text-2xl font-semibold tracking-tight text-balance text-white">{study.title}</h3>
      <p className="mt-4 leading-relaxed text-pretty text-muted">{study.summary}</p>
    </>
  );
}

function MediaCase({ study }: { study: CaseStudy }) {
  return (
    <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="group border-b border-line lg:border-r lg:border-b-0">
        <BrowserPreview address={study.demo?.href ?? ''} image={study.image!} aspect="aspect-[16/9]" />
        <div className="hidden p-8 lg:block">
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Tech stack</p>
          <Tags items={study.stack} label="Tech stack" />
        </div>
      </div>
      <div className="p-7 sm:p-10">
        <Heading study={study} />
        <div className="mt-7">
          <Points items={study.points} />
        </div>
        <div className="lg:hidden">
          <Tags items={study.stack} label="Tech stack" />
        </div>
        {study.demo && (
          <div className="mt-8">
            {study.demo.external ? (
              <a href={study.demo.href} target="_blank" rel="noopener" className={buttonClasses('primary', 'md')}>
                {study.demo.label}
                <ArrowUpRight size={16} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <Link to={study.demo.href} className={buttonClasses('primary', 'md')}>
                {study.demo.label}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TextCase({ study }: { study: CaseStudy }) {
  return (
    <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <Heading study={study} />
        <Tags items={study.stack} label="Tech stack" />
      </div>
      <div className="lg:pt-9">
        <Points items={study.points} />
      </div>
    </div>
  );
}
