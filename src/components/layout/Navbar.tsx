import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { ArrowRight, Mail, Menu, X } from 'lucide-react';
import { navItems } from '@/config/site';
import { useScrolled } from '@/hooks/useScrolled';
import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/ui/Logo';
import { ButtonLink } from '@/components/ui/Button';

export function Navbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu on navigation.
  useEffect(() => setOpen(false), [pathname, hash]);

  // Escape closes the menu; lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        solid ? 'border-b border-line bg-ink/90 backdrop-blur-md' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <Container className="flex h-[72px] items-center justify-between gap-6">
        <Link to="/" aria-label="Sanket Sathe — Home" className="shrink-0 rounded-md">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="rounded-md px-3.5 py-2 text-[14px] font-medium text-slate-300 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink to="/#contact" className="hidden sm:inline-flex">
            <Mail size={16} aria-hidden="true" />
            Contact
          </ButtonLink>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line-strong text-white transition-colors hover:bg-white/5 lg:hidden"
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <m.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden border-t border-line bg-ink lg:hidden"
          >
            <Container className="flex max-h-[calc(100dvh-72px)] flex-col overflow-y-auto py-4">
              <ul className="flex flex-col">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="flex items-center justify-between border-b border-line py-4 text-base font-medium text-slate-300"
                    >
                      {item.label}
                      <ArrowRight size={16} aria-hidden="true" className="text-slate-400" />
                    </Link>
                  </li>
                ))}
              </ul>
              <ButtonLink to="/#contact" size="lg" className="mt-5 sm:hidden">
                <Mail size={18} aria-hidden="true" />
                Contact Me
              </ButtonLink>
            </Container>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
