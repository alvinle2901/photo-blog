import { cache } from 'react';
import { unstable_cache } from 'next/cache';

import { CACHE_KEYS } from '@/cache/keys';
import {
  getPhotoById,
  getPhotoPageData,
  getPhotos,
  getPhotosPaginatedByOffset,
} from '@/photo/query';

export const getPhotosCached = unstable_cache(
  getPhotos,
  [CACHE_KEYS.photos()],
  { tags: [CACHE_KEYS.photos()] },
);

export const getPhotoCached = (id: string) =>
  unstable_cache(
    () => getPhotoById(id),
    [CACHE_KEYS.photo(id)],
    { tags: [CACHE_KEYS.photos(), CACHE_KEYS.photo(id)] },
  )();

export const getPhotoPageDataCached = (id: string, nextLimit = 12) =>
  unstable_cache(
    () => getPhotoPageData(id, nextLimit),
    [CACHE_KEYS.photo(id), `next-${nextLimit}`],
    { tags: [CACHE_KEYS.photos(), CACHE_KEYS.photo(id)] },
  )();

export const getPhotosPaginatedCached = (offset: number, limit: number) =>
  unstable_cache(
    () => getPhotosPaginatedByOffset(offset, limit),
    [CACHE_KEYS.photos(), `paginated-${offset}-${limit}`],
    { tags: [CACHE_KEYS.photos()] },
  )();

export const getPhotosForRequest = cache(getPhotosCached);

export const getPhotoPageDataForRequest = cache(
  (id: string, nextLimit = 12) => getPhotoPageDataCached(id, nextLimit),
);
