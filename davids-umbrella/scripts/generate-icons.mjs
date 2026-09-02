import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4a90d9"/>
      <stop offset="100%" stop-color="#2f6fb0"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g>
    <path d="M 256 152
             C 176 152 116 208 108 268
             C 108 274 113 278 119 275
             C 138 265 158 260 176 260
             C 176 292 176 292 176 292
             L 208 292
             C 208 260 208 260 208 260
             C 224 260 240 264 254 272
             C 258 274 264 271 264 266
             L 264 260
             C 280 260 296 264 312 272
             C 316 274 320 271 320 267
             C 320 267 320 260 320 260
             C 338 260 358 265 393 275
             C 399 278 404 274 404 268
             C 396 208 336 152 256 152 Z"
          fill="#ffffff"/>
    <path d="M 256 152 L 256 122" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
    <path d="M 256 292 L 256 356 C 256 378 240 388 224 382"
          fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round"/>
  </g>
  <g fill="#dcecff">
    <path d="M 348 340 C 348 328 358 318 366 310 C 374 318 384 328 384 340 C 384 350 376 358 366 358 C 356 358 348 350 348 340 Z"/>
  </g>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
mkdirSync('public/icons', { recursive: true });

for (const size of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
  console.log(`wrote icon-${size}x${size}.png`);
}

await sharp(Buffer.from(svg)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(Buffer.from(svg)).resize(32, 32).png().toFile('src/assets/icon/favicon.png');
console.log('wrote apple-touch-icon.png and favicon.png');
