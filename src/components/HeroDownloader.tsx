import React, { useState } from 'react';
import { Video, Music, Sparkles, Clipboard, ArrowRight, Loader2, AlertCircle, Radio, Check, X } from 'lucide-react';
import { SupportedLocale } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';

interface HeroDownloaderProps {
  currentLocale: SupportedLocale;
  inputUrl: string;
  setInputUrl: (val: string) => void;
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
  errorMessage: string | null;
  activeTab: 'all' | 'audio' | 'gif' | 'live';
  setActiveTab: (tab: 'all' | 'audio' | 'gif' | 'live') => void;
}

const SAMPLE_TWEETS = [
  'https://x.com/BarackObama/status/1325126733482385409',
];

const SAMPLE_LIVE_URLS = [
  'https://x.com/BarackObama/status/1325126733482385409',
];

const PASTE_FROM_CLIPBOARD_TEXT: Record<SupportedLocale, string> = {
  en: 'Paste from Clipboard',
  es: 'Pegar del portapapeles',
  fr: 'Coller depuis le presse-papiers',
  pt: 'Colar da área de transferência',
  ar: 'لصق من الحافظة',
};

const PASTED_TEXT: Record<SupportedLocale, string> = {
  en: 'Pasted!',
  es: '¡Pegado!',
  fr: 'Collé !',
  pt: 'Colado!',
  ar: 'تم اللصق!',
};

export const HeroDownloader: React.FC<HeroDownloaderProps> = ({
  currentLocale,
  inputUrl,
  setInputUrl,
  onAnalyze,
  isAnalyzing,
  errorMessage,
  activeTab,
  setActiveTab,
}) => {
  const t = TRANSLATIONS[currentLocale];
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputUrl(text.trim());
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
          inputRef.current?.focus();
        }
      } else {
        inputRef.current?.focus();
      }
    } catch (err) {
      console.warn('Clipboard access denied or unsupported:', err);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    onAnalyze(inputUrl.trim());
  };

  const handleTryExample = () => {
    const pool = activeTab === 'live' ? SAMPLE_LIVE_URLS : SAMPLE_TWEETS;
    const randomSample = pool[Math.floor(Math.random() * pool.length)];
    setInputUrl(randomSample);
    onAnalyze(randomSample);
  };

  return (
    <section className="relative pt-6 pb-12 sm:pb-16 text-center max-w-4xl mx-auto px-4">
      {/* Kicker Tag / Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-100/80 shadow-xs">
        {activeTab === 'live' ? (
          <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        )}
        <span>{activeTab === 'live' ? t.liveBadge : t.badgeText}</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-4 text-balance">
        {t.heroTitlePrefix}{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
          {activeTab === 'live' ? t.tabLive : t.heroTitleHighlight}
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
        {activeTab === 'live' ? t.liveHelperText : t.heroSubtitle}
      </p>

      {/* Format Switcher Tabs */}
      <div className="inline-flex flex-wrap items-center justify-center p-1 bg-slate-100/90 rounded-xl mb-6 shadow-inner gap-1" role="tablist">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          role="tab"
          aria-selected={activeTab === 'all'}
        >
          <Video className="w-4 h-4 text-blue-600" />
          <span>{t.tabVideo}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'audio'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          role="tab"
          aria-selected={activeTab === 'audio'}
        >
          <Music className="w-4 h-4 text-indigo-600" />
          <span>{t.tabAudio}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gif')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'gif'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          role="tab"
          aria-selected={activeTab === 'gif'}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{t.tabGif}</span>
        </button>

        {/* Live & Spaces Dedicated Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'live'
              ? 'bg-red-50 text-red-700 shadow-sm border border-red-200/90'
              : 'text-slate-600 hover:text-red-700'
          }`}
          role="tab"
          aria-selected={activeTab === 'live'}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <Radio className="w-4 h-4 text-red-600" />
          <span>{t.tabLive}</span>
        </button>
      </div>

      {/* Input Box & Action Form */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
        <div className={`flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 rounded-2xl border-2 ${activeTab === 'live' ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-100' : 'border-slate-200/90 focus-within:border-blue-600 focus-within:ring-blue-100'} shadow-lg shadow-slate-200/40 focus-within:ring-4 transition-all`}>
          <div className="flex-1 flex items-center min-w-0 px-3 py-1">
            <input
              ref={inputRef}
              type="url"
              dir="ltr"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder={activeTab === 'live' ? 'https://x.com/i/spaces/... or https://x.com/i/broadcasts/...' : t.inputPlaceholder}
              className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              aria-label="Twitter or X Post URL"
              disabled={isAnalyzing}
            />

            {/* In-field Action Buttons: Clear & Paste from Clipboard */}
            <div className="flex items-center gap-1.5 shrink-0 ms-2">
              {inputUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('');
                    inputRef.current?.focus();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Clear input"
                  aria-label="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={handlePaste}
                disabled={isAnalyzing}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 ${
                  pasteSuccess
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/90 hover:border-blue-200'
                }`}
                title={PASTE_FROM_CLIPBOARD_TEXT[currentLocale]}
                aria-label={PASTE_FROM_CLIPBOARD_TEXT[currentLocale]}
              >
                {pasteSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold">{PASTED_TEXT[currentLocale]}</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">{PASTE_FROM_CLIPBOARD_TEXT[currentLocale]}</span>
                    <span className="sm:hidden">{t.pasteBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            {/* Main Download Button */}
            <button
              type="submit"
              disabled={isAnalyzing || !inputUrl.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold shadow-md shadow-blue-500/25 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.analyzingBtn}</span>
                </>
              ) : (
                <>
                  <span>{t.downloadBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation or Fetch Error Alert */}
        {errorMessage && (
          <div
            className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-800 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-left rtl:text-right"
            role="alert"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">{errorMessage}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTryExample}
              className="shrink-0 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            >
              {t.tryExample} →
            </button>
          </div>
        )}

        {/* Tip & Try Example Action */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-2">
          <span>{t.tipText}</span>
          <button
            type="button"
            onClick={handleTryExample}
            className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            {t.tryExample}
          </button>
        </div>
      </form>
    </section>
  );
};
