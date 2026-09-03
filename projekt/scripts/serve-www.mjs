/**
 * Serves the production build in `www/` over http://localhost, so the PWA can
 * be tested the way a browser sees it in production: with the service worker
 * active and the install prompt available.
 *
 * `ng serve` cannot do this — the service worker is disabled in dev mode.
 *
 * Usage: npm run build && npm run serve:prod
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../www/', import.meta.url));
const PORT = Number(process.env.PORT ?? 4400);

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

/**
 * Resolves a request path to a file inside `www`. Splitting on "/" and dropping
 * "." and ".." keeps the result inside the directory, whatever the client sends.
 */
function resolve(urlPath) {
  const segments = decodeURIComponent(urlPath)
    .split('/')
    .filter((segment) => segment !== '' && segment !== '.' && segment !== '..');

  return segments.length === 0 ? join(ROOT, 'index.html') : join(ROOT, ...segments);
}

createServer(async (request, response) => {
  const file = resolve(request.url.split('?')[0]);

  try {
    const body = await readFile(file);
    response.writeHead(200, {
      'content-type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
      // The service worker must always be revalidated, otherwise an update never lands.
      'cache-control': 'no-cache',
    });
    response.end(body);
  } catch {
    // Unknown paths belong to the Angular router — hand them the app shell.
    const shell = await readFile(join(ROOT, 'index.html'));
    response.writeHead(200, { 'content-type': CONTENT_TYPES['.html'], 'cache-control': 'no-cache' });
    response.end(shell);
  }
}).listen(PORT, () => {
  console.log(`Habitus (Produktions-Build) läuft auf http://localhost:${PORT}`);
});
