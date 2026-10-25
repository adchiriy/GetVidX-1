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
                <a
                  href={currentLocale === 'en' ? '/' : `/${currentLocale}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/');
                  }}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer inline-block"
                >
                  {t.navDownloader}
                </a>
              </li>
              <li>
                <a
                  href={currentLocale === 'en' ? '/twitter-to-mp3' : `/${currentLocale}/twitter-to-mp3`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/twitter-to-mp3');
                  }}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer inline-block"
                >
                  {t.navMp3}
                </a>
              </li>
              <li>
                <a
                  href={currentLocale === 'en' ? '/twitter-gif-downloader' : `/${currentLocale}/twitter-gif-downloader`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/twitter-gif-downloader');
                  }}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer inline-block"
                >
                  {t.navGif}
                </a>
              </li>
              <li>
                <a
                  href={currentLocale === 'en' ? '/twitter-video-download-hd' : `/${currentLocale}/twitter-video-download-hd`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/twitter-video-download-hd');
                  }}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer inline-block"
                >
                  Twitter Video HD
                </a>
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
                <a
                  href={currentLocale === 'en' ? '/terms' : `/${currentLocale}/terms`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/terms');
                  }}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer inline-block"
                >
                  {t.terms}
                </a>
              </li>
              <li>
                <a
                  href={currentLocale === 'en' ? '/privacy' : `/${currentLocale}/privacy`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/privacy');
                  }}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer inline-block"
                >
                  {t.privacy}
                </a>
              </li>
              <li>
                <a
                  href={currentLocale === 'en' ? '/dmca' : `/${currentLocale}/dmca`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/dmca');
                  }}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer inline-block"
                >
                  {t.dmca}
                </a>
              </li>
              <li>
                <a
                  href={currentLocale === 'en' ? '/about' : `/${currentLocale}/about`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/about');
                  }}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer inline-block"
                >
                  {t.about}
                </a>
              </li>
              <li>
                <a
                  href={currentLocale === 'en' ? '/contact' : `/${currentLocale}/contact`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/contact');
                  }}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right cursor-pointer inline-block"
                >
                  {t.contact}
                </a>
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
                const langHref = locKey === 'en' ? '/' : `/${locKey}`;
                return (
                  <a
                    key={locKey}
                    href={langHref}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectLocale(locKey);
                    }}
                    className={`px-2.5 py-1 rounded text-xs transition-colors border cursor-pointer inline-block ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {LOCALES[locKey].nativeName}
                  </a>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-400 block mb-1">Programmatic Guides:</span>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
                <a
                  href={currentLocale === 'en' ? '/how-to-download-twitter-videos-iphone' : `/${currentLocale}/how-to-download-twitter-videos-iphone`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/how-to-download-twitter-videos-iphone');
                  }}
                  className="hover:text-blue-600 underline cursor-pointer"
                >
                  iPhone Guide
                </a>
                <span className="text-slate-300">·</span>
                <a
                  href={currentLocale === 'en' ? '/how-to-download-twitter-videos-android' : `/${currentLocale}/how-to-download-twitter-videos-android`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/how-to-download-twitter-videos-android');
                  }}
                  className="hover:text-blue-600 underline cursor-pointer"
                >
                  Android Guide
                </a>
                <span className="text-slate-300">·</span>
                <a
                  href={currentLocale === 'en' ? '/troubleshooting-twitter-video-downloads' : `/${currentLocale}/troubleshooting-twitter-video-downloads`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/troubleshooting-twitter-video-downloads');
                  }}
                  className="hover:text-blue-600 underline cursor-pointer"
                >
                  Fix Errors
                </a>
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
