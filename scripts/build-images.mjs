import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'public/assets';
mkdirSync(OUT, { recursive: true });

const source = sharp('pic1.jpeg').removeAlpha().toColourspace('srgb');
const { width, height } = await source.metadata();
if (!width || !height) throw new Error('Could not read the dimensions of pic1.jpeg');

const rgb = await source.raw().toBuffer();
const pixels = width * height;
const background = new Uint8Array(pixels);
const queue = new Uint32Array(pixels);
let head = 0;
let tail = 0;

const isWhiteBackground = (index) => {
  const offset = index * 3;
  const r = rgb[offset];
  const g = rgb[offset + 1];
  const b = rgb[offset + 2];
  return Math.min(r, g, b) >= 190 && Math.max(r, g, b) - Math.min(r, g, b) <= 75;
};

const enqueue = (index) => {
  if (!background[index] && isWhiteBackground(index)) {
    background[index] = 1;
    queue[tail++] = index;
  }
};

for (let x = 0; x < width; x++) {
  enqueue(x);
  enqueue((height - 1) * width + x);
}
for (let y = 1; y < height - 1; y++) {
  enqueue(y * width);
  enqueue(y * width + width - 1);
}

while (head < tail) {
  const index = queue[head++];
  const x = index % width;
  const y = Math.floor(index / width);
  if (x > 0) enqueue(index - 1);
  if (x + 1 < width) enqueue(index + 1);
  if (y > 0) enqueue(index - width);
  if (y + 1 < height) enqueue(index + width);
}

const rgba = Buffer.alloc(pixels * 4);
for (let i = 0; i < pixels; i++) {
  const sourceOffset = i * 3;
  const targetOffset = i * 4;
  rgba[targetOffset] = rgb[sourceOffset];
  rgba[targetOffset + 1] = rgb[sourceOffset + 1];
  rgba[targetOffset + 2] = rgb[sourceOffset + 2];
  rgba[targetOffset + 3] = background[i] ? 0 : 255;
}

const portrait = sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer();
for (const targetWidth of [1100, 720, 420]) {
  await sharp(await portrait)
    .resize({ width: targetWidth })
    .webp({ quality: 86, alphaQuality: 90 })
    .toFile(`${OUT}/portrait-${targetWidth}.webp`);
}

const sharePortrait = await sharp(await portrait).resize({ height: 600 }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#07070a' } })
  .composite([
    {
      input: Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="g" cx="78%" cy="45%" r="45%"><stop offset="0" stop-color="#e5132b" stop-opacity="0.45"/><stop offset="1" stop-color="#e5132b" stop-opacity="0"/></radialGradient></defs>
        <rect width="1200" height="630" fill="url(#g)"/>
      </svg>`),
    },
    { input: sharePortrait, gravity: 'southeast' },
    {
      input: Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <text x="72" y="290" font-family="Impact, 'Arial Narrow', sans-serif" font-size="86" fill="#f4f1ec" letter-spacing="3">PRANEETH</text>
        <text x="78" y="352" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="26" fill="#ff3d5a" letter-spacing="16">THE SERIES</text>
        <text x="78" y="420" font-family="Helvetica, Arial, sans-serif" font-weight="600" font-size="18" fill="#a7a6ad" letter-spacing="3">PHARMACY • CLINICAL INFORMATICS • HEALTHTECH</text>
      </svg>`),
    },
  ])
  .jpeg({ quality: 85 })
  .toFile(`${OUT}/og-image.jpg`);

console.log('Praneeth portrait and social image built.');
