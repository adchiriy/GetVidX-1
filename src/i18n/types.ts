export type SupportedLocale = 'en' | 'es' | 'fr' | 'pt' | 'ar';

export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  flag: string;
  fontFamily: string;
}

export const LOCALES: Record<SupportedLocale, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    flag: '🇺🇸',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
    flag: '🇪🇸',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    flag: '🇫🇷',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    direction: 'ltr',
    flag: '🇧🇷',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    flag: '🇸🇦',
    fontFamily: "'Cairo', 'Plus Jakarta Sans', system-ui, sans-serif",
  },
};

export interface UiTranslations {
  // Navigation
  navDownloader: string;
  navMp3: string;
  navGif: string;
  navLive: string;
  navHowItWorks: string;
  navFaq: string;
  navGuides: string;

  // Hero
  badgeText: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroSubtitle: string;
  tabVideo: string;
  tabAudio: string;
  tabGif: string;
  tabLive: string;
  liveBadge: string;
  liveHelperTitle: string;
  liveHelperText: string;
  liveStreamFormat: string;
  liveSpaceAudioFormat: string;
  previewMedia: string;
  stopPreview: string;
  copyCommand: string;
  commandCopied: string;
  directBrowserDownload: string;
  saveInstructions: string;
  inputPlaceholder: string;
  pasteBtn: string;
  downloadBtn: string;
  analyzingBtn: string;
  tipText: string;
  tryExample: string;

  // Downloader Results
  resultTitle: string;
  authorLabel: string;
  durationLabel: string;
  resolutionsTitle: string;
  qualityLabel: string;
  formatLabel: string;
  actionDownload: string;
  actionCopyLink: string;
  linkCopied: string;
  extractAudio: string;
  downloadLiveVideo?: string;
  downloadSpaceAudio?: string;
  downloadPlaylist?: string;
  downloadImage?: string;
  liveBannerTitle?: string;
  liveBannerDesc?: string;
  directDownloadNote: string;
  downloadAnother: string;

  // Errors & Validations
  errorEmptyUrl: string;
  errorInvalidDomain: string;
  errorInvalidPostId: string;
  errorNoVideoFound: string;
  errorPrivatePost: string;
  errorNetwork: string;
  errorGeneric: string;

  // How it works
  howTitle: string;
  howSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  stepBadge: string;

  // Features / Why choose us
  whyTitle: string;
  whySubtitle: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  feat3Title: string;
  feat3Desc: string;
  feat4Title: string;
  feat4Desc: string;
  feat5Title: string;
  feat5Desc: string;
  feat6Title: string;
  feat6Desc: string;

  // FAQ
  faqTitle: string;
  faqSubtitle: string;

  // Sponsored Ad Slot
  adLabelHeader: string;
  adLabelResult: string;
  adNotice: string;

  // Direct replacement
  directReplacementHint: string;

  // Footer
  footerDesc: string;
  footerConverters: string;
  footerLegal: string;
  footerLanguages: string;
  terms: string;
  privacy: string;
  dmca: string;
  about: string;
  contact: string;
  howToDownload: string;
  disclaimer: string;
  copyright: string;
}
