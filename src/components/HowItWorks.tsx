import React from 'react';
import { Copy, ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import { SupportedLocale } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';

interface HowItWorksProps {
  currentLocale: SupportedLocale;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ currentLocale }) => {
  const t = TRANSLATIONS[currentLocale];

  const steps = [
    {
      number: '1',
      icon: Copy,
      title: t.step1Title,
      desc: t.step1Desc,
    },
    {
      number: '2',
      icon: ArrowRight,
      title: t.step2Title,
      desc: t.step2Desc,
    },
    {
      number: '3',
      icon: Download,
      title: t.step3Title,
      desc: t.step3Desc,
    },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.howTitle}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          {t.howSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="relative p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold flex items-center justify-center font-mono">
                    {step.number}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.stepBadge}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
