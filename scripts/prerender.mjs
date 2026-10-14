// Injects server-rendered markup into each route's static HTML file in dist/.
// Runs after `vite build` (client) and `vite build --ssr` (server entry).
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dist = resolve(root, 'dist');
const ssrDir = resolve(root, 'dist-ssr');

const { render, routes } = await import(pathToFileURL(resolve(ssrDir, 'entry-server.js')).href);

// Inline the (small) stylesheet so first paint needs no extra round trip.
const inlineCss = (html) =>
  html.replace(/<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/, (_, href) => {
    const css = readFileSync(resolve(dist, href.slice(1)), 'utf8');
    return `<style>${css}</style>`;
  });

const fileFor = (route) =>
  route === '/' ? resolve(dist, 'index.html') : route === '/404' ? resolve(dist, '404.html') : resolve(dist, route.slice(1), 'index.html');

for (const route of routes) {
  const file = fileFor(route);
  if (!existsSync(file)) throw new Error(`Missing HTML template for ${route}: ${file}`);
  const template = readFileSync(file, 'utf8');
  if (!template.includes('<div id="root"></div>')) throw new Error(`No empty #root in ${file}`);
  const markup = await render(route);
  writeFileSync(file, inlineCss(template).replace('<div id="root"></div>', `<div id="root" data-route="${route}">${markup}</div>`));
  console.log(`prerendered ${route.padEnd(14)} ${(markup.length / 1024).toFixed(1)} kB`);
}

rmSync(ssrDir, { recursive: true, force: true });
