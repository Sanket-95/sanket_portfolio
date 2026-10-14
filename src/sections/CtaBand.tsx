import { ArrowLeft, Mail } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ButtonLink, buttonClasses } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { profile } from '@/config/site';

export function CtaBand() {
  return (
    <section aria-labelledby="cta-title" className="py-20 sm:py-24">
      <Container>
        <Reveal variant="scale" className="relative overflow-hidden rounded-3xl border border-line bg-panel px-7 py-14 sm:px-14 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,#000,transparent_70%)]" />
          <div className="relative max-w-2xl">
            <h2 id="cta-title" className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
              Like what you see? Let's talk.
            </h2>
            <p className="mt-4 text-lg text-muted">
              I'm open to remote and hybrid roles. Explore more of my work or send me a message.
            </p>
          </div>
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
            <a href={`mailto:${profile.email}`} className={buttonClasses('primary', 'lg')}>
              <Mail size={18} aria-hidden="true" />
              Get in Touch
            </a>
            <ButtonLink to="/#work" size="lg" variant="secondary">
              <ArrowLeft size={18} aria-hidden="true" />
              Back to Portfolio
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
