import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { techCategories } from '@/data/technologies';

export function Technologies({ tone = 'default' }: { tone?: 'default' | 'raised' }) {
  return (
    <Section id="technologies" labelledBy="technologies-title" tone={tone}>
      <SectionHeading
        id="technologies-title"
        eyebrow="Tech Stack"
        title="Technologies I use in production"
        description="Every tool here has shipped in real projects — from browser to database, cloud server to PLC."
      />

      <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {techCategories.map((cat, i) => (
          <Reveal key={cat.id} delay={(i % 4) * 0.08} variant="scale" className="card flex flex-col p-7">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">{cat.title}</h3>
              <span className="shrink-0 text-xs text-slate-400 tabular-nums">
                {cat.items.length} {cat.items.length === 1 ? 'technology' : 'technologies'}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{cat.description}</p>
            <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {cat.items.map((t) => (
                <li
                  key={t.name}
                  className="flex flex-col items-center justify-center gap-2.5 rounded-xl border border-line bg-ink/60 px-2 py-4 text-center transition-colors hover:border-line-strong hover:bg-ink"
                >
                  <BrandIcon name={t.icon} size={26} />
                  <span className="text-xs font-medium text-slate-300">{t.name}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
