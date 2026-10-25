import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroDownloader } from './components/HeroDownloader';
import { DownloadResult } from './components/DownloadResult';
import { HowItWorks } from './components/HowItWorks';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FaqSection } from './components/FaqSection';
import { SponsoredAdSlot } from './components/SponsoredAdSlot';
import { PseoPageTemplate } from './components/PseoPageTemplate';
import { LegalPageTemplate } from './components/LegalPageTemplate';
import { Footer } from './components/Footer';

import { SupportedLocale, LOCALES } from './i18n/types';
import { TRANSLATIONS } from './i18n/translations';
import { PSEO_PAGES } from './data/pseoPages';
import { LEGAL_PAGES } from './data/legalPages';
import { FAQS_BY_LOCALE } from './data/faqs';
import { detectDirectReplacementPath } from './utils/twitterUrl';
import { analyzeTweet, TweetAnalysisResult } from './utils/downloader';
import {
  updateDocumentSeo,
  buildWebApplicationSchema,
  buildFaqSchema,
  buildHowToSchema,
} from './utils/seo';

export default function App() {
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>('en');
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');

  // Downloader state
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<TweetAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'audio' | 'gif' | 'live'>('all');

  // Detect locale from URL path e.g. /ar/..., /es/..., /fr/..., /pt/...
  const parseLocaleAndPath = useCallback((pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    let detectedLocale: SupportedLocale = 'en';
    let subPath = pathname;

    if (segments.length > 0 && ['en', 'es', 'fr', 'pt', 'ar'].includes(segments[0])) {
      detectedLocale = segments[0] as SupportedLocale;
      subPath = '/' + segments.slice(1).join('/');
      if (subPath === '') subPath = '/';
    }

    return { detectedLocale, subPath };
  }, []);

  // Handle URL change
  const handleNavigate = useCallback(
    (targetPath: string) => {
      // Build localized path
      let fullPath = targetPath;
      if (currentLocale !== 'en') {
        const cleanTarget = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
        fullPath = `/${currentLocale}${cleanTarget === '/' ? '' : cleanTarget}`;
      }

      window.history.pushState({}, '', fullPath);
      setCurrentPath(targetPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [currentLocale]
  );

  // Switch language
  const handleSelectLocale = useCallback(
    (newLocale: SupportedLocale) => {
      setCurrentLocale(newLocale);
      const cleanPath = currentPath.replace(/^\/(en|es|fr|pt|ar)(\/|$)/, '/');
      const newFullPath =
        newLocale === 'en'
          ? cleanPath
          : `/${newLocale}${cleanPath === '/' ? '' : cleanPath}`;
      window.history.pushState({}, '', newFullPath);
    },
    [currentPath]
  );

  // Analyze Tweet Handler
  const handleAnalyze = useCallback(
    async (urlToAnalyze: string) => {
      setIsAnalyzing(true);
      setErrorMessage(null);
      setAnalysisResult(null);

      const t = TRANSLATIONS[currentLocale];
      const response = await analyzeTweet(urlToAnalyze);

      setIsAnalyzing(false);
      if (response.success && response.result) {
        setAnalysisResult(response.result);
        setTimeout(() => {
          document.getElementById('download-results')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        // Map localized error message
        let msg = t.errorGeneric;
        if (response.errorCode === 'EMPTY_URL') msg = t.errorEmptyUrl;
        else if (response.errorCode === 'INVALID_DOMAIN') msg = t.errorInvalidDomain;
        else if (response.errorCode === 'INVALID_ID') msg = t.errorInvalidPostId;
        else if (response.errorCode === 'NO_VIDEO') msg = t.errorNoVideoFound;
        else if (response.errorCode === 'PRIVATE') msg = t.errorPrivatePost;
        else if (response.errorCode === 'NETWORK') msg = t.errorNetwork;

        setErrorMessage(msg);
      }
    },
    [currentLocale]
  );

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const onPopState = () => {
      const { detectedLocale, subPath } = parseLocaleAndPath(window.location.pathname);
      setCurrentLocale(detectedLocale);
      setCurrentPath(subPath);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [parseLocaleAndPath]);

  // Initial load: parse path, check direct replacement trick
  useEffect(() => {
    const rawPath = window.location.pathname;
    const { detectedLocale, subPath } = parseLocaleAndPath(rawPath);
    setCurrentLocale(detectedLocale);
    setCurrentPath(subPath);

    // Direct replacement feature: user navigated to e.g. /username/status/123456789
    const directCheck = detectDirectReplacementPath(rawPath);
    if (directCheck.isDirect && directCheck.normalizedUrl) {
      setInputUrl(directCheck.normalizedUrl);
      handleAnalyze(directCheck.normalizedUrl);
    }
  }, [parseLocaleAndPath, handleAnalyze]);

  // Update HTML dir, lang and SEO tags on state changes
  useEffect(() => {
    const activeLocaleConfig = LOCALES[currentLocale] || LOCALES.en;
    document.documentElement.lang = activeLocaleConfig.code;
    document.documentElement.dir = activeLocaleConfig.direction;

    // Check if on a pSEO page
    const cleanSlug = currentPath.replace(/^\//, '');
    const pseoMatch = PSEO_PAGES.find((p) => p.slug === cleanSlug);
    const legalMatch = LEGAL_PAGES[cleanSlug];

    if (pseoMatch) {
      const title = pseoMatch.title[currentLocale] || pseoMatch.title.en;
      const desc = pseoMatch.metaDescription[currentLocale] || pseoMatch.metaDescription.en;
      const steps = pseoMatch.steps[currentLocale] || pseoMatch.steps.en;

      updateDocumentSeo({
        locale: currentLocale,
        title,
        description: desc,
        pathname: currentPath,
        type: 'article',
        jsonLd: [
          buildWebApplicationSchema(currentLocale),
          buildHowToSchema(pseoMatch.h1[currentLocale], desc, steps),
        ],
      });
    } else if (legalMatch) {
      const title = legalMatch.title[currentLocale] || legalMatch.title.en;
      const desc = `${legalMatch.h1[currentLocale]} for GetVidX - Online Twitter Video Downloader.`;

      updateDocumentSeo({
        locale: currentLocale,
        title,
        description: desc,
        pathname: currentPath,
        type: 'website',
        jsonLd: buildWebApplicationSchema(currentLocale),
      });
    } else {
      // Default Homepage Metadata
      const homepageTitles: Record<SupportedLocale, string> = {
        en: 'Twitter Video Downloader - Save X Videos & MP4 in HD - GetVidX',
        es: 'Descargar Vídeos de Twitter (X) - Guardar MP4 en HD - GetVidX',
        fr: 'Télécharger des vidéos Twitter (X) - Enregistrer MP4 en HD - GetVidX',
        pt: 'Baixar Vídeos do Twitter (X) - Salvar MP4 em HD - GetVidX',
        ar: 'تحميل فيديو تويتر (X) - تنزيل وحفظ مقاطع MP4 بدقة عالية - GetVidX',
      };
      const homepageDescriptions: Record<SupportedLocale, string> = {
        en: 'Download supported Twitter (X) videos online with GetVidX. Paste a public post link to check available video formats and save supported media.',
        es: 'Usa GetVidX para comprobar los formatos disponibles y descargar vídeos compatibles de publicaciones públicas de Twitter (X).',
        fr: 'Utilisez GetVidX pour vérifier les formats disponibles et télécharger les vidéos compatibles des publications publiques de Twitter (X).',
        pt: 'Use o GetVidX para verificar os formatos disponíveis e baixar vídeos compatíveis de publicações públicas do Twitter (X).',
        ar: 'استخدم GetVidX للتحقق من صيغ الفيديو المتاحة وتنزيل الفيديوهات المتوافقة من منشورات تويتر (X) العامة بدقة 1080p مجاناً.',
      };

      const title = homepageTitles[currentLocale] || homepageTitles.en;
      const description = homepageDescriptions[currentLocale] || homepageDescriptions.en;
      const faqs = FAQS_BY_LOCALE[currentLocale] || FAQS_BY_LOCALE.en;

      updateDocumentSeo({
        locale: currentLocale,
        title,
        description,
        pathname: currentPath,
        type: 'website',
        jsonLd: [buildWebApplicationSchema(currentLocale), buildFaqSchema(faqs)],
      });
    }
  }, [currentLocale, currentPath]);

  // Determine current active page view
  const cleanSlug = currentPath.replace(/^\//, '');
  const activePseoPage = PSEO_PAGES.find((p) => p.slug === cleanSlug);
  const activeLegalPage = LEGAL_PAGES[cleanSlug];
  const t = TRANSLATIONS[currentLocale];

  return (
    <div
      className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900"
      style={{ fontFamily: LOCALES[currentLocale]?.fontFamily }}
    >
      {/* 3-Zone Header Contract */}
      <Header
        currentLocale={currentLocale}
        onSelectLocale={handleSelectLocale}
        onNavigate={handleNavigate}
        onSelectLive={() => {
          setActiveTab('live');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePseoPage ? (
          /* Programmatic SEO Landing Page */
          <PseoPageTemplate
            page={activePseoPage}
            currentLocale={currentLocale}
            onNavigate={handleNavigate}
            renderDownloader={() => (
              <>
                <HeroDownloader
                  currentLocale={currentLocale}
                  inputUrl={inputUrl}
                  setInputUrl={setInputUrl}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  errorMessage={errorMessage}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                {analysisResult && (
                  <DownloadResult
                    currentLocale={currentLocale}
                    result={analysisResult}
                    onReset={() => {
                      setAnalysisResult(null);
                      setInputUrl('');
                    }}
                    activeFilter={activeTab}
                  />
                )}
              </>
            )}
          />
        ) : activeLegalPage ? (
          /* Legal / Trust Page */
          <LegalPageTemplate
            page={activeLegalPage}
            currentLocale={currentLocale}
            onNavigate={handleNavigate}
          />
        ) : (
          /* Standard Homepage Layout Matching Exact Design */
          <>
            {/* Header Display Reserved Ad Space (Strictly decoupled) */}
            <SponsoredAdSlot label={t.adLabelHeader} notice={t.adNotice} />

            {/* Hero Downloader Box */}
            <HeroDownloader
              currentLocale={currentLocale}
              inputUrl={inputUrl}
              setInputUrl={setInputUrl}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              errorMessage={errorMessage}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* Live Media Download Results */}
            {analysisResult && (
              <DownloadResult
                currentLocale={currentLocale}
                result={analysisResult}
                onReset={() => {
                  setAnalysisResult(null);
                  setInputUrl('');
                }}
                activeFilter={activeTab}
              />
            )}

            {/* Under-Result Reserved Ad Space (Strictly decoupled) */}
            <SponsoredAdSlot label={t.adLabelResult} notice={t.adNotice} />

            {/* 3-Step How It Works Section */}
            <HowItWorks currentLocale={currentLocale} />

            {/* 6 Feature Cards Why Choose Us Section */}
            <WhyChooseUs currentLocale={currentLocale} />

            {/* FAQ Accordion Section */}
            <FaqSection currentLocale={currentLocale} />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        currentLocale={currentLocale}
        onSelectLocale={handleSelectLocale}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
