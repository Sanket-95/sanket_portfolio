import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { m } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ScrollManager } from './ScrollManager';
import { ScrollToTopButton } from './ScrollToTopButton';
import { PageLoader } from './PageLoader';

export function Layout() {
  const { pathname } = useLocation();
  // The first page is pre-rendered HTML: show it as-is. Fade only on later navigations.
  const isFirstRender = useRef(true);
  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="fixed top-3 left-3 z-[60] -translate-y-20 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <ScrollManager />
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<PageLoader />}>
          <m.div
            key={pathname}
            initial={isFirstRender.current ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Outlet />
          </m.div>
        </Suspense>
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
