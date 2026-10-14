import { ArrowUpRight, Radio, ShoppingBasket, Store } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { BrowserPreview, Tags, cardClass, cardLinkClass } from '@/components/ui/Cards';
import { hostOf, websites } from '@/data/work';

const icons: Record<string, LucideIcon> = { siddhai: ShoppingBasket, kokan: Store, rosary: Radio };

export function Websites() {
  const featured = websites.filter((w) => w.url && w.image);
  const others = websites.filter((w) => !(w.url && w.image));

  return (
    <Section id="websites" labelledBy="websites-title">
      <SectionHeading
        id="websites-title"
        eyebrow="Websites & Platforms"
        title="Sites I've built and launched for clients"
        description="Platforms I've built in collaboration with a state government, international clients and growing local brands — engineered for availability, performance and easy management."
      />

      <ul className="mt-14 grid gap-6 lg:grid-cols-3">
        {featured.map((w, i) => (
          <Reveal as="li" key={w.id} delay={i * 0.1} variant="scale" className="h-full">
            <article className={`${cardClass} cursor-pointer`}>
              <BrowserPreview address={hostOf(w.url!)} image={w.image!} aspect="aspect-[16/10]" />
              <div className="flex flex-1 flex-col p-7">
                <p className="text-xs font-semibold tracking-widest text-accent-soft uppercase">{w.category}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{w.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{w.summary}</p>
                <Tags items={w.highlights} />
                <a href={w.url} target="_blank" rel="noopener noreferrer" className={cardLinkClass}>
                  Visit {hostOf(w.url!)}
                  <ArrowUpRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>

      <ul className="mt-6 grid gap-6 md:grid-cols-3">
        {others.map((w, i) => {
          const Icon = icons[w.id] ?? Store;
          return (
            <Reveal as="li" key={w.id} delay={i * 0.08} className="card flex h-full flex-col p-7">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/15 text-accent-soft">
                <Icon size={20} aria-hidden="true" />
              </span>
              <p className="mt-5 text-xs font-semibold tracking-widest text-accent-soft uppercase">{w.category}</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{w.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{w.summary}</p>
              <Tags items={w.highlights} />
            </Reveal>
          );
        })}
      </ul>
    </Section>
  );
}
