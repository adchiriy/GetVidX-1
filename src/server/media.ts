import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { randomBytes } from 'node:crypto';

const HOSTS = ['twimg.com', 'twitter.com', 'x.com', 'pscp.tv', 'giphy.com'];
export function validateMediaUrl(raw: string): URL {
  const url = new URL(raw);
  if (url.protocol !== 'https:' || (url.port && url.port !== '443') || url.username || url.password ||
      !HOSTS.some(host => url.hostname === host || url.hostname.endsWith('.' + host))) {
    throw new Error('Only HTTPS media on supported X / Twitter CDN hosts is allowed.');
  }
  return url;
}

export async function fetchWithSafeRedirects(initialUrl: string, init: RequestInit = {}, maxRedirects = 5) {
  let currentUrl = initialUrl;
  for (let i = 0; i <= maxRedirects; i++) {
    validateMediaUrl(currentUrl);
    const response = await fetch(currentUrl, { ...init, redirect: 'manual', signal: init.signal || AbortSignal.timeout(30_000) });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) throw new Error('Missing redirect location.');
      currentUrl = new URL(location, currentUrl).href;
      continue;
    }
    return { response, finalUrl: currentUrl };
  }
  throw new Error('Too many redirects.');
}

export function rewritePlaylist(text: string, base: string, wrap: (url: string) => string): string {
  const convert = (raw: string) => wrap(validateMediaUrl(new URL(raw, base).href).href);
  return text.split(/\r?\n/).map(line => {
    if (!line.trim()) return line;
    if (line.startsWith('#')) return line.replace(/URI="([^"]+)"/g, (_, uri) => `URI="${convert(uri)}"`);
    return convert(line.trim());
  }).join('\n');
}

// FFmpeg can only use HTTP to this per-job loopback gateway. Every CDN request,
// including nested HLS playlists, keys, segments and redirects, is revalidated.
export async function createMediaGateway(mediaUrl: string) {
  validateMediaUrl(mediaUrl);
  const secret = randomBytes(24).toString('hex');
  const controllers = new Set<AbortController>();
  let origin = '';
  const wrap = (url: string) => `${origin}/${secret}?url=${encodeURIComponent(url)}`;
  const server = createServer(async (req, res) => {
    const controller = new AbortController();
    controllers.add(controller);
    const timer = setTimeout(() => controller.abort(), 60_000);
    res.once('close', () => controller.abort());
    try {
      const requestUrl = new URL(req.url || '/', 'http://localhost');
      if (requestUrl.pathname !== '/' + secret || !['GET', 'HEAD'].includes(req.method || '')) {
        res.writeHead(403).end(); return;
      }
      const target = validateMediaUrl(requestUrl.searchParams.get('url') || '').href;
      const { response, finalUrl } = await fetchWithSafeRedirects(target, {
        signal: controller.signal,
        method: req.method,
        headers: { 'User-Agent': 'Mozilla/5.0', ...(req.headers.range ? { Range: req.headers.range } : {}) },
      });
      if (!response.ok) { res.writeHead(502).end(); await response.body?.cancel(); return; }
      const type = response.headers.get('content-type') || 'application/octet-stream';
      if (type.toLowerCase().includes('mpegurl') || new URL(finalUrl).pathname.endsWith('.m3u8')) {
        const reader = response.body?.getReader();
        const chunks: Uint8Array[] = []; let bytes = 0;
        if (reader) while (true) {
          const chunk = await reader.read(); if (chunk.done) break;
          bytes += chunk.value.length;
          if (bytes > 2 * 1024 * 1024) { await reader.cancel(); throw new Error('Playlist too large.'); }
          chunks.push(chunk.value);
        }
        const playlist = rewritePlaylist(Buffer.concat(chunks).toString('utf8'), finalUrl, wrap);
        res.writeHead(200, { 'Content-Type': 'application/vnd.apple.mpegurl' }).end(playlist);
      } else {
        res.writeHead(response.status, { 'Content-Type': type,
          ...(response.headers.get('content-length') ? { 'Content-Length': response.headers.get('content-length')! } : {}),
          ...(response.headers.get('content-range') ? { 'Content-Range': response.headers.get('content-range')! } : {}),
        });
        if (response.body) await pipeline(Readable.fromWeb(response.body as any), res);
        else res.end();
      }
    } catch {
      if (!res.headersSent) res.writeHead(502).end(); else res.destroy();
    } finally { clearTimeout(timer); controllers.delete(controller); }
  });
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Gateway startup failed.');
  origin = `http://127.0.0.1:${address.port}`;
  return { url: wrap(mediaUrl), close: () => { controllers.forEach(c => c.abort()); server.closeAllConnections(); server.close(); } };
}
