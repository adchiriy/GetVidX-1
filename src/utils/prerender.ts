import { PSEO_PAGES, PseoPageData } from '../data/pseoPages';
import { LEGAL_PAGES, LegalPageContent } from '../data/legalPages';
import { FAQS_BY_LOCALE } from '../data/faqs';
import { SupportedLocale, LOCALES, LocaleConfig } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';
import { CANONICAL_DOMAIN } from './seo';

export interface RenderResult {
  status: number;
  html: string;
}

const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'es', 'fr', 'pt', 'ar'];

const HOMEPAGE_TITLES: Record<SupportedLocale, string> = {
  en: 'Twitter Video Downloader - Save X Videos & MP4 in HD - GetVidX',
  es: 'Descargar Vídeos de Twitter (X) - Guardar MP4 en HD - GetVidX',
  fr: 'Télécharger des vidéos Twitter (X) - Enregistrer MP4 en HD - GetVidX',
  pt: 'Baixar Vídeos do Twitter (X) - Salvar MP4 em HD - GetVidX',
  ar: 'تحميل فيديو تويتر (X) - تنزيل وحفظ مقاطع MP4 بدقة عالية - GetVidX',
};

const HOMEPAGE_DESCRIPTIONS: Record<SupportedLocale, string> = {
  en: 'Check available formats and download supported videos from public Twitter and X posts with GetVidX. Available quality and formats depend on the source media.',
  es: 'Comprueba los formatos disponibles y descarga vídeos compatibles de publicaciones públicas de Twitter y X con GetVidX. Las calidades dependen del medio original.',
  fr: 'Vérifiez les formats disponibles et téléchargez les vidéos compatibles des publications publiques Twitter et X avec GetVidX. La qualité dépend du média d’origine.',
  pt: 'Verifique os formatos disponíveis e baixe vídeos compatíveis de publicações públicas do Twitter e X com o GetVidX. A qualidade depende da mídia de origem.',
  ar: 'تحقق من الصيغ المتاحة ونزّل مقاطع الفيديو المتوافقة من منشورات تويتر و X العامة باستخدام GetVidX. تعتمد الدقة والصيغ على الفيديو الأصلي.',
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Resolves requested path into locale and route target
 */
export function resolveRoute(rawPath: string): {
  locale: SupportedLocale;
  subPath: string;
  cleanSlug: string;
  pageType: 'home' | 'pseo' | 'legal' | 'direct' | 'not_found';
  pseoPage?: PseoPageData;
  legalPage?: LegalPageContent;
} {
  const pathname = rawPath.split('?')[0].split('#')[0] || '/';
  const segments = pathname.split('/').filter(Boolean);

  let locale: SupportedLocale = 'en';
  let subSegments = segments;

  if (segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0] as SupportedLocale)) {
    locale = segments[0] as SupportedLocale;
    subSegments = segments.slice(1);
  }

  const cleanSlug = subSegments.join('/');
  const subPath = cleanSlug ? `/${cleanSlug}` : '/';

  // 1. Homepage
  if (cleanSlug === '') {
    return { locale, subPath, cleanSlug, pageType: 'home' };
  }

  // 2. Programmatic SEO Page
  const pseoMatch = PSEO_PAGES.find((p) => p.slug === cleanSlug);
  if (pseoMatch) {
    return { locale, subPath, cleanSlug, pageType: 'pseo', pseoPage: pseoMatch };
  }

  // 3. Legal Page
  const legalMatch = LEGAL_PAGES[cleanSlug];
  if (legalMatch) {
    return { locale, subPath, cleanSlug, pageType: 'legal', legalPage: legalMatch };
  }

  // 4. Twitter Direct Post check (/username/status/123456789)
  if (subSegments.length === 3 && subSegments[1] === 'status' && /^\d+$/.test(subSegments[2])) {
    return { locale, subPath, cleanSlug, pageType: 'direct' };
  }

  // 5. Unknown route
  return { locale, subPath, cleanSlug, pageType: 'not_found' };
}

/**
 * Builds localized hreflang tags for given clean path
 */
