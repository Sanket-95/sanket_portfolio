import { lazy, type ComponentType } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import Home from '@/pages/Home';

type PageModule = { default: ComponentType };

// Home ships in the main bundle for the fastest first paint; other pages are code-split.
const pageLoaders: Record<string, () => Promise<PageModule>> = {
  '/chat-bot': () => import('@/pages/ChatBotPage'),
  '/ecommerce-demo': () => import('@/pages/EcommerceDemoPage'),
  '/mobile-app-demo': () => import('@/pages/MobileAppDemoPage'),
  '/404': () => import('@/pages/NotFound'),
};

const lazyPages = Object.fromEntries(Object.entries(pageLoaders).map(([path, load]) => [path, lazy(load)]));
const loadedPages = new Map<string, ComponentType>();

/**
 * Loads a page's chunk ahead of rendering. Called before hydrating pre-rendered
 * HTML so the page renders synchronously instead of suspending, which would let
 * React discard the server markup and flash the loading fallback.
 */
export async function preloadPage(path: string) {
  const load = pageLoaders[path];
  if (load && !loadedPages.has(path)) loadedPages.set(path, (await load()).default);
}

function Page({ path }: { path: string }) {
  const Component = loadedPages.get(path) ?? lazyPages[path];
  return <Component />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="chat-bot" element={<Page path="/chat-bot" />} />
        <Route path="ecommerce-demo" element={<Page path="/ecommerce-demo" />} />
        <Route path="mobile-app-demo" element={<Page path="/mobile-app-demo" />} />
        <Route path="*" element={<Page path="/404" />} />
      </Route>
    </Routes>
  );
}
