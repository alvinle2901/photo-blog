'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { photos } from '../db/schema';
import { storage } from '../storage';
import { getIsAdmin } from '../auth/session';
import { CACHE_KEYS } from '../cache/keys';
import { getPhotos, getPhotosPaginated } from './query';
import type { Photo } from '.';

export async function fetchAllPhotos(): Promise<Photo[]> {
  return getPhotos();
}

export async function fetchPhotosPaginated(
  page: number,
  limit: number,
): Promise<Photo[]> {
  return getPhotosPaginated(page, limit);
}

export async function deletePhoto(id: string) {
  if (!(await getIsAdmin())) redirect('/sign-in');

  const rows = await db
    .select({ url: photos.url })
    .from(photos)
    .where(eq(photos.id, id))
    .limit(1);

  if (!rows[0]) return;

  // Delete from storage — extract the key from the URL
  const url = new URL(rows[0].url);
  const key = url.pathname.replace(/^\//, '');
  await storage.delete(key).catch(() => {
    // Best-effort — don't fail the DB delete if storage delete fails
  });

  await db.delete(photos).where(eq(photos.id, id));

  revalidateTag(CACHE_KEYS.photos(), 'default');
  revalidateTag(CACHE_KEYS.photo(id), 'default');
}
