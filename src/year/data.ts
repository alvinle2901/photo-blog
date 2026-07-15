import {
	getPhotoCountByYearCached,
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
	const [photos, count] = await Promise.all([
		getPhotosByYearCached(year, limit),
		getPhotoCountByYearCached(year),
	]);

	return [photos, { count }] as const;
}

export const getPhotoYearPageDataCached = (photoId: string, year: string) =>
	getPhotoPageDataByYearCached(photoId, year);
