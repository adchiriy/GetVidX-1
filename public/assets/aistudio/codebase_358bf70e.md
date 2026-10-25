# .gitignore

```
node_modules/
build/
dist/
coverage/
.DS_Store
*.log
.env*
!.env.example

```

# index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script>
      (function() {
        try {
          var originalFetch = window.fetch ? window.fetch.bind(window) : null;
          var activeFetch = originalFetch;
          Object.defineProperty(window, 'fetch', {
            get: function() {
              return activeFetch;
            },
            set: function(val) {
              activeFetch = val;
            },
            configurable: true,
            enumerable: true,
          });
        } catch (_) {}
      })();
    </script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GetVidX - Twitter & X Video Downloader | Save MP4 & GIF in HD</title>
    <meta
      name="description"
      content="Fast, free online Twitter and X video downloader. Save MP4 videos in 1080p Full HD, GIFs, and MP3 audio with multi-language support and zero storage."
    />
    <link rel="canonical" href="https://getvidx.com/" />
    <meta property="og:title" content="GetVidX - Twitter & X Video Downloader" />
    <meta
      property="og:description"
      content="Fast, free online Twitter and X video downloader. Save MP4 videos in 1080p Full HD, GIFs, and MP3 audio with multi-language support and zero storage."
    />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="GetVidX" />
    <meta property="og:url" content="https://getvidx.com/" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="GetVidX - Twitter & X Video Downloader" />
    <meta
      name="twitter:description"
      content="Fast, free online Twitter and X video downloader. Save MP4 videos in 1080p Full HD, GIFs, and MP3 audio."
    />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/%3E%3Cpolyline points='7 10 12 15 17 10'/%3E%3Cline x1='12' y1='15' x2='12' y2='3'/%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="antialiased bg-white text-slate-900">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>


```

# metadata.json

```json
{
  "name": "GetVidX - Twitter & X Video Downloader",
  "description": "Fast, free online Twitter and X video downloader. Save MP4 videos in 1080p Full HD, GIFs, and MP3 audio with multi-language support and zero storage.",
  "requestFramePermissions": [],
  "majorCapabilities": ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]
}

```

# package.json

```json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server.ts",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "lucide-react": "^0.546.0",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0",
    "express": "^4.21.2",
    "dotenv": "^17.2.3",
    "motion": "^12.23.24"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2",
    "@types/express": "^4.17.21"
  }
}

```

# README.md

```md
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/661df123-0189-4c34-88f1-2ce85edb0b0d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

```

# server.ts

```ts
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import { Readable } from 'stream';
import {
  buildChildSitemapXml,
  buildSitemapIndexXml,
  buildRobotsTxt,
} from './src/data/sitemapData';
import { parseTwitterUrl } from './src/utils/twitterUrl';
import { buildMediaFormats } from './src/utils/downloader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // 1. Robots.txt
  app.get('/robots.txt', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(buildRobotsTxt());
  });

  // 2. Sitemap Index (/sitemap.xml)
  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(buildSitemapIndexXml());
  });

  // 3. Child Sitemap (/sitemap_1.xml)
  app.get('/sitemap_1.xml', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(buildChildSitemapXml());
  });

  // 4. API: Analyze Tweet Endpoint
  app.post('/api/analyze', async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ success: false, error: 'URL is required', errorCode: 'EMPTY_URL' });
        return;
      }

      const parsed = parseTwitterUrl(url);
      if (!parsed.isValid || !parsed.postId) {
        res.status(400).json({ success: false, error: parsed.error, errorCode: 'INVALID_DOMAIN' });
        return;
      }

      const postId = parsed.postId;

      // Query Twitter API resolver (vxtwitter / syndication endpoint)
      const vxUrl = `https://api.vxtwitter.com/Twitter/status/${postId}`;
      const response = await fetch(vxUrl, {
        headers: {
          'User-Agent': 'GetVidX/1.0 (Compatible media resolver; +https://getvidx.com)',
        },
      });

      if (!response.ok) {
        res.status(404).json({
          success: false,
          error: 'Tweet could not be found or is protected.',
          errorCode: 'PRIVATE',
        });
        return;
      }

      const data = await response.json();
      const mediaList = data.media_extended || [];
      const videoMedia = mediaList.find(
        (m: { type: string; url: string }) => m.type === 'video' || m.type === 'gif'
      );

      if (!videoMedia || !videoMedia.url) {
        res.status(422).json({
          success: false,
          error: 'No video stream was found in this tweet.',
          errorCode: 'NO_VIDEO',
        });
        return;
      }

      const isGif = videoMedia.type === 'gif' || videoMedia.url.includes('tweet_video');
      const durationSec = videoMedia.duration_millis ? videoMedia.duration_millis / 1000 : 30;

      const variants: Array<{ bitrate?: number; content_type?: string; url: string }> = [];
      if (Array.isArray(videoMedia.variants) && videoMedia.variants.length > 0) {
        variants.push(...videoMedia.variants);
      } else {
        variants.push({
          url: videoMedia.url,
          content_type: 'video/mp4',
          bitrate: 2176000,
        });
      }

      const formats = buildMediaFormats(variants, durationSec, postId);

      const m = Math.floor(durationSec / 60);
      const s = Math.floor(durationSec % 60);
      const durationStr = `${m}:${s < 10 ? '0' : ''}${s}`;

      res.json({
        success: true,
        result: {
          tweetId: postId,
          username: data.user_screen_name || parsed.username || 'twitter_user',
          authorName: data.user_name || 'Twitter Creator',
          authorAvatar: data.user_profile_image_url,
          tweetText: data.text || '',
          thumbnailUrl: videoMedia.thumbnail_url || (videoMedia.variants && videoMedia.variants[0]?.url),
          duration: durationStr,
          isVideo: !isGif,
          isGif,
          formats,
        },
      });
    } catch (err: unknown) {
      console.error('API /api/analyze error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal service error while resolving tweet media.',
        errorCode: 'NETWORK',
      });
    }
  });

  // 5. API: Direct Media Proxy Download (Enforces browser download prompt & SSRF protection)
  app.all(['/api/proxy-download'], async (req: Request, res: Response) => {
    // Only support GET and HEAD
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const mediaUrl = req.query.url as string;
      const rawFilename = (req.query.filename as string) || '';
      const isAudioOnly = req.query.audioOnly === 'true';

      if (!mediaUrl) {
        res.status(400).json({ error: 'Missing media URL parameter.' });
        return;
      }

      // SSRF & Target Validation
      let parsedTarget: URL;
      try {
        parsedTarget = new URL(mediaUrl);
      } catch {
        res.status(400).json({ error: 'Invalid media URL format.' });
        return;
      }

      // Restrict protocol strictly to https and http
      if (parsedTarget.protocol !== 'https:' && parsedTarget.protocol !== 'http:') {
        res.status(400).json({ error: 'Unsupported protocol scheme.' });
        return;
      }

      // Disallow user credentials embedded in URL
      if (parsedTarget.username || parsedTarget.password) {
        res.status(400).json({ error: 'Credentials in URL are strictly forbidden.' });
        return;
      }

      // SSRF Whitelist Check: strictly allow official Twitter/X CDN domains
      const hostname = parsedTarget.hostname.toLowerCase();
      const isAllowedHost =
        hostname === 'twimg.com' ||
        hostname.endsWith('.twimg.com') ||
        hostname === 'twitter.com' ||
        hostname === 'x.com';

      // Disallow IP literals (IPv4 or IPv6) and localhost to prevent SSRF
      const isIpOrLocalhost =
        /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
        hostname.includes(':') ||
        hostname === 'localhost';

      if (!isAllowedHost || isIpOrLocalhost) {
        res.status(403).json({ error: 'Access forbidden: only authorized Twitter/X media CDN hosts are permitted.' });
        return;
      }

      // Sanitize filename against path traversal and dangerous characters
      const defaultFilename = isAudioOnly ? 'getvidx_audio.mp3' : 'getvidx_video.mp4';
      const sanitizedBase = path.basename(rawFilename).replace(/[^\w\d_.-]/g, '_').trim();
      const safeFilename = sanitizedBase && sanitizedBase !== '.' ? sanitizedBase : defaultFilename;

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 60000); // 60s timeout
      req.on('close', () => abortController.abort());

      // Stream request to upstream Twitter CDN
      const upstream = await fetch(mediaUrl, {
        method: req.method === 'HEAD' ? 'HEAD' : 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://twitter.com/',
          'Accept': '*/*',
        },
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!upstream.ok) {
        const errorMsg =
          upstream.status === 404 || upstream.status === 410
            ? 'The video media link has expired or was removed by Twitter.'
            : `Provider returned HTTP ${upstream.status} while fetching media.`;
        res.status(upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502).json({
          error: errorMsg,
          upstreamStatus: upstream.status,
        });
        return;
      }

      // Safe Content-Disposition header forcing direct download across all browsers
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`
      );

      // Determine proper Content-Type
      let contentType = isAudioOnly
        ? 'audio/mpeg'
        : upstream.headers.get('content-type') || 'video/mp4';
      if (safeFilename.endsWith('.mp3')) contentType = 'audio/mpeg';
      else if (safeFilename.endsWith('.gif')) contentType = 'image/gif';
      else if (safeFilename.endsWith('.mp4')) contentType = 'video/mp4';

      res.setHeader('Content-Type', contentType);

      const contentLength = upstream.headers.get('content-length');
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      res.setHeader('Cache-Control', 'private, max-age=3600');

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      if (!upstream.body) {
        res.status(502).json({ error: 'Empty media stream received from upstream provider.' });
        return;
      }

      // Stream directly to Express response without loading into server memory
      const nodeStream = Readable.fromWeb(upstream.body as any);
      nodeStream.pipe(res);

      nodeStream.on('error', (streamErr) => {
        console.error('Error streaming media to client:', streamErr);
        if (!res.headersSent) {
          res.status(502).json({ error: 'Stream error during media transfer.' });
        }
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Proxy download handler error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error while processing media download.' });
      }
    }
  });

  // 6. Mount Vite middleware for development or serve dist for production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GetVidX] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

```

# src\App.tsx

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroDownloader } from './components/HeroDownloader';
import { DownloadResult } from './components/DownloadResult';
import { HowItWorks } from './components/HowItWorks';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FaqSection } from './components/FaqSection';
import { SponsoredAdSlot } from './components/SponsoredAdSlot';
import { PseoPageTemplate } from './components/PseoPageTemplate';
import { LegalPageTemplate } from './components/LegalPageTemplate';
import { Footer } from './components/Footer';

import { SupportedLocale, LOCALES } from './i18n/types';
import { TRANSLATIONS } from './i18n/translations';
import { PSEO_PAGES, PseoPageData } from './data/pseoPages';
import { LEGAL_PAGES, LegalPageContent } from './data/legalPages';
import { FAQS_BY_LOCALE } from './data/faqs';
import { detectDirectReplacementPath } from './utils/twitterUrl';
import { analyzeTweet, TweetAnalysisResult } from './utils/downloader';
import {
  updateDocumentSeo,
  buildWebApplicationSchema,
  buildFaqSchema,
  buildHowToSchema,
} from './utils/seo';

