export interface ParsedTwitterUrl {
  isValid: boolean;
  normalizedUrl: string;
  postId: string | null;
  username: string | null;
  isLive?: boolean;
  isSpace?: boolean;
  isBroadcast?: boolean;
  mediaType?: 'video' | 'space' | 'broadcast' | 'live';
  error?: string;
}

const ALLOWED_HOSTS = new Set([
  'x.com',
  'www.x.com',
  'twitter.com',
  'www.twitter.com',
  'mobile.twitter.com',
  'm.twitter.com',
  'vxtwitter.com',
  'fxtwitter.com',
  'fixupx.com',
]);

/**
 * Validates and extracts details from a Twitter or X URL safely,
 * including standard tweets, videos, Twitter Spaces, and Live Broadcasts.
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

  // Remove wrapping quotes or brackets if pasted from chat/email
  trimmed = trimmed.replace(/^["'<(\[]+|[>"')\]]+$/g, '').trim();

  // If user pasted something like "x.com/username/status/123456" or "x.com/i/spaces/..." without protocol:
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

  const pathname = parsedUrl.pathname;

  // 1. Detect Twitter Spaces: /i/spaces/:spaceId or /spaces/:spaceId
  const spacesRegex = /(?:\/i)?\/spaces\/([a-zA-Z0-9_-]+)/i;
  const spacesMatch = pathname.match(spacesRegex);
  if (spacesMatch && spacesMatch[1]) {
    const spaceId = spacesMatch[1];
    return {
      isValid: true,
      normalizedUrl: `https://x.com/i/spaces/${spaceId}`,
      postId: spaceId,
      username: 'spaces',
      isLive: true,
      isSpace: true,
      mediaType: 'space',
    };
  }

  // 2. Detect Live Broadcasts: /i/broadcasts/:broadcastId or /broadcasts/:broadcastId
  const broadcastRegex = /(?:\/i)?\/broadcasts\/([a-zA-Z0-9_-]+)/i;
  const broadcastMatch = pathname.match(broadcastRegex);
  if (broadcastMatch && broadcastMatch[1]) {
    const broadcastId = broadcastMatch[1];
    return {
      isValid: true,
      normalizedUrl: `https://x.com/i/broadcasts/${broadcastId}`,
      postId: broadcastId,
      username: 'broadcasts',
      isLive: true,
      isBroadcast: true,
      mediaType: 'broadcast',
    };
  }

  // 3. Detect Live User stream: /:username/live
  const liveUserRegex = /^\/([a-zA-Z0-9_]+)\/live\/?$/i;
  const liveUserMatch = pathname.match(liveUserRegex);
  if (liveUserMatch && liveUserMatch[1]) {
    const username = liveUserMatch[1];
    return {
      isValid: true,
      normalizedUrl: `https://x.com/${username}/live`,
      postId: `live_${username}`,
      username,
      isLive: true,
      mediaType: 'live',
    };
  }

  // 4. Standard Post format: /:username/status/:id or /i/web/status/:id or /i/status/:id
  const statusRegex = /(?:\/([^/]+))?\/status\/(\d+)/i;
  const match = pathname.match(statusRegex);

  if (!match || !match[2]) {
    return {
      isValid: false,
      normalizedUrl: '',
      postId: null,
      username: null,
      error: 'Missing valid numeric status ID, Space ID, or Broadcast link in URL',
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
    mediaType: 'video',
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
