import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_SITE_URL } from './src/config/site.ts';
import { routeMeta } from './src/config/seo.ts';

const root = fileURLToPath(new URL('.', import.meta.url));

const escapeAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * SEO plugin:
 *  - replaces __SITE_URL__ in index.html
 *  - emits robots.txt and sitemap.xml
 *  - writes a static HTML entry per route with route-specific title, description,
 *    canonical and Open Graph tags, so crawlers and link previews work without JS
 *    and deep links resolve on any static host.
 */
function seoPlugin(siteUrl: string): Plugin {
  let outDir = 'dist';
  let isSsrBuild = false;
  return {
    name: 'portfolio-seo',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
      isSsrBuild = !!config.build.ssr;
    },
    transformIndexHtml(html, ctx) {
      // The SCADA demo page (scada-demo/index.html) has its own fonts and no SEO placeholders.
      if (ctx.path.startsWith('/scada-demo/')) return html;
      const out = html.replace(/__SITE_URL__/g, siteUrl);
      // Preload the Latin Inter file so text renders in the brand font without a late swap.
      const font = Object.keys(ctx.bundle ?? {}).find((f) => /inter-latin-wght-normal-.*\.woff2$/.test(f));
      if (!font) return out;
      return {
        html: out,
        tags: [
          {
            tag: 'link',
            attrs: { rel: 'preload', href: `/${font}`, as: 'font', type: 'font/woff2', crossorigin: '' },
            injectTo: 'head-prepend',
          },
        ],
      };
    },
    writeBundle() {
      if (isSsrBuild) return;
      const today = new Date().toISOString().slice(0, 10);
      const urls = routeMeta
        .map(
          (r) =>
            `  <url>\n    <loc>${siteUrl}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority.toFixed(1)}</priority>\n  </url>`,
        )
        .join('\n');
      writeFileSync(
        resolve(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
      writeFileSync(
        resolve(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      );

      const base = readFileSync(resolve(outDir, 'index.html'), 'utf8');
      const withMeta = (title: string, description: string, url: string) =>
        base
          .replace(/(<title[^>]*>)[^<]*(<\/title>)/, `$1${title}$2`)
          .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
          .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
          .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
          .replace(/(<meta property="og:description" content=")[^"]*/, `$1${description}`)
          .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${title}`)
          .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${description}`);

      for (const r of routeMeta) {
        if (r.path === '/') continue;
        const dir = resolve(outDir, r.path.slice(1));
        mkdirSync(dir, { recursive: true });
        writeFileSync(
          resolve(dir, 'index.html'),
          withMeta(escapeAttr(r.title), escapeAttr(r.description), `${siteUrl}${r.path}`),
        );
      }

      // Static 404 for hosts that serve 404.html (Netlify, Cloudflare Pages, GitHub Pages).
      writeFileSync(
        resolve(outDir, '404.html'),
        withMeta('Page Not Found | Sanket Sathe', 'The page you are looking for could not be found.', `${siteUrl}/`).replace(
          'content="index, follow"',
          'content="noindex, follow"',
        ),
      );
    },
  };
}

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, root, 'VITE_');
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

  return {
    plugins: [react(), tailwindcss(), seoPlugin(siteUrl)],
    resolve: {
      alias: { '@': resolve(root, 'src') },
    },
    build: {
      target: 'es2022',
      assetsInlineLimit: 4096,
      rolldownOptions: {
        // Two pages in one app: the website (/) and the 3D Web SCADA live demo
        // (/scada-demo/, source in scada-demo/ — a static, simulated-data app).
        ...(isSsrBuild ? {} : { input: { main: resolve(root, 'index.html'), scada: resolve(root, 'scada-demo/index.html') } }),
        output: {
          // Long-term cacheable vendor chunks.
          codeSplitting: {
            groups: [
              { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
              { name: 'router', test: /node_modules[\\/](react-router|react-router-dom|react-helmet-async|react-fast-compare|invariant|shallowequal)[\\/]/ },
            ],
          },
        },
      },
    },
  };
});
