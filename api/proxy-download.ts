const ALLOWED_MEDIA_HOSTS = new Set([
  'twimg.com',
  'twitter.com',
  'x.com',
  'pscp.tv',
  'giphy.com',
]);

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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const mediaUrl = (req.query?.url as string) || '';
  const rawFilename = (req.query?.filename as string) || '';

  if (!mediaUrl) {
    res.status(400).json({ error: 'Missing media URL parameter.' });
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(mediaUrl);
  } catch {
    res.status(400).json({ error: 'Invalid media URL.' });
    return;
  }

  if (parsed.protocol !== 'https:' || !isAllowedMediaHost(parsed.hostname)) {
    res.status(403).json({ error: 'Access forbidden: unauthorized host.' });
    return;
  }

  try {
    const upstream = await fetch(parsed.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: '*/*',
        ...(req.headers?.range ? { Range: req.headers.range } : {}),
      },
    });

    if (!upstream.ok && upstream.status !== 206) {
      res.status(upstream.status).json({ error: `Upstream error: ${upstream.status}` });
      return;
    }

    const contentType = upstream.headers.get('content-type') || 'video/mp4';
    const contentLength = upstream.headers.get('content-length');
    const contentRange = upstream.headers.get('content-range');
    const cleanFilename = (rawFilename || 'getvidx_video.mp4').replace(/[^a-zA-Z0-9._-]/g, '_');

    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);

    if (upstream.body) {
      const reader = upstream.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      res.end();
    }
  } catch (err: any) {
    res.status(502).json({ error: err?.message || 'Proxy fetch failed.' });
  }
}
