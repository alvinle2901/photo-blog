import { db } from '../db/client';
import { photos } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { rowToPhoto, type Photo } from './index';

export async function getPhotos(): Promise<Photo[]> {
  'use cache';
  const rows = await db
    .select()
    .from(photos)
    .orderBy(desc(photos.createdAt));
  return rows.map(rowToPhoto);
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  'use cache';
  const rows = await db
    .select()
    .from(photos)
    .where(eq(photos.id, id))
    .limit(1);
  return rows[0] ? rowToPhoto(rows[0]) : null;
}
