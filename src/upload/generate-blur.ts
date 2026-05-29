import sharp from 'sharp';

const BLUR_WIDTH = 200;
const BLUR_QUALITY = 80;

/**
 * Generate a base64 JPEG placeholder for lazy loading.
 * Small blurred image encoded as a data URL.
 */
export async function generateBlurHash(buffer: Buffer): Promise<string> {
  const data = await sharp(buffer)
    .resize(BLUR_WIDTH)
    .modulate({ saturation: 1.15 })
    .blur(4)
    .withMetadata()
    .toFormat('jpeg', { quality: BLUR_QUALITY })
    .toBuffer();

  return `data:image/jpeg;base64,${data.toString('base64')}`;
}
