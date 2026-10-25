import React from 'react';
import { Download } from 'lucide-react';
import { SupportedLocale, LOCALES } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';

interface FooterProps {
  currentLocale: SupportedLocale;
  onSelectLocale: (locale: SupportedLocale) => void;
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ currentLocale, onSelectLocale, onNavigate }) => {
  const t = TRANSLATIONS[currentLocale];

  return (
    <footer className="bg-slate-50 border-t border-slate-200/90 pt-12 pb-8 text-slate-600 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-200/80">
          {/* Brand info */}
          <div className="md:col-span-5 flex flex-col items-start">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 text-left mb-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Download className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                GetVidX
              </span>
            </button>

            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-4 leading-relaxed">
              {t.footerDesc}
            </p>

            <div className="text-xs font-mono text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              Canonical Domain: <span className="text-slate-600 font-semibold">https://getvidx.com</span>
            </div>
          </div>

          {/* Media Converters */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-3">
              {t.footerConverters}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.navDownloader}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/twitter-to-mp3')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.navMp3}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/twitter-gif-downloader')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.navGif}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/twitter-video-download-hd')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer"
                >
                  Twitter Video HD
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-3">
              {t.footerLegal}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/terms')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.terms}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/privacy')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.privacy}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/dmca')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.dmca}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.about}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer"
                >
                  {t.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Languages */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold text-slate-900 tracking-wider uppercase mb-3">
              {t.footerLanguages}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(LOCALES) as SupportedLocale[]).map((locKey) => {
                const isSelected = locKey === currentLocale;
                return (
                  <button
                    key={locKey}
                    onClick={() => onSelectLocale(locKey)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors border cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {LOCALES[locKey].nativeName}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-400 block mb-1">Programmatic Guides:</span>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
                <button
                  onClick={() => onNavigate('/how-to-download-twitter-videos-iphone')}
                  className="hover:text-blue-600 underline cursor-pointer"
                >
                  iPhone Guide
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => onNavigate('/how-to-download-twitter-videos-android')}
                  className="hover:text-blue-600 underline cursor-pointer"
                >
                  Android Guide
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => onNavigate('/troubleshooting-twitter-video-downloads')}
                  className="hover:text-blue-600 underline cursor-pointer"
                >
                  Fix Errors
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 text-xs text-slate-400 space-y-2">
          <p className="text-center sm:text-left rtl:sm:text-right leading-relaxed">
            {t.disclaimer}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200/40 text-[11px]">
            <span>{t.copyright}</span>
            <span>Crafted for clean, high-speed web experiences</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
