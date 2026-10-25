import { parseTwitterUrl } from './twitterUrl';

export interface MediaFormat {
  id: string;
  label: string;
  quality: string;
  resolution: string;
  format: 'MP4' | 'MP3' | 'GIF' | 'M3U8' | 'JPG';
  filename: string;
  directUrl: string;
  proxyUrl: string;
  bitrate?: number;
  sizeEstimate?: string;
  isAudioOnly?: boolean;
  isLiveStream?: boolean;
  isPhoto?: boolean;
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
  isLive?: boolean;
  isSpace?: boolean;
  isBroadcast?: boolean;
  isPhoto?: boolean;
  isQuoted?: boolean;
  quotedAuthor?: string;
  streamUrl?: string;
  previewUrl?: string;
  photos?: Array<{ url: string; width?: number; height?: number }>;
  formats: MediaFormat[];
}

export interface DownloaderResponse {
  success: boolean;
  result?: TweetAnalysisResult;
  error?: string;
  errorCode?: 'EMPTY_URL' | 'INVALID_DOMAIN' | 'INVALID_ID' | 'NO_VIDEO' | 'PRIVATE' | 'NETWORK' | 'UNKNOWN';
}

/**
 * Build clean downloadable formats for photo / gallery tweets
 */
export function buildPhotoFormats(
  photos: Array<{ url: string; width?: number; height?: number }>,
  postId: string
): MediaFormat[] {
  return photos.map((p, idx) => {
    const filename = `getvidx_${postId}_photo_${idx + 1}.jpg`;
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(p.url)}&filename=${encodeURIComponent(filename)}`;
    const resLabel = p.width && p.height ? `${p.width}x${p.height}` : 'Original HD';
    return {
      id: `format-photo-${idx + 1}`,
      label: `Original HD Photo ${photos.length > 1 ? `#${idx + 1}` : ''}`.trim(),
      quality: 'High-Res Photo',
      resolution: resLabel,
      format: 'JPG',
      filename,
      directUrl: p.url,
      proxyUrl,
      isPhoto: true,
      sizeEstimate: 'High-Res JPG',
    };
  });
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
 * Parse raw variants from Twitter CDN into sorted MediaFormat items,
 * supporting MP4 files, audio tracks, and live HLS (.m3u8) streams.
 */
export function buildMediaFormats(
  variants: Array<{ bitrate?: number; content_type?: string; container?: string; url: string }>,
  durationSeconds: number,
  postId: string,
  isGenuineLive = false
): MediaFormat[] {
  const formats: MediaFormat[] = [];
  const seenResolutions = new Set<string>();

  // Filter for genuine standalone MP4 files (exclude m3u8 playlists which are text chunks)
  const mp4Variants = variants.filter(
    (v) =>
      (v.container === 'mp4' || v.content_type === 'video/mp4' || v.url?.includes('.mp4')) &&
      !v.url?.includes('.m3u8') &&
      Boolean(v.url)
  );

  // Look for any HLS Live Stream / Space playlist
  const m3u8Variant = variants.find(
    (v) => v.container === 'm3u8' || v.content_type?.includes('mpegurl') || v.url?.includes('.m3u8')
  );

  // Sort MP4 variants descending by bitrate
  mp4Variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

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

      if (minDim >= 2000 || maxDim >= 3500) {
        qualityLabel = '4K Ultra HD';
        qualityCode = '4k';
      } else if (minDim >= 1000 || maxDim >= 1900) {
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
      if (v.bitrate > 15000000) {
        qualityLabel = '4K Ultra HD';
        qualityCode = '4k';
      } else if (v.bitrate > 2000000) {
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
      sizeEstimate: v.bitrate && durationSeconds ? estimateSize(v.bitrate, durationSeconds) : undefined,
    });
  }

  // If we have at least one valid MP4 video, provide clean Audio extract (MP3 universal & M4A AAC)
  if (mp4Variants.length > 0) {
    const highestQuality = formats.find((f) => f.quality === '720p') || formats[0];
    const mp3Filename = `getvidx_${postId}_audio.mp3`;
    const m4aFilename = `getvidx_${postId}_audio.m4a`;

    // 1. Universal MP3 format (192 kbps)
    formats.push({
      id: 'format-mp3',
      label: 'MP3 Audio (192 kbps Stereo)',
      quality: 'MP3 Audio',
      resolution: 'Audio / 192 kbps',
      format: 'MP3',
      filename: mp3Filename,
      directUrl: highestQuality.directUrl,
      proxyUrl: `/api/live-download?url=${encodeURIComponent(highestQuality.directUrl)}&filename=${encodeURIComponent(mp3Filename)}&format=mp3`,
      isAudioOnly: true,
      sizeEstimate: durationSeconds ? `${((192000 * durationSeconds) / (8 * 1024 * 1024)).toFixed(1)} MB` : '~2.5 MB',
    });

    // 2. M4A / AAC native audio track
    formats.push({
      id: 'format-m4a',
      label: 'M4A Audio (AAC Stereo Track)',
      quality: 'M4A Audio',
      resolution: 'Audio / 192 kbps',
      format: 'M4A',
      filename: m4aFilename,
      directUrl: highestQuality.directUrl,
      proxyUrl: `/api/live-download?url=${encodeURIComponent(highestQuality.directUrl)}&filename=${encodeURIComponent(m4aFilename)}&format=m4a`,
      isAudioOnly: true,
      sizeEstimate: durationSeconds ? `${((192000 * durationSeconds) / (8 * 1024 * 1024)).toFixed(1)} MB` : '~2.5 MB',
    });
  }

  // Only for genuine live broadcasts, Twitter Spaces, or when no standalone MP4 files exist
  if ((isGenuineLive || mp4Variants.length === 0) && m3u8Variant?.url) {
    const liveMp4Filename = `getvidx_${postId}_live.mp4`;
    const spaceAudioFilename = `getvidx_${postId}_live_audio.mp3`;
    const m3u8Filename = `getvidx_${postId}_stream.m3u8`;

    // 1. Full Live Video MP4 download (direct playable MP4 stream)
    formats.push({
      id: 'format-live-mp4',
      label: 'Live Video Recording (MP4)',
      quality: 'HD Live Video',
      resolution: 'Stream Replay',
      format: 'MP4',
      filename: liveMp4Filename,
      directUrl: m3u8Variant.url,
      proxyUrl: `/api/live-download?url=${encodeURIComponent(m3u8Variant.url)}&filename=${encodeURIComponent(liveMp4Filename)}&format=mp4`,
      isLiveStream: true,
      sizeEstimate: 'Full Live Video (.MP4)',
    });

    // 2. Direct Audio MP3 extraction (ideal for Twitter Spaces and podcasts)
    formats.push({
      id: 'format-space-audio',
      label: 'Live / Space Audio (MP3)',
      quality: 'Live Audio MP3',
      resolution: 'Audio / 128 kbps',
      format: 'MP3',
      filename: spaceAudioFilename,
      directUrl: m3u8Variant.url,
      proxyUrl: `/api/live-download?url=${encodeURIComponent(m3u8Variant.url)}&filename=${encodeURIComponent(spaceAudioFilename)}&format=mp3`,
      isAudioOnly: true,
      isLiveStream: true,
      sizeEstimate: 'Direct Audio (.MP3)',
    });

    // 3. HLS Playlist (.m3u8) for media players (VLC, MX Player, QuickTime)
    formats.push({
      id: 'format-live-m3u8',
      label: 'HLS Stream Playlist (.m3u8)',
      quality: 'Adaptive Stream',
      resolution: 'VLC / Player',
      format: 'M3U8',
      filename: m3u8Filename,
      directUrl: m3u8Variant.url,
      proxyUrl: `/api/live-download?url=${encodeURIComponent(m3u8Variant.url)}&filename=${encodeURIComponent(m3u8Filename)}&format=m3u8`,
      isLiveStream: true,
      sizeEstimate: 'M3U8 Playlist',
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
  const username = parsed.username || 'i';

  // 1. Try server API route first
  try {
    const apiResponse = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: parsed.normalizedUrl, postId }),
    });

    try {
      const data = await apiResponse.json();
      if (data.success && data.result) {
        return { success: true, result: data.result };
      }
      if (data.errorCode) {
        return { success: false, error: data.error, errorCode: data.errorCode };
      }
    } catch (_) {
      // Body not JSON
    }
  } catch (err) {
    console.warn('Backend /api/analyze unavailable, attempting client syndication fallback:', err);
  }

  // 2. Client-side fallback via public Twitter resolvers
  try {
    const endpoints = [
      `https://api.fxtwitter.com/2/status/${postId}`,
      `https://api.fxtwitter.com/${username}/status/${postId}`,
      `https://api.vxtwitter.com/${username}/status/${postId}`,
      `https://api.vxtwitter.com/Twitter/status/${postId}`,
    ];

    let data: any = null;

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep);
        if (res.ok) {
          const json = await res.json();
          const candidate = json.status || json.tweet || json;
          if (candidate && (candidate.media || candidate.media_extended || candidate.mediaURLs)) {
            data = candidate;
            break;
          }
        }
      } catch (_) {}
    }

    if (data) {
      const mediaList =
        (Array.isArray(data.media?.videos) && data.media.videos.length > 0 ? data.media.videos : null) ||
        (Array.isArray(data.media?.all) && data.media.all.length > 0 ? data.media.all : null) ||
        (Array.isArray(data.media_extended) && data.media_extended.length > 0 ? data.media_extended : null) ||
        [];

      const videoMedia =
        mediaList.find((m: { type: string; url: string }) => m.type === 'video' || m.type === 'gif') ||
        (data.media?.videos && data.media.videos[0]) ||
        null;

      if (videoMedia && (videoMedia.url || (videoMedia.formats && videoMedia.formats.length > 0) || (videoMedia.variants && videoMedia.variants.length > 0))) {
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
            container: 'mp4',
            bitrate: 2176000,
          });
        }

        const formats = buildMediaFormats(variants, durationSec, postId);

        return {
          success: true,
          result: {
            tweetId: postId,
            username: data.user_screen_name || data.author?.screen_name || parsed.username || 'twitter_user',
            authorName: data.user_name || data.author?.name || 'Twitter Creator',
            authorAvatar: data.user_profile_image_url || data.author?.avatar_url,
            tweetText: data.text || (data.raw_text?.text ? data.raw_text.text : ''),
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
