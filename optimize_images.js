import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const assetsDir = 'src/assets';

async function walk(dir) {
  let files = await fs.promises.readdir(dir);
  for (let file of files) {
    let p = path.join(dir, file);
    let stat = await fs.promises.stat(p);
    if (stat.isDirectory()) {
      await walk(p);
    } else {
      let ext = path.extname(p).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext) && stat.size > 500 * 1024) {
        if (file.startsWith('0')) continue;
        console.log(`Optimizing ${p}`);
        try {
          const img = sharp(p);
          const metadata = await img.metadata();
          let pipeline = img;
          const maxDim = 1920;
          if (metadata.width > maxDim || metadata.height > maxDim) {
             pipeline = pipeline.resize(maxDim, maxDim, { fit: 'inside' });
          }
          if (ext === '.png') {
             pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
          } else {
             pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
          }
          const buf = await pipeline.toBuffer();
          if (buf.length < stat.size) {
            await fs.promises.writeFile(p, buf);
            console.log(`Saved ${p} (${Math.round(buf.length/1024)} KB, down from ${Math.round(stat.size/1024)} KB)`);
          }
        } catch (e) {
          console.error(`Failed ${p}`, e);
        }
      }
    }
  }
}

walk(assetsDir).then(() => console.log('Done')).catch(console.error);
