import test from 'node:test';
import assert from 'node:assert/strict';
import { validateMediaUrl, rewritePlaylist, fetchWithSafeRedirects } from '../src/server/media';
import { parseTwitterUrl } from '../src/utils/twitterUrl';
import { buildMediaFormats, analyzeTweet } from '../src/utils/downloader';

test('accepts supported media and rejects forged hosts, credentials, ports and local targets', () => {
  assert.equal(validateMediaUrl('https://video.twimg.com/a.mp4').hostname, 'video.twimg.com');
  for (const url of ['http://video.twimg.com/a', 'https://video.twimg.com.evil.test/a', 'https://127.0.0.1/a', 'https://[::1]/', 'https://user:pass@video.twimg.com/a', 'https://video.twimg.com:8443/a']) {
    assert.throws(() => validateMediaUrl(url));
  }
});

test('rewrites HLS nested playlists, segments and keys and rejects local references', () => {
  const text = '#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI="key.bin"\nchild.m3u8\n../segment.ts';
  const urls: string[] = [];
  rewritePlaylist(text, 'https://video.twimg.com/path/master.m3u8', url => { urls.push(url); return 'gateway:' + url; });
  assert.deepEqual(urls, ['https://video.twimg.com/path/key.bin', 'https://video.twimg.com/path/child.m3u8', 'https://video.twimg.com/segment.ts']);
  assert.throws(() => rewritePlaylist('#EXTM3U\nhttp://127.0.0.1/private', 'https://video.twimg.com/master.m3u8', x => x));
  assert.throws(() => rewritePlaylist('#EXT-X-KEY:URI="file:///etc/passwd"', 'https://video.twimg.com/master.m3u8', x => x));
});

test('validates redirect destination before making another network request', async () => {
  const original = globalThis.fetch; let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response(null, {status:302, headers:{location:'http://127.0.0.1/private'}}); };
  try { await assert.rejects(fetchWithSafeRedirects('https://video.twimg.com/a')); assert.equal(calls, 1); }
  finally { globalThis.fetch = original; }
});

test('normalizes supported status and Space links without accepting an attacker host', () => {
  assert.equal(parseTwitterUrl('x.com/example/status/123456').normalizedUrl, 'https://x.com/example/status/123456');
  assert.equal(parseTwitterUrl('https://x.com/i/spaces/abc123').isSpace, true);
  assert.equal(parseTwitterUrl('https://x.com.evil.test/a/status/123').isValid, false);
});

test('audio formats point to real converter routes and keep the source video explicit', () => {
  const formats = buildMediaFormats([{url:'https://video.twimg.com/vid/1280x720/a.mp4', content_type:'video/mp4'}], 30, '123');
  assert.equal(formats.find(f => f.format === 'MP4')?.quality, '720p');
  for (const format of formats.filter(f => f.isAudioOnly)) {
    assert.match(format.proxyUrl!, /^\/api\/live-download/);
    assert.match(format.directUrl, /\.mp4$/);
  }
});

test('photo fallback uses alternate provider data when mediaDetails is empty', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => String(url) === '/api/analyze'
    ? new Response('{}', {status:503})
    : Response.json({ mediaDetails:[], media:{photos:[{url:'https://pbs.twimg.com/media/photo.jpg'}]} });
  try { const result = await analyzeTweet('https://x.com/example/status/123456'); assert.equal(result.result?.isPhoto, true); assert.equal(result.result?.formats.length, 1); }
  finally { globalThis.fetch = original; }
});
