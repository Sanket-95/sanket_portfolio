import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { BrowserPreview, Tags, cardClass, cardLinkClass } from '@/components/ui/Cards';
import { demos, type Demo } from '@/data/work';

export function Demos() {
  return (
    <Section id="demos" labelledBy="demos-title" tone="raised">
      <SectionHeading
        id="demos-title"
        eyebrow="Live Demos"
        title="Try my work, right here in your browser"
        description="Working versions of products I've built for clients, running on simulated data. Open one and explore — nothing leaves your browser. The 3D Web SCADA demo is linked above."
      />

      <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {demos.map((d, i) => (
          <Reveal as="li" key={d.id} delay={(i % 3) * 0.1} variant="scale" className="h-full">
            <DemoCard demo={d} />
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

function DemoCard({ demo }: { demo: Demo }) {
  const arrow = (
    <ArrowUpRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
  );
  return (
    <article className={`${cardClass} cursor-pointer`}>
      <BrowserPreview address={demo.path.replace(/\/$/, '')} image={demo.image} aspect="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-7">
        <p className="text-xs font-semibold tracking-widest text-accent-soft uppercase">{demo.category}</p>
        <h3 className="mt-3 text-xl font-semibold text-white">{demo.title}</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{demo.summary}</p>
        <Tags items={demo.highlights} />
        {demo.external ? (
          <a href={demo.path} target="_blank" rel="noopener" className={cardLinkClass}>
            Open live demo
            {arrow}
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          <Link to={demo.path} className={cardLinkClass}>
            Open live demo
            {arrow}
          </Link>
        )}
      </div>
    </article>
  );
}
