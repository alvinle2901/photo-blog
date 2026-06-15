import {
	getPhotoPageDataByFilmCached,
	getPhotosByFilmCached,
} from "@/photo/cache";

export async function getPhotosFilmDataCached({
	film,
	limit,
}: {
	film: string;
	limit?: number;
}) {
	const [photos, allPhotos] = await Promise.all([
		getPhotosByFilmCached(film, limit),
		getPhotosByFilmCached(film),
	]);

	return [photos, { count: allPhotos.length }] as const;
}

export const getPhotoFilmPageDataCached = (photoId: string, film: string) =>
	getPhotoPageDataByFilmCached(photoId, film);
