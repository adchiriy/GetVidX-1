import { mkdir, writeFile, chmod } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';

await build({ entryPoints: ['src/server/vercel-handler.ts'], outfile: '.vercel-server/handler.mjs',
  bundle: true, platform: 'node', target: 'node22', format: 'esm', packages: 'external' });

// Standalone Linux executable: no Python installation or separate hosting account.
if (process.platform !== 'linux' || !process.env.VERCEL) process.exit(0);
const release = await fetch('https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest', {
  headers: { 'User-Agent': 'GetVidX-build' }, signal: AbortSignal.timeout(30_000),
});
if (!release.ok) throw new Error(`yt-dlp release lookup failed: ${release.status}`);
const { tag_name: tag } = await release.json();
if (!/^\d{4}\.\d{2}\.\d{2}(?:\.\d+)?$/.test(tag)) throw new Error('Unexpected yt-dlp release tag.');
const base = `https://github.com/yt-dlp/yt-dlp/releases/download/${tag}`;
const [binary, sums] = await Promise.all(['yt-dlp_linux', 'SHA2-256SUMS'].map(async name => {
  const result = await fetch(`${base}/${name}`, { signal: AbortSignal.timeout(120_000) });
  if (!result.ok) throw new Error(`yt-dlp asset download failed: ${result.status}`);
  return Buffer.from(await result.arrayBuffer());
}));
const expected = sums.toString('utf8').split('\n').find(line => /\s+\*?yt-dlp_linux\s*$/.test(line))?.split(/\s+/)[0];
if (!expected || createHash('sha256').update(binary).digest('hex') !== expected) throw new Error('yt-dlp checksum mismatch.');
await mkdir('.vercel-bin', { recursive: true });
await writeFile('.vercel-bin/yt-dlp', binary);
await chmod('.vercel-bin/yt-dlp', 0o755);
console.log(`Prepared checksum-verified yt-dlp ${tag} for Vercel.`);