function buildHreflangTags(cleanSlug: string): string {
  const cleanPath = cleanSlug ? `/${cleanSlug}` : '';
  const lines: string[] = [];

  for (const lang of SUPPORTED_LOCALES) {
    const locHref = lang === 'en' ? `${CANONICAL_DOMAIN}${cleanPath || '/'}` : `${CANONICAL_DOMAIN}/${lang}${cleanPath}`;
    lines.push(`    <link rel="alternate" hreflang="${lang}" href="${locHref}" />`);
  }
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${CANONICAL_DOMAIN}${cleanPath || '/'}" />`);
  return lines.join('\n');
}

/**
 * Builds semantic HTML shell for server-side prerendering
 */
function buildSemanticBody(
  route: ReturnType<typeof resolveRoute>,
  localeConfig: LocaleConfig
): string {
  const { locale, pageType, pseoPage, legalPage, cleanSlug } = route;
  const t = TRANSLATIONS[locale];
  const homeHref = locale === 'en' ? '/' : `/${locale}`;

  // 404 Shell
  if (pageType === 'not_found') {
    return `
      <div class="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 px-4 py-16 text-center">
        <div class="max-w-md mx-auto">
          <span class="text-6xl font-extrabold text-blue-600 block mb-4">404</span>
          <h1 class="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
          <p class="text-slate-600 mb-6 text-sm">The page you requested could not be found or has been moved.</p>
          <a href="${homeHref}" class="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors">
            Return to Homepage
          </a>
        </div>
      </div>
    `;
  }

  // Shared Header
  const headerHtml = `
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <a href="${homeHref}" class="flex items-center gap-2.5 font-bold text-xl text-slate-900">
          <span class="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-base">⬇</span>
          <span>GetVidX</span>
        </a>
        <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="${homeHref}" class="hover:text-blue-600 transition-colors">${escapeHtml(t.navDownloader)}</a>
          <a href="${locale === 'en' ? '/twitter-to-mp3' : `/${locale}/twitter-to-mp3`}" class="hover:text-blue-600 transition-colors">${escapeHtml(t.navMp3)}</a>
          <a href="${locale === 'en' ? '/twitter-gif-downloader' : `/${locale}/twitter-gif-downloader`}" class="hover:text-blue-600 transition-colors">${escapeHtml(t.navGif)}</a>
          <a href="${locale === 'en' ? '/twitter-video-download-hd' : `/${locale}/twitter-video-download-hd`}" class="hover:text-blue-600 transition-colors">HD Video</a>
        </nav>
      </div>
    </header>
  `;

  // Shared Footer
  const footerHtml = `
    <footer class="bg-slate-50 border-t border-slate-200/80 py-12 text-slate-600 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <span class="text-base font-bold text-slate-900 block mb-2">GetVidX</span>
            <p class="text-slate-500 leading-relaxed">${escapeHtml(t.heroSubtitle)}</p>
          </div>
          <div>
            <span class="font-bold text-slate-900 block mb-3 uppercase tracking-wider">${escapeHtml(t.footerConverters)}</span>
            <ul class="space-y-2">
              <li><a href="${homeHref}" class="hover:text-blue-600">${escapeHtml(t.navDownloader)}</a></li>
              <li><a href="${locale === 'en' ? '/twitter-to-mp3' : `/${locale}/twitter-to-mp3`}" class="hover:text-blue-600">${escapeHtml(t.navMp3)}</a></li>
              <li><a href="${locale === 'en' ? '/twitter-gif-downloader' : `/${locale}/twitter-gif-downloader`}" class="hover:text-blue-600">${escapeHtml(t.navGif)}</a></li>
              <li><a href="${locale === 'en' ? '/twitter-video-download-hd' : `/${locale}/twitter-video-download-hd`}" class="hover:text-blue-600">Twitter Video HD</a></li>
            </ul>
          </div>
          <div>
            <span class="font-bold text-slate-900 block mb-3 uppercase tracking-wider">${escapeHtml(t.footerLegal)}</span>
            <ul class="space-y-2">
              <li><a href="${locale === 'en' ? '/terms' : `/${locale}/terms`}" class="hover:text-blue-600">${escapeHtml(t.terms)}</a></li>
              <li><a href="${locale === 'en' ? '/privacy' : `/${locale}/privacy`}" class="hover:text-blue-600">${escapeHtml(t.privacy)}</a></li>
              <li><a href="${locale === 'en' ? '/dmca' : `/${locale}/dmca`}" class="hover:text-blue-600">${escapeHtml(t.dmca)}</a></li>
              <li><a href="${locale === 'en' ? '/about' : `/${locale}/about`}" class="hover:text-blue-600">${escapeHtml(t.about)}</a></li>
              <li><a href="${locale === 'en' ? '/contact' : `/${locale}/contact`}" class="hover:text-blue-600">${escapeHtml(t.contact)}</a></li>
            </ul>
          </div>
          <div>
            <span class="font-bold text-slate-900 block mb-3 uppercase tracking-wider">${escapeHtml(t.footerLanguages)}</span>
            <div class="flex flex-wrap gap-1.5">
              ${SUPPORTED_LOCALES.map(
                (l) => `<a href="${l === 'en' ? (cleanSlug ? `/${cleanSlug}` : '/') : `/${l}${cleanSlug ? `/${cleanSlug}` : ''}`}" class="px-2 py-1 rounded border border-slate-200 hover:bg-white ${l === locale ? 'bg-blue-600 text-white font-bold' : ''}">${LOCALES[l].nativeName}</a>`
              ).join('')}
            </div>
          </div>
        </div>
        <div class="pt-6 border-t border-slate-200 text-slate-400 text-center sm:text-left rtl:sm:text-right">
          <p>${escapeHtml(t.disclaimer)}</p>
          <p class="mt-2">${escapeHtml(t.copyright)}</p>
        </div>
      </div>
    </footer>
  `;

  // 1. Homepage Shell
  if (pageType === 'home' || pageType === 'direct') {
    const faqs = FAQS_BY_LOCALE[locale] || FAQS_BY_LOCALE.en;
    return `
      <div class="min-h-screen flex flex-col bg-white text-slate-900">
        ${headerHtml}
        <main class="flex-1">
          <section class="max-w-4xl mx-auto px-4 pt-12 pb-16 text-center">
            <span class="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-100">
              ${escapeHtml(t.badgeText)}
            </span>
            <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 text-balance">
              ${escapeHtml(t.heroTitlePrefix)} <span class="text-blue-600">${escapeHtml(t.heroTitleHighlight)}</span>
            </h1>
            <p class="text-base text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              ${escapeHtml(t.heroSubtitle)}
            </p>
            <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 max-w-2xl mx-auto text-left rtl:text-right">
              <span class="text-xs text-slate-500 font-semibold block mb-2">${escapeHtml(t.inputPlaceholder)}</span>
              <div class="h-12 bg-white rounded-xl border border-slate-300 flex items-center px-4 text-slate-400 text-sm">
                https://x.com/username/status/...
              </div>
            </div>
          </section>

          <section id="how-it-works" class="py-12 bg-slate-50 border-t border-b border-slate-100">
            <div class="max-w-4xl mx-auto px-4">
              <h2 class="text-2xl font-bold text-center text-slate-900 mb-8">${escapeHtml(t.howTitle)}</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="p-5 bg-white rounded-xl border border-slate-200/80">
                  <span class="text-blue-600 font-bold text-lg block mb-2">01. ${escapeHtml(t.step1Title)}</span>
                  <p class="text-slate-600 text-sm leading-relaxed">${escapeHtml(t.step1Desc)}</p>
                </div>
                <div class="p-5 bg-white rounded-xl border border-slate-200/80">
                  <span class="text-blue-600 font-bold text-lg block mb-2">02. ${escapeHtml(t.step2Title)}</span>
                  <p class="text-slate-600 text-sm leading-relaxed">${escapeHtml(t.step2Desc)}</p>
                </div>
                <div class="p-5 bg-white rounded-xl border border-slate-200/80">
                  <span class="text-blue-600 font-bold text-lg block mb-2">03. ${escapeHtml(t.step3Title)}</span>
                  <p class="text-slate-600 text-sm leading-relaxed">${escapeHtml(t.step3Desc)}</p>
                </div>
              </div>
            </div>
          </section>

          <section id="faq" class="py-12 max-w-4xl mx-auto px-4">
            <h2 class="text-2xl font-bold text-center text-slate-900 mb-8">${escapeHtml(t.faqTitle)}</h2>
            <div class="space-y-4">
              ${faqs.map(
                (f) => `
                <div class="p-5 bg-white rounded-xl border border-slate-200">
                  <h3 class="text-base font-bold text-slate-900 mb-2">${escapeHtml(f.question)}</h3>
                  <p class="text-slate-600 text-sm leading-relaxed">${escapeHtml(f.answer)}</p>
                </div>
              `
              ).join('')}
            </div>
          </section>
        </main>
        ${footerHtml}
      </div>
    `;
  }

  // 2. pSEO Page Shell
  if (pageType === 'pseo' && pseoPage) {
    const h1 = pseoPage.h1[locale] || pseoPage.h1.en;
    const intro = pseoPage.intro[locale] || pseoPage.intro.en;
    const keyPoints = pseoPage.keyPoints[locale] || pseoPage.keyPoints.en;
    const stepsTitle = pseoPage.stepsTitle[locale] || pseoPage.stepsTitle.en;
    const steps = pseoPage.steps[locale] || pseoPage.steps.en;
    const technicalNotes = pseoPage.technicalNotes[locale] || pseoPage.technicalNotes.en;

    return `
      <div class="min-h-screen flex flex-col bg-white text-slate-900">
        ${headerHtml}
        <main class="flex-1 py-10 max-w-4xl mx-auto px-4">
          <nav aria-label="Breadcrumb" class="mb-6 flex items-center gap-2 text-xs text-slate-500">
            <a href="${homeHref}" class="hover:text-blue-600 font-medium">GetVidX</a>
            <span>›</span>
            <span class="text-slate-900 font-semibold">${escapeHtml(h1)}</span>
          </nav>

          <article>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">${escapeHtml(h1)}</h1>
            <p class="text-base text-slate-600 leading-relaxed mb-8">${escapeHtml(intro)}</p>

            <div class="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <h2 class="text-lg font-bold text-slate-900 mb-4">${escapeHtml(t.whyTitle)}</h2>
              <ul class="space-y-2.5 text-sm text-slate-700">
                ${keyPoints.map((kp) => `<li class="flex items-start gap-2"><span>✔</span><span>${escapeHtml(kp)}</span></li>`).join('')}
              </ul>
            </div>

            <div class="mb-10">
              <h2 class="text-xl font-bold text-slate-900 mb-6">${escapeHtml(stepsTitle)}</h2>
              <div class="space-y-4">
                ${steps.map(
                  (s, idx) => `
                  <div class="p-5 bg-white rounded-xl border border-slate-200 flex gap-4">
                    <span class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-sm">${idx + 1}</span>
                    <div>
                      <h3 class="font-bold text-slate-900 text-sm sm:text-base mb-1">${escapeHtml(s.step)}</h3>
                      <p class="text-slate-600 text-xs sm:text-sm leading-relaxed">${escapeHtml(s.detail)}</p>
                    </div>
                  </div>
                `
                ).join('')}
              </div>
            </div>

            ${
              technicalNotes
                ? `<div class="p-5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-blue-900 text-xs sm:text-sm mb-10 leading-relaxed">
                     <strong>Technical Note:</strong> ${escapeHtml(technicalNotes)}
                   </div>`
                : ''
            }

            ${
              pseoPage.relatedSlugs && pseoPage.relatedSlugs.length > 0
                ? `<div class="pt-8 border-t border-slate-200">
                     <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Related Guides</h3>
                     <div class="flex flex-wrap gap-2">
                       ${pseoPage.relatedSlugs
                         .map(
                           (slug) => `
                         <a href="${locale === 'en' ? `/${slug}` : `/${locale}/${slug}`}" class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 shadow-xs transition-colors">
                           ${escapeHtml(slug.replace(/-/g, ' '))}
                         </a>
                       `
                         )
                         .join('')}
                     </div>
                   </div>`
                : ''
            }
          </article>
        </main>
        ${footerHtml}
      </div>
    `;
  }

  // 3. Legal Page Shell
  if (pageType === 'legal' && legalPage) {
    const h1 = legalPage.h1[locale] || legalPage.h1.en;
    const sections = legalPage.sections.map((sec) => ({
      heading: sec.heading[locale] || sec.heading.en,
      paragraphs: sec.paragraphs[locale] || sec.paragraphs.en,
    }));

    return `
      <div class="min-h-screen flex flex-col bg-white text-slate-900">
        ${headerHtml}
        <main class="flex-1 py-10 max-w-4xl mx-auto px-4">
          <nav aria-label="Breadcrumb" class="mb-6 flex items-center gap-2 text-xs text-slate-500">
            <a href="${homeHref}" class="hover:text-blue-600 font-medium">GetVidX</a>
            <span>›</span>
            <span class="text-slate-900 font-semibold">${escapeHtml(h1)}</span>
          </nav>
          <article>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">${escapeHtml(h1)}</h1>
            <div class="space-y-6 text-sm text-slate-700 leading-relaxed">
              ${sections
                .map(
                  (sec) => `
                <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <h2 class="text-lg font-bold text-slate-900 mb-2">${escapeHtml(sec.heading)}</h2>
                  ${sec.paragraphs.map((p) => `<p class="text-slate-600 mb-2">${escapeHtml(p)}</p>`).join('')}
                </div>
              `
                )
                .join('')}
            </div>
          </article>
        </main>
        ${footerHtml}
      </div>
    `;
  }

  return '';
}

