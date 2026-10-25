import { SupportedLocale, LOCALES } from '../i18n/types';

export const CANONICAL_DOMAIN = 'https://getvidx.com';

export interface SeoMetadataOptions {
  locale: SupportedLocale;
  title: string;
  description: string;
  pathname?: string;
  type?: 'website' | 'article';
  imageUrl?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Updates browser document metadata dynamically (title, description, og, twitter, canonical, hreflang, json-ld)
 */
export function updateDocumentSeo(options: SeoMetadataOptions): void {
  const { locale, title, description, pathname = '', type = 'website', imageUrl, jsonLd } = options;

  // 1. Title
  document.title = title;

  // 2. Meta description
  setMetaTag('description', description);

  // 3. OpenGraph
  setMetaTag('og:title', title, 'property');
  setMetaTag('og:description', description, 'property');
  setMetaTag('og:type', type, 'property');
  setMetaTag('og:site_name', 'GetVidX', 'property');
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const cleanPath = normalizedPath.replace(/^\/(en|es|fr|pt|ar)(\/|$)/, '/');
  const localizedPath = locale === 'en'
    ? cleanPath
    : `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
  const canonicalUrl = `${CANONICAL_DOMAIN}${localizedPath}`;
  setMetaTag('og:url', canonicalUrl, 'property');
  if (imageUrl) {
    setMetaTag('og:image', imageUrl, 'property');
  }

  // 4. Twitter Card
  setMetaTag('twitter:card', 'summary_large_image', 'name');
  setMetaTag('twitter:title', title, 'name');
  setMetaTag('twitter:description', description, 'name');
  if (imageUrl) {
    setMetaTag('twitter:image', imageUrl, 'name');
  }

  // 5. HTML lang & dir
  const currentLocaleConfig = LOCALES[locale] || LOCALES.en;
  document.documentElement.lang = currentLocaleConfig.code;
  document.documentElement.dir = currentLocaleConfig.direction;

  // 6. Canonical link tag
  updateCanonicalTag(canonicalUrl);

  // 7. Hreflang links
  updateHreflangTags(pathname);

  // 8. JSON-LD structured data
  if (jsonLd) {
    updateJsonLd(jsonLd);
  }
}

function setMetaTag(nameOrProperty: string, content: string, attributeType: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attributeType}="${nameOrProperty}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeType, nameOrProperty);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateCanonicalTag(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function updateHreflangTags(pathname: string) {
  // Remove existing hreflang tags
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());

  // Base slug without leading locale prefix
  const cleanPath = pathname.replace(/^\/(en|es|fr|pt|ar)(\/|$)/, '/');

  const supportedLocales: SupportedLocale[] = ['en', 'es', 'fr', 'pt', 'ar'];

  supportedLocales.forEach((lang) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', lang);
    const localizedPath = lang === 'en' ? cleanPath : `/${lang}${cleanPath === '/' ? '' : cleanPath}`;
    link.setAttribute('href', `${CANONICAL_DOMAIN}${localizedPath}`);
    document.head.appendChild(link);
  });

  // x-default points to English
  const xDefault = document.createElement('link');
  xDefault.setAttribute('rel', 'alternate');
  xDefault.setAttribute('hreflang', 'x-default');
  xDefault.setAttribute('href', `${CANONICAL_DOMAIN}${cleanPath}`);
  document.head.appendChild(xDefault);
}

function updateJsonLd(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  let script = document.getElementById('getvidx-jsonld') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'getvidx-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

/**
 * Builds standard WebApplication Schema for GetVidX
 */
export function buildWebApplicationSchema(locale: SupportedLocale): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'GetVidX - Twitter & X Video Downloader',
    url: CANONICAL_DOMAIN,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description:
      'Online tool to check available formats and download supported videos from public Twitter (X) posts. Available formats depend on the source media.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    inLanguage: locale,
  };
}

/**
 * Builds FAQPage Schema for rich Google search snippets
 */
export function buildFaqSchema(faqs: Array<{ question: string; answer: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Builds HowTo Schema for step-by-step guides
 */
export function buildHowToSchema(
  name: string,
  description: string,
  steps: Array<{ step: string; detail: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((s, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: s.step,
      text: s.detail,
    })),
  };
}
