# Sanket Sathe — Portfolio

Senior Software Developer · Full Stack · Cloud & DevOps · Industrial Software

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · React Router · Three.js

## Run it locally

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install          # first time only
npm run dev          # http://localhost:5173  (auto-reloads on save)
```

Production build and preview:

```bash
npm run build        # type-check, build, pre-render every page → dist/
npm run preview      # http://localhost:4173
```

## Pages

| URL | What it is |
| --- | --- |
| `/` | Portfolio: work, demos, client websites, tech stack, about, contact |
| `/scada-demo/` | 3D Web SCADA live demo (separate app, source in `scada-demo/`) |
| `/chat-bot` | WhatsApp and website chat bot demos |
| `/ecommerce-demo` | Online store demo |
| `/mobile-app-demo` | Café order-management app demo |

All demos run in the browser on simulated data — no backend or database is needed.

## Where to edit content

| What | File |
| --- | --- |
| Name, email, phone, social links, work mode | `src/config/site.ts` |
| Case studies, demos, client websites, highlights, hobbies | `src/data/work.ts` |
| Tech stack (logo tiles) and the 9 hero tiles | `src/data/technologies.ts` |
| Page titles and descriptions (SEO) | `src/config/seo.ts` |
| Brand logos | `scripts/extract-icons.cjs` → run `npm run build:icons` |

## Deploying

Set the live URL in `.env` (copy `.env.example`) so canonical links, the sitemap and social previews point at the
right domain, then run `npm run build` and upload the contents of `dist/`:

- **Vercel / Netlify / Cloudflare Pages:** build command `npm run build`, output directory `dist`.
- **Shared hosting (cPanel):** upload `dist/` to `public_html`. `public/.htaccess` is included for clean URLs.
