import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SupportedLocale } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';
import { FAQS_BY_LOCALE } from '../data/faqs';

interface FaqSectionProps {
  currentLocale: SupportedLocale;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ currentLocale }) => {
  const t = TRANSLATIONS[currentLocale];
  const faqs = FAQS_BY_LOCALE[currentLocale] || FAQS_BY_LOCALE.en;

  // Initialize with first 2 items expanded as shown in the mockup
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-free': true,
    'faq-ios': true,
  });

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="faq" className="py-14 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          Support & Guidance
        </span>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.faqTitle}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          {t.faqSubtitle}
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => {
          const isOpen = !!openIds[faq.id];
          return (
            <div
              key={faq.id}
              className="rounded-xl border border-slate-200/90 bg-white overflow-hidden transition-all shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left rtl:text-right hover:bg-slate-50/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="font-bold text-sm sm:text-base text-slate-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/60 bg-slate-50/30">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
