import React from 'react';
import { Sparkles, Zap, Laptop, Music, HeartHandshake, ShieldCheck } from 'lucide-react';
import { SupportedLocale } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';

interface WhyChooseUsProps {
  currentLocale: SupportedLocale;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ currentLocale }) => {
  const t = TRANSLATIONS[currentLocale];

  const features = [
    {
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-50',
      title: t.feat1Title,
      desc: t.feat1Desc,
    },
    {
      icon: Zap,
      color: 'text-blue-500 bg-blue-50',
      title: t.feat2Title,
      desc: t.feat2Desc,
    },
    {
      icon: Laptop,
      color: 'text-sky-500 bg-sky-50',
      title: t.feat3Title,
      desc: t.feat3Desc,
    },
    {
      icon: Music,
      color: 'text-emerald-500 bg-emerald-50',
      title: t.feat4Title,
      desc: t.feat4Desc,
    },
    {
      icon: HeartHandshake,
      color: 'text-rose-500 bg-rose-50',
      title: t.feat5Title,
      desc: t.feat5Desc,
    },
    {
      icon: ShieldCheck,
      color: 'text-indigo-500 bg-indigo-50',
      title: t.feat6Title,
      desc: t.feat6Desc,
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.whyTitle}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            {t.whySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-start"
              >
                <div className={`w-10 h-10 rounded-xl ${feat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
