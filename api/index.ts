import { createApp } from '../server';

// One warm Express instance; no listener and no development server in a Function.
const app = createApp({ apiOnly: true });
export default async function handler(req: any, res: any) {
  const url = new URL(req.url, 'https://getvidx.local');
  const endpoint = req.query?.endpoint || url.searchParams.get('endpoint') || 'health';
  if (!['health', 'analyze', 'proxy-download', 'live-download'].includes(endpoint)) {
    res.status(404).json({ error: 'Unknown endpoint.' }); return;
  }
  url.searchParams.delete('endpoint');
  req.url = `/api/${endpoint}${url.searchParams.size ? '?' + url.searchParams.toString() : ''}`;
  (await app)(req, res);
}
