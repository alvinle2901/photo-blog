import { randomUUID } from 'crypto';
import { db } from '../db/client';
import { photos } from '../db/schema';
import { storage } from '../storage';
import { extractExif } from './extract-exif';
import { generateBlurHash } from './generate-blur';
import { generateColorData } from './generate-color';
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

  // 1. Upload to R2
  const url = await storage.upload({ key, body: buffer, contentType });

  // 2. Extract EXIF + blur hash + color palette in parallel
  const [exif, blurData, colorData] = await Promise.all([
    extractExif(buffer, fileName),
    generateBlurHash(buffer),
    generateColorData(buffer),
  ]);

  // 3. Insert into DB
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
      focalLength: exif.focalLength,
      focalLength35mm: exif.focalLength35mm,
      fStop: exif.fStop,
      iso: exif.iso,
      exposureTime: exif.exposureTime,
      exposureComp: exif.exposureComp,
      latitude: exif.latitude,
      longitude: exif.longitude,
      takenAt: exif.takenAt,
      takenAtNaive: exif.takenAtNaive,
    })
    .returning();

  return rowToPhoto(row);
}
