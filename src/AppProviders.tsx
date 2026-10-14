import { StrictMode, type ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { LazyMotion, MotionConfig, type FeatureBundle } from 'framer-motion';

interface AppProvidersProps {
  children: ReactNode;
  /** Animation features: loaded lazily in the browser, passed directly on the server. */
  motionFeatures: FeatureBundle | (() => Promise<FeatureBundle>);
}

/** Providers shared by the browser entry and the pre-render entry. */
export function AppProviders({ children, motionFeatures }: AppProvidersProps) {
  return (
    <StrictMode>
      <HelmetProvider>
        <LazyMotion features={motionFeatures} strict>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
      </HelmetProvider>
    </StrictMode>
  );
}
