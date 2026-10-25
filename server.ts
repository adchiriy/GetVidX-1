import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import {
  buildChildSitemapXml,
  buildSitemapIndexXml,
  buildRobotsTxt,
} from './src/data/sitemapData';
import { parseTwitterUrl } from './src/utils/twitterUrl';
import { buildMediaFormats, buildPhotoFormats } from './src/utils/downloader';
import { prerenderPage } from './src/utils/prerender';

const execFileAsync = promisify(execFile);

/**
 * Universal fallback resolver using yt-dlp binary for Twitter Spaces, Live Broadcasts, and videos
 */
async function resolveWithYtDlp(targetUrl: string): Promise<any | null> {
  try {
    const ytdlpBin = fs.existsSync('/usr/local/bin/yt-dlp') ? '/usr/local/bin/yt-dlp' : 'yt-dlp';
    const { stdout } = await execFileAsync(ytdlpBin, [
      '--dump-json',
      '--no-playlist',
      '--no-warnings',
      '--socket-timeout', '6',
      targetUrl,
    ], { timeout: 10000 });

    if (stdout && stdout.trim()) {
      return JSON.parse(stdout.trim());
    }
  } catch (err: any) {
    // yt-dlp was unable to extract or stream is offline
  }
  return null;
}

const ALLOWED_MEDIA_HOSTS = new Set([
  'twimg.com',
  'twitter.com',
  'x.com',
  'pscp.tv',
]);

/**
 * Validates that host belongs to authorized Twitter/X CDNs and rejects IP literals & localhost
 */
function isAllowedMediaHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(lower) || lower.includes(':') || lower === 'localhost') {
    return false;
  }
  for (const base of ALLOWED_MEDIA_HOSTS) {
    if (lower === base || lower.endsWith('.' + base)) {
      return true;
    }
  }
  return false;
}

/**
 * Strict media URL validator for SSRF prevention
 */
function validateMediaUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid media URL format.');
  }

  // Twitter/X media CDNs are strictly HTTPS
  if (parsed.protocol !== 'https:') {
    throw new Error('Only secure HTTPS protocol is permitted for media requests.');
  }

  if (parsed.port && parsed.port !== '443') {
    throw new Error('Non-standard ports are strictly forbidden.');
  }

  if (parsed.username || parsed.password) {
    throw new Error('Credentials in URL are strictly forbidden.');
  }

  if (!isAllowedMediaHost(parsed.hostname)) {
    throw new Error('Access forbidden: only authorized Twitter/X media CDN hosts are permitted.');
  }

  return parsed;
}

/**
 * Fetch helper with manual redirect validation.
 * Verifies that the initial URL and any redirect Location headers strictly conform
 * to authorized media CDN domains, preventing SSRF open redirect bypasses.
 */