export default function App() {
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>('en');
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');

  // Downloader state
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<TweetAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'audio' | 'gif'>('all');

  // Detect locale from URL path e.g. /ar/..., /es/..., /fr/..., /pt/...
  const parseLocaleAndPath = useCallback((pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    let detectedLocale: SupportedLocale = 'en';
    let subPath = pathname;

    if (segments.length > 0 && ['en', 'es', 'fr', 'pt', 'ar'].includes(segments[0])) {
      detectedLocale = segments[0] as SupportedLocale;
      subPath = '/' + segments.slice(1).join('/');
      if (subPath === '') subPath = '/';
    }

    return { detectedLocale, subPath };
  }, []);

  // Handle URL change
  const handleNavigate = useCallback(
    (targetPath: string) => {
      // Build localized path
      let fullPath = targetPath;
      if (currentLocale !== 'en') {
        const cleanTarget = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
        fullPath = `/${currentLocale}${cleanTarget === '/' ? '' : cleanTarget}`;
      }

      window.history.pushState({}, '', fullPath);
      setCurrentPath(targetPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [currentLocale]
  );

  // Switch language
  const handleSelectLocale = useCallback(
    (newLocale: SupportedLocale) => {
      setCurrentLocale(newLocale);
      const cleanPath = currentPath.replace(/^\/(en|es|fr|pt|ar)(\/|$)/, '/');
      const newFullPath =
        newLocale === 'en'
          ? cleanPath
          : `/${newLocale}${cleanPath === '/' ? '' : cleanPath}`;
      window.history.pushState({}, '', newFullPath);
    },
    [currentPath]
  );

  // Analyze Tweet Handler
  const handleAnalyze = useCallback(
    async (urlToAnalyze: string) => {
      setIsAnalyzing(true);
      setErrorMessage(null);
      setAnalysisResult(null);

      const t = TRANSLATIONS[currentLocale];
      const response = await analyzeTweet(urlToAnalyze);

      setIsAnalyzing(false);
      if (response.success && response.result) {
        setAnalysisResult(response.result);
        setTimeout(() => {
          document.getElementById('download-results')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        // Map localized error message
        let msg = t.errorGeneric;
        if (response.errorCode === 'EMPTY_URL') msg = t.errorEmptyUrl;
        else if (response.errorCode === 'INVALID_DOMAIN') msg = t.errorInvalidDomain;
        else if (response.errorCode === 'INVALID_ID') msg = t.errorInvalidPostId;
        else if (response.errorCode === 'NO_VIDEO') msg = t.errorNoVideoFound;
        else if (response.errorCode === 'PRIVATE') msg = t.errorPrivatePost;
        else if (response.errorCode === 'NETWORK') msg = t.errorNetwork;

        setErrorMessage(msg);
      }
    },
    [currentLocale]
  );

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const onPopState = () => {
      const { detectedLocale, subPath } = parseLocaleAndPath(window.location.pathname);
      setCurrentLocale(detectedLocale);
      setCurrentPath(subPath);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [parseLocaleAndPath]);

  // Initial load: parse path, check direct replacement trick
  useEffect(() => {
    const rawPath = window.location.pathname;
    const { detectedLocale, subPath } = parseLocaleAndPath(rawPath);
    setCurrentLocale(detectedLocale);
    setCurrentPath(subPath);

    // Direct replacement feature: user navigated to e.g. /username/status/123456789
    const directCheck = detectDirectReplacementPath(rawPath);
    if (directCheck.isDirect && directCheck.normalizedUrl) {
      setInputUrl(directCheck.normalizedUrl);
      handleAnalyze(directCheck.normalizedUrl);
    }
  }, [parseLocaleAndPath, handleAnalyze]);

  // Update HTML dir, lang and SEO tags on state changes
  useEffect(() => {
    const activeLocaleConfig = LOCALES[currentLocale] || LOCALES.en;
    document.documentElement.lang = activeLocaleConfig.code;
    document.documentElement.dir = activeLocaleConfig.direction;

    // Check if on a pSEO page
    const cleanSlug = currentPath.replace(/^\//, '');
    const pseoMatch = PSEO_PAGES.find((p) => p.slug === cleanSlug);
    const legalMatch = LEGAL_PAGES[cleanSlug];

    if (pseoMatch) {
      const title = pseoMatch.title[currentLocale] || pseoMatch.title.en;
      const desc = pseoMatch.metaDescription[currentLocale] || pseoMatch.metaDescription.en;
      const steps = pseoMatch.steps[currentLocale] || pseoMatch.steps.en;

      updateDocumentSeo({
        locale: currentLocale,
        title,
        description: desc,
        pathname: currentPath,
        type: 'article',
        jsonLd: [
          buildWebApplicationSchema(currentLocale),
          buildHowToSchema(pseoMatch.h1[currentLocale], desc, steps),
        ],
      });
    } else if (legalMatch) {
      const title = legalMatch.title[currentLocale] || legalMatch.title.en;
      const desc = `${legalMatch.h1[currentLocale]} for GetVidX - Online Twitter Video Downloader.`;

      updateDocumentSeo({
        locale: currentLocale,
        title,
        description: desc,
        pathname: currentPath,
        type: 'website',
        jsonLd: buildWebApplicationSchema(currentLocale),
      });
    } else {
      // Default Homepage Metadata
      const t = TRANSLATIONS[currentLocale];
      const homepageTitles: Record<SupportedLocale, string> = {
        en: 'Twitter Video Downloader - Save X Videos & MP4 in HD - GetVidX',
        es: 'Descargar Vídeos de Twitter (X) - Guardar MP4 en HD - GetVidX',
        fr: 'Télécharger des vidéos Twitter (X) - Enregistrer MP4 en HD - GetVidX',
        pt: 'Baixar Vídeos do Twitter (X) - Salvar MP4 em HD - GetVidX',
        ar: 'تحميل فيديو تويتر (X) - تنزيل وحفظ مقاطع MP4 بدقة عالية - GetVidX',
      };
      const homepageDescriptions: Record<SupportedLocale, string> = {
        en: 'Download supported Twitter (X) videos online with GetVidX. Paste a public post link to check available video formats and save supported media.',
        es: 'Usa GetVidX para comprobar los formatos disponibles y descargar vídeos compatibles de publicaciones públicas de Twitter (X).',
        fr: 'Utilisez GetVidX pour vérifier les formats disponibles et télécharger les vidéos compatibles des publications publiques de Twitter (X).',
        pt: 'Use o GetVidX para verificar os formatos disponíveis e baixar vídeos compatíveis de publicações públicas do Twitter (X).',
        ar: 'استخدم GetVidX للتحقق من صيغ الفيديو المتاحة وتنزيل الفيديوهات المتوافقة من منشورات تويتر (X) العامة بدقة 1080p مجاناً.',
      };

      const title = homepageTitles[currentLocale] || homepageTitles.en;
      const description = homepageDescriptions[currentLocale] || homepageDescriptions.en;
      const faqs = FAQS_BY_LOCALE[currentLocale] || FAQS_BY_LOCALE.en;

      updateDocumentSeo({
        locale: currentLocale,
        title,
        description,
        pathname: currentPath,
        type: 'website',
        jsonLd: [buildWebApplicationSchema(currentLocale), buildFaqSchema(faqs)],
      });
    }
  }, [currentLocale, currentPath]);

  // Determine current active page view
  const cleanSlug = currentPath.replace(/^\//, '');
  const activePseoPage = PSEO_PAGES.find((p) => p.slug === cleanSlug);
  const activeLegalPage = LEGAL_PAGES[cleanSlug];
  const t = TRANSLATIONS[currentLocale];

  return (
    <div
      className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900"
      style={{ fontFamily: LOCALES[currentLocale]?.fontFamily }}
    >
      {/* 3-Zone Header Contract */}
      <Header
        currentLocale={currentLocale}
        onSelectLocale={handleSelectLocale}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activePseoPage ? (
          /* Programmatic SEO Landing Page */
          <PseoPageTemplate
            page={activePseoPage}
            currentLocale={currentLocale}
            onNavigate={handleNavigate}
            renderDownloader={() => (
              <>
                <HeroDownloader
                  currentLocale={currentLocale}
                  inputUrl={inputUrl}
                  setInputUrl={setInputUrl}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                  errorMessage={errorMessage}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                {analysisResult && (
                  <DownloadResult
                    currentLocale={currentLocale}
                    result={analysisResult}
                    onReset={() => {
                      setAnalysisResult(null);
                      setInputUrl('');
                    }}
                    activeFilter={activeTab}
                  />
                )}
              </>
            )}
          />
        ) : activeLegalPage ? (
          /* Legal / Trust Page */
          <LegalPageTemplate
            page={activeLegalPage}
            currentLocale={currentLocale}
            onNavigate={handleNavigate}
          />
        ) : (
          /* Standard Homepage Layout Matching User's Exact Screenshot */
          <>
            {/* Header Display Reserved Ad Space (Strictly decoupled) */}
            <SponsoredAdSlot label={t.adLabelHeader} notice={t.adNotice} />

            {/* Hero Downloader Box */}
            <HeroDownloader
              currentLocale={currentLocale}
              inputUrl={inputUrl}
              setInputUrl={setInputUrl}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              errorMessage={errorMessage}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* Live Media Download Results */}
            {analysisResult && (
              <DownloadResult
                currentLocale={currentLocale}
                result={analysisResult}
                onReset={() => {
                  setAnalysisResult(null);
                  setInputUrl('');
                }}
                activeFilter={activeTab}
              />
            )}

            {/* Under-Result Reserved Ad Space (Strictly decoupled) */}
            <SponsoredAdSlot label={t.adLabelResult} notice={t.adNotice} />

            {/* 3-Step How It Works Section */}
            <HowItWorks currentLocale={currentLocale} />

            {/* 6 Feature Cards Why Choose Us Section */}
            <WhyChooseUs currentLocale={currentLocale} />

            {/* FAQ Accordion Section */}
            <FaqSection currentLocale={currentLocale} />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        currentLocale={currentLocale}
        onSelectLocale={handleSelectLocale}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

```

# src\components\DownloadResult.tsx

```tsx
import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Music,
  Video,
  RefreshCw,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { TweetAnalysisResult, MediaFormat } from '../utils/downloader';
import { SupportedLocale } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';

interface DownloadResultProps {
  currentLocale: SupportedLocale;
  result: TweetAnalysisResult;
  onReset: () => void;
  activeFilter: 'all' | 'audio' | 'gif';
}

const DOWNLOADING_TEXT: Record<SupportedLocale, string> = {
  en: 'Downloading...',
  es: 'Descargando...',
  fr: 'Téléchargement...',
  pt: 'Baixando...',
  ar: 'جاري التنزيل...',
};

const EXPIRED_ERROR_TEXT: Record<SupportedLocale, string> = {
  en: 'The media link has expired or is unavailable. Please analyze the tweet again.',
  es: 'El enlace multimedia ha caducado o no está disponible. Por favor vuelve a analizar el tweet.',
  fr: 'Le lien multimédia a expiré ou est indisponible. Veuillez analyser à nouveau le tweet.',
  pt: 'O link de mídia expirou ou está indisponível. Por favor, analise o tweet novamente.',
  ar: 'انتهت صلاحية رابط الوسائط أو لم يعد متوفراً. يرجى إعادة فحص التغريدة مجدداً.',
};

export const DownloadResult: React.FC<DownloadResultProps> = ({
  currentLocale,
  result,
  onReset,
  activeFilter,
}) => {
  const t = TRANSLATIONS[currentLocale];
  const [copiedFormatId, setCopiedFormatId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleCopyLink = async (format: MediaFormat) => {
    try {
      await navigator.clipboard.writeText(format.directUrl);
      setCopiedFormatId(format.id);
      setTimeout(() => setCopiedFormatId(null), 2500);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  /**
   * Genuine file download handler:
   * 1. Validates upstream availability via preflight HEAD to server-side proxy
   * 2. Sets Content-Disposition: attachment headers via server endpoint
   * 3. Triggers true device file download without navigating to video playback tab
   * 4. Prevents duplicate concurrent download requests
   */
  const handleDownload = async (e: React.MouseEvent, fmt: MediaFormat) => {
    e.preventDefault();

    if (downloadingId) {
      // Prevent duplicate requests while an operation is already in flight
      return;
    }

    setDownloadingId(fmt.id);
    setDownloadError(null);

    try {
      // Preflight availability check to catch expired CDN links or upstream 404/410/502
      const checkRes = await fetch(fmt.proxyUrl, {
        method: 'HEAD',
      });

      if (!checkRes.ok) {
        setDownloadError(EXPIRED_ERROR_TEXT[currentLocale] || EXPIRED_ERROR_TEXT.en);
        setDownloadingId(null);
        return;
      }

      // Stream file directly to user device via browser download manager using Content-Disposition
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = fmt.proxyUrl;
      downloadAnchor.download = fmt.filename;
      downloadAnchor.rel = 'noopener';
      downloadAnchor.style.display = 'none';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      // Keep downloading feedback state briefly to prevent immediate accidental re-clicks
      setTimeout(() => {
        setDownloadingId(null);
      }, 2500);
    } catch (err) {
      console.warn('Proxy preflight check failed, attempting direct download stream:', err);

      try {
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = fmt.proxyUrl;
        downloadAnchor.download = fmt.filename;
        downloadAnchor.rel = 'noopener';
        downloadAnchor.style.display = 'none';
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
      } catch (triggerErr) {
        console.error('Download execution error:', triggerErr);
        setDownloadError(t.errorNetwork || 'Network error while initiating download.');
      }

      setTimeout(() => {
        setDownloadingId(null);
      }, 2500);
    }
  };

  // Filter formats if user chose Audio or GIF specifically
  const displayedFormats = result.formats.filter((f) => {
    if (activeFilter === 'audio') return f.isAudioOnly;
    if (activeFilter === 'gif') return result.isGif || f.format === 'GIF';
    return true;
  });

  return (
    <div
      id="download-results"
      className="max-w-4xl mx-auto my-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {result.authorAvatar ? (
              <img
                src={result.authorAvatar}
                alt={result.authorName}
                className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                {result.authorName.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                {result.authorName}
              </div>
              <div className="text-xs text-slate-500 font-mono" dir="ltr">
                @{result.username}
              </div>
            </div>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.downloadAnother}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Media Player / Preview Thumbnail */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-video flex items-center justify-center shadow-inner">
              {result.formats.length > 0 && result.formats[0].directUrl ? (
                <video
                  src={result.formats[0].directUrl}
                  poster={result.thumbnailUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : result.thumbnailUrl ? (
                <img
                  src={result.thumbnailUrl}
                  alt="Tweet video preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                  <Video className="w-8 h-8 opacity-40" />
                  <span>Media Preview</span>
                </div>
              )}

              {result.duration && (
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[11px] font-mono tabular-nums">
                  {result.duration}
                </div>
              )}
            </div>

            {/* Tweet Text Excerpt */}
            {result.tweetText && (
              <p className="mt-3 text-xs sm:text-sm text-slate-600 italic line-clamp-3 w-full text-left rtl:text-right">
                "{result.tweetText}"
              </p>
            )}
          </div>

          {/* Download Options List */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {t.resolutionsTitle}
              </h2>
              <span className="text-xs text-slate-400">
                {displayedFormats.length} {t.formatLabel}s
              </span>
            </div>

            {/* Error Notification Alert */}
            {downloadError && (
              <div
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start justify-between gap-2 animate-in fade-in duration-200"
                role="alert"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{downloadError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDownloadError(null)}
                  className="text-red-500 hover:text-red-800 p-0.5"
                  aria-label="Close error message"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {displayedFormats.map((fmt) => {
                const isCopied = copiedFormatId === fmt.id;
                const isDownloadingThis = downloadingId === fmt.id;
                const isAnyDownloading = Boolean(downloadingId);

                return (
                  <div
                    key={fmt.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-3 group hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          fmt.isAudioOnly
                            ? 'bg-indigo-50 text-indigo-600'
                            : fmt.quality === '1080p'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {fmt.isAudioOnly ? (
                          <Music className="w-4 h-4" />
                        ) : fmt.format === 'GIF' ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-bold">{fmt.quality}</span>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{fmt.label}</span>
                          {fmt.quality === '1080p' && (
                            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                              Original HD
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{fmt.format}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{fmt.resolution}</span>
                          {fmt.sizeEstimate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-slate-400">{fmt.sizeEstimate}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {/* Copy Direct URL */}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(fmt)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                        title={t.actionCopyLink}
                        aria-label={t.actionCopyLink}
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* Download Action: Server-side proxy stream with Content-Disposition: attachment */}
                      <a
                        href={fmt.proxyUrl}
                        download={fmt.filename}
                        onClick={(e) => handleDownload(e, fmt)}
                        aria-disabled={isAnyDownloading}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-all cursor-pointer ${
                          isDownloadingThis
                            ? 'bg-slate-700 cursor-wait'
                            : isAnyDownloading
                            ? 'opacity-60 cursor-not-allowed bg-blue-600'
                            : fmt.isAudioOnly
                            ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-98'
                            : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
                        }`}
                      >
                        {isDownloadingThis ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{DOWNLOADING_TEXT[currentLocale] || DOWNLOADING_TEXT.en}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>{fmt.isAudioOnly ? t.extractAudio : t.actionDownload}</span>
                          </>
                        )}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Helpful saving note */}
            <div className="mt-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-xs">
              {t.directDownloadNote}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

```

# src\components\FaqSection.tsx

```tsx
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

  // Initialize with first 2 items expanded as shown in the user's reference mockup
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

```

# src\components\Footer.tsx

```tsx
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
              className="flex items-center gap-2.5 text-left mb-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
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
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right"
                >
                  {t.navDownloader}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/twitter-to-mp3')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right"
                >
                  {t.navMp3}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/twitter-gif-downloader')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right"
                >
                  {t.navGif}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/twitter-video-download-hd')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right"
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
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right"
                >
                  {t.terms}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/privacy')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right"
                >
                  {t.privacy}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/dmca')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right"
                >
                  {t.dmca}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/about')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right"
                >
                  {t.about}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="hover:text-blue-600 transition-colors text-left rtl:text-right"
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
                    className={`px-2.5 py-1 rounded text-xs transition-colors border ${
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
                  className="hover:text-blue-600 underline"
                >
                  iPhone Guide
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => onNavigate('/how-to-download-twitter-videos-android')}
                  className="hover:text-blue-600 underline"
                >
                  Android Guide
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => onNavigate('/troubleshooting-twitter-video-downloads')}
                  className="hover:text-blue-600 underline"
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

```

# src\components\Header.tsx

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { Download, Globe, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import { SupportedLocale, LOCALES } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';

interface HeaderProps {
  currentLocale: SupportedLocale;
  onSelectLocale: (locale: SupportedLocale) => void;
  onNavigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentLocale, onSelectLocale, onNavigate }) => {
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
          className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg group"
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
            className="hover:text-blue-600 transition-colors whitespace-nowrap"
          >
            {t.navDownloader}
          </button>
          <button
            onClick={() => onNavigate('/twitter-to-mp3')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap"
          >
            {t.navMp3}
          </button>
          <button
            onClick={() => onNavigate('/twitter-gif-downloader')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap"
          >
            {t.navGif}
          </button>
          <button
            onClick={() => {
              onNavigate('/');
              setTimeout(() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-blue-600 transition-colors whitespace-nowrap"
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
            className="hover:text-blue-600 transition-colors whitespace-nowrap"
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-expanded={langMenuOpen}
              aria-label="Select language"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span className="whitespace-nowrap">{activeLocaleConfig.nativeName}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <div
                className={`absolute ${currentLocale === 'ar' ? 'left-0' : 'right-0'} mt-2 w-44 rounded-xl bg-white shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100`}
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
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-left ${currentLocale === 'ar' ? 'text-right' : 'text-left'} transition-colors ${
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

```

# src\components\HeroDownloader.tsx

```tsx
import React, { useState } from 'react';
import { Video, Music, Sparkles, Clipboard, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { SupportedLocale } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';

interface HeroDownloaderProps {
  currentLocale: SupportedLocale;
  inputUrl: string;
  setInputUrl: (val: string) => void;
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
  errorMessage: string | null;
  activeTab: 'all' | 'audio' | 'gif';
  setActiveTab: (tab: 'all' | 'audio' | 'gif') => void;
}

const SAMPLE_TWEETS = [
  'https://x.com/NASA/status/1880000000000000000',
  'https://twitter.com/SpaceX/status/1768269784307581177',
  'https://x.com/Google/status/1790435882662453549',
];

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

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputUrl(text.trim());
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
        }
      }
    } catch (err) {
      console.warn('Clipboard access denied or unsupported:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    onAnalyze(inputUrl.trim());
  };

  const handleTryExample = () => {
    const randomSample = SAMPLE_TWEETS[Math.floor(Math.random() * SAMPLE_TWEETS.length)];
    setInputUrl(randomSample);
    onAnalyze(randomSample);
  };

  return (
    <section className="relative pt-6 pb-12 sm:pb-16 text-center max-w-4xl mx-auto px-4">
      {/* Kicker Tag / Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4 border border-blue-100/80 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        <span>{t.badgeText}</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-4 text-balance">
        {t.heroTitlePrefix}{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
          {t.heroTitleHighlight}
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
        {t.heroSubtitle}
      </p>

      {/* Format Switcher Tabs */}
      <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl mb-6 shadow-inner" role="tablist">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
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
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
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
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
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
      </div>

      {/* Input Box & Action Form */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 rounded-2xl border-2 border-slate-200/90 shadow-lg shadow-slate-200/40 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
          <div className="flex-1 flex items-center min-w-0 px-3">
            <input
              type="url"
              dir="ltr"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              aria-label="Twitter or X Post URL"
              disabled={isAnalyzing}
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 w-full sm:w-auto">
            {/* Paste Button */}
            <button
              type="button"
              onClick={handlePaste}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5 text-slate-500" />
              <span>{pasteSuccess ? 'Pasted!' : t.pasteBtn}</span>
            </button>

            {/* Main Download Button */}
            <button
              type="submit"
              disabled={isAnalyzing || !inputUrl.trim()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold shadow-md shadow-blue-500/25 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer disabled:cursor-not-allowed"
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
            className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-800 text-xs sm:text-sm flex items-start gap-2.5 text-left rtl:text-right animate-in fade-in duration-200"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">{errorMessage}</span>
            </div>
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

```

# src\components\HowItWorks.tsx

```tsx
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
              className="relative p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
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

```

# src\components\LegalPageTemplate.tsx

```tsx
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
          className="hover:text-blue-600 transition-colors font-medium"
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

```

# src\components\PseoPageTemplate.tsx

```tsx
import React from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, FileText, Info } from 'lucide-react';
import { PseoPageData } from '../data/pseoPages';
import { SupportedLocale } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';

interface PseoPageTemplateProps {
  page: PseoPageData;
  currentLocale: SupportedLocale;
  onNavigate: (route: string) => void;
  renderDownloader: () => React.ReactNode;
}

export const PseoPageTemplate: React.FC<PseoPageTemplateProps> = ({
  page,
  currentLocale,
  onNavigate,
  renderDownloader,
}) => {
  const t = TRANSLATIONS[currentLocale];
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
          className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
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
            Online Downloader
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
            Paste your Twitter/X Link to Download
          </h2>
        </div>
        {renderDownloader()}
      </div>

      {/* Key Architectural & Functional Advantages */}
      <div className="my-10">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <span>Core Capabilities & Features</span>
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
            Related Guides & Converters
          </h3>
          <div className="flex flex-wrap gap-2">
            {page.relatedSlugs.map((slug) => (
              <button
                key={slug}
                onClick={() => onNavigate(`/${slug}`)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 shadow-xs transition-colors"
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

```

# src\components\SponsoredAdSlot.tsx

```tsx
import React from 'react';

interface SponsoredAdSlotProps {
  label: string;
  notice: string;
  className?: string;
}

export const SponsoredAdSlot: React.FC<SponsoredAdSlotProps> = ({ label, notice, className = '' }) => {
  return (
    <aside
      className={`w-full max-w-4xl mx-auto my-6 px-4 py-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center transition-colors min-h-[72px] flex flex-col items-center justify-center ${className}`}
      aria-label="Advertisement Container"
    >
      <span className="text-[10px] tracking-wider font-semibold text-slate-400 uppercase">
        {label}
      </span>
      <p className="text-xs text-slate-400 mt-0.5">
        {notice}
      </p>
    </aside>
  );
};

```

# src\components\WhyChooseUs.tsx

```tsx
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

```

# src\data\faqs.ts

```ts
import { SupportedLocale } from '../i18n/types';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQS_BY_LOCALE: Record<SupportedLocale, FaqItem[]> = {
  en: [
    {
      id: 'faq-free',
      question: 'Is it completely free to download videos with GetVidX?',
      answer:
        'Yes! GetVidX is 100% free with no hidden charges, trial periods, or mandatory account creation. You can convert and save as many public Twitter (X) clips as you need.',
    },
    {
      id: 'faq-ios',
      question: 'How can I download Twitter videos on an iPhone or iPad?',
      answer:
        'Open Safari on iOS 13 or newer, visit GetVidX, paste your Tweet link, choose the desired quality, and tap Download. Safari will prompt you to save the video directly to your Files or Camera Roll.',
    },
    {
      id: 'faq-private',
      question: 'Can I download videos from private Twitter accounts?',
      answer:
        'No. Due to privacy and security protections, GetVidX only extracts media from publicly viewable tweets. We never bypass account privacy barriers or access protected content.',
    },
    {
      id: 'faq-location',
      question: 'Where are the downloaded files saved on my device?',
      answer:
        'On Windows and Mac, files are saved in your default "Downloads" folder. On Android and iOS, they go to your Downloads directory or Photos / Files app depending on your browser preferences.',
    },
    {
      id: 'faq-mp3',
      question: 'Can I extract MP3 audio from a Twitter video?',
      answer:
        'Yes! GetVidX provides a dedicated "Download Audio (MP3)" option for videos that include an audio stream, extracting a crisp 128kbps or 320kbps audio track.',
    },
    {
      id: 'faq-storage',
      question: 'Does GetVidX store copies of downloaded videos?',
      answer:
        'No. GetVidX operates on a zero-storage principle. We do not host, store, or archive any media files or personal logs. All video streams are retrieved directly from official Twitter CDN servers.',
    },
    {
      id: 'faq-error',
      question: 'Why did a download fail or show an error?',
      answer:
        'Downloads can fail if the tweet URL is misspelled, if the tweet contains only photos without video, if the original author deleted the tweet, or if the account is set to private.',
    },
    {
      id: 'faq-legal',
      question: 'Is it legal to download videos from Twitter?',
      answer:
        'Downloading publicly accessible videos for personal, offline viewing and fair use is generally permitted. However, re-distributing, claiming copyright, or monetizing other creators’ content without authorization is prohibited.',
    },
  ],

  es: [
    {
      id: 'faq-free',
      question: '¿Es completamente gratis descargar vídeos con GetVidX?',
      answer:
        '¡Sí! GetVidX es 100% gratuito, sin tarifas ocultas, sin registros obligatorios ni períodos de prueba. Puedes descargar y convertir todos los vídeos públicos de X que desees.',
    },
    {
      id: 'faq-ios',
      question: '¿Cómo descargo vídeos de Twitter en iPhone o iPad?',
      answer:
        'Abre Safari en iOS 13 o superior, entra a GetVidX, pega el enlace del Tweet, elige la resolución y pulsa en Descargar. Safari te preguntará si deseas guardar el archivo en Archivos o en tu Carrete.',
    },
    {
      id: 'faq-private',
      question: '¿Puedo descargar vídeos de cuentas privadas de Twitter?',
      answer:
        'No. Por motivos de privacidad y seguridad, GetVidX solo puede procesar tweets públicos accesibles para todo el mundo. No eludimos medidas de protección de cuentas privadas.',
    },
    {
      id: 'faq-location',
      question: '¿Dónde se guardan los archivos descargados en mi dispositivo?',
      answer:
        'En PC y Mac se guardan en la carpeta predeterminada de "Descargas". En dispositivos móviles Android y iPhone se almacenan en la app de Archivos o en la Galería multimedia.',
    },
    {
      id: 'faq-mp3',
      question: '¿Puedo extraer audio MP3 de un vídeo de Twitter?',
      answer:
        '¡Sí! GetVidX incluye una opción específica para extraer y guardar únicamente la pista de audio en formato MP3 con calidad cristalina.',
    },
    {
      id: 'faq-storage',
      question: '¿GetVidX almacena copias de los vídeos descargados?',
      answer:
        'No. GetVidX funciona con política de cero almacenamiento. No alojamos ni guardamos copias de ningún archivo. Todo el contenido se transfiere directamente desde los servidores CDN oficiales.',
    },
    {
      id: 'faq-error',
      question: '¿Por qué falló una descarga o mostró un error?',
      answer:
        'Las causas habituales son: enlace incorrecto, publicación que solo contiene imágenes sin vídeo, tweet eliminado por su autor o cuenta configurada como privada.',
    },
    {
      id: 'faq-legal',
      question: '¿Es legal descargar vídeos de Twitter?',
      answer:
        'Descargar vídeos públicos para uso personal y visualización sin conexión suele considerarse uso legítimo. No está permitido republicar o comercializar obras de terceros sin autorización.',
    },
  ],

  fr: [
    {
      id: 'faq-free',
      question: 'Est-ce totalement gratuit de télécharger des vidéos avec GetVidX ?',
      answer:
        'Oui ! GetVidX est 100% gratuit, sans frais cachés, sans période d’essai et sans création de compte obligatoire. Vous pouvez télécharger tous les clips publics souhaités.',
    },
    {
      id: 'faq-ios',
      question: 'Comment télécharger des vidéos Twitter sur un iPhone ou un iPad ?',
      answer:
        'Ouvrez Safari (iOS 13+), accédez à GetVidX, collez votre lien de Tweet, sélectionnez la qualité désirée et appuyez sur Télécharger. Safari enregistrera la vidéo directement dans vos Fichiers ou Photos.',
    },
    {
      id: 'faq-private',
      question: 'Puis-je télécharger des vidéos de comptes Twitter privés ?',
      answer:
        'Non. Par respect de la vie privée et des règles de sécurité, GetVidX ne peut extraire que les médias provenant de tweets publics.',
    },
    {
      id: 'faq-location',
      question: 'Où sont enregistrés les fichiers téléchargés ?',
      answer:
        'Sur ordinateur (Windows / Mac), les fichiers se trouvent dans votre dossier "Téléchargements". Sur mobile (Android / iOS), ils se trouvent dans l’application Fichiers ou Photos.',
    },
    {
      id: 'faq-mp3',
      question: 'Est-il possible d’extraire l’audio MP3 d’une vidéo Twitter ?',
      answer:
        'Oui ! GetVidX propose une option dédiée pour télécharger uniquement la piste audio au format MP3 en haute clarté.',
    },
    {
      id: 'faq-storage',
      question: 'GetVidX conserve-t-il des copies des vidéos téléchargées ?',
      answer:
        'Non. GetVidX applique une stricte politique de zéro stockage. Aucun média n’est hébergé sur nos serveurs ; tout est extrait directement des CDN de Twitter.',
    },
    {
      id: 'faq-error',
      question: 'Pourquoi un téléchargement échoue-t-il ?',
      answer:
        'Les erreurs surviennent généralement si le lien est incomplet, si la publication ne contient pas de vidéo (images seules), si le tweet a été supprimé ou si le compte est protégé.',
    },
    {
      id: 'faq-legal',
      question: 'Est-il légal de télécharger des vidéos depuis Twitter ?',
      answer:
        'Le téléchargement pour un usage personnel et privé hors ligne est généralement autorisé. La redistribution commerciale sans accord de l’auteur est strictement interdite.',
    },
  ],

  pt: [
    {
      id: 'faq-free',
      question: 'É totalmente gratuito baixar vídeos com o GetVidX?',
      answer:
        'Sim! O GetVidX é 100% gratuito, sem taxas ocultas, sem assinaturas e sem necessidade de criar conta. Você pode baixar quantos vídeos públicos precisar.',
    },
    {
      id: 'faq-ios',
      question: 'Como baixar vídeos do Twitter no iPhone ou iPad?',
      answer:
        'Abra o navegador Safari no iOS 13 ou superior, acesse o GetVidX, cole o link do Tweet, selecione a resolução e toque em Baixar. O Safari salvará o vídeo diretamente no app Arquivos ou Fotos.',
    },
    {
      id: 'faq-private',
      question: 'Posso baixar vídeos de contas privadas do Twitter?',
      answer:
        'Não. Por motivos de privacidade e conformidade técnica, o GetVidX só consegue processar publicações públicas. Não violamos contas protegidas.',
    },
    {
      id: 'faq-location',
      question: 'Onde os arquivos baixados são salvos no meu dispositivo?',
      answer:
        'No Windows e Mac, os arquivos vão para a pasta padrão "Downloads". Em celulares Android e iOS, ficam salvos nos Arquivos ou na Galeria de Fotos.',
    },
    {
      id: 'faq-mp3',
      question: 'Consigo extrair áudio MP3 de um vídeo do Twitter?',
      answer:
        'Sim! O GetVidX possui um botão dedicado para baixar apenas a trilha sonora em MP3 com som limpo.',
    },
    {
      id: 'faq-storage',
      question: 'O GetVidX armazena cópias dos vídeos baixados?',
      answer:
        'Não. O GetVidX adota o princípio de armazenamento zero. Não salvamos nenhuma mídia em nossos servidores; todos os arquivos vêm diretamente da CDN oficial.',
    },
    {
      id: 'faq-error',
      question: 'Por que o download falhou ou exibiu um erro?',
      answer:
        'Normalmente ocorre se o link contiver erros de digitação, se o tweet contiver apenas fotos ou texto, se foi apagado pelo autor ou se a conta for restrita.',
    },
    {
      id: 'faq-legal',
      question: 'É legal baixar vídeos do Twitter?',
      answer:
        'O download para consumo pessoal e visualização offline é geralmente permitido pelo uso justo. No entanto, republique ou comercialize conteúdos alheios apenas com autorização do autor.',
    },
  ],

  ar: [
    {
      id: 'faq-free',
      question: 'هل تحميل مقاطع الفيديو مجاني تماماً عبر GetVidX؟',
      answer:
        'نعم! موقع GetVidX مجاني 100% بدون أي رسوم خفية أو فترات تجريبية أو اشتراكات، ولا يتطلب إنشاء حساب أو تسجيل دخول. يمكنك تنزيل ما تشاء من مقاطع تويتر العامة بكل حرية.',
    },
    {
      id: 'faq-ios',
      question: 'كيف يمكنني تنزيل مقاطع فيديو تويتر على أجهزة آيفون وآيباد؟',
      answer:
        'افتح متصفح Safari على نظام iOS 13 أو الأحدث، وتوجه لموقع GetVidX، ثم الصق رابط التغريدة واختر الجودة المطلوبة وانقر على "تحميل". سيطلب منك Safari حفظ الفيديو في تطبيق الملفات أو المعرض.',
    },
    {
      id: 'faq-private',
      question: 'هل يمكن تحميل مقاطع من حسابات تويتر الخاصة أو المغلقة؟',
      answer:
        'لا، لحماية خصوصية المستخدمين وسياسات الحماية، يستخرج GetVidX مقاطع الفيديو من التغريدات العامة فقط المتاحة لجميع المشاهدين. لا يمكننا الوصول لأي حساب مقفل.',
    },
    {
      id: 'faq-location',
      question: 'أين يتم حفظ الملفات ومقاطع الفيديو بعد تحميلها؟',
      answer:
        'على أجهزة الكمبيوتر (ويندوز وماك)، تُحفظ الملفات في مجلد "التنزيلات" (Downloads). أما على هواتف أندرويد وآيفون، فتجدها في تطبيق التنزيلات أو تطبيق الصور والملفات.',
    },
    {
      id: 'faq-mp3',
      question: 'هل يدعم الموقع استخراج الصوت بصيغة MP3 من فيديو تويتر؟',
      answer:
        'نعم بكل تأكيد! يوفر GetVidX خياراً مخصصاً يتيح لك استخراج المسار الصوتي فقط بصيغة MP3 بنقاء ممتاز، مما يجعله مثالياً لحفظ المقاطع الصوتية والموسيقى والبودكاست.',
    },
    {
      id: 'faq-storage',
      question: 'هل يحتفظ موقع GetVidX بنسخ من مقاطع الفيديو التي أقوم بتحميلها؟',
      answer:
        'قطعاً لا. يلتزم GetVidX بمبدأ انعدام التخزين (Zero Storage). نحن لا نخزن أو نحتفظ بأي ملفات وسائط على خوادمنا نهائياً، بل يتم نقلها مباشرة من خوادم تويتر الرسمية إلى جهازك.',
    },
    {
      id: 'faq-error',
      question: 'لماذا فشل التحميل أو ظهرت رسالة خطأ عند فحص الرابط؟',
      answer:
        'تحدث الأخطاء عادة عند: كتابة رابط غير مكتمل، أو إذا كانت التغريدة تحتوي على صور ثابتة فقط بدون فيديو، أو إذا قام صاحب التغريدة بحذفها، أو إذا كان الحساب خاصاً.',
    },
    {
      id: 'faq-legal',
      question: 'هل تحميل مقاطع الفيديو من منصة تويتر أمر قانوني ومصرح به؟',
      answer:
        'تحميل المقاطع العامة للاستخدام الشخصي والمشاهدة دون اتصال بالإنترنت يعتبر ضمن الاستخدام العادل المقبول. ولكن لا يُسمح بإعادة نشر المحتوى تجارياً أو نسبه لنفسك دون إذن من صاحب العمل الأصلي.',
    },
  ],
};

```

# src\data\legalPages.ts

```ts
import { SupportedLocale } from '../i18n/types';

export interface LegalPageContent {
  slug: string;
  title: Record<SupportedLocale, string>;
  h1: Record<SupportedLocale, string>;
  lastUpdated: string;
  sections: {
    heading: Record<SupportedLocale, string>;
    paragraphs: Record<SupportedLocale, string[]>;
  }[];
}

export const LEGAL_PAGES: Record<string, LegalPageContent> = {
  terms: {
    slug: 'terms',
    title: {
      en: 'Terms of Service - GetVidX',
      es: 'Términos de Servicio - GetVidX',
      fr: 'Conditions d’Utilisation - GetVidX',
      pt: 'Termos de Serviço - GetVidX',
      ar: 'شروط الخدمة والاستخدام - GetVidX',
    },
    h1: {
      en: 'Terms of Service',
      es: 'Términos de Servicio',
      fr: 'Conditions d’Utilisation',
      pt: 'Termos de Serviço',
      ar: 'شروط الخدمة وسياسة الاستخدام',
    },
    lastUpdated: 'March 2026',
    sections: [
      {
        heading: {
          en: '1. Acceptance of Terms',
          es: '1. Aceptación de los Términos',
          fr: '1. Acceptation des Conditions',
          pt: '1. Aceitação dos Termos',
          ar: '1. قبول شروط الخدمة',
        },
        paragraphs: {
          en: [
            'By accessing and using GetVidX (the "Service"), you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website.',
            'GetVidX is an independent utility designed to allow users to parse and download publicly available media streams from Twitter / X for personal and fair-use archiving.',
          ],
          es: [
            'Al acceder y utilizar GetVidX (el "Servicio"), aceptas cumplir con estos Términos de Servicio. Si no estás de acuerdo con alguna parte, por favor no uses nuestro sitio.',
            'GetVidX es una utilidad independiente diseñada para facilitar la descarga de medios públicos de Twitter / X con fines de archivo personal y uso legítimo.',
          ],
          fr: [
            'En accédant et en utilisant GetVidX (le "Service"), vous acceptez de vous conformer aux présentes conditions. Si vous n’acceptez pas ces conditions, veuillez ne pas utiliser le site.',
            'GetVidX est un outil indépendant permettant de télécharger des flux multimédias publics depuis Twitter / X pour un usage personnel équitable.',
          ],
          pt: [
            'Ao acessar e utilizar o GetVidX (o "Serviço"), você concorda em cumprir estes Termos de Serviço. Caso não concorde, interrompa o uso do site.',
            'O GetVidX é um utilitário independente desenvolvido para salvar mídias públicas do Twitter / X para uso pessoal e arquivamento justo.',
          ],
          ar: [
            'بدخولك واستخدامك لموقع GetVidX (المشار إليه بـ "الخدمة")، فإنك تقر وتوافق على الالتزام الكامل بشروط الخدمة هذه. إذا كنت غير موافق على أي بند، يرجى التوقف عن استخدام الموقع فوراً.',
            'موقع GetVidX هو أداة تقنية مستقلة تتيح للمستخدمين استخراج وتحميل وسائط الفيديو العامة المتاحة على منصة تويتر / X للاستخدام الشخصي العادل والأرشفة الذاتية.',
          ],
        },
      },
      {
        heading: {
          en: '2. Permitted Use and Copyrights',
          es: '2. Uso Permitido y Derechos de Autor',
          fr: '2. Utilisation Autorisée et Droits d’Auteur',
          pt: '2. Uso Permitido e Direitos Autorais',
          ar: '2. الاستخدام المسموح به وحقوق الملكية',
        },
        paragraphs: {
          en: [
            'You agree to use GetVidX solely for non-commercial, personal purposes and in accordance with applicable copyright laws. You must respect the intellectual property rights of content owners.',
            'GetVidX does not grant any copyright license to the downloaded videos. You are solely responsible for ensuring you have legitimate rights or fair use justification to save any content.',
          ],
          es: [
            'Aceptas utilizar GetVidX únicamente con fines personales no comerciales y conforme a las leyes de propiedad intelectual vigentes.',
            'GetVidX no otorga ninguna licencia sobre los vídeos descargados. El usuario es responsable exclusivo de respetar los derechos de autor.',
          ],
          fr: [
            'Vous acceptez d’utiliser GetVidX uniquement à des fins personnelles et non commerciales, dans le respect des lois sur le droit d’auteur.',
            'GetVidX ne confère aucune licence de droit d’auteur. Vous êtes seul responsable du respect des droits des créateurs originaux.',
          ],
          pt: [
            'Você concorda em usar o GetVidX exclusivamente para fins pessoais e não comerciais, respeitando a legislação de direitos autorais.',
            'O GetVidX não concede nenhuma licença sobre os conteúdos baixados. O usuário é o único responsável pelo uso adequado da mídia.',
          ],
          ar: [
            'توافق بموجب هذه الشروط على استخدام GetVidX للأغراض الشخصية غير التجارية فقط، وبما يتوافق مع القوانين والأنظمة المعمول بها لحماية حقوق النشر والتأليف.',
            'لا يمنح GetVidX أي حقوق ملكية فكرية أو تراخيص للمقاطع التي يتم تنزيلها. تقع على عاتق المستخدم وحده مسؤولية التأكد من مشروعية حفظ واستخدام أي محتوى.',
          ],
        },
      },
      {
        heading: {
          en: '3. Disclaimer of Warranties and Limitation of Liability',
          es: '3. Exclusión de Garantías y Limitación de Responsabilidad',
          fr: '3. Exclusion de Garanties et Limitation de Responsabilité',
          pt: '3. Isenção de Garantias e Limitação de Responsabilidade',
          ar: '3. إخلاء المسؤولية وحدود الضمانات',
        },
        paragraphs: {
          en: [
            'The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee uninterrupted availability, error-free operation, or that Twitter / X links will always be resolvable.',
            'GetVidX is not affiliated with, endorsed by, or sponsored by Twitter, Inc., X Corp, or any of their affiliates.',
          ],
          es: [
            'El Servicio se proporciona "tal cual" y según disponibilidad. No garantizamos un funcionamiento ininterrumpido ni la disponibilidad permanente de los enlaces.',
            'GetVidX no está afiliado, respaldado ni patrocinado por Twitter, Inc. ni por X Corp.',
          ],
          fr: [
            'Le Service est fourni "en l’état" sans garantie d’aucune sorte. Nous ne garantissons pas la disponibilité continue des flux Twitter.',
            'GetVidX n’est en aucun cas affilié ou approuvé par Twitter, Inc. ou X Corp.',
          ],
          pt: [
            'O Serviço é fornecido "no estado em que se encontra", sem garantias de qualquer natureza. Não garantimos disponibilidade contínua.',
            'O GetVidX não possui vínculo oficial, afiliação ou endosso do Twitter, Inc. ou X Corp.',
          ],
          ar: [
            'تُقدم الخدمة "كما هي" وبحسب التوفر دون أي ضمانات صريحة أو ضمنية. نحن لا نضمن عمل الخدمة بشكل متواصل دون انقطاع نظراً للتغيرات التقنية المستمرة في خوادم تويتر.',
            'موقع GetVidX ليس تابعاً أو مدعوماً أو معتمداً من شركة Twitter, Inc أو X Corp أو أي من الشركات التابعة لهما.',
          ],
        },
      },
    ],
  },

  privacy: {
    slug: 'privacy',
    title: {
      en: 'Privacy Policy - GetVidX',
      es: 'Política de Privacidad - GetVidX',
      fr: 'Politique de Confidentialité - GetVidX',
      pt: 'Política de Privacidade - GetVidX',
      ar: 'سياسة الخصوصية وحماية البيانات - GetVidX',
    },
    h1: {
      en: 'Privacy Policy',
      es: 'Política de Privacidad',
      fr: 'Politique de Confidentialité',
      pt: 'Política de Privacidade',
      ar: 'سياسة الخصوصية وحماية البيانات',
    },
    lastUpdated: 'March 2026',
    sections: [
      {
        heading: {
          en: '1. Zero File Storage Principle',
          es: '1. Principio de Cero Almacenamiento',
          fr: '1. Principe de Zéro Stockage',
          pt: '1. Princípio de Armazenamento Zero',
          ar: '1. مبدأ انعدام التخزين (Zero Storage)',
        },
        paragraphs: {
          en: [
            'At GetVidX, user privacy is paramount. We do not store, archive, or retain any videos, audio tracks, or images processed through our service. All media is retrieved on-the-fly directly from Twitter official Content Delivery Network (CDN) servers.',
            'Once you download your file or close the browser window, the temporary processing reference is immediately discarded.',
          ],
          es: [
            'En GetVidX, la privacidad es prioritaria. No almacenamos, guardamos ni retenemos ningún archivo de vídeo o audio procesado. Toda la información procede de la CDN oficial de Twitter.',
            'Una vez completada la descarga o cerrada la ventana del navegador, los datos temporales se descartan inmediatamente.',
          ],
          fr: [
            'La confidentialité de nos utilisateurs est absolue. Nous ne conservons ni n’hébergeons aucune vidéo ou extrait audio. Tout transite directement par le CDN officiel de Twitter.',
            'Une fois le téléchargement terminé ou la page fermée, aucune trace de fichier n’est conservée.',
          ],
          pt: [
            'No GetVidX, a privacidade é fundamental. Não armazenamos, hospedamos ou salvamos qualquer vídeo ou áudio processado no serviço.',
            'Assim que o download é concluído ou a página fechada, qualquer referência temporária é eliminada.',
          ],
          ar: [
            'نضع خصوصية المستخدمين في صدارة أولوياتنا. نحن لا نقوم بتخزين أو استضافة أو أرشفة أي مقاطع فيديو أو ملفات صوتية تمر عبر موقعنا نهائياً. يتم سحب الوسائط مباشرة من شبكات التوزيع الرسمية لخوادم تويتر.',
            'بمجرد اكتمال التنزيل أو إغلاقك لصفحة المتصفح، يتم التخلص فوراً من أي بيانات مؤقتة.',
          ],
        },
      },
      {
        heading: {
          en: '2. Information We Do NOT Collect',
          es: '2. Información que NO Recopilamos',
          fr: '2. Informations que nous NE collectons PAS',
          pt: '2. Informações que NÃO Coletamos',
          ar: '2. البيانات التي لا نجمعها مطلقاً',
        },
        paragraphs: {
          en: [
            'We do NOT require user account registration, email addresses, names, or passwords.',
            'We do NOT log your Twitter account credentials or private search history.',
            'We do NOT sell or share your personal data with third-party data brokers.',
          ],
          es: [
            'NO solicitamos registro de cuenta, correo electrónico, nombres ni contraseñas.',
            'NO registramos credenciales de tu cuenta de Twitter ni tu historial de búsqueda.',
            'NO comercializamos ni compartimos datos con intermediarios comerciales.',
          ],
          fr: [
            'Nous n’exigeons AUCUN compte utilisateur, ni adresse e-mail, ni mot de passe.',
            'Nous n’enregistrons PAS vos identifiants Twitter ni votre historique de recherche.',
            'Nous ne vendons AUCUNE donnée personnelle à des tiers.',
          ],
          pt: [
            'NÃO solicitamos cadastro, e-mail, nome ou senhas de usuários.',
            'NÃO registramos suas credenciais do Twitter nem seu histórico de buscas.',
            'NÃO vendemos nem compartilhamos informações com corretores de dados.',
          ],
          ar: [
            'لا نطلب نهائياً إنشاء حساب أو تسجيل دخول أو إدخال بريدك الإلكتروني أو بياناتك الشخصية.',
            'لا نقوم بتسجيل أو تتبع بيانات حسابك في تويتر أو سجل بحثك الخاص.',
            'لا نبيع أو نشارك أي بيانات للمستخدمين مع أطراف ثالثة أو شركات إعلانية متطفلة.',
          ],
        },
      },
      {
        heading: {
          en: '3. Cookies and Analytics',
          es: '3. Cookies y Métricas',
          fr: '3. Cookies et Statistiques',
          pt: '3. Cookies e Estatísticas',
          ar: '3. ملفات تعريف الارتباط (Cookies)',
        },
        paragraphs: {
          en: [
            'GetVidX uses minimal technical cookies strictly necessary for language preferences and service routing. Standard anonymous web traffic telemetry may be analyzed to safeguard service stability and prevent distributed denial-of-service abuse.',
          ],
          es: [
            'GetVidX utiliza únicamente cookies técnicas indispensables para recordar tu idioma y garantizar la estabilidad del servicio frente a abusos.',
          ],
          fr: [
            'GetVidX n’utilise que les cookies techniques strictement nécessaires au choix de langue et à la prévention des abus DDoS.',
          ],
          pt: [
            'O GetVidX utiliza apenas cookies técnicos necessários para preferências de idioma e prevenção de tráfego abusivo.',
          ],
          ar: [
            'يستخدم موقع GetVidX ملفات تعريف ارتباط فنية أساسية لحفظ اختيارك للغة وضمان استقرار وسرعة الخدمة ومكافحة هجمات حجب الخدمة الآلية.',
          ],
        },
      },
    ],
  },

  dmca: {
    slug: 'dmca',
    title: {
      en: 'DMCA & Copyright Policy - GetVidX',
      es: 'Política DMCA y Derechos de Autor - GetVidX',
      fr: 'Politique DMCA et Droits d’Auteur - GetVidX',
      pt: 'Política DMCA e Direitos Autorais - GetVidX',
      ar: 'حقوق الملكية الفكرية وسياسة DMCA - GetVidX',
    },
    h1: {
      en: 'DMCA & Copyright Policy',
      es: 'Política DMCA y Propiedad Intelectual',
      fr: 'Politique DMCA et Droits d’Auteur',
      pt: 'Política DMCA e Direitos Autorais',
      ar: 'حقوق الملكية الفكرية وسياسة إشعار DMCA',
    },
    lastUpdated: 'March 2026',
    sections: [
      {
        heading: {
          en: '1. Notice and Takedown Compliance',
          es: '1. Cumplimiento de Avisos de Retirada',
          fr: '1. Conformité aux Avis de Retrait',
          pt: '1. Conformidade com Notificações de Remoção',
          ar: '1. الامتثال لإشعارات إزالة المحتوى',
        },
        paragraphs: {
          en: [
            'GetVidX respects the intellectual property rights of copyright holders and complies with the Digital Millennium Copyright Act (17 U.S.C. § 512) and international copyright legislation.',
            'Because GetVidX does not host any media files and solely acts as a technical user-agent conduit to public Twitter CDN nodes, removing the video from Twitter / X immediately renders it unreachable on GetVidX.',
          ],
          es: [
            'GetVidX respeta la propiedad intelectual y cumple con la Digital Millennium Copyright Act (DMCA) y tratados internacionales.',
            'Dado que GetVidX no almacena ningún archivo multimedia en sus servidores, retirar el contenido de Twitter / X hace que resulte inaccesible de forma automática.',
          ],
          fr: [
            'GetVidX respecte les droits d’auteur et se conforme à la loi DMCA (Digital Millennium Copyright Act).',
            'Étant donné que GetVidX n’héberge aucun fichier vidéo, la suppression du contenu sur Twitter empêche immédiatement tout téléchargement via notre plateforme.',
          ],
          pt: [
            'O GetVidX respeita os direitos autorais e cumpre com a legislação DMCA e normas internacionais.',
            'Como o GetVidX não hospeda mídias em seus servidores, a remoção do tweet no X elimina automaticamente o acesso aos arquivos.',
          ],
          ar: [
            'يحترم موقع GetVidX حقوق الملكية الفكرية لأصحاب المحتوى ويلتزم ببنود قانون الألفية الرقمية لحقوق النشر (DMCA) والمعاهدات الدولية ذات الصلة.',
            'نظراً لأن GetVidX لا يستضيف أو يخزن أي ملفات وسائط على خوادمه الخاصة ويعمل فقط كأداة لاستخراج الروابط العامة من خوادم تويتر، فإن قيام صاحب الحقوق بحذف أو إبلاغ تويتر لحذف التغريدة الأصلية يمنع تنزيلها فوراً عبر موقعنا.',
          ],
        },
      },
      {
        heading: {
          en: '2. Submitting an Infringement Notice',
          es: '2. Envío de Notificaciones de Infracción',
          fr: '2. Signalement d’Infraction',
          pt: '2. Envio de Notificação de Infração',
          ar: '2. تقديم إشعار انتهاك حقوق الملكية',
        },
        paragraphs: {
          en: [
            'If you are a copyright owner or authorized agent wishing to restrict our platform from resolving links to your specific works, contact us with: (a) Identification of copyrighted work, (b) Exact tweet URLs, (c) Your contact info, and (d) A good-faith statement.',
            'Contact our designated copyright agent via email at: copyright@getvidx.com',
          ],
          es: [
            'Si eres titular de derechos y deseas bloquear el análisis de enlaces a tus obras, contáctanos indicando: (a) Identificación de la obra, (b) URLs exactas de los tweets, (c) Datos de contacto y (d) Declaración de buena fe.',
            'Escribe a nuestro responsable de derechos en: copyright@getvidx.com',
          ],
          fr: [
            'Si vous êtes titulaire de droits, contactez-nous avec : (a) Description de l’œuvre, (b) Liens exacts des tweets, (c) Vos coordonnées complètes et (d) Une déclaration sur l’honneur.',
            'Contactez notre agent désigné à : copyright@getvidx.com',
          ],
          pt: [
            'Para solicitar o bloqueio de links protegidos, envie: (a) Identificação da obra, (b) URLs exatas dos tweets, (c) Informações de contato e (d) Declaração de boa-fé.',
            'Envie sua solicitação para: copyright@getvidx.com',
          ],
          ar: [
            'إذا كنت صاحب حق ملكية وترغب في حظر فحص روابط لتغريدات معينة، يرجى تزويدنا بالتالي: (أ) وصف العمل المحمي، (ب) روابط التغريدات الدقيقة، (ج) بيانات التواصل الرسمية، (د) إقرار بحسن النية.',
            'يمكنك التواصل مع فريق مراجعة حقوق الملكية عبر البريد الإلكتروني: copyright@getvidx.com',
          ],
        },
      },
    ],
  },

  about: {
    slug: 'about',
    title: {
      en: 'About GetVidX - High-Speed Media Retriever',
      es: 'Acerca de GetVidX - Extractor Multimedia de Alta Velocidad',
      fr: 'À Propos de GetVidX - Téléchargeur Haute Vitesse',
      pt: 'Sobre o GetVidX - Extrator de Mídia em Alta Velocidade',
      ar: 'عن موقع GetVidX - منصة استخراج وتحميل وسائط تويتر',
    },
    h1: {
      en: 'About GetVidX',
      es: 'Acerca de GetVidX',
      fr: 'À Propos de GetVidX',
      pt: 'Sobre o GetVidX',
      ar: 'عن موقع ومنصة GetVidX',
    },
    lastUpdated: 'March 2026',
    sections: [
      {
        heading: {
          en: 'Our Mission',
          es: 'Nuestra Misión',
          fr: 'Notre Mission',
          pt: 'Nossa Missão',
          ar: 'مهمتنا ورؤيتنا',
        },
        paragraphs: {
          en: [
            'GetVidX was founded with a singular focus: build the cleanest, fastest, and most honest media downloader for Twitter (X). We remove misleading popup ads, eliminate bloated server storage, and deliver direct media streams in under 1.5 seconds.',
            'We believe users deserve an easy way to save public educational clips, comedy memes, news updates, and music performances for offline viewing without requiring invasive software installations.',
          ],
          es: [
            'GetVidX nació con un objetivo claro: crear la herramienta más rápida, limpia y honesta para descargar medios de Twitter (X). Sin publicidad engañosa ni instalaciones complejas.',
            'Creemos que los usuarios merecen una forma directa de guardar vídeos formativos, noticias y memes para su visualización offline sin complicaciones.',
          ],
          fr: [
            'GetVidX a été créé avec un objectif : proposer le téléchargeur le plus rapide, propre et transparent pour Twitter (X), sans popups intrusifs ni logiciels encombrants.',
            'Nous offrons une solution simple pour sauvegarder vos contenus favoris pour une consultation hors ligne en toute liberté.',
          ],
          pt: [
            'O GetVidX foi desenvolvido com um propósito simples: ser a ferramenta mais rápida, limpa e confiável para salvar mídias do Twitter (X).',
            'Acreditamos que você merece guardar vídeos educativos, notícias e memes para assistir offline sem complicações nem aplicativos invasivos.',
          ],
          ar: [
            'تأسس موقع GetVidX بهدف محدد ورئيسي: بناء الأداة الأسرع والأكثر نقاءً ومصداقية لتحميل وسائط تويتر / X. نحن نرفض النوافذ المنبثقة الخادعة، ولا نقوم بتخزين ملفات المستخدمين، ونقدم الروابط المباشرة في أقل من 1.5 ثانية.',
            'نؤمن بأن لكل مستخدم الحق في حفظ المقاطع التعليمية، الأخبار، والمقاطع الترفيهية المفضلة لمشاهدتها في أي وقت دون اتصال بالإنترنت ودون الحاجة لتثبيت برامج ثقيلة.',
          ],
        },
      },
    ],
  },

  contact: {
    slug: 'contact',
    title: {
      en: 'Contact Us - GetVidX Support & Inquiries',
      es: 'Contacto - Soporte y Consultas GetVidX',
      fr: 'Contactez-nous - Support GetVidX',
      pt: 'Contato - Suporte e Dúvidas GetVidX',
      ar: 'اتصل بنا - الدعم الفني والاستفسارات - GetVidX',
    },
    h1: {
      en: 'Contact Us',
      es: 'Contacto',
      fr: 'Contactez-nous',
      pt: 'Entre em Contato',
      ar: 'اتصل بنا ومركز الدعم الفني',
    },
    lastUpdated: 'March 2026',
    sections: [
      {
        heading: {
          en: 'Get in Touch',
          es: 'Ponte en Contacto',
          fr: 'Nous Joindre',
          pt: 'Fale Conosco',
          ar: 'تواصل مع فريق الدعم',
        },
        paragraphs: {
          en: [
            'Have questions, feedback, or need technical assistance with a tweet link? Our team is available to assist you.',
            'Official Email: support@getvidx.com',
            'Business Hours: Monday – Friday, 09:00 - 18:00 UTC. We strive to respond to all inquiries within 24 to 48 hours.',
          ],
          es: [
            '¿Tienes dudas, sugerencias o problemas técnicos con un enlace? Nuestro equipo está a tu disposición.',
            'Correo electrónico oficial: support@getvidx.com',
            'Horario de atención: Lunes a viernes de 09:00 a 18:00 UTC. Respondemos habitualmente en un plazo de 24 a 48 horas.',
          ],
          fr: [
            'Vous avez une question, une suggestion ou un problème technique avec un lien ? Notre équipe est à votre écoute.',
            'Courriel officiel : support@getvidx.com',
            'Horaires : du lundi au vendredi, 09h00 - 18h00 UTC. Réponse sous 24 à 48 heures.',
          ],
          pt: [
            'Tem dúvidas, sugestões ou encontrou problemas com algum link? Nossa equipe está pronta para ajudar.',
            'E-mail oficial: support@getvidx.com',
            'Horário de atendimento: Segunda a sexta, 09:00 às 18:00 UTC. Respondemos em até 24 a 48 horas.',
          ],
          ar: [
            'هل لديك أي استفسار أو اقتراح أو تواجه صعوبة في فحص رابط تغريدة معينة؟ فريقنا مستعد دائماً لتقديم المساعدة.',
            'البريد الإلكتروني الرسمي للدعم: support@getvidx.com',
            'ساعات العمل: من الاثنين إلى الجمعة، 09:00 - 18:00 بتوقيت غرينتش (UTC). نحرص على الرد على كافة الرسائل في غضون 24 إلى 48 ساعة.',
          ],
        },
      },
    ],
  },
};

```

# src\data\pseoPages.ts

```ts
import { SupportedLocale } from '../i18n/types';

export interface PseoPageData {
  id: string;
  slug: string;
  category: 'format' | 'device' | 'guide';
  title: Record<SupportedLocale, string>;
  metaDescription: Record<SupportedLocale, string>;
  h1: Record<SupportedLocale, string>;
  intro: Record<SupportedLocale, string>;
  keyPoints: Record<SupportedLocale, string[]>;
  stepsTitle: Record<SupportedLocale, string>;
  steps: Record<SupportedLocale, { step: string; detail: string }[]>;
  technicalNotes: Record<SupportedLocale, string>;
  relatedSlugs: string[];
}

export const PSEO_PAGES: PseoPageData[] = [
  {
    id: 'hd-video',
    slug: 'twitter-video-download-hd',
    category: 'format',
    title: {
      en: 'Twitter Video Download HD (1080p & 720p) - GetVidX',
      es: 'Descargar Vídeos de Twitter en HD (1080p y 720p) - GetVidX',
      fr: 'Télécharger Vidéo Twitter HD (1080p et 720p) - GetVidX',
      pt: 'Baixar Vídeo do Twitter em HD (1080p e 720p) - GetVidX',
      ar: 'تحميل فيديو تويتر بجودة عالية HD و 1080p - GetVidX',
    },
    metaDescription: {
      en: 'Download Twitter (X) videos in genuine Full HD 1080p and 720p resolution with maximum bitrate. Free, instant, zero compression loss on GetVidX.',
      es: 'Descarga vídeos de Twitter (X) en auténtica resolución Full HD 1080p y 720p con la tasa de bits más alta. Gratis, rápido y sin pérdida.',
      fr: 'Téléchargez des vidéos Twitter (X) en véritable Full HD 1080p et 720p avec le débit binaire maximal. Rapide, gratuit et sans perte.',
      pt: 'Baixe vídeos do Twitter (X) em Full HD 1080p e 720p com a maior taxa de bits original. Grátis, rápido e sem compressão artificial.',
      ar: 'قم بتنزيل مقاطع فيديو تويتر (X) بدقة Full HD 1080p و 720p الأصلية بأعلى معدل بت ممكن وبدون فقدان للجودة عبر موقع GetVidX.',
    },
    h1: {
      en: 'Download Twitter Videos in Crisp 1080p Full HD',
      es: 'Descargar Vídeos de Twitter en Alta Definición 1080p Full HD',
      fr: 'Télécharger des Vidéos Twitter en Haute Définition 1080p Full HD',
      pt: 'Baixar Vídeos do Twitter em Alta Resolução 1080p Full HD',
      ar: 'تحميل فيديوهات تويتر بأعلى جودة Full HD 1080p',
    },
    intro: {
      en: 'GetVidX automatically inspects all video bitrate streams encoded by X (Twitter) servers and extracts the highest possible resolution available for the target tweet, up to 1920x1080 at high bitrate.',
      es: 'GetVidX examina automáticamente todas las transmisiones de vídeo generadas por los servidores de X (Twitter) y extrae la resolución más alta disponible, hasta 1920x1080.',
      fr: 'GetVidX analyse automatiquement les flux de streaming encodés par Twitter et extrait la résolution la plus élevée disponible, jusqu’à 1920x1080.',
      pt: 'O GetVidX analisa automaticamente os fluxos de vídeo dos servidores do Twitter (X) e entrega a resolução mais alta disponibilizada, de até 1920x1080.',
      ar: 'يقوم GetVidX بفحص مسارات البث المشفرة على خوادم منصة X (تويتر) واستخراج أعلى دقة متاحة للتغريدة تلقائياً بدقة تصل إلى 1920x1080 مع المحافظة على معدل الإطارات.',
    },
    keyPoints: {
      en: [
        'Direct extraction from video.twimg.com official CDN servers',
        'Preserves original H.264 / AAC compression without re-encoding artifacts',
        'Supports high-frame-rate 60 FPS clips uploaded by Premium creators',
        'Zero watermark, zero banner overlays, clean original file',
      ],
      es: [
        'Extracción directa desde los servidores CDN oficiales de Twitter',
        'Conserva la compresión nativa H.264 / AAC sin artefactos de re-codificación',
        'Soporta clips a 60 FPS subidos por cuentas con X Premium',
        'Sin marcas de agua ni logotipos superpuestos, archivo 100% limpio',
      ],
      fr: [
        'Extraction directe depuis les serveurs CDN officiels de Twitter',
        'Conserve la compression native H.264 / AAC sans perte de qualité',
        'Prend en charge les vidéos fluides à 60 images par seconde',
        'Sans filigrane, sans bannières publicitaires ajoutées',
      ],
      pt: [
        'Extração direta dos servidores CDN oficiais do Twitter',
        'Mantém a codificação H.264 / AAC nativa sem recodificar o vídeo',
        'Suporte a vídeos em 60 quadros por segundo com fluidez total',
        'Sem marcas d’água, sem anúncios embutidos, arquivo original limpo',
      ],
      ar: [
        'استخراج مباشر من خوادم شبكة التوزيع الرسمية video.twimg.com بدون وسيط',
        'الحفاظ على ترميز H.264 / AAC الأصلي دون أي ضغط إضافي أو تشويش',
        'دعم المقاطع ذات معدل الإطارات العالي 60 إطاراً في الثانية',
        'ملف خام نقي بدون أي علامات مائية أو شعارات مضافة',
      ],
    },
    stepsTitle: {
      en: 'How to Download HD Twitter Videos',
      es: 'Cómo descargar vídeos de Twitter en HD',
      fr: 'Comment télécharger des vidéos Twitter en HD',
      pt: 'Como baixar vídeos do Twitter em HD',
      ar: 'خطوات تحميل فيديو تويتر بجودة HD',
    },
    steps: {
      en: [
        { step: '1. Copy Link', detail: 'Locate the HD post on X/Twitter and copy the URL from the Share menu.' },
        { step: '2. Paste in GetVidX', detail: 'Paste the link into the field above and click the Download button.' },
        { step: '3. Pick 1080p / 720p', detail: 'Select the 1080p Full HD stream and save the MP4 to your device.' },
      ],
      es: [
        { step: '1. Copiar Enlace', detail: 'Localiza la publicación en X/Twitter y copia el enlace desde Compartir.' },
        { step: '2. Pegar en GetVidX', detail: 'Pega el enlace en la caja superior y haz clic en Descargar.' },
        { step: '3. Elegir 1080p / 720p', detail: 'Elige la opción 1080p y guarda el archivo MP4 en tu dispositivo.' },
      ],
      fr: [
        { step: '1. Copier le lien', detail: 'Repérez la publication HD sur Twitter et copiez son URL.' },
        { step: '2. Coller dans GetVidX', detail: 'Collez le lien ci-dessus et cliquez sur Télécharger.' },
        { step: '3. Choisir 1080p / 720p', detail: 'Sélectionnez le flux 1080p pour enregistrer la vidéo MP4.' },
      ],
      pt: [
        { step: '1. Copiar Link', detail: 'Localize o tweet em HD e copie o link no menu de compartilhamento.' },
        { step: '2. Colar no GetVidX', detail: 'Cole o link no campo acima e clique no botão Baixar.' },
        { step: '3. Escolher 1080p / 720p', detail: 'Selecione a versão 1080p e salve o arquivo MP4 diretamente.' },
      ],
      ar: [
        { step: '1. انسخ الرابط', detail: 'توجه إلى التغريدة عالية الدقة في تطبيق أو موقع X وانسخ الرابط من خيار المشاركة.' },
        { step: '2. الصق في GetVidX', detail: 'الصق الرابط في المربع المخصص بالأعلى واضغط على زر التحميل للتحليل.' },
        { step: '3. اختر 1080p واحفظ', detail: 'اختر جودة 1080p Full HD وانقر على تحميل لحفظ ملف MP4 على جهازك فوراً.' },
      ],
    },
    technicalNotes: {
      en: 'Note on quality: If the original author uploaded a 720p or 480p file, Twitter will not produce a 1080p stream. GetVidX will always present the maximum resolution actually made available by Twitter.',
      es: 'Nota técnica: Si el vídeo original se subió en 720p o 480p, Twitter no creará una versión 1080p. GetVidX siempre te ofrecerá la resolución máxima real que exista.',
      fr: 'Remarque technique : Si la vidéo d’origine a été mise en ligne en 720p, Twitter ne produira pas de version 1080p. GetVidX affiche toujours la meilleure qualité disponible.',
      pt: 'Nota técnica: Se o vídeo original foi publicado em 720p ou 480p, o Twitter não gera versão 1080p. O GetVidX entrega a resolução máxima real disponibilizada.',
      ar: 'ملاحظة تقنية: إذا قام الناشر برفع الفيديو بدقة 720p أو أقل، فإن خوادم تويتر لا تنشئ نسخة 1080p. يقدم لك GetVidX دائماً أعلى دقة فعلية أنتجها خادم تويتر.',
    },
    relatedSlugs: ['twitter-to-mp4', 'download-x-videos', 'troubleshooting-twitter-video-downloads'],
  },

  {
    id: 'mp4-converter',
    slug: 'twitter-to-mp4',
    category: 'format',
    title: {
      en: 'Twitter to MP4 Converter - Save X Videos in MP4 - GetVidX',
      es: 'Convertidor de Twitter a MP4 - Guardar Vídeos de X - GetVidX',
      fr: 'Convertisseur Twitter en MP4 - Enregistrer Vidéos X - GetVidX',
      pt: 'Conversor de Twitter para MP4 - Salvar Vídeos do X - GetVidX',
      ar: 'تحويل فيديو تويتر إلى MP4 - تنزيل مقاطع X بصيغة MP4 - GetVidX',
    },
    metaDescription: {
      en: 'Convert Twitter and X video links to standard MP4 format playable on any computer, TV, iPhone, or Android device. Fast, free, browser-based.',
      es: 'Convierte enlaces de vídeo de Twitter y X al formato universal MP4, compatible con PC, Mac, Smart TV, iPhone y Android. Rápido y gratis.',
      fr: 'Convertissez des liens vidéo Twitter et X au format standard MP4 compatible avec tous vos appareils : Mac, PC, TV, iPhone, Android.',
      pt: 'Converta links de vídeo do Twitter e X em formato universal MP4 compatível com qualquer computador, TV, iPhone ou Android.',
      ar: 'تحويل روابط منشورات تويتر و X إلى صيغة MP4 القياسية المتوافقة مع جميع مشغلات الفيديو والشاشات الذكية وهواتف آيفون وأندرويد مجاناً.',
    },
    h1: {
      en: 'Twitter to MP4 Online Converter',
      es: 'Convertidor de Twitter a MP4 Online',
      fr: 'Convertisseur Twitter en MP4 en ligne',
      pt: 'Conversor de Twitter para MP4 Online',
      ar: 'تحويل وتنزيل فيديو تويتر بصيغة MP4 القياسية',
    },
    intro: {
      en: 'MP4 is the most versatile video container format in the world. GetVidX extracts the native MP4 stream from public tweets so you can edit, watch offline, or share seamlessly across platforms.',
      es: 'El formato MP4 es el contenedor multimedia más versátil del mundo. GetVidX extrae la pista nativa MP4 de tweets públicos para editar o ver sin conexión.',
      fr: 'Le format MP4 est le format vidéo le plus universel. GetVidX extrait le flux MP4 natif des tweets publics pour une lecture hors ligne facile.',
      pt: 'O formato MP4 é o mais compatível do mundo. O GetVidX extrai o arquivo MP4 nativo de tweets públicos para você assistir offline ou editar.',
      ar: 'تعد صيغة MP4 أكثر صيغ الفيديو توافقاً وانتشاراً في العالم. يتيح لك GetVidX استخراج مسار MP4 النقي من التغريدات العامة لمشاهدته دون اتصال أو تعديله في برامج المونتاج.',
    },
    keyPoints: {
      en: [
        'Universal compatibility with QuickTime, Windows Media Player, VLC, Premiere, and Final Cut',
        'Standard H.264 video codec with AAC stereo audio',
        'No watermarks or quality degradation',
        'Direct download with proper .mp4 file extension',
      ],
      es: [
        'Compatibilidad universal con VLC, QuickTime, reproductores de TV y editores de vídeo',
        'Códec de vídeo estándar H.264 con audio estéreo AAC',
        'Sin marcas de agua ni compresión secundaria destructiva',
        'Descarga directa con extensión .mp4 reconocida por el sistema operativo',
      ],
      fr: [
        'Compatibilité universelle avec QuickTime, VLC, Windows Media et les logiciels de montage',
        'Codec vidéo standard H.264 avec audio stéréo AAC',
        'Sans filigrane et sans dégradation',
        'Téléchargement direct avec l’extension .mp4 valide',
      ],
      pt: [
        'Compatibilidade total com VLC, QuickTime, reprodutores de TV e editores de vídeo',
        'Codec H.264 padrão da indústria com áudio estéreo AAC',
        'Sem marcas d’água ou perda de fidelidade',
        'Download direto com extensão .mp4 reconhecida no sistema operacional',
      ],
      ar: [
        'توافق كامل مع مشغلات الوسائط QuickTime و VLC وبرامج المونتاج Premier و CapCut',
        'ترميز H.264 العالمي القياسي مع مسار صوتي ستيريو AAC نقي',
        'بدون أي علامات مائية أو تعديل على جودة الفيديو الأصلية',
        'تحميل مباشر بالامتداد الصحيح .mp4 للتشغيل الفوري على أي جهاز',
      ],
    },
    stepsTitle: {
      en: '3 Steps to Save Twitter as MP4',
      es: '3 pasos para guardar Twitter como MP4',
      fr: '3 étapes pour enregistrer Twitter en MP4',
      pt: '3 passos para salvar Twitter como MP4',
      ar: '3 خطوات لتحويل وحفظ فيديو تويتر بصيغة MP4',
    },
    steps: {
      en: [
        { step: '1. Copy Tweet URL', detail: 'Copy the tweet address from your browser bar or X app share button.' },
        { step: '2. Insert Link', detail: 'Paste it into the search box on GetVidX.' },
        { step: '3. Save MP4', detail: 'Click Download next to your preferred MP4 resolution.' },
      ],
      es: [
        { step: '1. Copiar Enlace', detail: 'Copia el enlace del tweet desde la app o tu navegador.' },
        { step: '2. Pegar en GetVidX', detail: 'Insértalo en la caja de búsqueda de GetVidX.' },
        { step: '3. Guardar MP4', detail: 'Haz clic en Descargar junto a la calidad MP4 deseada.' },
      ],
      fr: [
        { step: '1. Copier le lien', detail: 'Copiez l’adresse du tweet depuis le bouton Partager.' },
        { step: '2. Coller dans GetVidX', detail: 'Collez-la dans la barre de recherche GetVidX.' },
        { step: '3. Sauvegarder en MP4', detail: 'Cliquez sur Télécharger à côté de la résolution MP4 souhaitée.' },
      ],
      pt: [
        { step: '1. Copiar Link', detail: 'Copie o endereço da publicação através do botão de compartilhamento.' },
        { step: '2. Colar no GetVidX', detail: 'Cole no campo de busca do GetVidX.' },
        { step: '3. Salvar MP4', detail: 'Clique em Baixar ao lado da resolução MP4 preferida.' },
      ],
      ar: [
        { step: '1. انسخ رابط المنشور', detail: 'انسخ عنوان التغريدة من خيار المشاركة في تطبيق X أو من شريط المتصفح.' },
        { step: '2. الصق الرابط', detail: 'الصق الرابط في خانة البحث في GetVidX واضغط تحميل.' },
        { step: '3. احفظ ملف MP4', detail: 'انقر على زر تحميل MP4 بجوار الجودة التي تناسبك.' },
      ],
    },
    technicalNotes: {
      en: 'Twitter uses variable bitrate (VBR) encoding. The estimated file size may vary slightly based on video complexity and length.',
      es: 'Twitter utiliza codificación con tasa de bits variable (VBR). El tamaño del archivo puede variar levemente según la duración y el movimiento del vídeo.',
      fr: 'Twitter utilise un encodage à débit variable (VBR). La taille du fichier peut légèrement varier.',
      pt: 'O Twitter utiliza taxa de bits variável (VBR). O tamanho do arquivo pode variar ligeiramente de acordo com a movimentação da imagem.',
      ar: 'تستخدم خوادم تويتر معدل بت متغير (VBR) في الترميز، لذلك قد يختلف حجم الملف الفعلي بشكل طفيف بناءً على سرعة وحركة المشاهد في المقطع.',
    },
    relatedSlugs: ['twitter-video-download-hd', 'twitter-to-mp3', 'twitter-gif-downloader'],
  },

  {
    id: 'mp3-audio',
    slug: 'twitter-to-mp3',
    category: 'format',
    title: {
      en: 'Twitter to MP3 - Extract Audio from Twitter Videos - GetVidX',
      es: 'Twitter a MP3 - Extraer Audio de Vídeos de Twitter - GetVidX',
      fr: 'Twitter en MP3 - Extraire l’audio des vidéos Twitter - GetVidX',
      pt: 'Twitter para MP3 - Extrair Áudio de Vídeos do Twitter - GetVidX',
      ar: 'تحويل فيديو تويتر إلى MP3 - استخراج الصوت من مقاطع X - GetVidX',
    },
    metaDescription: {
      en: 'Extract MP3 audio from any Twitter / X video or audio clip online. Save speeches, podcasts, music, and interviews in clear MP3 sound.',
      es: 'Extrae audio MP3 de cualquier vídeo o clip de Twitter / X online. Guarda discursos, podcasts, música y entrevistas con audio limpio.',
      fr: 'Extrayez l’audio MP3 de n’importe quelle vidéo Twitter / X en ligne. Enregistrez discours, podcasts et musique en son clair.',
      pt: 'Extraia áudio MP3 de qualquer vídeo ou tweet do Twitter / X online. Salve podcasts, músicas e palestras em áudio limpo.',
      ar: 'استخرج الصوت بصيغة MP3 من أي مقطع فيديو أو تغريدة على منصة X. احفظ البودكاست والمقاطع الصوتية والموسيقى بنقاء استثنائي مجاناً.',
    },
    h1: {
      en: 'Twitter to MP3 Audio Extractor',
      es: 'Extractor de Audio de Twitter a MP3',
      fr: 'Extracteur Audio Twitter en MP3',
      pt: 'Extrator de Áudio do Twitter para MP3',
      ar: 'استخراج الصوت من فيديو تويتر بصيغة MP3',
    },
    intro: {
      en: 'Many Twitter videos feature incredible music performances, speeches, interviews, or podcasts where only the sound is needed. GetVidX allows you to isolate and download the audio track as an MP3 file.',
      es: 'Muchas publicaciones de Twitter contienen conciertos, entrevistas o podcasts donde solo necesitas el audio. GetVidX te permite aislar y guardar la pista sonora en MP3.',
      fr: 'De nombreuses vidéos Twitter contiennent des discours, interviews ou morceaux de musique. GetVidX vous permet d’isoler la piste audio en format MP3.',
      pt: 'Muitos tweets possuem músicas, discursos ou podcasts onde você só quer ouvir o áudio. O GetVidX permite extrair a trilha sonora em formato MP3.',
      ar: 'تحتوي العديد من تغريدات تويتر على مقاطع موسيقية مميزة، أو خطابات، أو حوارات بودكاست حيث تحتاج لسماع الصوت فقط. يتيح لك GetVidX عزل المسار الصوتي وتحميله بصيغة MP3 مباشرة.',
    },
    keyPoints: {
      en: [
        'Lightweight file size compared to full video downloads',
        'Ideal for offline listening during commutes, workouts, or travel',
        'Works with standard audio players on iOS, Android, macOS, and Windows',
        'Fast stream separation directly in your browser',
      ],
      es: [
        'Tamaño de archivo reducido comparado con un vídeo completo',
        'Ideal para escuchar sin conexión mientras haces deporte o viajas',
        'Compatible con cualquier reproductor de música en móviles y computadoras',
        'Separación de audio rápida y sin pérdida de claridad sonora',
      ],
      fr: [
        'Fichier beaucoup plus léger qu’une vidéo complète',
        'Idéal pour une écoute hors ligne pendant vos déplacements ou vos séances de sport',
        'Compatible avec tous les lecteurs multimédias sur smartphone et ordinateur',
        'Extraction audio rapide et fidèle',
      ],
      pt: [
        'Arquivo muito mais leve do que um vídeo completo',
        'Perfeito para ouvir offline durante viagens, caminhadas ou treinos',
        'Funciona em qualquer reprodutor de áudio no celular e computador',
        'Extração rápida sem perda de qualidade auditiva',
      ],
      ar: [
        'حجم ملف صغير جداً وموفر لبيانات الإنترنت مقارنة بتحميل الفيديو بالكامل',
        'مثالي للاستماع دون اتصال أثناء ممارسة الرياضة، القيادة أو السفر',
        'يعمل بسلاسة على كافة مشغلات الصوت في هواتف آيفون وأندرويد وأجهزة الكمبيوتر',
        'استخلاص فوري للمسار الصوتي بنقاء استريو فائق',
      ],
    },
    stepsTitle: {
      en: 'How to Extract MP3 Audio',
      es: 'Cómo extraer audio MP3 de Twitter',
      fr: 'Comment extraire l’audio MP3',
      pt: 'Como extrair áudio MP3 do Twitter',
      ar: 'طريقة استخراج صوت MP3 من تويتر',
    },
    steps: {
      en: [
        { step: '1. Paste Post URL', detail: 'Paste the tweet link containing the video into the GetVidX input.' },
        { step: '2. Click Download', detail: 'Press Download to let our tool analyze the video and audio tracks.' },
        { step: '3. Choose MP3 Audio', detail: 'Click "Download Audio (MP3)" in the results list to save the audio track.' },
      ],
      es: [
        { step: '1. Pegar Enlace', detail: 'Pega el enlace del tweet en la caja de GetVidX.' },
        { step: '2. Analizar', detail: 'Pulsa Descargar para que analicemos las pistas de vídeo y audio.' },
        { step: '3. Elegir Audio MP3', detail: 'Haz clic en "Descargar Audio (MP3)" en la lista de opciones.' },
      ],
      fr: [
        { step: '1. Coller le lien', detail: 'Collez le lien du tweet dans la barre de saisie GetVidX.' },
        { step: '2. Analyser', detail: 'Cliquez sur Télécharger pour charger les flux vidéo et audio.' },
        { step: '3. Choisir Audio MP3', detail: 'Cliquez sur "Télécharger Audio (MP3)" pour enregistrer le son.' },
      ],
      pt: [
        { step: '1. Colar Link', detail: 'Cole o link do tweet no campo do GetVidX.' },
        { step: '2. Analisar', detail: 'Clique em Baixar para verificar as faixas de mídia.' },
        { step: '3. Baixar MP3', detail: 'Clique em "Baixar Áudio (MP3)" para salvar a música ou fala.' },
      ],
      ar: [
        { step: '1. الصق الرابط', detail: 'ضع رابط التغريدة في حقل الإدخال أعلى الصفحة في موقع GetVidX.' },
        { step: '2. اضغط تحميل', detail: 'انقر على زر التحميل ليقوم النظام بفصل مسارات الفيديو والصوت.' },
        { step: '3. اختر MP3', detail: 'انقر على زر "تحميل الصوت (MP3)" في قائمة النتائج لحفظ الملف الصوتي فوراً.' },
      ],
    },
    technicalNotes: {
      en: 'Videos that were originally uploaded as silent GIFs or without audio tracks will not produce an audible MP3 stream.',
      es: 'Los vídeos subidos como GIFs mudos o sin pista de audio no contendrán sonido en el archivo MP3.',
      fr: 'Les vidéos publiées sous forme de GIF muet ou sans piste sonore ne produiront aucun son.',
      pt: 'Vídeos postados originalmente como GIFs mudos ou sem canal de áudio não terão som no MP3.',
      ar: 'المقاطع التي تم رفعها كصور متحركة صامتة (GIF) أو بدون مسار صوتي لن تنتج أي ملف صوتي مسموع.',
    },
    relatedSlugs: ['twitter-to-mp4', 'twitter-video-download-hd', 'twitter-gif-downloader'],
  },

  {
    id: 'twitter-gif',
    slug: 'twitter-gif-downloader',
    category: 'format',
    title: {
      en: 'Twitter GIF Downloader - Save X GIFs as MP4 or GIF - GetVidX',
      es: 'Descargador de GIF de Twitter - Guardar GIFs de X - GetVidX',
      fr: 'Téléchargeur de GIF Twitter - Enregistrer GIFs X - GetVidX',
      pt: 'Baixador de GIF do Twitter - Salvar GIFs do X - GetVidX',
      ar: 'تحميل صور GIF من تويتر - تنزيل صور متحركة من X بصيغة MP4 - GetVidX',
    },
    metaDescription: {
      en: 'Save animated GIFs from Twitter / X as lightweight MP4 loops or native GIF animations. Free, fast, works on all mobile and desktop browsers.',
      es: 'Guarda GIFs animados de Twitter / X en bucles MP4 ligeros o archivos GIF. Rápido, gratis y compatible con cualquier navegador.',
      fr: 'Téléchargez les GIF animés de Twitter / X en vidéos MP4 légères ou GIF. Rapide, gratuit, compatible mobile et PC.',
      pt: 'Baixe GIFs animados do Twitter / X como vídeos MP4 em looping leve ou GIF tradicional. Grátis e rápido.',
      ar: 'تنزيل صور GIF المتحركة من تويتر ومنصة X وحفظها كملفات فيديو MP4 خفيفة تتكرر تلقائياً أو صور GIF أصلية بدون علامات مائية وبأعلى سرعة.',
    },
    h1: {
      en: 'Twitter GIF Downloader & Loop Converter',
      es: 'Descargador y Convertidor de GIF de Twitter',
      fr: 'Téléchargeur et Convertisseur de GIF Twitter',
      pt: 'Baixador e Conversor de GIF do Twitter',
      ar: 'تحميل الصور المتحركة GIF من منصة تويتر / X',
    },
    intro: {
      en: 'Did you know Twitter actually converts uploaded GIFs into looped MP4 video files to reduce bandwidth? GetVidX lets you download the exact high-efficiency MP4 stream or save it for Discord, WhatsApp, and Telegram.',
      es: '¿Sabías que Twitter convierte los GIFs en vídeos MP4 en bucle para ahorrar datos? GetVidX te permite descargar el archivo optimizado para compartir en WhatsApp y Telegram.',
      fr: 'Saviez-vous que Twitter convertit les GIF en vidéos MP4 pour économiser la bande passante ? GetVidX vous permet d’enregistrer le fichier directement.',
      pt: 'Você sabia que o Twitter converte GIFs em arquivos MP4 em looping para economizar dados? O GetVidX permite baixar o arquivo pronto para redes sociais.',
      ar: 'هل تعلم أن منصة تويتر تحول صور GIF المرفوعة إلى مقاطع فيديو MP4 تتكرر تلقائياً لتقليل استهلاك البيانات؟ يتيح لك GetVidX تنزيل هذا الملف الأصلي بدقة عالية لمشاركته في واتساب وتيليغرام.',
    },
    keyPoints: {
      en: [
        'True animated loop preservation',
        'Optimized MP4 file size (typically under 2 MB)',
        'Instant playback in iMessage, WhatsApp, Slack, and Discord',
        'High frame rate and smooth transitions',
      ],
      es: [
        'Mantiene el bucle infinito de la animación original',
        'Tamaño de archivo ultra ligero (habitualmente menor a 2 MB)',
        'Listo para compartir en WhatsApp, Telegram, Slack y Discord',
        'Movimiento fluido sin saltos de fotogramas',
      ],
      fr: [
        'Préservation de la boucle d’animation infinie',
        'Taille ultra légère (souvent moins de 2 Mo)',
        'Prêt pour le partage sur WhatsApp, Discord, Slack et iMessage',
        'Fluidité totale des mouvements',
      ],
      pt: [
        'Preservação do looping contínuo da animação',
        'Arquivo super leve (geralmente abaixo de 2 MB)',
        'Compatibilidade instantânea no WhatsApp, Telegram e Discord',
        'Transições de quadros perfeitas',
      ],
      ar: [
        'الحفاظ على خاصية التكرار اللانهائي للحركة بسلاسة تامة',
        'حجم ملف فائق الخفة (عادة أقل من 2 ميغابايت) وسريع الإرسال',
        'متوافق للمشاركة الفورية عبر واتساب وتيليغرام وديسكورد وتطبيقات المحادثة',
        'معدل إطارات سلس بدون أي تقطيع أو تشوه في الصورة',
      ],
    },
    stepsTitle: {
      en: 'How to Download a Twitter GIF',
      es: 'Cómo descargar un GIF de Twitter',
      fr: 'Comment télécharger un GIF Twitter',
      pt: 'Como baixar um GIF do Twitter',
      ar: 'خطوات تنزيل صورة GIF من تويتر',
    },
    steps: {
      en: [
        { step: '1. Copy GIF Link', detail: 'Right-click or tap Share on the GIF tweet and copy the link.' },
        { step: '2. Paste in GetVidX', detail: 'Enter the URL in our downloader tool.' },
        { step: '3. Save GIF / MP4', detail: 'Click Download on the resulting animated file.' },
      ],
      es: [
        { step: '1. Copiar Enlace', detail: 'Haz clic derecho o pulsa Compartir en el GIF y copia el enlace.' },
        { step: '2. Pegar en GetVidX', detail: 'Pega la URL en nuestra herramienta.' },
        { step: '3. Guardar', detail: 'Haz clic en Descargar en el archivo animado resultante.' },
      ],
      fr: [
        { step: '1. Copier le lien', detail: 'Cliquez sur Partager sur le GIF Twitter et copiez le lien.' },
        { step: '2. Coller dans GetVidX', detail: 'Collez l’adresse dans notre outil.' },
        { step: '3. Télécharger', detail: 'Cliquez sur Télécharger pour sauvegarder l’animation.' },
      ],
      pt: [
        { step: '1. Copiar Link', detail: 'Clique em Compartilhar no tweet do GIF e copie a URL.' },
        { step: '2. Colar no GetVidX', detail: 'Cole no campo de download do GetVidX.' },
        { step: '3. Salvar', detail: 'Clique em Baixar no arquivo de animação.' },
      ],
      ar: [
        { step: '1. انسخ رابط الـ GIF', detail: 'انقر على زر المشاركة أسفل التغريدة المتحركة واختر "نسخ الرابط".' },
        { step: '2. الصق في GetVidX', detail: 'ضع الرابط في صندوق التحميل واضغط تنزيل.' },
        { step: '3. احفظ الملف المتحرك', detail: 'انقر على زر تحميل لحفظ المقطع المتكرر فوراً.' },
      ],
    },
    technicalNotes: {
      en: 'Twitter GIFs do not have an audio track. Downloaded files are silent video loops.',
      es: 'Los GIFs de Twitter no poseen pista de audio, por lo que el archivo descargado será un vídeo mudo.',
      fr: 'Les GIF Twitter n’ont pas de bande son ; le fichier téléchargé est une vidéo muette en boucle.',
      pt: 'GIFs no Twitter não contêm áudio; o arquivo baixado é um vídeo mudo em repetição contínua.',
      ar: 'صور GIF في تويتر لا تحتوي على مسار صوتي، لذلك يكون الملف المحمّل عبارة عن فيديو متكرر بدون صوت.',
    },
    relatedSlugs: ['twitter-to-mp4', 'twitter-video-download-hd', 'troubleshooting-twitter-video-downloads'],
  },

  {
    id: 'iphone-guide',
    slug: 'how-to-download-twitter-videos-iphone',
    category: 'device',
    title: {
      en: 'How to Download Twitter Videos on iPhone & iPad - iOS Guide - GetVidX',
      es: 'Cómo Descargar Vídeos de Twitter en iPhone y iPad - Guía iOS - GetVidX',
      fr: 'Comment Télécharger des Vidéos Twitter sur iPhone & iPad - Guide iOS - GetVidX',
      pt: 'Como Baixar Vídeos do Twitter no iPhone e iPad - Guia iOS - GetVidX',
      ar: 'طريقة تحميل فيديو تويتر على آيفون وآيباد - دليل أجهزة iOS - GetVidX',
    },
    metaDescription: {
      en: 'Step-by-step guide to download Twitter (X) videos directly to your iPhone Camera Roll or Files app using Safari on iOS 13, 14, 15, 16, 17, and 18.',
      es: 'Guía paso a paso para descargar vídeos de Twitter en iPhone y iPad directamente al Carrete de Fotos usando Safari en iOS 13 o superior.',
      fr: 'Guide étape par étape pour télécharger des vidéos Twitter sur iPhone et iPad directement dans la Pellicule avec Safari.',
      pt: 'Guia passo a passo para baixar vídeos do Twitter no iPhone e iPad diretamente para a Galeria usando o Safari no iOS.',
      ar: 'دليل شامل خطوة بخطوة لتحميل مقاطع فيديو تويتر (X) على أجهزة آيفون وآيباد وحفظها مباشرة في تطبيق الصور (Camera Roll) عبر متصفح Safari.',
    },
    h1: {
      en: 'How to Download Twitter Videos on iPhone & iPad',
      es: 'Cómo Descargar Vídeos de Twitter en iPhone y iPad',
      fr: 'Comment Télécharger des Vidéos Twitter sur iPhone et iPad',
      pt: 'Como Baixar Vídeos do Twitter no iPhone e iPad',
      ar: 'كيفية تنزيل مقاطع فيديو تويتر على أجهزة iPhone و iPad',
    },
    intro: {
      en: 'Modern iOS devices (iOS 13 and later) feature a built-in Safari Download Manager that allows saving MP4 video files directly to the Files app or Photos Camera Roll without installing third-party apps.',
      es: 'Los dispositivos iOS modernos cuentan con el Gestor de Descargas de Safari que permite guardar vídeos MP4 directamente en Archivos o en Fotos sin apps adicionales.',
      fr: 'Les appareils iOS récents disposent d’un gestionnaire de téléchargement intégré dans Safari permettant d’enregistrer des fichiers MP4 sans application tierce.',
      pt: 'Dispositivos iOS possuem o Gerenciador de Downloads do Safari, permitindo salvar vídeos MP4 diretamente nos Arquivos ou Fotos sem apps extras.',
      ar: 'تحتوي أجهزة آيفون الحديثة (نظام iOS 13 والإصدارات الأحدث) على مدير تنزيلات مدمج في متصفح Safari يتيح حفظ ملفات MP4 مباشرة في تطبيق الملفات أو معرض الصور دون الحاجة لأي تطبيقات خارجية.',
    },
    keyPoints: {
      en: [
        'Works 100% inside native Safari browser',
        'No jailbreak or App Store utility required',
        'Easily move videos from "Files" to "Photos" with one tap',
        'Supports AirDrop and messaging app sharing',
      ],
      es: [
        'Funciona totalmente desde el navegador Safari oficial',
        'No necesitas jailbreak ni instalar utilidades de terceros',
        'Pasa el vídeo de "Archivos" a "Fotos" con un solo toque',
        'Compatible con AirDrop y apps de mensajería',
      ],
      fr: [
        'Fonctionne directement dans le navigateur Safari natif',
        'Aucune application tierce ou jailbreak requis',
        'Enregistrement dans l’application Photos en un clic',
        'Compatible AirDrop et partage instantané',
      ],
      pt: [
        'Funciona direto no navegador nativo Safari',
        'Não requer jailbreak nem instalação de apps da App Store',
        'Envie o vídeo de "Arquivos" para "Fotos" com apenas um toque',
        'Compartilhamento fácil via AirDrop e WhatsApp',
      ],
      ar: [
        'يعمل بسلاسة تامة عبر متصفح Safari الأساسي بدون أي إضافات',
        'لا يحتاج إلى جيلبريك أو تنزيل برامج مساعدة من متجر التطبيقات',
        'إمكانية حفظ الفيديو من تطبيق "الملفات" إلى "ألبوم الصور" بنقرة واحدة',
        'دعم كامل لمشاركة المقطع عبر AirDrop أو تطبيقات المراسلة',
      ],
    },
    stepsTitle: {
      en: 'Step-by-Step iOS Tutorial',
      es: 'Tutorial paso a paso para iOS',
      fr: 'Tutoriel étape par étape pour iOS',
      pt: 'Passo a passo no iOS',
      ar: 'خطوات التحميل خطوة بخطوة على نظام iOS',
    },
    steps: {
      en: [
        { step: '1. Copy Link from X App', detail: 'Tap the Share icon under the tweet and select "Copy link".' },
        { step: '2. Open Safari & GetVidX', detail: 'Launch Safari, go to GetVidX, paste the link, and tap Download.' },
        { step: '3. Save to Photos', detail: 'Tap Download on your preferred quality. Once downloaded, open the Safari Downloads arrow, tap the video, tap Share, and choose "Save Video".' },
      ],
      es: [
        { step: '1. Copiar Enlace en la app de X', detail: 'Pulsa el icono de Compartir debajo del tweet y selecciona "Copiar enlace".' },
        { step: '2. Abrir Safari y GetVidX', detail: 'Entra en Safari a GetVidX, pega el enlace y pulsa en Descargar.' },
        { step: '3. Guardar en Fotos', detail: 'Pulsa Descargar en la calidad que prefieras. En las descargas de Safari, toca el vídeo, pulsa Compartir y elige "Guardar vídeo".' },
      ],
      fr: [
        { step: '1. Copier le lien depuis l’app X', detail: 'Touchez l’icône Partager sous le tweet et choisissez "Copier le lien".' },
        { step: '2. Ouvrir Safari & GetVidX', detail: 'Ouvrez Safari, rendez-vous sur GetVidX, collez le lien et validez.' },
        { step: '3. Enregistrer dans Photos', detail: 'Téléchargez la vidéo, ouvrez la flèche des téléchargements de Safari, touchez la vidéo, Partager puis "Enregistrer la vidéo".' },
      ],
      pt: [
        { step: '1. Copiar Link no App do X', detail: 'Toque no ícone de Compartilhar do tweet e selecione "Copiar link".' },
        { step: '2. Abrir Safari e GetVidX', detail: 'Abra o Safari, acesse o GetVidX, cole o link e toque em Baixar.' },
        { step: '3. Salvar no Rolo da Câmera', detail: 'Toque em Baixar na qualidade desejada. Na lista de downloads do Safari, abra o vídeo, toque em Compartilhar e selecione "Salvar Vídeo".' },
      ],
      ar: [
        { step: '1. انسخ الرابط من تطبيق X', detail: 'اضغط على زر المشاركة أسفل التغريدة واختر "نسخ الرابط".' },
        { step: '2. افتح متصفح Safari وادخل GetVidX', detail: 'توجه إلى GetVidX عبر Safari والصق الرابط ثم اضغط زر التحميل.' },
        { step: '3. احفظ المقطع في تطبيق الصور', detail: 'اختر الجودة المطلوبة واضغط تحميل، وبعد اكتمال التنزيل في Safari، افتح الملف واضغط على زر المشاركة واختر "حفظ الفيديو" (Save Video) لينتقل إلى ألبوم الكاميرا فوراً.' },
      ],
    },
    technicalNotes: {
      en: 'If you are using Google Chrome or Firefox on iOS, files will download to the respective browser download folder inside the iOS Files app.',
      es: 'Si utilizas Chrome o Firefox en iOS, el archivo se descargará en la carpeta de dicha app dentro de Archivos.',
      fr: 'Si vous utilisez Chrome ou Firefox sur iOS, les fichiers seront stockés dans le dossier du navigateur dans Fichiers.',
      pt: 'Ao usar o Chrome no iPhone, o arquivo é salvo na pasta do Chrome dentro do app Arquivos.',
      ar: 'إذا كنت تستخدم متصفح Chrome أو Firefox على جهاز آيفون، فسيتم حفظ المقطع في مجلد التنزيلات الخاص بالمتصفح داخل تطبيق "الملفات".',
    },
    relatedSlugs: ['how-to-download-twitter-videos-android', 'twitter-video-download-hd', 'troubleshooting-twitter-video-downloads'],
  },

  {
    id: 'android-guide',
    slug: 'how-to-download-twitter-videos-android',
    category: 'device',
    title: {
      en: 'How to Download Twitter Videos on Android - GetVidX',
      es: 'Cómo Descargar Vídeos de Twitter en Android - GetVidX',
      fr: 'Comment Télécharger des Vidéos Twitter sur Android - GetVidX',
      pt: 'Como Baixar Vídeos do Twitter no Android - GetVidX',
      ar: 'طريقة تحميل فيديو تويتر على أجهزة أندرويد - GetVidX',
    },
    metaDescription: {
      en: 'Download Twitter (X) videos on Samsung Galaxy, Xiaomi, Pixel, and any Android phone. Save directly to your Gallery or Files folder in Full HD.',
      es: 'Descarga vídeos de Twitter (X) en teléfonos Samsung, Xiaomi, Motorola o Pixel directamente a tu Galería en Full HD con GetVidX.',
      fr: 'Téléchargez des vidéos Twitter (X) sur Samsung, Xiaomi, Pixel et tout smartphone Android directement dans votre Galerie.',
      pt: 'Baixe vídeos do Twitter (X) no Samsung, Motorola, Xiaomi e qualquer celular Android diretamente na Galeria.',
      ar: 'طريقة تنزيل مقاطع فيديو تويتر و X على هواتف سامسونج جالاكسي وشاومي وبكسل وكافة هواتف أندرويد وحفظها مباشرة في المعرض بجودة Full HD.',
    },
    h1: {
      en: 'How to Download Twitter Videos on Android Devices',
      es: 'Cómo Descargar Vídeos de Twitter en Dispositivos Android',
      fr: 'Comment Télécharger des Vidéos Twitter sur Android',
      pt: 'Como Baixar Vídeos do Twitter no Celular Android',
      ar: 'طريقة تحميل مقاطع فيديو تويتر على هواتف أندرويد',
    },
    intro: {
      en: 'Downloading Twitter videos on Android is instantaneous. Whether you use Chrome, Samsung Internet, Firefox, or Brave, GetVidX downloads the MP4 file directly to your device storage where your Gallery app detects it immediately.',
      es: 'Descargar vídeos de Twitter en Android es instantáneo. Con Chrome, Samsung Internet o Firefox, GetVidX guarda el archivo MP4 directamente en tu galería.',
      fr: 'Sur Android, l’enregistrement est immédiat : avec Chrome ou Samsung Internet, GetVidX télécharge le fichier MP4 visible tout de suite dans votre Galerie.',
      pt: 'Baixar vídeos no Android é muito rápido. Usando o Chrome ou Samsung Internet, o GetVidX salva o vídeo MP4 visível direto na sua Galeria.',
      ar: 'يعد تحميل مقاطع تويتر على نظام أندرويد في غاية السهولة والسرعة، حيث يمكنك استخدام متصفح Chrome أو Samsung Internet، ويقوم GetVidX بحفظ ملف MP4 في مساحة التخزين ليظهر فوراً في معرض الصور ومشغلات الفيديو.',
    },
    keyPoints: {
      en: [
        'Instant detection by Google Photos, Samsung Gallery, and VLC',
        'Works with all Android versions from Android 8 to 15',
        'Direct download notification with open/share shortcuts',
        'No external APK installations needed',
      ],
      es: [
        'Reconocimiento automático en Google Fotos, Galería de Samsung y VLC',
        'Compatible con todas las versiones de Android',
        'Notificación de descarga con accesos rápidos de apertura',
        'Sin necesidad de instalar archivos APK externos',
      ],
      fr: [
        'Reconnaissance immédiate par Google Photos, Galerie Samsung et VLC',
        'Compatible avec toutes les versions d’Android',
        'Notification de fin de téléchargement avec accès rapide',
        'Aucun fichier APK externe à installer',
      ],
      pt: [
        'Aparece automaticamente no Google Fotos e na Galeria',
        'Compatível com qualquer versão do sistema Android',
        'Notificação na barra de status para abrir o arquivo na hora',
        'Sem instalar nenhum arquivo APK suspeito',
      ],
      ar: [
        'ظهور فوري للمقطع في تطبيق صور Google، واستوديو سامسونج ومشغل VLC',
        'توافق كامل مع كافة إصدارات نظام أندرويد بدون أي استثناء',
        'إشعار فوري في شريط التنبيهات مع أزرار تشغيل ومشاركة المقطع مباشرة',
        'أمان تام دون الحاجة لتثبيت أي ملفات APK خارجية على هاتفك',
      ],
    },
    stepsTitle: {
      en: 'Android Download Steps',
      es: 'Pasos para Android',
      fr: 'Étapes pour Android',
      pt: 'Passos no Android',
      ar: 'خطوات التحميل على هواتف أندرويد',
    },
    steps: {
      en: [
        { step: '1. Copy Tweet URL', detail: 'In the X app, tap the Share icon under the video and choose "Copy Link".' },
        { step: '2. Open GetVidX in Chrome', detail: 'Go to GetVidX, paste the URL into the input field, and tap Download.' },
        { step: '3. Tap Download Quality', detail: 'Choose 1080p or 720p. The MP4 file will download directly into your Downloads folder and Gallery.' },
      ],
      es: [
        { step: '1. Copiar Enlace', detail: 'En la app de X, pulsa Compartir debajo del vídeo y selecciona "Copiar enlace".' },
        { step: '2. Abrir GetVidX en Chrome', detail: 'Entra a GetVidX, pega el enlace y pulsa Descargar.' },
        { step: '3. Elegir Calidad', detail: 'Selecciona 1080p o 720p. El archivo se guardará en Descargas y aparecerá en tu Galería.' },
      ],
      fr: [
        { step: '1. Copier le lien', detail: 'Sur l’application X, touchez Partager puis "Copier le lien".' },
        { step: '2. Ouvrir GetVidX', detail: 'Dans Chrome, ouvrez GetVidX, collez le lien et validez.' },
        { step: '3. Choisir la résolution', detail: 'Sélectionnez 1080p ou 720p pour lancer le téléchargement dans votre Galerie.' },
      ],
      pt: [
        { step: '1. Copiar Link', detail: 'No aplicativo do X, toque em Compartilhar e selecione "Copiar link".' },
        { step: '2. Acessar GetVidX', detail: 'No Chrome, acesse o GetVidX, cole a URL e toque em Baixar.' },
        { step: '3. Baixar', detail: 'Escolha 1080p ou 720p para salvar o vídeo diretamente no seu celular.' },
      ],
      ar: [
        { step: '1. انسخ رابط التغريدة', detail: 'في تطبيق X اضغط على زر المشاركة أسفل الفيديو واختر "نسخ الرابط".' },
        { step: '2. افتح GetVidX في Chrome', detail: 'ادخل إلى موقع GetVidX والصق الرابط في المستطيل المخصص واضغط تحميل.' },
        { step: '3. اضغط زر الجودة', detail: 'اختر دقة 1080p أو 720p، وسيبدأ التنزيل تلقائياً ويظهر المقطع في المعرض فور انتهائه.' },
      ],
    },
    technicalNotes: {
      en: 'If Chrome opens the video directly in the media player, tap the three dots in the bottom-right corner of the video player and tap "Download".',
      es: 'Si Chrome reproduce el vídeo directamente, toca los tres puntos en la esquina inferior del reproductor y pulsa "Descargar".',
      fr: 'Si Chrome lit la vidéo directement, appuyez sur les trois points en bas à droite du lecteur et sélectionnez "Télécharger".',
      pt: 'Caso o Chrome reproduza o vídeo na tela, toque nos três pontinhos no canto inferior do player e selecione "Fazer download".',
      ar: 'إذا قام متصفح Chrome بتشغيل المقطع بدلاً من تنزيله، انقر على النقاط الثلاث أسفل مشغل الفيديو واختر "تنزيل" (Download).',
    },
    relatedSlugs: ['how-to-download-twitter-videos-iphone', 'twitter-to-mp4', 'twitter-video-download-hd'],
  },

  {
    id: 'troubleshooting',
    slug: 'troubleshooting-twitter-video-downloads',
    category: 'guide',
    title: {
      en: 'Troubleshooting Twitter Video Downloads - Fix Errors - GetVidX',
      es: 'Solución de Problemas al Descargar de Twitter - Guía - GetVidX',
      fr: 'Dépannage Téléchargement Vidéo Twitter - Corriger Erreurs - GetVidX',
      pt: 'Solução de Problemas no Download do Twitter - Erros - GetVidX',
      ar: 'حل مشاكل وأخطاء تحميل فيديو تويتر - دليل الإصلاح الشامل - GetVidX',
    },
    metaDescription: {
      en: 'Fix common Twitter video download issues: private tweets, deleted posts, invalid URL formats, missing audio, and slow downloads with our troubleshooting guide.',
      es: 'Resuelve fallos comunes al descargar vídeos de Twitter: cuentas privadas, tweets eliminados, errores de enlace y problemas de audio.',
      fr: 'Corrigez les erreurs fréquentes de téléchargement Twitter : tweets privés, liens invalides, vidéos supprimées et absence de son.',
      pt: 'Resolva erros comuns ao baixar vídeos do Twitter: publicações privadas, links incorretos, tweets apagados ou falta de áudio.',
      ar: 'دليل عملي لحل أشهر مشاكل وأخطاء تنزيل فيديوهات تويتر: الحسابات المقفلة، التغريدات المحذوفة، الروابط غير الصالحة، وانقطاع الصوت.',
    },
    h1: {
      en: 'Troubleshooting Guide for Twitter Video Downloads',
      es: 'Guía de Solución de Problemas para Descargas de Twitter',
      fr: 'Guide de Dépannage pour les Téléchargements Twitter',
      pt: 'Guia de Solução de Problemas para Downloads do Twitter',
      ar: 'الدليل الشامل لحل مشاكل تحميل مقاطع فيديو تويتر',
    },
    intro: {
      en: 'Encountering an error while attempting to save a tweet? Most issues result from tweet privacy permissions, URL formatting quirks, or Twitter CDN stream status. Here is how to diagnose and resolve them.',
      es: '¿Has encontrado un error al intentar descargar un vídeo? La mayoría de los fallos se deben a la privacidad de la cuenta o al formato del enlace. Aquí te mostramos cómo solucionarlo.',
      fr: 'Vous rencontrez une erreur ? La plupart des difficultés proviennent de la confidentialité du compte ou du format du lien. Voici comment y remédier.',
      pt: 'Encontrou algum problema ao baixar? A maioria dos erros decorre de contas protegidas ou formato do link. Veja como resolver.',
      ar: 'هل واجهت رسالة خطأ أثناء محاولة تنزيل مقطع فيديو؟ يعود سبب أغلب المشاكل إلى إعدادات خصوصية الحساب، أو تنسيق الرابط، أو حذف التغريدة. إليك الحلول الشاملة.',
    },
    keyPoints: {
      en: [
        'Private / Protected Tweets: Cannot be retrieved as they require authenticated session tokens',
        'Image-Only Tweets: Make sure the post contains an actual MP4 video or animated GIF',
        'Deleted Content: If the author removed the post, the CDN streams are revoked',
        'Quote Tweets: Ensure you copy the link of the actual video tweet, not just the commentary',
      ],
      es: [
        'Tweets privados o protegidos: No se pueden descargar por requerir autenticación personal',
        'Publicaciones con imágenes fijas: Verifica que contenga un vídeo real o un GIF animado',
        'Tweets eliminados: Si el autor borró el contenido, los enlaces de la CDN dejan de existir',
        'Tweets citados: Asegúrate de copiar el enlace del tweet original que contiene el vídeo',
      ],
      fr: [
        'Tweets privés ou protégés : Inaccessibles car ils nécessitent une connexion au compte',
        'Publications d’images statiques : Assurez-vous que le tweet contient une vraie vidéo ou un GIF',
        'Contenus supprimés : Si l’auteur a effacé le tweet, le flux vidéo n’est plus disponible',
        'Tweets cités : Veillez à copier le lien du tweet d’origine contenant le clip',
      ],
      pt: [
        'Tweets privados: Inacessíveis pois exigem autorização de seguidor aprovado',
        'Publicações com fotos estáticas: Certifique-se de que há um vídeo ou GIF animado no tweet',
        'Conteúdo apagado: Se o autor excluiu o post, os links da CDN deixam de funcionar',
        'Retweets com comentário: Copie o link do tweet original onde o vídeo foi postado',
      ],
      ar: [
        'التغريدات الخاصة والمحمية: لا يمكن تنزيلها لأنها تتطلب مصادقة حساب موافق عليه من صاحب التغريدة',
        'التغريدات التي تحتوي صوراً فقط: تأكد أن التغريدة تحتوي بالفعل على مقطع فيديو أو صورة متحركة',
        'المحتوى المحذوف: إذا قام المغرد بحذف التغريدة، يتم إيقاف روابط البث على شبكة CDN فوراً',
        'التغريدات المقتبسة: تأكد من نسخ رابط التغريدة الأصلية صاحبة الفيديو وليس تغريدة الاقتباس',
      ],
    },
    stepsTitle: {
      en: 'Quick 3-Check Checklist',
      es: 'Lista de verificación rápida',
      fr: 'Liste de contrôle rapide',
      pt: 'Checklist de verificação rápida',
      ar: 'قائمة الفحص السريع للتأكد من الرابط',
    },
    steps: {
      en: [
        { step: 'Check 1. Open Tweet in Incognito', detail: 'If you cannot view the tweet in a private browser window without logging in, the tweet is private or age-restricted.' },
        { step: 'Check 2. Inspect URL Format', detail: 'URL must contain /status/ followed by digits (e.g. x.com/user/status/1234567890).' },
        { step: 'Check 3. Check for Video Playback', detail: 'Confirm that the tweet plays a moving video or animation in the Twitter app or web browser.' },
      ],
      es: [
        { step: '1. Modo incógnito', detail: 'Si no puedes ver el tweet en incógnito sin iniciar sesión, es privado o restringido por edad.' },
        { step: '2. Formato de la URL', detail: 'El enlace debe incluir /status/ seguido de números (ej. x.com/user/status/1234567890).' },
        { step: '3. Reproducir vídeo', detail: 'Confirma que el contenido se reproduce en movimiento en la app o web de Twitter.' },
      ],
      fr: [
        { step: '1. Fenêtre privée', detail: 'Si le tweet n’est pas visible sans connexion, il est privé ou restreint par l’âge.' },
        { step: '2. Format de l’URL', detail: 'Le lien doit comporter /status/ suivi de chiffres (ex. x.com/user/status/1234567890).' },
        { step: '3. Vérifier la lecture', detail: 'Vérifiez que la vidéo se lit bien dans l’application ou sur le site Twitter.' },
      ],
      pt: [
        { step: '1. Aba anônima', detail: 'Se o tweet não abrir na aba anônima sem login, a conta é privada ou restrita.' },
        { step: '2. Formato da URL', detail: 'O endereço deve conter /status/ seguido de dígitos numéricos.' },
        { step: '3. Reprodução', detail: 'Confirme que o vídeo toca normalmente no aplicativo do X.' },
      ],
      ar: [
        { step: 'الفحص 1: التصفح الخفي', detail: 'إذا تعذر فتح التغريدة في نافذة تصفح خفية دون تسجيل الدخول، فهذا يعني أن الحساب خاص أو التغريدة محظورة للأعمار.' },
        { step: 'الفحص 2: صيغة الرابط', detail: 'يجب أن يحتوي الرابط على كلمة /status/ متبوعة بالأرقام التسلسلية للمنشور.' },
        { step: 'الفحص 3: تشغيل المقطع', detail: 'تأكد من إمكانية تشغيل المقطع وسماع صوته بصورة طبيعية على منصة تويتر الأصلية.' },
      ],
    },
    technicalNotes: {
      en: 'Still having trouble? Check if your ad blocker or browser extension is blocking media downloads, or try switching between Wi-Fi and mobile data.',
      es: '¿Sigues teniendo problemas? Comprueba si algún bloqueador de anuncios está interfiriendo o prueba con otra red.',
      fr: 'En cas de blocage persistant, vérifiez qu’aucune extension ne bloque le téléchargement ou changez de réseau.',
      pt: 'Ainda com problemas? Verifique se algum bloqueador de anúncios está bloqueando downloads de mídia.',
      ar: 'إذا استمرت المشكلة، يرجى التأكد من عدم قيام برامج حجب الإعلانات بحظر تنزيل ملفات الوسائط، أو تجربة تبديل شبكة الإنترنت.',
    },
    relatedSlugs: ['how-to-download-twitter-videos-iphone', 'how-to-download-twitter-videos-android', 'twitter-video-download-hd'],
  },
];

```

# src\data\sitemapData.ts

```ts
import { PSEO_PAGES } from './pseoPages';
import { LEGAL_PAGES } from './legalPages';
import { SupportedLocale } from '../i18n/types';

export const BASE_PRODUCTION_DOMAIN = 'https://getvidx.com';

const LOCALES: SupportedLocale[] = ['en', 'es', 'fr', 'pt', 'ar'];

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
  alternates: { lang: string; href: string }[];
}

/**
 * Compiles all genuine, indexable URLs across all 5 languages
 */
export function generateAllSitemapEntries(): SitemapEntry[] {
  const today = '2026-03-20';
  const entries: SitemapEntry[] = [];

  // 1. Homepage & Language Homepages
  LOCALES.forEach((locale) => {
    const loc = locale === 'en' ? `${BASE_PRODUCTION_DOMAIN}/` : `${BASE_PRODUCTION_DOMAIN}/${locale}`;
    const alternates: Array<{ lang: string; href: string }> = LOCALES.map((l) => ({
      lang: l,
      href: l === 'en' ? `${BASE_PRODUCTION_DOMAIN}/` : `${BASE_PRODUCTION_DOMAIN}/${l}`,
    }));
    alternates.push({ lang: 'x-default', href: `${BASE_PRODUCTION_DOMAIN}/` });

    entries.push({
      loc,
      lastmod: today,
      changefreq: 'daily',
      priority: locale === 'en' ? '1.0' : '0.9',
      alternates,
    });
  });

  // 2. Programmatic SEO Landing Pages
  PSEO_PAGES.forEach((page) => {
    LOCALES.forEach((locale) => {
      const path = locale === 'en' ? `/${page.slug}` : `/${locale}/${page.slug}`;
      const loc = `${BASE_PRODUCTION_DOMAIN}${path}`;

      const alternates: Array<{ lang: string; href: string }> = LOCALES.map((l) => ({
        lang: l,
        href: l === 'en' ? `${BASE_PRODUCTION_DOMAIN}/${page.slug}` : `${BASE_PRODUCTION_DOMAIN}/${l}/${page.slug}`,
      }));
      alternates.push({ lang: 'x-default', href: `${BASE_PRODUCTION_DOMAIN}/${page.slug}` });

      entries.push({
        loc,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.8',
        alternates,
      });
    });
  });

  // 3. Legal and informational pages
  Object.values(LEGAL_PAGES).forEach((legal) => {
    LOCALES.forEach((locale) => {
      const path = locale === 'en' ? `/${legal.slug}` : `/${locale}/${legal.slug}`;
      const loc = `${BASE_PRODUCTION_DOMAIN}${path}`;

      const alternates: Array<{ lang: string; href: string }> = LOCALES.map((l) => ({
        lang: l,
        href: l === 'en' ? `${BASE_PRODUCTION_DOMAIN}/${legal.slug}` : `${BASE_PRODUCTION_DOMAIN}/${l}/${legal.slug}`,
      }));
      alternates.push({ lang: 'x-default', href: `${BASE_PRODUCTION_DOMAIN}/${legal.slug}` });

      entries.push({
        loc,
        lastmod: today,
        changefreq: 'monthly',
        priority: '0.5',
        alternates,
      });
    });
  });

  return entries;
}

/**
 * Generates the child sitemap XML string (e.g. /sitemap_1.xml)
 */
export function buildChildSitemapXml(): string {
  const entries = generateAllSitemapEntries();

  const xmlEntries = entries
    .map((e) => {
      const alternateTags = e.alternates
        .map(
          (alt) => `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />`
        )
        .join('\n');

      return `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
${alternateTags}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlEntries}
</urlset>`;
}

/**
 * Generates the primary sitemap index XML string (/sitemap.xml)
 */
export function buildSitemapIndexXml(): string {
  const today = '2026-03-20';
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_PRODUCTION_DOMAIN}/sitemap_1.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
}

/**
 * Generates standard robots.txt content
 */
export function buildRobotsTxt(): string {
  return `# Robots.txt for GetVidX
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

# Sitemap index
Sitemap: ${BASE_PRODUCTION_DOMAIN}/sitemap.xml
`;
}

```

# src\i18n\translations.ts

```ts
import { SupportedLocale, UiTranslations } from './types';

export const TRANSLATIONS: Record<SupportedLocale, UiTranslations> = {
  en: {
    navDownloader: 'Twitter Downloader',
    navMp3: 'Twitter to MP3',
    navGif: 'Twitter GIF',
    navHowItWorks: 'How It Works',
    navFaq: 'FAQ',
    navGuides: 'Guides',

    badgeText: 'Fast & Free Twitter / X Media Downloader',
    heroTitlePrefix: 'Download Twitter Video,',
    heroTitleHighlight: 'Save MP4 & GIF in HD',
    heroSubtitle:
      'The fastest way to download Twitter (X) videos and GIF animations online in Full HD, 720p, or extract MP3 audio directly to your device.',
    tabVideo: 'Video & GIF',
    tabAudio: 'MP3 Audio',
    tabGif: 'Twitter GIF',
    inputPlaceholder: 'Paste Twitter / X link here (e.g. https://x.com/username/status/...)',
    pasteBtn: 'Paste',
    downloadBtn: 'Download',
    analyzingBtn: 'Analyzing tweet...',
    tipText: 'Tip: Paste any public tweet or status link to retrieve available MP4 qualities instantly.',
    tryExample: 'Try Example',

    resultTitle: 'Ready for Download',
    authorLabel: 'Author',
    durationLabel: 'Duration',
    resolutionsTitle: 'Available Qualities & Formats',
    qualityLabel: 'Quality',
    formatLabel: 'Format',
    actionDownload: 'Download MP4',
    actionCopyLink: 'Copy Media URL',
    linkCopied: 'Copied to clipboard!',
    extractAudio: 'Download Audio (MP3)',
    directDownloadNote: 'Tip: Right-click or long-press "Download" if your browser starts playing the video instead of saving.',
    downloadAnother: 'Convert Another Link',

    errorEmptyUrl: 'Please paste a valid Twitter or X status link.',
    errorInvalidDomain: 'Supported domains are only x.com and twitter.com.',
    errorInvalidPostId: 'Please provide a full post link containing /status/[numeric_id].',
    errorNoVideoFound: 'No video or GIF stream was found in this tweet. It may contain only text, images, or a quote tweet.',
    errorPrivatePost: 'This post is from a protected/private account or has been deleted. GetVidX only processes publicly accessible media.',
    errorNetwork: 'Unable to reach Twitter servers right now. Please verify the URL and try again.',
    errorGeneric: 'An error occurred while analyzing this tweet. Please check the link and retry.',

    howTitle: 'How to Download Twitter Videos with GetVidX',
    howSubtitle: 'Simple 3-step process to save your favorite tweets, clips, and GIFs in seconds.',
    step1Title: '1. Copy Tweet URL',
    step1Desc: "Open X / Twitter, locate the post containing the video or GIF, click Share and choose 'Copy link to Tweet'.",
    step2Title: '2. Paste into GetVidX',
    step2Desc: 'Paste the copied URL into the search box above and press the Download button to analyze available media streams.',
    step3Title: '3. Choose Quality & Save',
    step3Desc: 'Select your desired resolution (1080p, 720p, 480p, or MP3 audio) and click Download to save the file.',
    stepBadge: 'Verified & Instant',

    whyTitle: 'Why Choose GetVidX?',
    whySubtitle: 'Engineered for speed, privacy, and crystal-clear high definition media playback.',
    feat1Title: 'Full HD & 4K Quality',
    feat1Desc: 'Download videos in their original source resolution up to 1080p Full HD with highest available bitrate.',
    feat2Title: 'Ultra-Fast Processing',
    feat2Desc: 'Our optimized media retriever analyzes and extracts direct CDN links in under 1.5 seconds.',
    feat3Title: 'No Software or App Needed',
    feat3Desc: '100% web-based. Works smoothly on Chrome, Safari, Firefox, Edge across PC, Mac, iPhone, and Android.',
    feat4Title: 'Extract Audio to MP3',
    feat4Desc: 'Convert any music video, podcast clip, or speech into a standalone high-clarity MP3 audio track.',
    feat5Title: 'Completely Free & Unlimited',
    feat5Desc: 'No subscription fees, no credit card, and no daily download quotas. Use it whenever you need.',
    feat6Title: 'Privacy & Zero Storage',
    feat6Desc: 'GetVidX does not host or store your downloaded files. All media is retrieved directly from official CDN nodes.',

    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Everything you need to know about downloading videos and audio with GetVidX.',

    adLabelHeader: 'SPONSORED SPACE · HEADER DISPLAY',
    adLabelResult: 'SPONSORED SPACE · UNDER-RESULT SLOT',
    adNotice: 'Reserved ad slot (Strictly decoupled from download controls)',

    directReplacementHint: 'Direct Link Trick: Change x.com in your browser bar to getvidx.com to download immediately!',

    footerDesc: 'High-Speed Online Video & Audio Downloader. High-speed, client-first media retriever for public X (Twitter) videos, GIFs, and MP3 audio.',
    footerConverters: 'MEDIA CONVERTERS',
    footerLegal: 'LEGAL & TRUST',
    footerLanguages: 'LANGUAGES',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    dmca: 'DMCA & Copyright',
    about: 'About Us',
    contact: 'Contact Us',
    howToDownload: 'How to Download',
    disclaimer: 'Disclaimer: GetVidX is an independent utility and is not affiliated with, endorsed by, or associated with Twitter, Inc. or X Corp. All trademarks belong to their respective owners.',
    copyright: '© 2026 GetVidX. All rights reserved.',
  },

  es: {
    navDownloader: 'Descargador de Twitter',
    navMp3: 'Twitter a MP3',
    navGif: 'GIF de Twitter',
    navHowItWorks: 'Cómo Funciona',
    navFaq: 'Preguntas Frecuentes',
    navGuides: 'Guías',

    badgeText: 'Descargador Rápido y Gratis de Vídeos de Twitter / X',
    heroTitlePrefix: 'Descargar Vídeos de Twitter,',
    heroTitleHighlight: 'Guardar MP4 y GIF en HD',
    heroSubtitle:
      'La forma más rápida de descargar vídeos y animaciones GIF de Twitter (X) en Full HD, 720p o extraer audio MP3 directamente a tu dispositivo.',
    tabVideo: 'Vídeo y GIF',
    tabAudio: 'Audio MP3',
    tabGif: 'GIF de Twitter',
    inputPlaceholder: 'Pega el enlace de Twitter / X aquí (ej. https://x.com/usuario/status/...)',
    pasteBtn: 'Pegar',
    downloadBtn: 'Descargar',
    analyzingBtn: 'Analizando tweet...',
    tipText: 'Consejo: Pega cualquier enlace de publicación pública para obtener todas las calidades MP4 al instante.',
    tryExample: 'Probar Ejemplo',

    resultTitle: 'Listo para Descargar',
    authorLabel: 'Autor',
    durationLabel: 'Duración',
    resolutionsTitle: 'Calidades y Formatos Disponibles',
    qualityLabel: 'Calidad',
    formatLabel: 'Formato',
    actionDownload: 'Descargar MP4',
    actionCopyLink: 'Copiar Enlace',
    linkCopied: '¡Enlace copiado al portapapeles!',
    extractAudio: 'Descargar Audio (MP3)',
    directDownloadNote: 'Consejo: Haz clic derecho o mantén presionado "Descargar" si el navegador reproduce el vídeo en vez de guardarlo.',
    downloadAnother: 'Convertir Otro Enlace',

    errorEmptyUrl: 'Por favor ingresa un enlace válido de publicación de Twitter o X.',
    errorInvalidDomain: 'Solo se admiten enlaces procedentes de x.com y twitter.com.',
    errorInvalidPostId: 'El enlace debe contener la ruta completa /status/[id_numérico].',
    errorNoVideoFound: 'No se encontró ningún vídeo ni GIF en este tweet. Puede tratarse de una imagen o texto únicamente.',
    errorPrivatePost: 'Esta publicación pertenece a una cuenta privada o ha sido eliminada. Solo procesamos contenido público.',
    errorNetwork: 'No se pudo conectar con los servidores en este momento. Inténtalo de nuevo.',
    errorGeneric: 'Ocurrió un error al analizar el tweet. Revisa el enlace e inténtalo nuevamente.',

    howTitle: 'Cómo Descargar Vídeos de Twitter con GetVidX',
    howSubtitle: 'Proceso sencillo de 3 pasos para guardar tus tweets, vídeos y GIFs en segundos.',
    step1Title: '1. Copiar Enlace del Tweet',
    step1Desc: "Abre Twitter / X, encuentra el vídeo o GIF deseado, pulsa en Compartir y selecciona 'Copiar enlace'.",
    step2Title: '2. Pegar en GetVidX',
    step2Desc: 'Pega el enlace copiado en el campo superior y haz clic en Descargar para extraer los medios.',
    step3Title: '3. Elegir Calidad y Guardar',
    step3Desc: 'Selecciona la resolución que prefieras (1080p, 720p, 480p o audio MP3) y pulsa en Descargar.',
    stepBadge: 'Verificado e Instantáneo',

    whyTitle: '¿Por Qué Elegir GetVidX?',
    whySubtitle: 'Diseñado para máxima velocidad, privacidad absoluta y reproducción en alta definición.',
    feat1Title: 'Calidad Full HD y 4K',
    feat1Desc: 'Descarga vídeos en su resolución original hasta 1080p Full HD con la tasa de bits más alta.',
    feat2Title: 'Procesamiento Ultra Rápido',
    feat2Desc: 'Analizador optimizado que extrae enlaces directos de la CDN en menos de 1.5 segundos.',
    feat3Title: 'Sin Instalaciones ni Apps',
    feat3Desc: '100% online en tu navegador. Compatible con Chrome, Safari, Firefox y Edge en PC, Mac y móviles.',
    feat4Title: 'Extracción a Audio MP3',
    feat4Desc: 'Convierte fragmentos de entrevistas, música o podcasts en archivos de audio MP3 limpios.',
    feat5Title: 'Totalmente Gratis e Ilimitado',
    feat5Desc: 'Sin registros, sin suscripciones y sin límites diarios de descarga.',
    feat6Title: 'Privacidad y Cero Almacenamiento',
    feat6Desc: 'GetVidX no almacena copias de tus archivos. Toda la descarga se realiza directamente desde la CDN.',

    faqTitle: 'Preguntas Frecuentes',
    faqSubtitle: 'Todo lo que necesitas saber sobre la descarga de vídeos y audios con GetVidX.',

    adLabelHeader: 'ESPACIO PATROCINADO · ENCABEZADO',
    adLabelResult: 'ESPACIO PATROCINADO · DEBAJO DEL RESULTADO',
    adNotice: 'Espacio publicitario reservado (Totalmente separado de los controles de descarga)',

    directReplacementHint: 'Truco directo: Cambia x.com por getvidx.com en tu navegador para descargar directamente.',

    footerDesc: 'Descargador de vídeo y audio de alta velocidad. Conversor web para publicaciones públicas de Twitter / X en MP4 y MP3.',
    footerConverters: 'CONVERSORES DE MEDIOS',
    footerLegal: 'LEGAL Y CONFIANZA',
    footerLanguages: 'IDIOMAS',
    terms: 'Términos de Servicio',
    privacy: 'Política de Privacidad',
    dmca: 'DMCA y Derechos de Autor',
    about: 'Sobre Nosotros',
    contact: 'Contacto',
    howToDownload: 'Cómo Descargar',
    disclaimer: 'Aviso legal: GetVidX es una utilidad independiente y no está afiliada ni respaldada por Twitter, Inc. ni X Corp.',
    copyright: '© 2026 GetVidX. Todos los derechos reservados.',
  },

  fr: {
    navDownloader: 'Téléchargeur Twitter',
    navMp3: 'Twitter en MP3',
    navGif: 'GIF Twitter',
    navHowItWorks: 'Comment ça marche',
    navFaq: 'FAQ',
    navGuides: 'Guides',

    badgeText: 'Téléchargeur de Vidéos Twitter / X Rapide et Gratuit',
    heroTitlePrefix: 'Télécharger des vidéos Twitter,',
    heroTitleHighlight: 'Enregistrer MP4 et GIF en HD',
    heroSubtitle:
      'Le moyen le plus rapide de télécharger des vidéos et animations GIF Twitter (X) en Full HD, 720p ou d’extraire l’audio MP3 directement sur votre appareil.',
    tabVideo: 'Vidéo & GIF',
    tabAudio: 'Audio MP3',
    tabGif: 'GIF Twitter',
    inputPlaceholder: 'Collez le lien Twitter / X ici (ex. https://x.com/pseudo/status/...)',
    pasteBtn: 'Coller',
    downloadBtn: 'Télécharger',
    analyzingBtn: 'Analyse du tweet...',
    tipText: 'Astuce : Collez n’importe quel lien de statut public pour afficher instantanément toutes les qualités MP4 disponibles.',
    tryExample: 'Essayer un exemple',

    resultTitle: 'Prêt pour le téléchargement',
    authorLabel: 'Auteur',
    durationLabel: 'Durée',
    resolutionsTitle: 'Qualités et Formats Disponibles',
    qualityLabel: 'Qualité',
    formatLabel: 'Format',
    actionDownload: 'Télécharger MP4',
    actionCopyLink: 'Copier le lien',
    linkCopied: 'Lien copié dans le presse-papiers !',
    extractAudio: 'Télécharger Audio (MP3)',
    directDownloadNote: 'Astuce : Faites un clic droit ou appuyez longuement sur "Télécharger" si votre navigateur lit la vidéo au lieu de la sauvegarder.',
    downloadAnother: 'Convertir un autre lien',

    errorEmptyUrl: 'Veuillez coller un lien Twitter ou X valide.',
    errorInvalidDomain: 'Seuls les domaines x.com et twitter.com sont pris en charge.',
    errorInvalidPostId: 'Le lien doit contenir /status/[identifiant_numérique].',
    errorNoVideoFound: 'Aucune vidéo ni GIF n’a été trouvé dans ce tweet.',
    errorPrivatePost: 'Ce tweet provient d’un compte privé ou a été supprimé.',
    errorNetwork: 'Impossible de joindre les serveurs Twitter pour le moment. Veuillez réessayer.',
    errorGeneric: 'Une erreur s’est produite lors de l’analyse. Veuillez vérifier le lien et réessayer.',

    howTitle: 'Comment télécharger des vidéos Twitter avec GetVidX',
    howSubtitle: 'Un processus simple en 3 étapes pour enregistrer vos vidéos et GIFs préférés en quelques secondes.',
    step1Title: '1. Copier le lien du tweet',
    step1Desc: "Ouvrez X / Twitter, repérez la publication contenant la vidéo ou le GIF, cliquez sur Partager puis 'Copier le lien'.",
    step2Title: '2. Coller dans GetVidX',
    step2Desc: 'Collez le lien dans le champ ci-dessus et cliquez sur Télécharger pour analyser le flux multimédia.',
    step3Title: '3. Choisir la qualité et enregistrer',
    step3Desc: 'Choisissez la résolution souhaitée (1080p, 720p, 480p ou MP3) et cliquez sur Télécharger.',
    stepBadge: 'Vérifié & Instantané',

    whyTitle: 'Pourquoi choisir GetVidX ?',
    whySubtitle: 'Conçu pour la rapidité, le respect de la vie privée et la clarté haute définition.',
    feat1Title: 'Qualité Full HD & 4K',
    feat1Desc: 'Téléchargez les vidéos dans leur qualité source d’origine jusqu’à 1080p Full HD.',
    feat2Title: 'Traitement ultra rapide',
    feat2Desc: 'Notre moteur extrait les liens directs du CDN officiel en moins de 1,5 seconde.',
    feat3Title: 'Aucun logiciel nécessaire',
    feat3Desc: 'Fonctionne directement dans votre navigateur web sur Chrome, Safari, Firefox, Edge sur PC, Mac, iPhone et Android.',
    feat4Title: 'Extraction Audio en MP3',
    feat4Desc: 'Convertissez n’importe quelle vidéo musicale ou discours en piste audio MP3 nette.',
    feat5Title: 'Entièrement gratuit et illimité',
    feat5Desc: 'Aucun abonnement, aucune carte requise et aucun quota quotidien.',
    feat6Title: 'Confidentialité et zéro stockage',
    feat6Desc: 'GetVidX ne stocke aucun fichier. Les données proviennent directement du CDN officiel.',

    faqTitle: 'Foire Aux Questions',
    faqSubtitle: 'Tout ce que vous devez savoir sur le téléchargement de vidéos et audios avec GetVidX.',

    adLabelHeader: 'ESPACE SPONSORISÉ · BANNIÈRE EN-TÊTE',
    adLabelResult: 'ESPACE SPONSORISÉ · EMPLACEMENT RÉSULTAT',
    adNotice: 'Emplacement publicitaire réservé (Strictement dissocié des commandes de téléchargement)',

    directReplacementHint: 'Astuce d’accès rapide : Remplacez x.com par getvidx.com dans votre barre d’adresse !',

    footerDesc: 'Téléchargeur de vidéos et audios Twitter en ligne à grande vitesse. Extraction directe de vidéos MP4, GIF et audio MP3.',
    footerConverters: 'CONVERTISSEURS',
    footerLegal: 'LÉGAL ET CONFIANCE',
    footerLanguages: 'LANGUES',
    terms: 'Conditions d’utilisation',
    privacy: 'Politique de confidentialité',
    dmca: 'DMCA et Droits d’auteur',
    about: 'À propos',
    contact: 'Contact',
    howToDownload: 'Comment Télécharger',
    disclaimer: 'Avertissement : GetVidX est un utilitaire indépendant et n’est pas affilié à Twitter, Inc. ni X Corp.',
    copyright: '© 2026 GetVidX. Tous droits réservés.',
  },

  pt: {
    navDownloader: 'Baixador do Twitter',
    navMp3: 'Twitter para MP3',
    navGif: 'GIF do Twitter',
    navHowItWorks: 'Como Funciona',
    navFaq: 'Perguntas Frequentes',
    navGuides: 'Guias',

    badgeText: 'Baixador de Vídeos do Twitter / X Rápido e Grátis',
    heroTitlePrefix: 'Baixar Vídeos do Twitter,',
    heroTitleHighlight: 'Salvar MP4 e GIF em HD',
    heroSubtitle:
      'A forma mais rápida de baixar vídeos e animações GIF do Twitter (X) em Full HD, 720p ou extrair áudio MP3 diretamente no seu dispositivo.',
    tabVideo: 'Vídeo e GIF',
    tabAudio: 'Áudio MP3',
    tabGif: 'GIF do Twitter',
    inputPlaceholder: 'Cole o link do Twitter / X aqui (ex.: https://x.com/usuario/status/...)',
    pasteBtn: 'Colar',
    downloadBtn: 'Baixar',
    analyzingBtn: 'Analisando tweet...',
    tipText: 'Dica: Cole qualquer link de publicação pública para carregar todas as qualidades MP4 disponíveis.',
    tryExample: 'Testar Exemplo',

    resultTitle: 'Pronto para Download',
    authorLabel: 'Autor',
    durationLabel: 'Duração',
    resolutionsTitle: 'Qualidades e Formatos Disponíveis',
    qualityLabel: 'Qualidade',
    formatLabel: 'Formato',
    actionDownload: 'Baixar MP4',
    actionCopyLink: 'Copiar Link',
    linkCopied: 'Link copiado para a área de transferência!',
    extractAudio: 'Baixar Áudio (MP3)',
    directDownloadNote: 'Dica: Clique com o botão direito ou pressione e segure "Baixar" caso o navegador comece a reproduzir o vídeo.',
    downloadAnother: 'Converter Outro Link',

    errorEmptyUrl: 'Por favor, insira um link válido do Twitter ou X.',
    errorInvalidDomain: 'Apenas os domínios x.com e twitter.com são suportados.',
    errorInvalidPostId: 'O link precisa conter o caminho /status/[id_numerico].',
    errorNoVideoFound: 'Nenhum vídeo ou GIF foi encontrado nesta publicação.',
    errorPrivatePost: 'Este tweet é de uma conta privada ou foi excluído. Suportamos apenas mídia pública.',
    errorNetwork: 'Não foi possível conectar aos servidores no momento. Tente novamente.',
    errorGeneric: 'Ocorreu um erro ao processar o tweet. Verifique o link e tente novamente.',

    howTitle: 'Como Baixar Vídeos do Twitter com o GetVidX',
    howSubtitle: 'Processo simples em 3 etapas para salvar seus vídeos e GIFs favoritos em segundos.',
    step1Title: '1. Copiar Link do Tweet',
    step1Desc: "Abra o X / Twitter, encontre a publicação com o vídeo ou GIF, clique em Compartilhar e escolha 'Copiar link'.",
    step2Title: '2. Colar no GetVidX',
    step2Desc: 'Cole o link na caixa de pesquisa acima e clique em Baixar para analisar os arquivos de mídia.',
    step3Title: '3. Escolher Qualidade e Salvar',
    step3Desc: 'Selecione a resolução desejada (1080p, 720p, 480p ou áudio MP3) e clique em Baixar para salvar.',
    stepBadge: 'Verificado e Instantâneo',

    whyTitle: 'Por Que Escolher o GetVidX?',
    whySubtitle: 'Projetado para máxima velocidade, privacidade e nitidez em alta definição.',
    feat1Title: 'Qualidade Full HD e 4K',
    feat1Desc: 'Baixe vídeos na resolução original de até 1080p Full HD com a melhor taxa de bits.',
    feat2Title: 'Processamento Ultra Rápido',
    feat2Desc: 'Nosso extrator otimizado busca links diretos de CDN em menos de 1,5 segundo.',
    feat3Title: 'Sem Instalar Aplicativos',
    feat3Desc: '100% online pelo navegador. Funciona no Chrome, Safari, Edge e Firefox em PC, Mac e celular.',
    feat4Title: 'Extração de Áudio para MP3',
    feat4Desc: 'Converta qualquer vídeo, música ou discurso em um arquivo de áudio MP3 de alta fidelidade.',
    feat5Title: 'Totalmente Gratuito e Ilimitado',
    feat5Desc: 'Sem cadastro, sem custos ocultos e sem limites de download por dia.',
    feat6Title: 'Privacidade e Zero Armazenamento',
    feat6Desc: 'O GetVidX não armazena cópias dos seus downloads. Todo o fluxo é feito diretamente da CDN.',

    faqTitle: 'Perguntas Frequentes',
    faqSubtitle: 'Tudo o que você precisa saber sobre o download de vídeos e áudios com o GetVidX.',

    adLabelHeader: 'ESPAÇO PATROCINADO · TOPO',
    adLabelResult: 'ESPAÇO PATROCINADO · ABAIXO DO RESULTADO',
    adNotice: 'Espaço de anúncio reservado (Totalmente separado dos botões de download)',

    directReplacementHint: 'Dica rápida: Troque x.com por getvidx.com na barra do navegador para baixar direto!',

    footerDesc: 'Baixador de vídeos e áudios do Twitter em alta velocidade. Conversor direto para MP4 e MP3.',
    footerConverters: 'CONVERSORES DE MÍDIA',
    footerLegal: 'LEGAL E CONFIANÇA',
    footerLanguages: 'IDIOMAS',
    terms: 'Termos de Serviço',
    privacy: 'Política de Privacidade',
    dmca: 'DMCA e Direitos Autorais',
    about: 'Sobre Nós',
    contact: 'Contato',
    howToDownload: 'Como Baixar',
    disclaimer: 'Aviso: GetVidX é um serviço independente e não possui vínculo com o Twitter, Inc. ou X Corp.',
    copyright: '© 2026 GetVidX. Todos os direitos reservados.',
  },

  ar: {
    navDownloader: 'تحميل فيديو تويتر',
    navMp3: 'تويتر إلى MP3',
    navGif: 'صور GIF تويتر',
    navHowItWorks: 'كيف يعمل',
    navFaq: 'الأسئلة الشائعة',
    navGuides: 'أدلة الاستخدام',

    badgeText: 'أداة سريعة ومجانية لتحميل وسائط تويتر / X',
    heroTitlePrefix: 'تحميل فيديو تويتر،',
    heroTitleHighlight: 'وحفظ MP4 و GIF بدقة HD',
    heroSubtitle:
      'أسرع طريقة لتنزيل مقاطع فيديو وصور GIF من منصة تويتر (X) بدقة Full HD و 720p أو استخراج الصوت بصيغة MP3 مباشرة إلى جهازك.',
    tabVideo: 'فيديو وصور GIF',
    tabAudio: 'صوت MP3',
    tabGif: 'صور متحركة GIF',
    inputPlaceholder: 'الصق رابط تغريدة تويتر / X هنا (مثال: https://x.com/username/status/...)',
    pasteBtn: 'لصق',
    downloadBtn: 'تحميل',
    analyzingBtn: 'جاري فحص التغريدة...',
    tipText: 'نصيحة: الصق رابط أي تغريدة عامة لعرض جميع جودات MP4 المتاحة فوراً وبدون انتظار.',
    tryExample: 'تجربة رابط توضيحي',

    resultTitle: 'جاهز للتحميل المباشر',
    authorLabel: 'الناشر',
    durationLabel: 'المدة',
    resolutionsTitle: 'الجودات والصيغ المتاحة',
    qualityLabel: 'الجودة',
    formatLabel: 'الصيغة',
    actionDownload: 'تحميل MP4',
    actionCopyLink: 'نسخ الرابط',
    linkCopied: 'تم نسخ الرابط إلى الحافظة!',
    extractAudio: 'تحميل الصوت (MP3)',
    directDownloadNote: 'نصيحة: اضغط مطولاً أو انقر بالزر الأيمن على "تحميل" إذا بدأ المتصفح بتشغيل الفيديو بدلاً من حفظه.',
    downloadAnother: 'تحويل رابط آخر',

    errorEmptyUrl: 'يرجى لصق رابط تغريدة صالح من منصة تويتر أو X.',
    errorInvalidDomain: 'النطاقات المدعومة هي x.com و twitter.com فقط.',
    errorInvalidPostId: 'يجب أن يحتوي الرابط على مسار التغريدة الكامل /status/[رقم_التغريدة].',
    errorNoVideoFound: 'لم يتم العثور على أي مقطع فيديو أو صورة GIF في هذه التغريدة. قد تحتوي على نص أو صور ثابتة فقط.',
    errorPrivatePost: 'هذه التغريدة من حساب خاص ومحمي أو تم حذفها. نحن ندعم الوسائط العامة المتاحة فقط.',
    errorNetwork: 'تعذر الاتصال بخوادم تويتر في الوقت الحالي. يرجى التحقق من الرابط والمحاولة مجدداً.',
    errorGeneric: 'حدث خطأ أثناء معالجة التغريدة. يرجى التحقق من صحة الرابط والمحاولة مرة أخرى.',

    howTitle: 'كيفية تحميل مقاطع فيديو تويتر عبر GetVidX',
    howSubtitle: 'عملية بسيطة من 3 خطوات لحفظ تغريداتك ومقاطعك المفضلة في ثوانٍ معدودة.',
    step1Title: '1. انسخ رابط التغريدة',
    step1Desc: 'افتح تطبيق أو موقع X / تويتر، وتوجه إلى المنشور الذي يحتوي الفيديو، ثم اضغط على زر المشاركة واختر "نسخ الرابط".',
    step2Title: '2. الصق الرابط في GetVidX',
    step2Desc: 'الصق الرابط المنسوخ في حقل البحث بالأعلى واضغط على زر التحميل لبدء تحليل وسائط الفيديو المتاحة.',
    step3Title: '3. اختر الجودة واحفظ الملف',
    step3Desc: 'اختر الدقة المطلوبة (1080p أو 720p أو 480p أو ملف MP3) واضغط على تحميل لحفظه مباشرة على جهازك.',
    stepBadge: 'موثوق وفوري',

    whyTitle: 'لماذا تختار موقع GetVidX؟',
    whySubtitle: 'تم تصميمه لتقديم أعلى سرعة، وخصوصية كاملة، وتشغيل وسائط فائق الدقة والوضوح.',
    feat1Title: 'جودة Full HD و 4K',
    feat1Desc: 'تنزيل مقاطع الفيديو بأعلى جودة أصلية ممكنة تصل إلى 1080p مع أفضل معدل بت متوفر.',
    feat2Title: 'معالجة فائقة السرعة',
    feat2Desc: 'نظام فحص متطور يستخرج الروابط المباشرة من شبكات CDN الرسمية في أقل من 1.5 ثانية.',
    feat3Title: 'بدون أي برامج أو تطبيقات',
    feat3Desc: 'يعمل بالكامل عبر المتصفح على هواتف آيفون وأندرويد وأجهزة الكمبيوتر بنظامي ويندوز وماك.',
    feat4Title: 'استخراج الصوت بصيغة MP3',
    feat4Desc: 'تحويل أي مقطع موسيقي أو بودكاست أو كلمة صوتية إلى ملف صوت MP3 عالي النقاء.',
    feat5Title: 'مجاني 100% وبدون حدود',
    feat5Desc: 'لا يتطلب اشتراكاً أو بطاقة مصرفية، ولا توجد أي قيود على عدد المقاطع التي يمكنك تحميلها يومياً.',
    feat6Title: 'خصوصية كاملة وبدون تخزين',
    feat6Desc: 'لا يقوم GetVidX بتخزين أي نسخة من ملفاتك. يتم نقل الوسائط مباشرة من خوادم تويتر الرسمية.',

    faqTitle: 'الأسئلة الشائعة حول التحميل',
    faqSubtitle: 'كل ما تحتاج معرفته حول تحميل الفيديوهات والصوتيات بأمان عبر GetVidX.',

    adLabelHeader: 'مساحة إعلانية مخصصة · أعلى الصفحة',
    adLabelResult: 'مساحة إعلانية مخصصة · أسفل النتيجة',
    adNotice: 'مساحة إعلانية محجوزة (مفصولة تماماً عن أزرار وعناصر التحكم في التنزيل)',

    directReplacementHint: 'حيلة التنزيل السريع: استبدل x.com بـ getvidx.com في شريط المتصفح للتحميل الفوري!',

    footerDesc: 'موقع وتطبيق ويب فائق السرعة لتحميل مقاطع فيديو وصوت تويتر. استخراج فوري لمقاطع MP4 و GIF وملفات MP3 الصوتية بجودة أصلية.',
    footerConverters: 'محولات الوسائط',
    footerLegal: 'الشروط والمصداقية',
    footerLanguages: 'اللغات المدعومة',
    terms: 'شروط الخدمة',
    privacy: 'سياسة الخصوصية',
    dmca: 'حقوق الملكية الفكرية DMCA',
    about: 'من نحن',
    contact: 'اتصل بنا',
    howToDownload: 'طريقة التحميل',
    disclaimer: 'إخلاء مسؤولية: GetVidX هو موقع مستقل تماماً ولا يرتبط بشركة Twitter أو X Corp أو أي من علاماتها التجارية.',
    copyright: '© 2026 GetVidX. جميع الحقوق محفوظة.',
  },
};

```

# src\i18n\types.ts

```ts
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

```

# src\index.css

```css
@import "tailwindcss";

```

# src\main.tsx

```tsx
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

```

# src\utils\downloader.ts

```ts
import { parseTwitterUrl } from './twitterUrl';

export interface MediaFormat {
  id: string;
  label: string;
  quality: string;
  resolution: string;
  format: 'MP4' | 'MP3' | 'GIF';
  filename: string;
  directUrl: string;
  proxyUrl: string;
  bitrate?: number;
  sizeEstimate?: string;
  isAudioOnly?: boolean;
}

export interface TweetAnalysisResult {
  tweetId: string;
  username: string;
  authorName: string;
  authorAvatar?: string;
  tweetText: string;
  thumbnailUrl?: string;
  duration?: string;
  isVideo: boolean;
  isGif: boolean;
  formats: MediaFormat[];
}

export interface DownloaderResponse {
  success: boolean;
  result?: TweetAnalysisResult;
  error?: string;
  errorCode?: 'EMPTY_URL' | 'INVALID_DOMAIN' | 'INVALID_ID' | 'NO_VIDEO' | 'PRIVATE' | 'NETWORK' | 'UNKNOWN';
}

/**
 * Helper to estimate file size from bitrate and duration
 */
function estimateSize(bitrateBps: number, durationSeconds: number): string {
  if (!bitrateBps || !durationSeconds) return 'Unknown size';
  const totalBytes = (bitrateBps * durationSeconds) / 8;
  const megabytes = totalBytes / (1024 * 1024);
  return `${megabytes.toFixed(1)} MB`;
}

/**
 * Format duration in seconds to M:SS
 */
function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Parse raw variants from Twitter CDN into sorted MediaFormat items
 */
export function buildMediaFormats(
  variants: Array<{ bitrate?: number; content_type?: string; url: string }>,
  durationSeconds: number,
  postId: string
): MediaFormat[] {
  // Filter for MP4 videos
  const mp4Variants = variants.filter(
    (v) => (v.content_type === 'video/mp4' || v.url.includes('.mp4')) && v.url
  );

  // Sort descending by bitrate
  mp4Variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

  const formats: MediaFormat[] = [];
  const seenResolutions = new Set<string>();

  for (const v of mp4Variants) {
    // Attempt to extract resolution from URL (e.g. /vid/avc1/1280x720/ or /vid/720x1280/)
    const resMatch = v.url.match(/(\d+)x(\d+)/);
    let resolution = 'Standard';
    let qualityLabel = '720p HD';
    let qualityCode = '720p';

    if (resMatch) {
      const w = parseInt(resMatch[1], 10);
      const h = parseInt(resMatch[2], 10);
      const minDim = Math.min(w, h);
      const maxDim = Math.max(w, h);
      resolution = `${w}x${h}`;

      if (minDim >= 1000 || maxDim >= 1900) {
        qualityLabel = '1080p Full HD';
        qualityCode = '1080p';
      } else if (minDim >= 700 || maxDim >= 1200) {
        qualityLabel = '720p HD';
        qualityCode = '720p';
      } else if (minDim >= 400 || maxDim >= 600) {
        qualityLabel = '480p SD';
        qualityCode = '480p';
      } else {
        qualityLabel = '360p Low';
        qualityCode = '360p';
      }
    } else if (v.bitrate) {
      if (v.bitrate > 1500000) {
        qualityLabel = '1080p Full HD';
        qualityCode = '1080p';
      } else if (v.bitrate > 800000) {
        qualityLabel = '720p HD';
        qualityCode = '720p';
      } else {
        qualityLabel = '480p SD';
        qualityCode = '480p';
      }
    }

    // De-duplicate same quality level
    if (seenResolutions.has(qualityCode)) continue;
    seenResolutions.add(qualityCode);

    const filename = `getvidx_${postId}_${qualityCode}.mp4`;
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(v.url)}&filename=${encodeURIComponent(filename)}`;

    formats.push({
      id: `format-${qualityCode}`,
      label: qualityLabel,
      quality: qualityCode,
      resolution,
      format: 'MP4',
      filename,
      directUrl: v.url,
      proxyUrl,
      bitrate: v.bitrate,
      sizeEstimate: v.bitrate ? estimateSize(v.bitrate, durationSeconds) : undefined,
    });
  }

  // If we have at least one video with audio, add the MP3 Audio option
  if (formats.length > 0) {
    const highestQuality = formats[0];
    const audioFilename = `getvidx_${postId}_audio.mp3`;
    formats.push({
      id: 'format-mp3',
      label: 'MP3 Audio (128kbps)',
      quality: 'Audio Only',
      resolution: 'Audio / Stereo',
      format: 'MP3',
      filename: audioFilename,
      directUrl: highestQuality.directUrl,
      proxyUrl: `/api/proxy-download?url=${encodeURIComponent(highestQuality.directUrl)}&filename=${encodeURIComponent(audioFilename)}&audioOnly=true`,
      isAudioOnly: true,
      sizeEstimate: durationSeconds ? `${((128000 * durationSeconds) / (8 * 1024 * 1024)).toFixed(1)} MB` : '~2.5 MB',
    });
  }

  return formats;
}

/**
 * Primary function to analyze a Twitter post URL and retrieve real media streams.
 * Attempts server-side proxy route first, falls back to direct client-safe syndication resolvers.
 */
export async function analyzeTweet(rawUrl: string): Promise<DownloaderResponse> {
  const parsed = parseTwitterUrl(rawUrl);
  if (!parsed.isValid) {
    if (parsed.error?.includes('Host must be')) {
      return { success: false, error: parsed.error, errorCode: 'INVALID_DOMAIN' };
    }
    if (parsed.error?.includes('numeric status ID')) {
      return { success: false, error: parsed.error, errorCode: 'INVALID_ID' };
    }
    return { success: false, error: parsed.error || 'Invalid URL', errorCode: 'EMPTY_URL' };
  }

  const postId = parsed.postId!;

  // 1. Try server API route first
  try {
    const apiResponse = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: parsed.normalizedUrl, postId }),
    });

    if (apiResponse.ok) {
      const data = await apiResponse.json();
      if (data.success && data.result) {
        return { success: true, result: data.result };
      }
      if (data.errorCode) {
        return { success: false, error: data.error, errorCode: data.errorCode };
      }
    }
  } catch (err) {
    // Server route might be undergoing dev restart, proceed to resilient client-side resolver
    console.warn('Backend /api/analyze unavailable, attempting client syndication fallback:', err);
  }

  // 2. Client-side fallback via public Twitter syndication / vxtwitter APIs
  try {
    // Attempt vxtwitter API resolver
    const vxUrl = `https://api.vxtwitter.com/Twitter/status/${postId}`;
    const vxRes = await fetch(vxUrl);

    if (vxRes.ok) {
      const data = await vxRes.json();
      const mediaList = data.media_extended || [];
      const videoMedia = mediaList.find(
        (m: { type: string; url: string }) => m.type === 'video' || m.type === 'gif'
      );

      if (videoMedia && videoMedia.url) {
        const isGif = videoMedia.type === 'gif' || videoMedia.url.includes('tweet_video');
        const durationSec = videoMedia.duration_millis ? videoMedia.duration_millis / 1000 : 30;

        // Collect all available variants
        const variants: Array<{ bitrate?: number; content_type?: string; url: string }> = [];
        if (Array.isArray(videoMedia.variants) && videoMedia.variants.length > 0) {
          variants.push(...videoMedia.variants);
        } else {
          variants.push({
            url: videoMedia.url,
            content_type: 'video/mp4',
            bitrate: 2176000,
          });
        }

        const formats = buildMediaFormats(variants, durationSec, postId);

        return {
          success: true,
          result: {
            tweetId: postId,
            username: data.user_screen_name || parsed.username || 'twitter_user',
            authorName: data.user_name || 'Twitter Creator',
            authorAvatar: data.user_profile_image_url,
            tweetText: data.text || '',
            thumbnailUrl: videoMedia.thumbnail_url || (videoMedia.variants && videoMedia.variants[0]?.url),
            duration: formatDuration(durationSec),
            isVideo: !isGif,
            isGif,
            formats,
          },
        };
      } else {
        return {
          success: false,
          error: 'No video stream was found in this tweet.',
          errorCode: 'NO_VIDEO',
        };
      }
    }
  } catch (err) {
    console.error('Client fallback resolver error:', err);
  }

  return {
    success: false,
    error: 'Could not retrieve video stream. Tweet may be private, deleted, or without video.',
    errorCode: 'NETWORK',
  };
}

```

# src\utils\seo.ts

```ts
import { SupportedLocale, LOCALES } from '../i18n/types';

export const CANONICAL_DOMAIN = 'https://getvidx.com';

export interface SeoMetadataOptions {
  locale: SupportedLocale;
  title: string;
  description: string;
  pathname?: string;
  type?: 'website' | 'article';
  imageUrl?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Updates browser document metadata dynamically (title, description, og, twitter, canonical, hreflang, json-ld)
 */
export function updateDocumentSeo(options: SeoMetadataOptions): void {
  const { locale, title, description, pathname = '', type = 'website', imageUrl, jsonLd } = options;

  // 1. Title
  document.title = title;

  // 2. Meta description
  setMetaTag('description', description);

  // 3. OpenGraph
  setMetaTag('og:title', title, 'property');
  setMetaTag('og:description', description, 'property');
  setMetaTag('og:type', type, 'property');
  setMetaTag('og:site_name', 'GetVidX', 'property');
  const canonicalUrl = `${CANONICAL_DOMAIN}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  setMetaTag('og:url', canonicalUrl, 'property');
  if (imageUrl) {
    setMetaTag('og:image', imageUrl, 'property');
  }

  // 4. Twitter Card
  setMetaTag('twitter:card', 'summary_large_image', 'name');
  setMetaTag('twitter:title', title, 'name');
  setMetaTag('twitter:description', description, 'name');
  if (imageUrl) {
    setMetaTag('twitter:image', imageUrl, 'name');
  }

  // 5. HTML lang & dir
  const currentLocaleConfig = LOCALES[locale] || LOCALES.en;
  document.documentElement.lang = currentLocaleConfig.code;
  document.documentElement.dir = currentLocaleConfig.direction;

  // 6. Canonical link tag
  updateCanonicalTag(canonicalUrl);

  // 7. Hreflang links
  updateHreflangTags(pathname);

  // 8. JSON-LD structured data
  if (jsonLd) {
    updateJsonLd(jsonLd);
  }
}

function setMetaTag(nameOrProperty: string, content: string, attributeType: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attributeType}="${nameOrProperty}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeType, nameOrProperty);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateCanonicalTag(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function updateHreflangTags(pathname: string) {
  // Remove existing hreflang tags
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());

  // Base slug without leading locale prefix
  const cleanPath = pathname.replace(/^\/(en|es|fr|pt|ar)(\/|$)/, '/');

  const supportedLocales: SupportedLocale[] = ['en', 'es', 'fr', 'pt', 'ar'];

  supportedLocales.forEach((lang) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', lang);
    const localizedPath = lang === 'en' ? cleanPath : `/${lang}${cleanPath === '/' ? '' : cleanPath}`;
    link.setAttribute('href', `${CANONICAL_DOMAIN}${localizedPath}`);
    document.head.appendChild(link);
  });

  // x-default points to English
  const xDefault = document.createElement('link');
  xDefault.setAttribute('rel', 'alternate');
  xDefault.setAttribute('hreflang', 'x-default');
  xDefault.setAttribute('href', `${CANONICAL_DOMAIN}${cleanPath}`);
  document.head.appendChild(xDefault);
}

function updateJsonLd(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  let script = document.getElementById('getvidx-jsonld') as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = 'getvidx-jsonld';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

/**
 * Builds standard WebApplication Schema for GetVidX
 */
export function buildWebApplicationSchema(locale: SupportedLocale): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'GetVidX - Twitter & X Video Downloader',
    url: CANONICAL_DOMAIN,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description:
      'High-speed Twitter (X) video downloader. Save MP4 videos in 1080p Full HD, GIFs, and MP3 audio directly to your device.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    inLanguage: locale,
  };
}

/**
 * Builds FAQPage Schema for rich Google search snippets
 */
export function buildFaqSchema(faqs: Array<{ question: string; answer: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Builds HowTo Schema for step-by-step guides
 */
export function buildHowToSchema(
  name: string,
  description: string,
  steps: Array<{ step: string; detail: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((s, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: s.step,
      text: s.detail,
    })),
  };
}

```

# src\utils\twitterUrl.ts

```ts
export interface ParsedTwitterUrl {
  isValid: boolean;
  normalizedUrl: string;
  postId: string | null;
  username: string | null;
  error?: string;
}

const ALLOWED_HOSTS = new Set([
  'x.com',
  'www.x.com',
  'twitter.com',
  'www.twitter.com',
  'mobile.twitter.com',
  'm.twitter.com',
]);

/**
 * Validates and extracts details from a Twitter or X URL safely.
 */
export function parseTwitterUrl(rawInput: string): ParsedTwitterUrl {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isValid: false,
      normalizedUrl: '',
      postId: null,
      username: null,
      error: 'Empty or invalid input',
    };
  }

  let trimmed = rawInput.trim();

  // If user pasted something like "x.com/username/status/123456" without protocol:
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      normalizedUrl: '',
      postId: null,
      username: null,
      error: 'Malformed URL structure',
    };
  }

  // Only allow http and https
  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    return {
      isValid: false,
      normalizedUrl: '',
      postId: null,
      username: null,
      error: 'Unsupported protocol scheme. Only https:// is permitted.',
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(hostname)) {
    return {
      isValid: false,
      normalizedUrl: '',
      postId: null,
      username: null,
      error: 'Host must be x.com or twitter.com',
    };
  }

  // Path format typically: /:username/status/:id or /i/web/status/:id or /i/status/:id
  const pathname = parsedUrl.pathname;
  const statusRegex = /(?:\/([^/]+))?\/status\/(\d+)/i;
  const match = pathname.match(statusRegex);

  if (!match || !match[2]) {
    return {
      isValid: false,
      normalizedUrl: '',
      postId: null,
      username: null,
      error: 'Missing valid numeric status ID in post URL',
    };
  }

  const username = match[1] || 'i';
  const postId = match[2];

  // Normalized safe public canonical format: https://x.com/[username]/status/[id]
  const normalizedUrl = `https://x.com/${username}/status/${postId}`;

  return {
    isValid: true,
    normalizedUrl,
    postId,
    username,
  };
}

/**
 * Inspects a route pathname (e.g. from window.location.pathname)
 * to detect if user navigated via direct URL replacement (e.g. /username/status/123456789).
 */
export function detectDirectReplacementPath(pathname: string): { isDirect: boolean; normalizedUrl?: string } {
  if (!pathname || pathname === '/') return { isDirect: false };

  // Match /:username/status/:id or /:locale/:username/status/:id
  const directRegex = /^(?:\/(en|es|fr|pt|ar))?\/([a-zA-Z0-9_]+)\/status\/(\d+)\/?$/;
  const match = pathname.match(directRegex);

  if (match && match[2] && match[3]) {
    const username = match[2];
    const postId = match[3];
    return {
      isDirect: true,
      normalizedUrl: `https://x.com/${username}/status/${postId}`,
    };
  }

  return { isDirect: false };
}

```

# tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "types": ["vite/client"],
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "exclude": ["dist"]
}

```

# vite.config.ts

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

```

