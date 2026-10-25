import { PSEO_PAGES } from './pseoPages';
import { LEGAL_PAGES } from './legalPages';
import { SupportedLocale } from '../i18n/types';

export const BASE_PRODUCTION_DOMAIN = 'https://getvidx.com';

const LOCALES: SupportedLocale[] = ['en', 'es', 'fr', 'pt', 'ar'];

export interface SitemapEntry {
  loc: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
  alternates: { lang: string; href: string }[];
}

/**
 * Compiles all genuine, indexable URLs across all 5 languages
 * (Omit stale hardcoded lastmod to comply with search engine guidelines)
 */
export function generateAllSitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];

  // 1. Homepage & Language Homepages
  LOCALES.forEach((locale) => {
    const loc = locale === 'en' ? `${BASE_PRODUCTION_DOMAIN}/` : `${BASE_PRODUCTION_DOMAIN}/${locale}`;
    const alternates: Array<{ lang: string; href: string }> = LOCALES.map((l) => ({
      lang: l,
      href: l === 'en' ? `${BASE_PRODUCTION_DOMAIN}/` : `${BASE_PRODUCTION_DOMAIN}/${l}`,
    }));
    alternates.push({ lang: 'x-default', href: `${BASE_PRODUCTION_DOMAIN}/` });

    entries.push({
      loc,
      changefreq: 'daily',
      priority: locale === 'en' ? '1.0' : '0.9',
      alternates,
    });
  });

  // 2. Programmatic SEO Landing Pages
  PSEO_PAGES.forEach((page) => {
    LOCALES.forEach((locale) => {
      const path = locale === 'en' ? `/${page.slug}` : `/${locale}/${page.slug}`;
      const loc = `${BASE_PRODUCTION_DOMAIN}${path}`;

      const alternates: Array<{ lang: string; href: string }> = LOCALES.map((l) => ({
        lang: l,
        href: l === 'en' ? `${BASE_PRODUCTION_DOMAIN}/${page.slug}` : `${BASE_PRODUCTION_DOMAIN}/${l}/${page.slug}`,
      }));
      alternates.push({ lang: 'x-default', href: `${BASE_PRODUCTION_DOMAIN}/${page.slug}` });

      entries.push({
        loc,
        changefreq: 'weekly',
        priority: '0.8',
        alternates,
      });
    });
  });

  // 3. Legal and informational pages
  Object.values(LEGAL_PAGES).forEach((legal) => {
    LOCALES.forEach((locale) => {
      const path = locale === 'en' ? `/${legal.slug}` : `/${locale}/${legal.slug}`;
      const loc = `${BASE_PRODUCTION_DOMAIN}${path}`;

      const alternates: Array<{ lang: string; href: string }> = LOCALES.map((l) => ({
        lang: l,
        href: l === 'en' ? `${BASE_PRODUCTION_DOMAIN}/${legal.slug}` : `${BASE_PRODUCTION_DOMAIN}/${l}/${legal.slug}`,
      }));
      alternates.push({ lang: 'x-default', href: `${BASE_PRODUCTION_DOMAIN}/${legal.slug}` });

      entries.push({
        loc,
        changefreq: 'monthly',
        priority: '0.5',
        alternates,
      });
    });
  });

  return entries;
}

/**
 * Generates the child sitemap XML string (e.g. /sitemap_1.xml)
 */
export function buildChildSitemapXml(): string {
  const entries = generateAllSitemapEntries();

  const xmlEntries = entries
    .map((e) => {
      const alternateTags = e.alternates
        .map(
          (alt) => `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />`
        )
        .join('\n');

      return `  <url>
    <loc>${e.loc}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
${alternateTags}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlEntries}
</urlset>`;
}

/**
 * Generates the primary sitemap index XML string (/sitemap.xml)
 */
export function buildSitemapIndexXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_PRODUCTION_DOMAIN}/sitemap_1.xml</loc>
  </sitemap>
</sitemapindex>`;
}

/**
 * Generates standard robots.txt content
 */
export function buildRobotsTxt(): string {
  return `# Robots.txt for GetVidX
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

# Sitemap index
Sitemap: ${BASE_PRODUCTION_DOMAIN}/sitemap.xml
`;
}
