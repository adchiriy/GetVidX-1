import React from 'react';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { LegalPageContent } from '../data/legalPages';
import { SupportedLocale } from '../i18n/types';

interface LegalPageTemplateProps {
  page: LegalPageContent;
  currentLocale: SupportedLocale;
  onNavigate: (route: string) => void;
}

export const LegalPageTemplate: React.FC<LegalPageTemplateProps> = ({
  page,
  currentLocale,
  onNavigate,
}) => {
  const h1 = page.h1[currentLocale] || page.h1.en;

  return (
    <div className="py-10 sm:py-16 max-w-3xl mx-auto px-4 sm:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => onNavigate('/')}
          className="hover:text-blue-600 transition-colors font-medium cursor-pointer"
        >
          GetVidX
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold">{h1}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Trust & Transparency</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {h1}
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          Last Updated: {page.lastUpdated} · Official Policy for GetVidX
        </p>
      </div>

      {/* Policy Sections */}
      <div className="space-y-8">
        {page.sections.map((sec, idx) => {
          const heading = sec.heading[currentLocale] || sec.heading.en;
          const paragraphs = sec.paragraphs[currentLocale] || sec.paragraphs.en;
          return (
            <section key={idx} className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {heading}
              </h2>
              {paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {p}
                </p>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
};
