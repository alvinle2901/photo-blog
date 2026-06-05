import { randomUUID } from 'crypto';
import { db } from '../db/client';
import { photos } from '../db/schema';
import { storage } from '../storage';
import { getOptimizedKey } from '../storage/utils';
import { extractExif } from './extract-exif';
import { generateBlurHash } from './generate-blur';
import { generateColorData } from './generate-color';
import { generateOptimizedVariants } from './generate-optimized';
import { rowToPhoto, type Photo } from '../photo';

export type UploadInput = {
  buffer: Buffer;
  fileName: string;
  contentType: string;
};

export async function processUpload(input: UploadInput): Promise<Photo> {
  const { buffer, fileName, contentType } = input;

  const id = randomUUID();
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
  const key = `photos/${id}.${ext}`;

  // 1. Upload original to R2
  const url = await storage.upload({ key, body: buffer, contentType });

  // 2. Generate optimized variants (sm/md/lg) and upload in parallel
  const variants = await generateOptimizedVariants(buffer);
  await Promise.all(
    variants.map(({ suffix, buffer: variantBuffer }) =>
      storage.upload({
        key: getOptimizedKey(key, suffix),
        body: variantBuffer,
        contentType: 'image/jpeg',
      }),
    ),
  );

  // 3. Extract EXIF + blur hash + color palette in parallel
  const [exif, blurData, colorData] = await Promise.all([
    extractExif(buffer, fileName),
    generateBlurHash(buffer),
    generateColorData(buffer),
  ]);

  // 4. Insert into DB
  const [row] = await db
    .insert(photos)
    .values({
      id,
      url,
      extension: exif.extension,
      aspectRatio: exif.aspectRatio,
      blurData,
      colorData: JSON.stringify(colorData),
      make: exif.make,
      model: exif.model,
      focalLength: exif.focalLength != null ? Math.round(exif.focalLength) : null,
      focalLength35mm: exif.focalLength35mm != null ? Math.round(exif.focalLength35mm) : null,
      fStop: exif.fStop,
      iso: exif.iso != null ? Math.round(exif.iso) : null,
      exposureTime: exif.exposureTime,
      exposureComp: exif.exposureComp,
      latitude: exif.latitude,
      longitude: exif.longitude,
      takenAt: exif.takenAt,
      takenAtNaive: exif.takenAtNaive,
      filmSimulation: exif.filmSimulation,
      recipeData: exif.recipeData ? JSON.stringify(exif.recipeData) : null,
    })
    .returning();

  return rowToPhoto(row);
}
