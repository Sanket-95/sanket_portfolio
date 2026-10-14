import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { navItems, profile } from '@/config/site';
import { demos } from '@/data/work';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { SocialLinks } from '@/components/ui/SocialLinks';

const linkClass = 'text-sm text-muted transition-colors hover:text-white';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-ink">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link to="/" aria-label="Sanket Sathe — Home" className="inline-block rounded-md">
              <Logo showTagline />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              Full stack developer building enterprise software, cloud infrastructure and industrial automation
              systems — from database to deployment.
            </p>
            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>

          <nav aria-labelledby="footer-sections" className="lg:col-span-2">
            <h2 id="footer-sections" className="text-sm font-semibold text-white">
              Sections
            </h2>
            <ul className="mt-4 space-y-3">
              {navItems.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-demos" className="lg:col-span-2">
            <h2 id="footer-demos" className="text-sm font-semibold text-white">
              Live Demos
            </h2>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="/scada-demo/" target="_blank" rel="noopener" className={linkClass}>
                  3D Web SCADA
                </a>
              </li>
              {demos.map((d) => (
                <li key={d.id}>
                  <Link to={d.path} className={linkClass}>
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold text-white">Contact</h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li>
                <a href={`mailto:${profile.email}`} className="flex items-start gap-2.5 text-muted transition-colors hover:text-white">
                  <Mail size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-accent-soft" />
                  <span className="break-words">{profile.email}</span>
                </a>
              </li>
              <li>
                <a href={profile.phoneHref} className="flex items-start gap-2.5 text-muted transition-colors hover:text-white">
                  <Phone size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-accent-soft" />
                  <span>{profile.phone}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-muted">
                <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-accent-soft" />
                <span>{profile.city}, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {profile.name}. All rights reserved.
          </p>
          <p>{profile.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}