/**
 * Prerenders complete HTML with accurate metadata and semantic body
 */
export function prerenderPage(rawPath: string, templateHtml: string): RenderResult {
  const route = resolveRoute(rawPath);
  const { locale, cleanSlug, pageType, pseoPage, legalPage } = route;
  const localeConfig = LOCALES[locale] || LOCALES.en;

  let title = HOMEPAGE_TITLES[locale] || HOMEPAGE_TITLES.en;
  let description = HOMEPAGE_DESCRIPTIONS[locale] || HOMEPAGE_DESCRIPTIONS.en;
  let canonicalPath = locale === 'en' ? (cleanSlug ? `/${cleanSlug}` : '/') : `/${locale}${cleanSlug ? `/${cleanSlug}` : ''}`;
  let canonicalUrl = `${CANONICAL_DOMAIN}${canonicalPath}`;
  let ogType = 'website';
  let robotsDirective = 'index, follow';

  let schemas: Array<Record<string, unknown>> = [
    {
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
    },
  ];

  if (pageType === 'pseo' && pseoPage) {
    title = pseoPage.title[locale] || pseoPage.title.en;
    description = pseoPage.metaDescription[locale] || pseoPage.metaDescription.en;
    ogType = 'article';

    const steps = pseoPage.steps[locale] || pseoPage.steps.en;
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: pseoPage.h1[locale] || pseoPage.h1.en,
      description,
      step: steps.map((s, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        name: s.step,
        text: s.detail,
      })),
    });
  } else if (pageType === 'legal' && legalPage) {
    title = legalPage.title[locale] || legalPage.title.en;
    description = `${legalPage.h1[locale] || legalPage.h1.en} for GetVidX - Online Twitter Video Downloader.`;
    ogType = 'website';
  } else if (pageType === 'home' || pageType === 'direct') {
    const faqs = FAQS_BY_LOCALE[locale] || FAQS_BY_LOCALE.en;
    schemas.push({
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
    });
  } else if (pageType === 'not_found') {
    title = '404 - Page Not Found | GetVidX';
    description = 'The requested page could not be found on GetVidX.';
    robotsDirective = 'noindex, nofollow';
  }

  const hreflangsHtml = pageType !== 'not_found' ? buildHreflangTags(cleanSlug) : '';
  const bodyHtml = buildSemanticBody(route, localeConfig);
  const jsonLdHtml = `<script id="getvidx-jsonld" type="application/ld+json">${JSON.stringify(schemas)}</script>`;

  let html = templateHtml;

  // 1. Update <html lang="..." dir="...">
  html = html.replace(/<html[^>]*>/, `<html lang="${localeConfig.code}" dir="${localeConfig.direction}">`);

  // 2. Replace <title>
  html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);

  // 3. Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // 4. Replace canonical URL
  html = html.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // 5. Replace Open Graph tags
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  html = html.replace(
    /<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:type" content="${ogType}" />`
  );

  // 6. Replace Twitter Card tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );

  // 7. Inject robots directive, hreflangs, and Schema JSON-LD before </head>
  const headAdditions = `
    <meta name="robots" content="${robotsDirective}" />
${hreflangsHtml}
    ${jsonLdHtml}
  `;
  html = html.replace('</head>', `${headAdditions}\n  </head>`);

  // 8. Inject prerendered semantic body inside <div id="root">
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);

  return {
    status: pageType === 'not_found' ? 404 : 200,
    html,
  };
}
