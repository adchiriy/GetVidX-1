import { parseTwitterUrl } from './twitterUrl';

export interface MediaFormat {
  id: string;
  label: string;
  quality: string;
  resolution: string;
  format: 'MP4' | 'MP3' | 'M4A' | 'GIF' | 'M3U8' | 'JPG';
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
  if (mp4Variants.length > 0 && formats.length > 0) {
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
      // If server returned an explicit format error, return it immediately without redundant fallback
      if (data.errorCode === 'INVALID_DOMAIN' || data.errorCode === 'EMPTY_URL' || data.errorCode === 'INVALID_ID') {
        return { success: false, error: data.error, errorCode: data.errorCode };
      }
    } catch (_) {
      // Body not JSON
    }
  } catch (err) {
    console.warn('Backend /api/analyze unavailable, attempting client syndication fallback:', err);
  }

  // 2. Client-side fallback via public Twitter resolvers (Syndication CDN, FixupX, FxTwitter, VxTwitter)
  try {
    const syndicationToken = ((Number(postId) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
    const endpoints = [
      `https://cdn.syndication.twimg.com/tweet-result?id=${postId}&token=${syndicationToken}`,
      `https://api.fxtwitter.com/2/status/${postId}`,
      `https://api.fixupx.com/status/${postId}`,
      `https://api.fxtwitter.com/${username}/status/${postId}`,
      `https://api.vxtwitter.com/Twitter/status/${postId}`,
      `https://api.vxtwitter.com/${username}/status/${postId}`,
    ];

    let data: any = null;

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep);
        if (res.ok) {
          const json = await res.json();
          if (json.tombstone) continue;
          const candidate = json.status || json.tweet || json;
          const hasMediaCandidate = Boolean(
            (Array.isArray(candidate?.mediaDetails) && candidate.mediaDetails.length > 0) ||
            candidate?.video ||
            (candidate?.media && (candidate.media.videos?.length > 0 || candidate.media.all?.length > 0 || candidate.media.photos?.length > 0)) ||
            (Array.isArray(candidate?.media_extended) && candidate.media_extended.length > 0) ||
            (Array.isArray(candidate?.mediaURLs) && candidate.mediaURLs.length > 0) ||
            candidate?.embed_card ||
            candidate?.quote
          );
          if (candidate && hasMediaCandidate) {
            data = candidate;
            break;
          }
        }
      } catch (_) {}
    }

    if (data) {
      // Check if Quote Tweet contains the media
      let targetPost = data;
      let isQuoted = false;
      let quotedAuthor = '';

      const hasDirect = Boolean(
        (Array.isArray(targetPost?.mediaDetails) && targetPost.mediaDetails.length > 0) ||
        targetPost?.video ||
        (targetPost?.media && (targetPost.media.videos?.length > 0 || targetPost.media.all?.length > 0)) ||
        (Array.isArray(targetPost?.media_extended) && targetPost.media_extended.length > 0) ||
        (Array.isArray(targetPost?.mediaURLs) && targetPost.mediaURLs.some((u: string) => u.includes('.mp4') || u.includes('video.twimg.com')))
      );

      if (!hasDirect && data.quote) {
        const q = data.quote;
        targetPost = q;
        isQuoted = true;
        quotedAuthor = q.user?.name || q.author?.name || q.user_name || q.author?.screen_name || 'Quoted Post';
      }

      // Extract media details by checking all upstream schemas
      let rawType = 'video';
      let durationSec = 30;
      let thumbnailUrl = '';
      const variants: Array<{ bitrate?: number; content_type?: string; container?: string; url: string }> = [];

      // A. Check Twitter Syndication mediaDetails
      if (Array.isArray(targetPost.mediaDetails) && targetPost.mediaDetails.length > 0) {
        const mediaItem = targetPost.mediaDetails.find((m: any) =>
          m.type === 'video' || m.type === 'animated_gif' || m.type === 'live' || m.type === 'hls' || m.type === 'broadcast'
        );
        if (mediaItem) {
          rawType = mediaItem.type;
          thumbnailUrl = mediaItem.media_url_https || mediaItem.url || '';
          if (mediaItem.video_info) {
            durationSec = mediaItem.video_info.duration_millis ? mediaItem.video_info.duration_millis / 1000 : 30;
            if (Array.isArray(mediaItem.video_info.variants)) {
              for (const v of mediaItem.video_info.variants) {
                if (v.url) {
                  variants.push({
                    url: v.url,
                    content_type: v.content_type,
                    bitrate: v.bitrate,
                  });
                }
              }
            }
          }
        }
      }

      // B. Check Twitter Syndication data.video
      if (variants.length === 0 && targetPost.video) {
        const v = targetPost.video;
        rawType = v.contentType === 'gif' ? 'animated_gif' : (v.contentType || 'video');
        thumbnailUrl = v.poster || '';
        durationSec = v.durationMs ? v.durationMs / 1000 : 30;
        if (Array.isArray(v.variants)) {
          for (const item of v.variants) {
            const src = item.src || item.url;
            if (src) {
              variants.push({
                url: src,
                content_type: item.type || item.content_type,
                bitrate: item.bitrate,
              });
            }
          }
        }
      }

      // C. Check FxTwitter / VxTwitter media structures
      if (variants.length === 0) {
        const mediaList =
          (Array.isArray(targetPost.media?.videos) && targetPost.media.videos.length > 0 ? targetPost.media.videos : null) ||
          (Array.isArray(targetPost.media?.all) && targetPost.media.all.length > 0 ? targetPost.media.all : null) ||
          (Array.isArray(targetPost.media_extended) && targetPost.media_extended.length > 0 ? targetPost.media_extended : null) ||
          [];

        const vm = mediaList.find((m: { type: string; url?: string }) =>
          m.type === 'video' || m.type === 'gif' || m.type === 'animated_gif' || m.type === 'live' || m.type === 'hls' || m.type === 'broadcast'
        ) || (targetPost.media?.videos && targetPost.media.videos[0]) || null;

        if (vm) {
          rawType = vm.type;
          durationSec = vm.duration || (vm.duration_millis ? vm.duration_millis / 1000 : 30);
          thumbnailUrl = vm.thumbnail_url || '';
          const rawVariants = Array.isArray(vm.formats) && vm.formats.length > 0
            ? vm.formats
            : Array.isArray(vm.variants) && vm.variants.length > 0
            ? vm.variants
            : [];
          if (rawVariants.length > 0) {
            variants.push(...rawVariants);
          } else if (vm.url) {
            variants.push({
              url: vm.url,
              content_type: 'video/mp4',
              container: 'mp4',
              bitrate: 2176000,
            });
          }
        } else if (Array.isArray(targetPost.mediaURLs)) {
          const mp4Url = targetPost.mediaURLs.find((u: string) => u.includes('.mp4') || u.includes('video.twimg.com'));
          if (mp4Url) {
            rawType = 'video';
            thumbnailUrl = targetPost.thumbnail_url || targetPost.mediaURLs[0];
            variants.push({ url: mp4Url, content_type: 'video/mp4', container: 'mp4', bitrate: 2176000 });
          }
        }
      }

      // If variants are found, classify and build formats
      if (variants.length > 0) {
        const isGif = rawType === 'animated_gif' || rawType === 'gif';
        const isLiveOrHlsType = rawType === 'live' || rawType === 'hls' || rawType === 'broadcast';

        const hasMp4 = variants.some((v) =>
          (v.container === 'mp4' || v.content_type === 'video/mp4' || v.url?.includes('.mp4')) &&
          !v.url?.includes('.m3u8') &&
          Boolean(v.url)
        );

        // A post is ONLY genuinely live if explicitly a live/hls/broadcast post, or if no MP4 exists and only m3u8 exists
        const isGenuineLive = Boolean(
          parsed.isLive ||
          parsed.isSpace ||
          parsed.isBroadcast ||
          isLiveOrHlsType ||
          (!hasMp4 && variants.some((v) => v.url?.includes('.m3u8')))
        );

        const formats = buildMediaFormats(variants, durationSec, postId, isGenuineLive);

        const previewFormat = formats.find((f) => f.format === 'MP4' && (f.quality === '720p' || f.quality === '480p')) ||
          formats.find((f) => f.format === 'MP4') ||
          formats[0];

        return {
          success: true,
          result: {
            tweetId: postId,
            username: targetPost.user?.screen_name || targetPost.user_screen_name || targetPost.author?.screen_name || data.author?.screen_name || parsed.username || 'twitter_user',
            authorName: targetPost.user?.name || targetPost.user_name || targetPost.author?.name || data.author?.name || 'Twitter Creator',
            authorAvatar: targetPost.user?.profile_image_url_https || targetPost.user_profile_image_url || targetPost.author?.avatar_url || data.author?.avatar_url,
            tweetText: targetPost.text || (targetPost.raw_text?.text ? targetPost.raw_text.text : data.text || ''),
            thumbnailUrl: thumbnailUrl || (variants[0]?.url ? undefined : undefined),
            duration: formatDuration(durationSec) || (isGenuineLive ? 'Live' : '0:30'),
            isVideo: !isGif,
            isGif,
            isLive: isGenuineLive,
            isSpace: Boolean(parsed.isSpace),
            isBroadcast: Boolean(parsed.isBroadcast || rawType === 'broadcast'),
            isQuoted,
            quotedAuthor: isQuoted ? quotedAuthor : undefined,
            streamUrl: variants.find((v) => v.url?.includes('.m3u8'))?.url,
            previewUrl: previewFormat?.directUrl || variants[0]?.url,
            formats,
          },
        };
      }

      // Check for Photos if no video was found
      const rawPhotos =
        (Array.isArray(targetPost.mediaDetails) ? targetPost.mediaDetails.filter((m: any) => m.type === 'photo').map((m: any) => ({ url: m.media_url_https || m.url, width: m.sizes?.large?.w, height: m.sizes?.large?.h })) : null) ||
        (Array.isArray(targetPost.photos) && targetPost.photos.length > 0 ? targetPost.photos.map((p: any) => ({ url: p.url || p.media_url_https })) : null) ||
        (Array.isArray(targetPost.media?.photos) && targetPost.media.photos.length > 0 ? targetPost.media.photos : null) ||
        (Array.isArray(data.media?.photos) && data.media.photos.length > 0 ? data.media.photos : null) ||
        (Array.isArray(targetPost.media?.all) ? targetPost.media.all.filter((m: any) => m.type === 'photo') : null) ||
        (Array.isArray(targetPost.media_extended) ? targetPost.media_extended.filter((m: any) => m.type === 'image') : null) ||
        [];

      if (rawPhotos.length > 0) {
        const photoFormats = buildPhotoFormats(rawPhotos, postId);
        return {
          success: true,
          result: {
            tweetId: postId,
            username: targetPost.user?.screen_name || targetPost.user_screen_name || targetPost.author?.screen_name || parsed.username || 'twitter_user',
            authorName: targetPost.user?.name || targetPost.user_name || targetPost.author?.name || 'Twitter Creator',
            authorAvatar: targetPost.user?.profile_image_url_https || targetPost.user_profile_image_url || targetPost.author?.avatar_url,
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
        };
      }

      return {
        success: false,
        error: 'This tweet contains only text without any attached videos, GIFs, or photos.',
        errorCode: 'NO_VIDEO',
      };
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
