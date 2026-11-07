import sharp from 'sharp';
import { readFileSync } from 'fs';
import { mkdirSync } from 'fs';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgBuffer = readFileSync('public/icons/icon.svg');

mkdirSync('public/icons', { recursive: true });

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`);
  console.log(`Generated icon-${size}.png`);
}

// Also generate favicon.png at 32x32
await sharp(svgBuffer)
  .resize(32, 32)
  .png()
  .toFile('public/favicon-32.png');
console.log('Generated favicon-32.png');

console.log('All icons generated!');
