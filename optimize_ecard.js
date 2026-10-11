import fs from 'fs';
import sharp from 'sharp';

async function run() {
  const p = 'PHOTO-2026-09-28-20-38-49.jpg';
  const stat = await fs.promises.stat(p);
  console.log(`Original:\n- Dimensions: (loading...)\n- File size: ${Math.round(stat.size/1024)} KB\n- Format: JPEG`);
  
  const img = sharp(p);
  const metadata = await img.metadata();
  console.log(`Original:\n- Dimensions: ${metadata.width}x${metadata.height}\n- File size: ${stat.size} bytes\n- Format: ${metadata.format}`);

  const maxDim = 1200;
  let pipeline = img;
  if (metadata.width > maxDim || metadata.height > maxDim) {
      pipeline = pipeline.resize(maxDim, maxDim, { fit: 'inside' });
  }
  
  pipeline = pipeline.webp({ quality: 80, effort: 4 });
  const outPath = 'src/assets/ssc2026-ecard.webp';
  
  const buf = await pipeline.toBuffer();
  await fs.promises.writeFile(outPath, buf);
  
  const imgOut = sharp(outPath);
  const outMeta = await imgOut.metadata();
  console.log(`\nOptimized:\n- Dimensions: ${outMeta.width}x${outMeta.height}\n- File size: ${buf.length} bytes\n- Format: ${outMeta.format}`);
}

run().catch(console.error);
