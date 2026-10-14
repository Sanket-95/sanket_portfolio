import { Mail } from 'lucide-react';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { profile } from '@/config/site';

const linkClass =
  'inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line-strong text-slate-300 transition-colors hover:border-white/30 hover:bg-white/[0.05] hover:text-white';

const links = [
  { label: 'GitHub', href: profile.social.github, icon: 'github' },
  { label: 'LinkedIn', href: profile.social.linkedin, icon: 'linkedin' },
  { label: 'YouTube', href: profile.social.youtube, icon: 'youtube' },
  { label: 'Instagram', href: profile.social.instagram, icon: 'instagram' },
] as const;

export function SocialLinks() {
  return (
    <ul className="flex flex-wrap gap-2.5" aria-label="Profiles">
      {links.map((l) => (
        <li key={l.label}>
          <a href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`${l.label} (opens in a new tab)`} className={linkClass}>
            <BrandIcon name={l.icon} size={18} tone="mono" />
          </a>
        </li>
      ))}
      <li>
        <a href={`mailto:${profile.email}`} aria-label={`Email ${profile.email}`} className={linkClass}>
          <Mail size={18} aria-hidden="true" />
        </a>
      </li>
    </ul>
  );
}
