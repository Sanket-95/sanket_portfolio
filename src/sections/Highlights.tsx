import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { highlights } from '@/data/work';

export function Highlights() {
  return (
    <section aria-label="Highlights" className="border-y border-line bg-panel-2/40">
      <Container>
        <ul className="grid grid-cols-2 lg:grid-cols-4">
          {highlights.map((h, i) => (
            <Reveal
              as="li"
              key={h.value}
              delay={i * 0.06}
              className={`py-8 pr-4 sm:py-10 ${i % 2 ? 'border-l border-line pl-5 sm:pl-8' : ''} ${i >= 2 ? 'border-t border-line lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l lg:pl-8' : ''}`}
            >
              <p className="text-3xl font-semibold tracking-tight text-white tabular-nums sm:text-4xl">{h.value}</p>
              <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-muted">{h.label}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
