let handler;
export default async function api(req, res) {
  try {
    handler ||= (await import('../.vercel-server/handler.mjs')).default;
    await handler(req, res);
  } catch (error) {
    console.error('API initialization failed:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Media service initialization failed.', code: error.code || 'API_STARTUP_FAILED' });
  }
}
