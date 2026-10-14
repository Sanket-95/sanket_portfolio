import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { profile } from '@/config/site';

export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-title">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading
            id="contact-title"
            eyebrow="Contact"
            title="Let's work together"
            description="Hiring for a full stack, backend, DevOps or industrial software role — or have a project in mind? Reach out through any of these and I'll get back to you."
          />
        </div>

        <Reveal delay={0.1} className="grid content-start gap-4 sm:grid-cols-2 lg:col-span-7 lg:pt-10">
          <ContactItem href={`mailto:${profile.email}`} icon={<Mail size={19} aria-hidden="true" />} label="Email">
            {profile.email}
          </ContactItem>
          <ContactItem href={profile.phoneHref} icon={<Phone size={19} aria-hidden="true" />} label="Phone">
            {profile.phone}
          </ContactItem>
          <ContactItem
            href={profile.social.linkedin}
            external
            icon={<BrandIcon name="linkedin" size={18} tone="mono" />}
            label="LinkedIn"
          >
            linkedin.com/in/sathesanket
          </ContactItem>
          <ContactItem
            href={profile.social.github}
            external
            icon={<BrandIcon name="github" size={18} tone="mono" />}
            label="GitHub"
          >
            github.com/Sanket-95
          </ContactItem>
          <div className="sm:col-span-2">
            <ContactItem icon={<MapPin size={19} aria-hidden="true" />} label="Location">
              {profile.location} · {profile.workMode}
            </ContactItem>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function ContactItem({
  href,
  external,
  icon,
  label,
  children,
}: {
  href?: string;
  external?: boolean;
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  const body = (
    <>
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-ink text-accent-soft">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold tracking-widest text-slate-400 uppercase">{label}</span>
        <span className="mt-0.5 block break-words text-[15px] font-medium text-white">{children}</span>
      </span>
      {href && <ArrowUpRight size={18} aria-hidden="true" className="shrink-0 text-slate-500 transition-colors group-hover:text-white" />}
    </>
  );
  const cls = 'card group flex h-full items-center gap-4 px-5 py-5';
  if (!href) return <div className={cls}>{body}</div>;
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`${cls} transition-colors hover:border-accent/40`}
    >
      {body}
    </a>
  );
}
