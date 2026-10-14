import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App, { preloadPage } from './App';
import { AppProviders } from './AppProviders';

// Animation features are only needed after first paint, so load them in a separate chunk.
const loadMotionFeatures = () => import('./motionFeatures').then((mod) => mod.default);

// Static per-route head tags from the pre-rendered HTML; Helmet takes over from here.
document.head.querySelectorAll('[data-ssg]').forEach((el) => el.remove());

const container = document.getElementById('root')!;
const app = (
  <AppProviders motionFeatures={loadMotionFeatures}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AppProviders>
);

// Hydrate only when the pre-rendered markup belongs to this URL. A host that falls
// back to another page's HTML (e.g. an SPA rewrite) gets a clean client render instead.
const normalize = (p: string) => p.replace(/\/+$/, '') || '/';
const renderedRoute = container.dataset.route;
const matches =
  renderedRoute === normalize(window.location.pathname) || (renderedRoute === '/404' && container.hasChildNodes());

if (renderedRoute && container.hasChildNodes() && matches) {
  // Let the browser paint the pre-rendered page before hydration occupies the main
  // thread, and load the page's chunk first so hydration never suspends (see preloadPage).
  const afterFirstPaint = new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
  Promise.all([afterFirstPaint, preloadPage(renderedRoute)]).then(() => hydrateRoot(container, app));
} else {
  container.replaceChildren();
  createRoot(container).render(app);
}
