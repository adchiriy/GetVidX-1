# GetVidX — merged edition

GetVidX's React/Express media engine with a responsive dark interface inspired by the supplied SaveThisX reconstruction. Includes five languages (English, French, Spanish, Portuguese, Arabic/RTL), video/photo results, audio conversion routes, guides, legal pages and server-rendered SEO metadata.

## Run locally

Requires Node 22.12+ (Node 24 also tested). Install FFmpeg and yt-dlp on PATH for audio conversion and live/Space extraction.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Basic MP4 analysis/proxy downloads can work without the optional system binaries. MP3/M4A, HLS conversion and yt-dlp extraction require them. No Gemini key is needed.

## Production: Docker recommended

The Dockerfile installs FFmpeg and yt-dlp, builds the client, and serves the complete site through Express.

```sh
docker build --build-arg VITE_SITE_URL=https://YOUR_DOMAIN -t getvidx .
docker run --rm -p 3000:3000 -e PORT=3000 getvidx
```

Replace YOUR_DOMAIN with your verified domain. Deploy this Docker image on a service supporting long-running HTTP streams. Health check: `/api/health`. Use HTTPS at the hosting edge. No hosting account was configured or changed as part of this delivery.

For a native Node production run:

```sh
npm ci
npm run build
npm start
```

Set `NODE_ENV=production` in your host environment. Set `VITE_SITE_URL` consistently at build and runtime. Copy `.env.example` to `.env` for local settings. Only configure `TRUST_PROXY_HOPS` when the network path and number of trusted reverse proxies are known. Put rate limits and resource limits at your hosting edge for multi-instance deployments.

## Vercel Hobby deployment (no separate backend)

The repository now includes `api/index.ts` and `vercel.json`. Push to main on the connected Vercel project. Build preparation downloads the official standalone Linux yt-dlp executable and verifies its SHA-256 checksum. `ffmpeg-static` supplies FFmpeg. There are no API keys or paid third-party services.

The Vercel Function serves `/api/health`, `/api/analyze`, `/api/proxy-download`, and `/api/live-download`. The frontend remains a static Vite build. Existing Docker deployment remains supported.

Hobby usage quotas still apply. Functions have a maximum five-minute invocation with Fluid Compute. Converted live/audio output is explicitly limited to the first 240 seconds, with a 270-second process deadline and a visible notice in the result. Original MP4 downloads retain their source duration. This is not an unlimited live recorder. No paid plan or service is enabled by this code.

Check `/api/health`: `converter` and `resolver` should both be true on Vercel. If the deployed plan predates Fluid Compute, check the project's function duration setting before using longer conversions.

## Checks

```sh
npm run lint
npm test
npm run build
```

`lint` runs TypeScript. Tests cover media URL validation, nested HLS URI rewriting, redirect rejection, Twitter URL parsing, converter format routing, and empty-provider photo fallback.

Verified during delivery: normal npm installation; TypeScript and production build; six passing tests; desktop/mobile UI and Arabic RTL with no horizontal overflow; invalid-link UI; home, locale, MP3, privacy, 404, robots and sitemap routes; real public-post analysis; real partial MP4 download (HTTP 206, MP4 `ftyp` signature). The new native FFmpeg regression test generates an HLS fixture and remuxes it through the protected gateway. Docker itself was not executed here. Test those on the chosen host before launch. External X/provider availability can vary.

## Merge decisions

- Retained GetVidX's functioning analysis backend, provider fallbacks, translations, SEO routes and media formats.
- Adapted SaveThisX's navy/cyan palette, focused downloader layout and visual three-step guide. Its supplied code contains a simulated submit handler, placeholder samples, and language links all pointing to `/en`; these were not retained.
- Removed empty advertisement placeholders, public AI Studio source archives and unused AI/motion dependencies.
- Fixed installation conflict by removing the unused direct esbuild version, and added npm lockfile / `npm ci` for Docker.
- Audio/live failures now show an error instead of saving video bytes under an audio filename. HTML/JSON responses are rejected as media.
- Reserved conversion capacity before asynchronous work; added job timeout, bounded error logs, disconnect handling and backpressure.
- FFmpeg now reads from a per-job loopback gateway. Nested HLS playlists, segments, key URIs and redirects are validated against the same CDN allowlist. FFmpeg's input protocols are restricted to HTTP/TCP/crypto.
- Corrected empty-photo-array fallbacks and HLS-vs-converted-MP4 preview detection.
- Lazy-loaded results and HLS: initial JS reduced from about 986 KB to 395 KB (gzip: 309 KB to 125 KB). HLS still has a large deferred chunk.

## Known limits

- Converter requests are limited to eight per process, ten minutes of wall time, and two hours of output media. The rate limiter is per process, not a distributed service.
- Download UI still buffers responses into a Blob for browser saving. Large files may use significant memory on mobile.
- Provider schemas, signed URLs, source audio tracks and live availability affect success. No promise that every post or Space can be downloaded.
- Original legal text and support emails are retained. Verify contact details, policy accuracy and your domain before publishing.
- This merge does not establish rights to either original project. Original repository had no explicit license in the examined snapshot.
