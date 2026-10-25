import React, { useState, useRef, useEffect } from 'react';
import { Download, Globe, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import { SupportedLocale, LOCALES } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';

interface HeaderProps {
  currentLocale: SupportedLocale;
  onSelectLocale: (locale: SupportedLocale) => void;
  onNavigate: (route: string) => void;
  onSelectLive?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentLocale, onSelectLocale, onNavigate, onSelectLive }) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[currentLocale];
  const activeLocaleConfig = LOCALES[currentLocale];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg group cursor-pointer"
          aria-label="GetVidX Home"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
            <Download className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            GetVidX
          </span>
        </button>

        {/* Zone 2: Navigation Links (single-line, clean typography) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('/')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer"
          >
            {t.navDownloader}
          </button>
          <button
            onClick={() => onNavigate('/twitter-to-mp3')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer"
          >
            {t.navMp3}
          </button>
          <button
            onClick={() => onNavigate('/twitter-gif-downloader')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer"
          >
            {t.navGif}
          </button>
          <button
            onClick={() => {
              onNavigate('/');
              if (onSelectLive) onSelectLive();
            }}
            className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>{t.navLive}</span>
          </button>
          <button
            onClick={() => {
              onNavigate('/');
              setTimeout(() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer"
          >
            {t.navHowItWorks}
          </button>
          <button
            onClick={() => {
              onNavigate('/');
              setTimeout(() => {
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer"
          >
            {t.navFaq}
          </button>
        </nav>

        {/* Zone 3: Language Selector & Trust Badge */}
        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
              aria-expanded={langMenuOpen}
              aria-label="Select language"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="whitespace-nowrap">{activeLocaleConfig.nativeName}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <div
                className={`absolute ${currentLocale === 'ar' ? 'left-0' : 'right-0'} mt-2 w-44 rounded-xl bg-white shadow-xl border border-slate-100 py-1 z-50`}
                role="menu"
              >
                {(Object.keys(LOCALES) as SupportedLocale[]).map((locKey) => {
                  const loc = LOCALES[locKey];
                  const isSelected = locKey === currentLocale;
                  return (
                    <button
                      key={locKey}
                      onClick={() => {
                        onSelectLocale(locKey);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-left ${currentLocale === 'ar' ? 'text-right' : 'text-left'} transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      role="menuitem"
                    >
                      <span className="flex items-center gap-2">
                        <span>{loc.flag}</span>
                        <span>{loc.nativeName}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Privacy & Trust Verified Icon */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
            title="Safe, Secure & Encrypted - Zero User Tracking"
            aria-label="Verified Security"
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
