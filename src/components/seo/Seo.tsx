import { Helmet } from 'react-helmet-async';
import { defaultDescription, defaultTitle, getRouteMeta, keywords } from '@/config/seo';
import { DEFAULT_SITE_URL } from '@/config/site';

export const siteUrl = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

interface SeoProps {
  /** Route path used for the canonical URL and to look up default metadata. */
  path: string;
  title?: string;
  description?: string;
  noindex?: boolean;
  /** Additional JSON-LD objects for this page. */
  jsonLd?: Record<string, unknown>[];
}

/**
 * Page metadata.
 *
 * Pre-rendered HTML already carries each route's head tags (written by the
 * build plugin in vite.config.ts). On boot, main.tsx removes those static tags
 * and Helmet manages the head from then on, so client-side navigation updates
 * the title, description, canonical and social tags without duplicates.
 */
export function Seo({ path, title, description, noindex = false, jsonLd = [] }: SeoProps) {
  const meta = getRouteMeta(path);
  const pageTitle = title ?? meta?.title ?? defaultTitle;
  const pageDescription = description ?? meta?.description ?? defaultDescription;
  const url = `${siteUrl}${path}`;
  const image = `${siteUrl}/og-image.jpg`;

  return (
    <>
      {!import.meta.env.SSR && (
        <Helmet prioritizeSeoTags>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <meta name="keywords" content={keywords} />
          <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
          {!noindex && <link rel="canonical" href={url} />}

          <meta property="og:type" content="website" />
          <meta property="og:url" content={url} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:image" content={image} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          <meta name="twitter:image" content={image} />
        </Helmet>
      )}

      {/* Rendered in the page body on both server and client, so it is present in the static HTML. */}
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}
    </>
  );
}

/** BreadcrumbList for inner pages. */
export const breadcrumb = (name: string, path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
    { '@type': 'ListItem', position: 2, name, item: `${siteUrl}${path}` },
  ],
});
