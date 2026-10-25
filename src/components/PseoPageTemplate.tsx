import React from 'react';
import { CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { PseoPageData } from '../data/pseoPages';
import { SupportedLocale } from '../i18n/types';

interface PseoPageTemplateProps {
  page: PseoPageData;
  currentLocale: SupportedLocale;
  onNavigate: (route: string) => void;
  renderDownloader: () => React.ReactNode;
}

const PSEO_UI_STRINGS: Record<SupportedLocale, {
  onlineDownloader: string;
  pasteTitle: string;
  coreFeatures: string;
  relatedGuides: string;
}> = {
  en: {
    onlineDownloader: 'Online Downloader',
    pasteTitle: 'Paste your Twitter / X link to download',
    coreFeatures: 'Core Capabilities & Features',
    relatedGuides: 'Related Guides & Converters',
  },
  es: {
    onlineDownloader: 'Descargador Online',
    pasteTitle: 'Pega tu enlace de Twitter / X para descargar',
    coreFeatures: 'Capacidades y Características Principales',
    relatedGuides: 'Guías y Conversores Relacionados',
  },
  fr: {
    onlineDownloader: 'Téléchargeur en Ligne',
    pasteTitle: 'Collez votre lien Twitter / X pour télécharger',
    coreFeatures: 'Fonctionnalités et Capacités Principales',
    relatedGuides: 'Guides et Convertisseurs Associés',
  },
  pt: {
    onlineDownloader: 'Baixador Online',
    pasteTitle: 'Cole seu link do Twitter / X para baixar',
    coreFeatures: 'Recursos e Capacidades Principais',
    relatedGuides: 'Guias e Conversores Relacionados',
  },
  ar: {
    onlineDownloader: 'أداة التحميل المباشر',
    pasteTitle: 'الصق رابط تغريدة تويتر / X للتحميل الفوري',
    coreFeatures: 'أبرز الإمكانيات والمميزات التقنية',
    relatedGuides: 'أدلة ومحولات ذات صلة',
  },
};

export const PseoPageTemplate: React.FC<PseoPageTemplateProps> = ({
  page,
  currentLocale,
  onNavigate,
  renderDownloader,
}) => {
  const ui = PSEO_UI_STRINGS[currentLocale] || PSEO_UI_STRINGS.en;
  const h1 = page.h1[currentLocale] || page.h1.en;
  const intro = page.intro[currentLocale] || page.intro.en;
  const keyPoints = page.keyPoints[currentLocale] || page.keyPoints.en;
  const stepsTitle = page.stepsTitle[currentLocale] || page.stepsTitle.en;
  const steps = page.steps[currentLocale] || page.steps.en;
  const technicalNotes = page.technicalNotes[currentLocale] || page.technicalNotes.en;

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => onNavigate('/')}
          className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium cursor-pointer"
        >
          <span>GetVidX</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{h1}</span>
      </nav>

      {/* Main Editorial Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          {h1}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          {intro}
        </p>
      </div>

      {/* Integrated Downloader Container */}
      <div className="my-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-blue-50/50 to-white border border-blue-100 shadow-sm">
        <div className="text-center mb-6">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100/70 px-2.5 py-1 rounded-md">
            {ui.onlineDownloader}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
            {ui.pasteTitle}
          </h2>
        </div>
        {renderDownloader()}
      </div>

      {/* Key Architectural & Functional Advantages */}
      <div className="my-10">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <span>{ui.coreFeatures}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {keyPoints.map((point, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="my-10">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6">
          {stepsTitle}
        </h2>
        <div className="space-y-4">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-4"
            >
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0 font-mono">
                {idx + 1}
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                  {st.step}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {st.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Notes Callout */}
      {technicalNotes && (
        <div className="my-8 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {technicalNotes}
          </p>
        </div>
      )}

      {/* Related pSEO Articles & Crosslinks */}
      {page.relatedSlugs && page.relatedSlugs.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            {ui.relatedGuides}
          </h3>
          <div className="flex flex-wrap gap-2">
            {page.relatedSlugs.map((slug) => (
              <button
                key={slug}
                onClick={() => onNavigate(`/${slug}`)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 shadow-xs transition-colors cursor-pointer"
              >
                {slug.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