async function fetchWithSafeRedirects(
  initialUrl: string,
  init: RequestInit,
  maxRedirects = 5
): Promise<{ response: globalThis.Response; finalUrl: string }> {
  let currentUrl = initialUrl;
  for (let i = 0; i <= maxRedirects; i++) {
    validateMediaUrl(currentUrl);

    const response = await fetch(currentUrl, {
      ...init,
      redirect: 'manual',
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) {
        throw new Error('Redirect response missing Location header.');
      }
      const nextUrl = new URL(location, currentUrl).toString();
      validateMediaUrl(nextUrl);
      currentUrl = nextUrl;
      continue;
    }

    return { response, finalUrl: currentUrl };
  }
  throw new Error('Exceeded maximum redirect depth.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';
  app.use(express.json({ limit: '16kb' }));

  // In-memory IP rate limiter for API endpoints (120 req/min per IP)
  const ipRequests = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW_MS = 60 * 1000;
  const MAX_REQUESTS_PER_WINDOW = 120;

  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of ipRequests.entries()) {
      if (now > entry.resetTime) {
        ipRequests.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  app.use('/api', (req, res, next) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = ipRequests.get(ip);

    if (!entry || now > entry.resetTime) {
      ipRequests.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else {
      entry.count++;
      if (entry.count > MAX_REQUESTS_PER_WINDOW) {
        res.setHeader('Retry-After', '60');
        res.status(429).json({ error: 'Too many requests. Please slow down and try again.' });
        return;
      }
    }
    next();
  });

  // Track active media transcoding jobs across backend
  let activeFfmpegCount = 0;
  const MAX_CONCURRENT_FFMPEG = 8;

  // Security Headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

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

  // 4. API: Analyze Tweet Endpoint with multi-provider resilience
  app.post('/api/analyze', async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ success: false, error: 'URL is required', errorCode: 'EMPTY_URL' });
        return;
      }

      const parsed = parseTwitterUrl(url);
      if (!parsed.isValid || !parsed.postId) {
        const isDomainError = parsed.error?.includes('Host must be') || parsed.error?.includes('Unsupported protocol');
        res.status(400).json({
          success: false,
          error: parsed.error,
          errorCode: isDomainError ? 'INVALID_DOMAIN' : 'INVALID_ID',
        });
        return;
      }

      const postId = parsed.postId;
      const username = parsed.username || 'i';
      const isLivePost = Boolean(parsed.isLive || parsed.isSpace || parsed.isBroadcast);

      // Fast, resilient concurrent resolvers for Twitter/X posts
      const resolverConfigs = [
        { url: `https://api.fxtwitter.com/2/status/${postId}`, ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        { url: `https://api.vxtwitter.com/Twitter/status/${postId}`, ua: 'TelegramBot (like TwitterBot)' },
        { url: `https://api.fxtwitter.com/${username}/status/${postId}`, ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        { url: `https://api.vxtwitter.com/${username}/status/${postId}`, ua: 'Twitterbot/1.0' },
      ];

      const fetchCandidate = async (config: { url: string; ua: string }) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        try {
          const response = await fetch(config.url, {
            headers: {
              'User-Agent': config.ua,
              Accept: 'application/json',
            },
            signal: controller.signal,
          });
          if (response.ok) {
            const json = await response.json();
            return json.status || json.tweet || json;
          }
        } catch (_) {
          // Ignore failed candidate
        } finally {
          clearTimeout(timeout);
        }
        return null;
      };

      const candidates = await Promise.all(resolverConfigs.map(fetchCandidate));

      let data: any = candidates.find((c) =>
        Boolean(
          (c?.media && (c.media.videos?.length > 0 || c.media.photos?.length > 0)) ||
          (c?.media_extended && c.media_extended.length > 0) ||
          (c?.mediaURLs && c.mediaURLs.length > 0) ||
          c?.embed_card ||
          c?.quote
        )
      );

      if (!data) {
        data = candidates.find((c) => c && (c.text || c.id || c.conversationID || c.tweetID));
      }

      // If data wasn't found through standard resolvers or if it is a Live/Space,
      // attempt extraction via yt-dlp
      if (!data || isLivePost) {
        const ytData = await resolveWithYtDlp(parsed.normalizedUrl || url);
        if (ytData) {
          const ytFormats = ytData.formats || [];
          const mp4s = ytFormats.filter(
            (f: any) => f.ext === 'mp4' && f.vcodec !== 'none' && !f.url?.includes('.m3u8')
          );
          const m3u8 = ytFormats.find((f: any) => f.url?.includes('.m3u8'));
          const durationSec = ytData.duration || 0;
          const isLiveStream = Boolean(ytData.is_live || isLivePost || m3u8);

          const variants: any[] = [];
          for (const m of mp4s) {
            variants.push({
              url: m.url,
              content_type: 'video/mp4',
              container: 'mp4',
              bitrate: m.tbr ? m.tbr * 1000 : 1500000,
            });
          }
          if (m3u8) {
            variants.push({
              url: m3u8.url,
              content_type: 'application/x-mpegURL',
              container: 'm3u8',
            });
          }

          if (variants.length > 0) {
            const mappedFormats = buildMediaFormats(variants, durationSec, postId);
            const m = Math.floor(durationSec / 60);
            const s = Math.floor(durationSec % 60);
            const durationStr = durationSec > 0 ? `${m}:${s < 10 ? '0' : ''}${s}` : (isLiveStream ? 'Live / Replay' : '0:30');

            const previewFormat = mappedFormats.find((f) => f.format === 'MP4' && (f.quality === '720p' || f.quality === '480p')) ||
              mappedFormats.find((f) => f.format === 'MP4') ||
              mappedFormats[0];

            res.json({
              success: true,
              result: {
                tweetId: postId,
                username: ytData.uploader_id || ytData.uploader || parsed.username || 'twitter_user',
                authorName: ytData.uploader || ytData.channel || 'Twitter Creator',
                authorAvatar: undefined,
                tweetText: ytData.title || ytData.description || '',
                thumbnailUrl: ytData.thumbnail,
                duration: durationStr,
                isVideo: true,
                isGif: false,
                isLive: isLiveStream,
                isSpace: Boolean(parsed.isSpace),
                isBroadcast: Boolean(parsed.isBroadcast),
                streamUrl: m3u8?.url,
                previewUrl: previewFormat?.directUrl || m3u8?.url,
                formats: mappedFormats,
              },
            });
            return;
          }
        }
      }

      if (!data) {
        res.status(404).json({
          success: false,
          error: isLivePost
            ? 'Cette diffusion en direct ou ce Space est introuvable ou n\'est plus accessible.'
            : 'Tweet could not be found or is protected.',
          errorCode: 'PRIVATE',
        });
        return;
      }

      // 1. Check if tweet is a Quote Tweet where the outer tweet has no direct video,
      // but the quoted tweet contains the video or photos!
      let targetPost = data;
      let isQuoted = false;
      let quotedAuthor = '';

      const hasDirectVideos = Boolean(
        targetPost.media?.videos?.length ||
        targetPost.media?.all?.some((m: any) => m.type === 'video' || m.type === 'gif') ||
        targetPost.media_extended?.some((m: any) => m.type === 'video' || m.type === 'gif') ||
        (Array.isArray(targetPost.mediaURLs) && targetPost.mediaURLs.some((u: string) => u.includes('.mp4') || u.includes('video.twimg.com')))
      );

      if (!hasDirectVideos && data.quote) {
        const q = data.quote;
        const quoteHasMedia = Boolean(
          q.media?.videos?.length ||
          q.media?.all?.some((m: any) => m.type === 'video' || m.type === 'gif') ||
          q.media_extended?.some((m: any) => m.type === 'video' || m.type === 'gif') ||
          (Array.isArray(q.mediaURLs) && q.mediaURLs.some((u: string) => u.includes('.mp4') || u.includes('video.twimg.com'))) ||
          q.media?.photos?.length
        );
        if (quoteHasMedia) {
          targetPost = q;
          isQuoted = true;
          quotedAuthor = q.author?.name || q.user_name || q.author?.screen_name || 'Quoted Post';
        }
      }

      // 2. Extract video/gif media from targetPost
      const mediaList =
        (Array.isArray(targetPost.media?.videos) && targetPost.media.videos.length > 0 ? targetPost.media.videos : null) ||
        (Array.isArray(targetPost.media?.all) && targetPost.media.all.length > 0 ? targetPost.media.all : null) ||
        (Array.isArray(targetPost.media_extended) && targetPost.media_extended.length > 0 ? targetPost.media_extended : null) ||
        [];

      let videoMedia = mediaList.find(
        (m: { type: string; url: string }) => m.type === 'video' || m.type === 'gif'
      ) || (targetPost.media?.videos && targetPost.media.videos[0]) || null;

      // Also check targetPost.mediaURLs for direct .mp4 if not found in mediaList
      if (!videoMedia && Array.isArray(targetPost.mediaURLs)) {
        const mp4Url = targetPost.mediaURLs.find((u: string) => u.includes('.mp4') || u.includes('video.twimg.com'));
        if (mp4Url) {
          videoMedia = {
            type: 'video',
            url: mp4Url,
            thumbnail_url: targetPost.thumbnail_url || targetPost.mediaURLs[0],
          };
        }
      }

      // 3. If NO video/gif stream was found through resolvers, attempt extraction with yt-dlp
      if (!videoMedia || (!videoMedia.url && (!videoMedia.formats || videoMedia.formats.length === 0) && (!videoMedia.variants || videoMedia.variants.length === 0))) {
        const ytData = await resolveWithYtDlp(parsed.normalizedUrl || url);
        if (ytData && ytData.formats && ytData.formats.length > 0) {
          const ytFormats = ytData.formats || [];
          const mp4s = ytFormats.filter(
            (f: any) => f.ext === 'mp4' && f.vcodec !== 'none' && !f.url?.includes('.m3u8')
          );
          const m3u8 = ytFormats.find((f: any) => f.url?.includes('.m3u8'));
          const durationSec = ytData.duration || 0;
          const isLiveStream = Boolean(ytData.is_live || isLivePost || m3u8);

          const variants: any[] = [];
          for (const m of mp4s) {
            variants.push({
              url: m.url,
              content_type: 'video/mp4',
              container: 'mp4',
              bitrate: m.tbr ? m.tbr * 1000 : 1500000,
            });
          }
          if (m3u8) {
            variants.push({
              url: m3u8.url,
              content_type: 'application/x-mpegURL',
              container: 'm3u8',
            });
          }

          if (variants.length > 0) {
            const mappedFormats = buildMediaFormats(variants, durationSec, postId);
            const m = Math.floor(durationSec / 60);
            const s = Math.floor(durationSec % 60);
            const durationStr = durationSec > 0 ? `${m}:${s < 10 ? '0' : ''}${s}` : (isLiveStream ? 'Live / Replay' : '0:30');

            const previewFormat = mappedFormats.find((f) => f.format === 'MP4' && (f.quality === '720p' || f.quality === '480p')) ||
              mappedFormats.find((f) => f.format === 'MP4') ||
              mappedFormats[0];

            res.json({
              success: true,
              result: {
                tweetId: postId,
                username: ytData.uploader_id || ytData.uploader || targetPost.author?.screen_name || parsed.username || 'twitter_user',
                authorName: ytData.uploader || ytData.channel || targetPost.author?.name || 'Twitter Creator',
                authorAvatar: targetPost.author?.avatar_url || targetPost.user_profile_image_url,
                tweetText: ytData.title || targetPost.text || '',
                thumbnailUrl: ytData.thumbnail || targetPost.thumbnail_url,
                duration: durationStr,
                isVideo: true,
                isGif: false,
                isLive: isLiveStream,
                isSpace: Boolean(parsed.isSpace),
                isBroadcast: Boolean(parsed.isBroadcast),
                streamUrl: m3u8?.url,
                previewUrl: previewFormat?.directUrl || m3u8?.url,
                formats: mappedFormats,
              },
            });
            return;
          }
        }

        const rawPhotos =
          (Array.isArray(targetPost.media?.photos) && targetPost.media.photos.length > 0 ? targetPost.media.photos : null) ||
          (Array.isArray(data.media?.photos) && data.media.photos.length > 0 ? data.media.photos : null) ||
          (Array.isArray(targetPost.media?.all) ? targetPost.media.all.filter((m: any) => m.type === 'photo') : null) ||
          (Array.isArray(targetPost.media_extended) ? targetPost.media_extended.filter((m: any) => m.type === 'image') : null) ||
          (Array.isArray(targetPost.mediaURLs) ? targetPost.mediaURLs.filter((u: string) => !u.includes('.mp4')).map((u: string) => ({ url: u })) : null) ||
          [];

        if (rawPhotos.length > 0) {
          const photoFormats = buildPhotoFormats(rawPhotos, postId);
          res.json({
            success: true,
            result: {
              tweetId: postId,
              username: targetPost.user_screen_name || targetPost.author?.screen_name || parsed.username || 'twitter_user',
              authorName: targetPost.user_name || targetPost.author?.name || 'Twitter Creator',
              authorAvatar: targetPost.user_profile_image_url || targetPost.author?.avatar_url,
              tweetText: targetPost.text || (targetPost.raw_text?.text ? targetPost.raw_text.text : data.text || ''),
              thumbnailUrl: rawPhotos[0].url,
              duration: `${rawPhotos.length} Photo${rawPhotos.length > 1 ? 's' : ''}`,
              isVideo: false,
              isGif: false,
              isPhoto: true,
              isQuoted,
              quotedAuthor: isQuoted ? quotedAuthor : undefined,
              previewUrl: rawPhotos[0].url,
              photos: rawPhotos.map((p: any) => ({ url: p.url, width: p.width, height: p.height })),
              formats: photoFormats,
            },
          });
          return;
        }

        // Truly text-only: No video, no gif, no photos, no live stream
        res.status(422).json({
          success: false,
          error: isLivePost
            ? 'No live broadcast or audio stream was found for this link.'
            : 'This tweet contains only text without any attached videos, GIFs, or photos.',
          errorCode: 'NO_VIDEO',
        });
        return;
      }

      const isGif = videoMedia.type === 'gif' || (videoMedia.url && videoMedia.url.includes('tweet_video'));
      const durationSec = videoMedia.duration || (videoMedia.duration_millis ? videoMedia.duration_millis / 1000 : 30);

      const rawVariants = Array.isArray(videoMedia.formats) && videoMedia.formats.length > 0
        ? videoMedia.formats
        : Array.isArray(videoMedia.variants) && videoMedia.variants.length > 0
        ? videoMedia.variants
        : [];

      const variants: Array<{ bitrate?: number; content_type?: string; container?: string; url: string }> = [];
      if (rawVariants.length > 0) {
        variants.push(...rawVariants);
      } else if (videoMedia.url) {
        variants.push({
          url: videoMedia.url,
          content_type: 'video/mp4',
          bitrate: 2176000,
        });
      }

      const formats = buildMediaFormats(variants, durationSec, postId);

      const m = Math.floor(durationSec / 60);
      const s = Math.floor(durationSec % 60);
      const durationStr = durationSec > 0 ? `${m}:${s < 10 ? '0' : ''}${s}` : 'Live';

      // Pick preview video URL (preferably 720p or standard MP4 for seamless browser preview)
      const previewFormat = formats.find((f) => f.format === 'MP4' && (f.quality === '720p' || f.quality === '480p')) ||
        formats.find((f) => f.format === 'MP4') ||
        formats[0];

      res.json({
        success: true,
        result: {
          tweetId: postId,
          username: targetPost.user_screen_name || targetPost.author?.screen_name || data.author?.screen_name || parsed.username || 'twitter_user',
          authorName: targetPost.user_name || targetPost.author?.name || data.author?.name || 'Twitter Creator',
          authorAvatar: targetPost.user_profile_image_url || targetPost.author?.avatar_url || data.author?.avatar_url,
          tweetText: targetPost.text || (targetPost.raw_text?.text ? targetPost.raw_text.text : data.text || ''),
          thumbnailUrl: videoMedia.thumbnail_url || (variants[0]?.url ? undefined : undefined),
          duration: durationStr,
          isVideo: !isGif,
          isGif,
          isLive: isLivePost || Boolean(variants.some((v) => v.url?.includes('.m3u8'))),
          isSpace: Boolean(parsed.isSpace),
          isBroadcast: Boolean(parsed.isBroadcast),
          isQuoted,
          quotedAuthor: isQuoted ? quotedAuthor : undefined,
          streamUrl: variants.find((v) => v.url?.includes('.m3u8'))?.url,
          previewUrl: previewFormat?.directUrl || videoMedia.url,
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

  // 5. API: Direct Media Proxy Download (Streams upstream response directly with SSRF & redirect protection)
  app.all(['/api/proxy-download'], async (req: Request, res: Response) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.status(204).end();
      return;
    }

    // Only support GET and HEAD
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const mediaUrl = req.query.url as string;
      const rawFilename = (req.query.filename as string) || '';

      if (!mediaUrl) {
        res.status(400).json({ error: 'Missing media URL parameter.' });
        return;
      }

      // SSRF & Host Validation
      try {
        validateMediaUrl(mediaUrl);
      } catch (validationErr: any) {
        res.status(403).json({ error: validationErr.message || 'Access forbidden.' });
        return;
      }

      // Sanitize filename against path traversal and dangerous characters
      const defaultFilename = 'getvidx_video.mp4';
      const sanitizedBase = path.basename(rawFilename).replace(/[^\w\d_.-]/g, '_').trim();
      const safeFilename = sanitizedBase && sanitizedBase !== '.' ? sanitizedBase : defaultFilename;

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 60000); // 60s timeout
      req.on('close', () => abortController.abort());

      const upstreamHeaders: Record<string, string> = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: 'https://twitter.com/',
        Accept: '*/*',
      };

      // Forward HTTP Range requests to upstream for seekable video playback
      if (req.headers.range) {
        upstreamHeaders['Range'] = req.headers.range;
      }

      // Stream request to upstream Twitter CDN with strict manual redirect validation
      const { response: upstream } = await fetchWithSafeRedirects(
        mediaUrl,
        {
          method: req.method === 'HEAD' ? 'HEAD' : 'GET',
          headers: upstreamHeaders,
          signal: abortController.signal,
        },
        5
      );

      clearTimeout(timeoutId);

      if (!upstream.ok && upstream.status !== 206) {
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

      let contentType = upstream.headers.get('content-type') || 'video/mp4';
      if (safeFilename.endsWith('.mp3')) contentType = 'audio/mpeg';
      else if (safeFilename.endsWith('.m4a')) contentType = 'audio/mp4';
      else if (safeFilename.endsWith('.gif')) contentType = 'image/gif';
      else if (safeFilename.endsWith('.jpg') || safeFilename.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (safeFilename.endsWith('.png')) contentType = 'image/png';
      else if (safeFilename.endsWith('.webp')) contentType = 'image/webp';
      else if (safeFilename.endsWith('.m3u8')) contentType = 'application/vnd.apple.mpegurl';
      else if (safeFilename.endsWith('.mp4')) contentType = 'video/mp4';

      const disposition = `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', disposition);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Range');
      res.setHeader('Cache-Control', 'public, max-age=86400');

      const MAX_DOWNLOAD_BYTES = 1024 * 1024 * 1024; // 1 GB cap

      if (upstream.headers.has('content-length')) {
        const contentLength = parseInt(upstream.headers.get('content-length')!, 10);
        if (contentLength > MAX_DOWNLOAD_BYTES) {
          res.status(413).json({ error: 'Media exceeds maximum supported download size (1 GB).' });
          return;
        }
        res.setHeader('Content-Length', contentLength.toString());
      }
      if (upstream.headers.has('content-range')) {
        res.setHeader('Content-Range', upstream.headers.get('content-range')!);
      }

      if (upstream.status === 206) {
        res.status(206);
      } else {
        res.status(200);
      }

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      if (!upstream.body) {
        res.end();
        return;
      }

      // Stream response body directly to client instead of buffering in memory
      const readableStream = Readable.fromWeb(upstream.body as any);

      let streamedBytes = 0;
      readableStream.on('data', (chunk) => {
        streamedBytes += chunk.length;
        if (streamedBytes > MAX_DOWNLOAD_BYTES) {
          abortController.abort();
          readableStream.destroy(new Error('Download size limit exceeded.'));
        }
      });

      readableStream.pipe(res);

      readableStream.on('error', (streamErr) => {
        console.error('Upstream stream error:', streamErr);
        if (!res.headersSent) {
          res.status(502).json({ error: 'Stream interrupted from media provider.' });
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

  // 5b. API: Live Stream & Audio Converter / Downloader using FFmpeg (Streams MP4, M4A, MP3, or M3U8)
  app.all(['/api/live-download'], async (req: Request, res: Response) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.status(204).end();
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const mediaUrl = req.query.url as string;
      const rawFilename = (req.query.filename as string) || '';
      const requestedFormat = ((req.query.format as string) || 'mp4').toLowerCase();

      if (!mediaUrl) {
        res.status(400).json({ error: 'Missing live stream URL parameter.' });
        return;
      }

      // Strict SSRF validation
      try {
        validateMediaUrl(mediaUrl);
      } catch (validationErr: any) {
        res.status(403).json({ error: validationErr.message || 'Access forbidden.' });
        return;
      }

      // If format is m3u8 playlist, fetch text with safe redirect validation and stream back
      if (requestedFormat === 'm3u8') {
        const { response: upstream } = await fetchWithSafeRedirects(
          mediaUrl,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              Referer: 'https://twitter.com/',
              Accept: '*/*',
            },
          },
          5
        );

        if (!upstream.ok) {
          res.status(upstream.status).json({
            error: 'The live stream playlist has expired or is offline.',
          });
          return;
        }

        const text = await upstream.text();
        const safeName = path.basename(rawFilename).replace(/[^\w\d_.-]/g, '_') || 'stream.m3u8';
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(text);
        return;
      }

      // Determine audio / video format settings
      const isM4a = requestedFormat === 'm4a';
      const isMp3 = requestedFormat === 'mp3';
      const defaultFilename = isM4a
        ? 'getvidx_audio.m4a'
        : isMp3
        ? 'getvidx_audio.mp3'
        : 'getvidx_live_video.mp4';
      const sanitizedBase = path.basename(rawFilename).replace(/[^\w\d_.-]/g, '_').trim();
      const safeFilename = sanitizedBase && sanitizedBase !== '.' ? sanitizedBase : defaultFilename;

      const contentType = isM4a ? 'audio/mp4' : isMp3 ? 'audio/mpeg' : 'video/mp4';
      const disposition = `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`;

      if (req.method === 'HEAD') {
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', disposition);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        res.status(200).end();
        return;
      }

      // Concurrency protection: prevent process exhaustion on container
      if (activeFfmpegCount >= MAX_CONCURRENT_FFMPEG) {
        res.setHeader('Retry-After', '5');
        res.status(503).json({
          error: 'The media converter is currently at capacity. Please try again in a few moments.',
        });
        return;
      }

      // Pre-resolve redirect chain with strict host validation before passing to FFmpeg
      let validatedUrl = mediaUrl;
      try {
        const { finalUrl } = await fetchWithSafeRedirects(
          mediaUrl,
          {
            method: 'HEAD',
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              Referer: 'https://twitter.com/',
            },
          },
          5
        );
        validatedUrl = finalUrl;
      } catch (_) {
        // If HEAD fails (e.g. 405 on some CDNs), initial mediaUrl was already verified by validateMediaUrl
      }

      let ffmpegArgs: string[];
      if (isM4a) {
        // True M4A (AAC stereo stream) extraction
        ffmpegArgs = [
          '-loglevel', 'error',
          '-protocol_whitelist', 'https,tls,tcp,crypto,data,hls',
          '-headers', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\nReferer: https://twitter.com/\r\n',
          '-i', validatedUrl,
          '-t', '7200',
          '-vn',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
          '-f', 'mp4',
          'pipe:1',
        ];
      } else if (isMp3) {
        // True MP3 stereo stream extraction
        ffmpegArgs = [
          '-loglevel', 'error',
          '-protocol_whitelist', 'https,tls,tcp,crypto,data,hls',
          '-headers', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\nReferer: https://twitter.com/\r\n',
          '-i', validatedUrl,
          '-t', '7200',
          '-vn',
          '-c:a', 'libmp3lame',
          '-b:a', '192k',
          '-f', 'mp3',
          'pipe:1',
        ];
      } else {
        // Video MP4 stream remux
        ffmpegArgs = [
          '-loglevel', 'error',
          '-protocol_whitelist', 'https,tls,tcp,crypto,data,hls',
          '-headers', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\nReferer: https://twitter.com/\r\n',
          '-i', validatedUrl,
          '-t', '7200',
          '-c', 'copy',
          '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
          '-f', 'mp4',
          'pipe:1',
        ];
      }

      activeFfmpegCount++;
      let hasDecremented = false;
      const releaseFfmpegSlot = () => {
        if (!hasDecremented) {
          hasDecremented = true;
          activeFfmpegCount = Math.max(0, activeFfmpegCount - 1);
        }
      };

      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      let hasData = false;

      ffmpeg.stdout.on('data', (chunk) => {
        if (!hasData) {
          hasData = true;
          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Disposition', disposition);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
          res.status(200);
        }
        res.write(chunk);
      });

      let ffmpegErrorOutput = '';
      ffmpeg.stderr.on('data', (data) => {
        ffmpegErrorOutput += data.toString();
      });

      ffmpeg.on('error', (procErr) => {
        releaseFfmpegSlot();
        console.error('FFmpeg process error:', procErr);
        if (!res.headersSent && !hasData) {
          res.status(500).json({ error: 'Failed to start media converter.' });
        }
      });

      ffmpeg.on('close', (code) => {
        releaseFfmpegSlot();
        if (code !== 0 && !hasData) {
          console.warn(`FFmpeg closed with code ${code}: ${ffmpegErrorOutput.trim()}`);
          if (!res.headersSent) {
            // Visitor-facing response: clean sanitized message without exposing internal stderr
            res.status(502).json({
              error: 'The live stream or media could not be converted or has ended.',
            });
            return;
          }
        }
        if (!res.writableEnded) {
          res.end();
        }
      });

      req.on('close', () => {
        releaseFfmpegSlot();
        try {
          ffmpeg.kill('SIGKILL');
        } catch (_) {}
      });
    } catch (err: any) {
      console.error('Live download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error while initiating live stream download.' });
      }
    }
  });

  // 6. Mount Vite middleware for development or serve dist for production with SEO prerendering
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.get('*', async (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/@') || req.path.includes('.')) {
        return next();
      }

      try {
        const rawTemplate = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const transformedTemplate = await vite.transformIndexHtml(req.originalUrl, rawTemplate);
        const { status, html } = prerenderPage(req.path, transformedTemplate);
        res.status(status).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(html);
      } catch (err: any) {
        vite.ssrFixStacktrace(err);
        next(err);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { index: false }));

    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api') || req.path.includes('.')) {
        return next();
      }

      try {
        const templateHtml = fs.readFileSync(path.resolve(distPath, 'index.html'), 'utf-8');
        const { status, html } = prerenderPage(req.path, templateHtml);
        res.status(status).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(html);
      } catch (err) {
        console.error('Prerender error in production:', err);
        res.sendFile(path.resolve(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GetVidX] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
