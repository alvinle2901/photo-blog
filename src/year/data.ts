import {
	getPhotoPageDataByYearCached,
	getPhotosByYearCached,
} from "@/photo/cache";

export async function getPhotosYearDataCached({
	year,
	limit,
}: {
	year: string;
	limit?: number;
}) {
	const [photos, allPhotos] = await Promise.all([
		getPhotosByYearCached(year, limit),
		getPhotosByYearCached(year),
	]);

	return [photos, { count: allPhotos.length }] as const;
}

export const getPhotoYearPageDataCached = (photoId: string, year: string) =>
	getPhotoPageDataByYearCached(photoId, year);
