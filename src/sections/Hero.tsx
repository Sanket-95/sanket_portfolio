import type { CSSProperties } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ButtonLink } from '@/components/ui/Button';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { SocialLinks } from '@/components/ui/SocialLinks';
import { useParallax } from '@/hooks/useParallax';
import { heroTechnologies } from '@/data/technologies';
import { profile } from '@/config/site';

/** Stagger for the CSS entrance animation (.enter in index.css). */
const enterDelay = (seconds: number) => ({ '--enter-delay': `${seconds}s` }) as CSSProperties;

const parallaxStyle = { transform: 'translateY(var(--parallax-y, 0px))' } as CSSProperties;

export function Hero() {
  const gridRef = useParallax<HTMLDivElement>(0.12);
  const glowRef = useParallax<HTMLDivElement>(0.26);

  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-svh items-center overflow-hidden pt-[72px]">
      {/* Background: slowly panning grid with a single soft accent glow, each drifting at its own
          rate on scroll (grid slowest/furthest, glow faster/nearest) for a subtle sense of depth. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div ref={gridRef} style={parallaxStyle} className="mask-radial absolute inset-0 overflow-hidden">
          {/* Oversized by one tile and moved with transform, so the pan is composited, not repainted. */}
          <div className="bg-grid absolute -inset-16 animate-grid-pan will-change-transform" />
        </div>
        <div
          ref={glowRef}
          style={parallaxStyle}
          className="absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(ellipse_50%_45%_at_50%_15%,rgb(37_99_235/0.16),transparent)]"
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>

      <Container className="grid items-center gap-14 py-16 lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="lg:col-span-7">
          <p style={enterDelay(0)} className="enter flex w-fit items-center gap-2.5 rounded-full border border-line-strong bg-white/[0.03] py-1.5 pr-4 pl-3 text-[13px] text-slate-300">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgb(52_211_153/0.15)]" />
            {profile.workMode}
          </p>

          <p style={enterDelay(0.05)} className="enter eyebrow mt-8">
            <span aria-hidden="true" className="h-px w-6 bg-accent-soft/70" />
            {profile.name} · {profile.role}
          </p>

          <h1
            id="hero-title"
            className="enter-move mt-5 text-[2.5rem] leading-[1.06] font-semibold tracking-[-0.025em] text-balance text-white sm:text-6xl lg:text-[4rem]"
          >
            Engineering reliable software,
            <br />
            <span className="text-slate-400">from the plant floor to the cloud.</span>
          </h1>

          <p className="enter-move mt-7 max-w-2xl text-base leading-relaxed text-pretty text-muted sm:text-lg">
            I design, build and deploy end-to-end systems — <span className="text-slate-200">SCADA and compliance
            reporting</span> for manufacturing, <span className="text-slate-200">enterprise web platforms</span>,{' '}
            <span className="text-slate-200">WhatsApp automation</span> and <span className="text-slate-200">mobile
            apps</span>. I own the whole path, from database schema and APIs to the production server that runs them.
          </p>

          <div style={enterDelay(0.2)} className="enter mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/#work" size="lg">
              View My Work
              <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink to="/#contact" size="lg" variant="secondary">
              <Mail size={18} aria-hidden="true" />
              Contact Me
            </ButtonLink>
          </div>

          <div style={enterDelay(0.3)} className="enter mt-10">
            <SocialLinks />
          </div>
        </div>

        <TechConstellation />
      </Container>
    </section>
  );
}

/** Staggered grid of floating technology tiles. */
function TechConstellation() {
  return (
    <div style={enterDelay(0.15)} className="enter relative lg:col-span-5">
      <p className="sr-only">Core technologies: {heroTechnologies.map((t) => t.name).join(', ')}.</p>
      <div aria-hidden="true" className="relative mx-auto max-w-md lg:max-w-none">
        {/* Faint connecting frame behind the tiles. */}
        <div className="absolute inset-6 rounded-3xl border border-dashed border-white/[0.07]" />
        <ul className="relative grid grid-cols-3 gap-3 sm:gap-4">
          {heroTechnologies.map((tech, i) => (
            <li
              key={tech.name}
              className={`animate-float ${i % 3 === 1 ? 'translate-y-6' : ''}`}
              style={{ animationDelay: `${(i % 5) * -1.4}s` }}
            >
              <div className="flex aspect-square flex-col items-center justify-center gap-2.5 rounded-2xl border border-line bg-panel/80 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.8)] transition-colors hover:border-line-strong sm:gap-3">
                <BrandIcon name={tech.icon} size={30} className="sm:h-9 sm:w-9" />
                <span className="text-[11px] font-medium text-slate-400 sm:text-xs">{tech.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
