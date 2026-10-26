import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ASSETS_DIR = path.resolve('src/assets');

async function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip font directory
      if (entry.name.includes('Neue Haas') || entry.name.includes('Web Fonts')) continue;
      await processDirectory(fullPath);
    } else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) {
      const ext = path.extname(entry.name).toLowerCase();
      const baseName = path.basename(entry.name, ext);
      const isHero = /hero/i.test(baseName);
      const isCover = /cover|top|cloth|tshirt|henley/i.test(baseName);
      
      const maxDimension = isHero ? 1920 : (isCover ? 1200 : 800);
      const targetWebpPath = path.join(dir, `${baseName}.webp`);

      try {
        const metadata = await sharp(fullPath).metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;

        let transform = sharp(fullPath);
        if (width > maxDimension || height > maxDimension) {
          transform = transform.resize({
            width: width > height ? maxDimension : undefined,
            height: height >= width ? maxDimension : undefined,
            withoutEnlargement: true,
            fit: 'inside'
          });
        }

        const buffer = await transform
          .webp({ quality: 82, effort: 6 })
          .toBuffer();

        // Write webp
        fs.writeFileSync(targetWebpPath, buffer);
        console.log(`Optimized ${entry.name} -> ${baseName}.webp (${(buffer.length / 1024).toFixed(1)} KB)`);

        // If the original was not webp, remove the original bloated PNG/JPEG if webp is written
        if (ext !== '.webp') {
          const origSize = fs.statSync(fullPath).size;
          console.log(`  Reduced from ${(origSize / 1024).toFixed(1)} KB to ${(buffer.length / 1024).toFixed(1)} KB (-${((1 - buffer.length / origSize) * 100).toFixed(0)}%)`);
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.error(`Error processing ${fullPath}:`, err.message);
      }
    }
  }
}

console.log('Starting image optimization across src/assets...');
await processDirectory(ASSETS_DIR);
console.log('Finished image optimization!');
