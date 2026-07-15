import {
	getPhotoCountByFilmCached,
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
	const [photos, count] = await Promise.all([
		getPhotosByFilmCached(film, limit),
		getPhotoCountByFilmCached(film),
	]);

	return [photos, { count }] as const;
}

export const getPhotoFilmPageDataCached = (photoId: string, film: string) =>
	getPhotoPageDataByFilmCached(photoId, film);
