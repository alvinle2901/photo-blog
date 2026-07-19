import { unstable_cache } from "next/cache";

import {
	getFilmPhotoCount,
	getFilmPhotoPageData,
	getFilmPhotos,
	getFilmPhotosPaginatedByOffset,
} from "@/35mm/query";

const FILM_PHOTOS_TAG = "35mm-photos";

export const getFilmPhotosCached = unstable_cache(
	getFilmPhotos,
	[FILM_PHOTOS_TAG],
	{ tags: [FILM_PHOTOS_TAG] },
);

export const getFilmPhotosPaginatedCached = (offset: number, limit: number) =>
	unstable_cache(
		() => getFilmPhotosPaginatedByOffset(offset, limit),
		[FILM_PHOTOS_TAG, `paginated-${offset}-${limit}`],
		{ tags: [FILM_PHOTOS_TAG] },
	)();

export const getFilmPhotoCountCached = unstable_cache(
	getFilmPhotoCount,
	[FILM_PHOTOS_TAG, "count"],
	{ tags: [FILM_PHOTOS_TAG] },
);

export const getFilmPhotoPageDataCached = (photoId: string, nextLimit = 10) =>
	unstable_cache(
		() => getFilmPhotoPageData(photoId, nextLimit),
		[`35mm-photo-${photoId}`, `next-${nextLimit}`],
		{ tags: [FILM_PHOTOS_TAG, `35mm-photo-${photoId}`] },
	)();
