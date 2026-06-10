import { cache } from 'react';
import { unstable_cache } from 'next/cache';

import { CACHE_KEYS } from '@/cache/keys';
import {
  getPhotoById,
  getPhotoPageDataByFilm,
  getPhotoPageData,
  getPhotosByFilm,
  getPhotos,
  getPhotosPaginatedByOffset,
  getUniqueFilms,
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

export const getUniqueFilmsCached = unstable_cache(
  getUniqueFilms,
  [CACHE_KEYS.film('all')],
  { tags: [CACHE_KEYS.photos(), CACHE_KEYS.film('all')] },
);

export const getPhotosByFilmCached = (film: string, limit?: number) =>
  unstable_cache(
    () => getPhotosByFilm(film, limit),
    [CACHE_KEYS.film(film), `limit-${typeof limit === 'number' ? limit : 'all'}`],
    { tags: [CACHE_KEYS.photos(), CACHE_KEYS.film(film)] },
  )();

export const getPhotoPageDataByFilmCached = (
  id: string,
  film: string,
  nextLimit = 12,
) =>
  unstable_cache(
    () => getPhotoPageDataByFilm(id, film, nextLimit),
    [CACHE_KEYS.photo(id), CACHE_KEYS.film(film), `next-${nextLimit}`],
    { tags: [CACHE_KEYS.photos(), CACHE_KEYS.photo(id), CACHE_KEYS.film(film)] },
  )();

export const getPhotosForRequest = cache(getPhotosCached);

export const getPhotoPageDataForRequest = cache(
  (id: string, nextLimit = 12) => getPhotoPageDataCached(id, nextLimit),
);
