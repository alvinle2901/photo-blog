import { db } from '../db/client';
import { photos } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { rowToPhoto, type Photo } from './index';

export async function getPhotos(): Promise<Photo[]> {
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
  const rows = await db
    .select()
    .from(photos)
    .where(eq(photos.id, id))
    .limit(1);
  return rows[0] ? rowToPhoto(rows[0]) : null;
}

export async function getPhotoPageData(
  id: string,
  nextLimit = 12,
): Promise<{
  photo: Photo;
  prevPhoto: Photo | null;
  nextPhoto: Photo | null;
  nextPhotos: Photo[];
} | null> {
  const photos = await getPhotos();
  const index = photos.findIndex(photo => photo.id === id);

  if (index === -1) return null;

  const photo = photos[index];
  const prevPhoto = index > 0 ? photos[index - 1] : null;
  const nextPhoto = index < photos.length - 1 ? photos[index + 1] : null;
  const nextPhotos = photos.slice(index + 1, index + 1 + nextLimit);

  return {
    photo,
    prevPhoto,
    nextPhoto,
    nextPhotos,
  };
}
