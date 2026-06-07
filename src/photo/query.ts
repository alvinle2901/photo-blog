import { db } from '../db/client';
import { photos } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { cacheTag } from 'next/cache';
import { rowToPhoto, type Photo } from './index';
import { CACHE_KEYS } from '../cache/keys';

export async function getPhotos(): Promise<Photo[]> {
  'use cache';
  cacheTag(CACHE_KEYS.photos());
  const rows = await db
    .select()
    .from(photos)
    .orderBy(desc(photos.createdAt));
  return rows.map(rowToPhoto);
}

export async function getPhotosPaginated(
  page: number,
  limit: number,
): Promise<Photo[]> {
  const offset = (page - 1) * limit;
  return getPhotosPaginatedByOffset(offset, limit);
}

export async function getPhotosPaginatedByOffset(
  offset: number,
  limit: number,
): Promise<Photo[]> {
  const rows = await db
    .select()
    .from(photos)
    .orderBy(desc(photos.createdAt))
    .limit(limit)
    .offset(offset);
  return rows.map(rowToPhoto);
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  'use cache';
  cacheTag(CACHE_KEYS.photo(id));
  const rows = await db
    .select()
    .from(photos)
    .where(eq(photos.id, id))
    .limit(1);
  return rows[0] ? rowToPhoto(rows[0]) : null;
}
