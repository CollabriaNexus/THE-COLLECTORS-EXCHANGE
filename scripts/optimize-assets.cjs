const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.resolve(__dirname, '../src/assets');
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const pngFiles = [
  'hero-background.png',
  'verification_authenticity.png',
  'gallery-hero.png',
  'collectors_study.png',
  'kohinoor.png',
  'artisan2.png',
];

async function convertToWebP() {
  for (const file of pngFiles) {
    const inputPath = path.join(ASSETS_DIR, file);
    const outputPath = path.join(ASSETS_DIR, file.replace('.png', '.webp'));
    console.log(`Converting ${file} → ${path.basename(outputPath)}`);
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);
    const origSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    console.log(`  ${(origSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (${((1 - newSize / origSize) * 100).toFixed(0)}% reduction)`);
  }
}

// Large marketing images that are rendered big but shipped at one resolution.
// We emit width variants as WebP into public/img so pages can use srcset/sizes
// and phones download a small file instead of the full desktop image.
const RESPONSIVE_SOURCES = [
  { src: 'About_US.jpg', name: 'about-us' },
  { src: 'verification_authenticity.png', name: 'verification' },
  { src: 'artisan2.png', name: 'artisan' },
  { src: 'collectors_study.png', name: 'collectors-study' },
];
const RESPONSIVE_WIDTHS = [480, 800, 1200, 1600];

async function generateResponsiveVariants() {
  const OUT = path.join(PUBLIC_DIR, 'img');
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  for (const { src, name } of RESPONSIVE_SOURCES) {
    const inputPath = path.join(ASSETS_DIR, src);
    if (!fs.existsSync(inputPath)) { console.warn(`  skip (missing): ${src}`); continue; }
    const meta = await sharp(inputPath).metadata();
    for (const w of RESPONSIVE_WIDTHS) {
      if (meta.width && w > meta.width) continue; // never upscale
      const outPath = path.join(OUT, `${name}-${w}.webp`);
      await sharp(inputPath).resize({ width: w }).webp({ quality: 78 }).toFile(outPath);
      console.log(`  ${name}-${w}.webp — ${(fs.statSync(outPath).size / 1024).toFixed(1)}KB`);
    }
  }
}

async function createOGImage() {
  const width = 1200;
  const height = 630;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a0a0a" />
          <stop offset="50%" stop-color="#1a1a2e" />
          <stop offset="100%" stop-color="#0a0a0a" />
        </linearGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d4a84b" />
          <stop offset="100%" stop-color="#f0d68a" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <rect x="60" y="60" width="${width - 120}" height="${height - 120}" rx="8" fill="none" stroke="#d4a84b" stroke-width="1" opacity="0.3" />
      <text x="${width / 2}" y="240" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="url(#gold)" text-anchor="middle" letter-spacing="3">THE COLLECTORS</text>
      <text x="${width / 2}" y="310" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="url(#gold)" text-anchor="middle" letter-spacing="3">EXCHANGE</text>
      <line x1="400" y1="350" x2="800" y2="350" stroke="#d4a84b" stroke-width="1.5" opacity="0.6" />
      <text x="${width / 2}" y="400" font-family="Arial, sans-serif" font-size="22" fill="#b0a090" text-anchor="middle" letter-spacing="6">VERIFIED PRE-OWNED COLLECTIBLES</text>
      <text x="${width / 2}" y="445" font-family="Arial, sans-serif" font-size="16" fill="#777" text-anchor="middle" letter-spacing="3">thecollectorsexchange.in</text>
    </svg>`;

  const outputPath = path.join(PUBLIC_DIR, 'og-image.png');
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toFile(outputPath);

  const size = fs.statSync(outputPath).size;
  console.log(`OG image created: ${(size / 1024).toFixed(1)}KB`);
}

async function main() {
  console.log('=== Converting PNGs to WebP ===');
  await convertToWebP();
  console.log('\n=== Generating responsive width variants (public/img) ===');
  await generateResponsiveVariants();
  console.log('\n=== Creating OG Image ===');
  await createOGImage();
  console.log('\nDone!');
}

main().catch(console.error);
