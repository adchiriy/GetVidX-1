// Configure VITE_SITE_URL during build and at server startup to use your domain.
export const SITE_URL = (
  import.meta.env?.VITE_SITE_URL ||
  (typeof process !== 'undefined' ? process.env.VITE_SITE_URL : '') ||
  'https://getvidx.com'
).replace(/\/$/, '');
