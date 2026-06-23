import { unstable_cache } from "next/cache";
import { getFilmPhotoPageData, getFilmPhotos } from "@/35mm/query";

const FILM_PHOTOS_TAG = "35mm-photos";

export const getFilmPhotosCached = unstable_cache(
	getFilmPhotos,
	[FILM_PHOTOS_TAG],
	{ tags: [FILM_PHOTOS_TAG] },
);

export const getFilmPhotoPageDataCached = (
	photoId: string,
	nextLimit = 12,
) =>
	unstable_cache(
		() => getFilmPhotoPageData(photoId, nextLimit),
		[`35mm-photo-${photoId}`, `next-${nextLimit}`],
		{ tags: [FILM_PHOTOS_TAG, `35mm-photo-${photoId}`] },
	)();
