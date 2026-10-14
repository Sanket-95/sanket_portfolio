import { AnimatePresence, m } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useScrolled } from '@/hooks/useScrolled';

export function ScrollToTopButton() {
  const visible = useScrolled(640);

  return (
    <AnimatePresence>
      {visible && (
        <m.button
          type="button"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed right-5 bottom-5 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-panel/90 text-white shadow-lg transition-colors hover:border-accent hover:bg-accent sm:right-8 sm:bottom-8"
        >
          <ArrowUp size={18} aria-hidden="true" />
        </m.button>
      )}
    </AnimatePresence>
  );
}
