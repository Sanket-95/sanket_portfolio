import { ArrowUpRight, Clapperboard, MapPin, Music, Waves } from 'lucide-react';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { cardClass, cardLinkClass } from '@/components/ui/Cards';
import { creative } from '@/data/work';
import { profile } from '@/config/site';
import portrait from '@/assets/photo/sanket.jpg';

const creativeIcons = [Clapperboard, Waves, Music];

export function About() {
  return (
    <Section id="about" labelledBy="about-title" tone="raised">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal variant="scale" className="lg:col-span-5">
          <figure className="relative mx-auto max-w-sm lg:max-w-none">
            <img
              src={portrait}
              alt="Portrait of Sanket Sathe"
              width={540}
              height={644}
              loading="lazy"
              decoding="async"
              className="aspect-[540/644] w-full rounded-3xl border border-line-strong object-cover"
            />
            <figcaption className="absolute bottom-5 left-5 right-5 rounded-xl border border-line-strong bg-ink/85 px-4 py-3 backdrop-blur-md sm:right-auto">
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <MapPin size={15} aria-hidden="true" className="text-accent-soft" />
                {profile.city}
              </span>
              <span className="mt-0.5 block text-[13px] text-muted">{profile.workMode}</span>
            </figcaption>
          </figure>
        </Reveal>

        <div className="lg:col-span-7">
          <SectionHeading id="about-title" eyebrow="About Me" title="A developer who ships the whole system" />
          <div className="mt-8 space-y-5">
            <Reveal delay={0.05}>
              <p className="text-lg leading-relaxed text-pretty text-slate-200">
                I'm Sanket Sathe, a Senior Software Developer from Ratnagiri, working across the full stack. I do my best work where software meets
                real operations — a warehouse, a production line, a pharma plant, or a business that runs on its
                customer conversations.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="leading-relaxed text-pretty text-muted">
                I've migrated a 30-year-old DOS warehouse system to Oracle at Reliance, delivered compliance reporting
                for a drug-production line at Cipla, and engineered a browser-based SCADA that reads live data from
                Siemens and Mitsubishi PLCs. Alongside that, I build and launch client platforms — a state government
                news portal, e-commerce stores, WhatsApp support bots and mobile apps.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="leading-relaxed text-pretty text-muted">
                I work across the entire stack: database design, backend services, front-end interfaces, server
                setup and monitoring. I'm looking for a team where I can take ownership of meaningful products and
                keep growing as an engineer.
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="eyebrow">Beyond Code</h3>
          <p className="text-sm text-muted">I'm also a 3D animator and a musician.</p>
        </div>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {creative.map((c, i) => {
            const Icon = creativeIcons[i];
            return (
              <Reveal as="li" key={c.title} delay={i * 0.08} className="h-full">
                <article className={`${cardClass} cursor-pointer p-7`}>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-300">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-xs font-semibold tracking-widest text-accent-soft uppercase">{c.kind}</p>
                  <h4 className="mt-2 text-lg font-semibold text-white">{c.title}</h4>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{c.text}</p>
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className={cardLinkClass}>
                    {c.cta}
                    <ArrowUpRight size={16} aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
