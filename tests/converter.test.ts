import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, readdir, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';
import { createMediaGateway } from '../src/server/media';

test('native FFmpeg remuxes HLS fetched through the protected loopback gateway', async () => {
  assert.ok(ffmpeg);
  const exec = promisify(execFile);
  const dir = await mkdtemp(path.join(tmpdir(), 'getvidx-hls-'));
  const originalFetch = globalThis.fetch;
  let gateway: Awaited<ReturnType<typeof createMediaGateway>> | undefined;
  try {
    await exec(ffmpeg, ['-v','error','-f','lavfi','-i','color=c=blue:s=160x90:r=10','-f','lavfi','-i','sine=frequency=440:sample_rate=44100','-t','1','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-f','hls','-hls_time','1',path.join(dir,'master.m3u8')]);
    globalThis.fetch = async (url) => {
      const parsed = new URL(String(url));
      assert.equal(parsed.hostname, 'video.twimg.com');
      const file = path.basename(parsed.pathname);
      return new Response(await readFile(path.join(dir, file)), { headers: {'content-type':file.endsWith('.m3u8')?'application/vnd.apple.mpegurl':'video/mp2t'} });
    };
    gateway = await createMediaGateway('https://video.twimg.com/master.m3u8');
    const output = path.join(dir, 'output.mp4');
    await exec(ffmpeg, ['-v','error','-protocol_whitelist','http,tcp,crypto','-allowed_extensions','ALL','-i',gateway.url,'-c','copy','-bsf:a','aac_adtstoasc','-movflags','frag_keyframe+empty_moov+default_base_moof','-f','mp4',output]);
    assert.equal((await readFile(output)).subarray(4,8).toString(), 'ftyp');
  } finally {
    gateway?.close(); globalThis.fetch = originalFetch;
    for (const file of await readdir(dir)) await unlink(path.join(dir,file));
    await rmdir(dir);
  }
});
