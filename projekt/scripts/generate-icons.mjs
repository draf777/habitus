/**
 * Renders the Habitus app icon (teal ground, white circle, white check)
 * into every asset the app needs: the PWA icon sizes, the apple-touch-icon,
 * a PNG favicon and a multi-resolution favicon.ico.
 *
 * Run with `npm run icons` after changing the SVG below; the generated files
 * are committed, so the build itself does not depend on this script.
 */
import { mkdirSync, writeFileSync } from 'node:fs';

import sharp from 'sharp';

const PRIMARY = '#0e7c86';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${PRIMARY}"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="#ffffff" stroke-width="28"/>
  <path d="M 186 258 L 236 308 L 330 208"
        fill="none" stroke="#ffffff" stroke-width="36"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

/** Sizes referenced by `public/manifest.webmanifest`. */
const MANIFEST_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

/** Sizes packed into `favicon.ico` — Windows uses the largest one for pinned sites. */
const FAVICON_SIZES = [16, 32, 48, 64];

const render = (size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

/**
 * Packs PNG buffers into an .ico container. Windows and every current browser
 * read PNG-compressed ICO entries, so the PNGs go in as they are.
 */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const directory = [];

  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    directory.push(entry);
    offset += data.length;
  }

  return Buffer.concat([header, ...directory, ...images.map((image) => image.data)]);
}

mkdirSync('public/icons', { recursive: true });

for (const size of MANIFEST_SIZES) {
  writeFileSync(`public/icons/icon-${size}x${size}.png`, await render(size));
  console.log(`wrote public/icons/icon-${size}x${size}.png`);
}

writeFileSync('public/apple-touch-icon.png', await render(180));
writeFileSync('public/favicon.png', await render(32));

const icoImages = [];
for (const size of FAVICON_SIZES) {
  icoImages.push({ size, data: await render(size) });
}
writeFileSync('public/favicon.ico', buildIco(icoImages));

console.log('wrote public/apple-touch-icon.png, favicon.png and favicon.ico');
