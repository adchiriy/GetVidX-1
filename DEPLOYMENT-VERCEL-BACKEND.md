# GetVidX deployment: Vercel frontend + separate media backend

## Why split it

Vercel is suitable for the static React frontend, but the current Express application also starts `yt-dlp` and `ffmpeg` subprocesses and streams media. Those operations should run on a persistent Docker-capable service with explicit CPU, memory, and request-time limits.

## 1. Deploy the backend first

1. Create a new service on Railway (or another Docker host that supports Docker images and long-running HTTP responses).
2. Connect this repository and use the repository `Dockerfile`.
3. Set the service's start command to the Dockerfile default; do not override it with `vite`.
4. Set `NODE_ENV=production` and `APP_URL` to the public backend URL if your hosting platform needs it.
5. Wait for the service to build and deploy. Test `https://YOUR_BACKEND_HOST/robots.txt` and `https://YOUR_BACKEND_HOST/sitemap.xml`.
6. The backend needs outbound HTTPS access to the public media providers. Do not add secrets or API keys unless the selected provider explicitly requires them.

## 2. Configure Vercel

1. Import the same repository as a Vercel project.
2. Set the framework to Vite and build command to `npm run build`; output directory is `dist`.
3. Copy `vercel.json.example` to `vercel.json` and replace every `REPLACE_WITH_YOUR_BACKEND_HOST` with the backend hostname only (for example `your-service.up.railway.app`, without `https://`).
4. Deploy Vercel again. The rewrites preserve the frontend's existing same-origin `/api/*` requests and route them to the backend.
5. Confirm `/api/analyze`, `/api/proxy-download`, `/api/live-download`, `/robots.txt`, `/sitemap.xml`, and `/sitemap_1.xml` route correctly through the public Vercel domain.

## 3. Smoke tests before launch

- `npm install` and `npm run build` pass locally.
- Submit a public X/Twitter post with a video; confirm analysis returns formats.
- Download an MP4 and check it plays on desktop and mobile.
- Download the audio option and confirm the response really contains M4A audio, not video bytes with an audio filename.
- Test invalid domains, non-HTTPS URLs, redirect targets outside the allowlist, missing media, and expired media links.
- Check server logs for failures without exposing raw upstream URLs or internal stack traces to visitors.
- Watch backend memory and request duration under concurrent downloads; set rate limits at the hosting edge before public launch.

## Important limits

- External resolver APIs and X/Twitter media URLs can change or rate-limit requests; no resolver can guarantee every public post works.
- This deployment does not add an Admin dashboard. It preserves the current project scope.
- The sitemap intentionally omits `lastmod` rather than publishing a stale hard-coded date. Add accurate `lastmod` values only when content modification dates are tracked reliably.
- Before launch, perform a security review of FFmpeg input redirects and rate limiting. The allowlist and redirect checks reduce SSRF exposure but should not be treated as a complete security audit.

## Before you publish

- Verify that `getvidx.com` is actually registered and configured for your use. The sitemap currently targets that domain in source code; change `BASE_PRODUCTION_DOMAIN` in `src/data/sitemapData.ts` if your final verified domain differs.
- The backend currently includes the app's static build too. This is intentional for easy backend health checks, but the public site should be accessed through Vercel once the rewrites are configured.
- Set appropriate request/rate limits at the backend provider or edge. This patch does not add a full rate-limit store.
