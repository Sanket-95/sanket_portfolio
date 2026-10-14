import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import { domAnimation } from 'framer-motion';
import App from './App';
import { AppProviders } from './AppProviders';
import { routeMeta } from './config/seo';

/** Routes to pre-render at build time, plus the 404 page. */
export const routes = [...routeMeta.map((r) => r.path), '/404'];

/** Renders a route to static HTML, waiting for lazy-loaded pages to resolve. */
export async function render(url: string): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <AppProviders motionFeatures={domAnimation}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </AppProviders>,
    // Keep every Suspense boundary inline. By default React outlines large boundaries
    // (fallback first, content swapped in by script), which delays paint and shifts layout.
    { progressiveChunkSize: Number.POSITIVE_INFINITY },
  );

  const chunks: Buffer[] = [];
  for await (const chunk of prelude) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}
