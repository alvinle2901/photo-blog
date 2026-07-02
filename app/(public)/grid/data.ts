import {
	getPhotoCountCached,
	getUniqueCamerasCached,
	getUniqueFilmsCached,
	getUniqueYearsCached,
} from "@/photo/cache";
import { getGridPhotos } from "@/photo/query";

export type SortType = "createdAt" | "takenAt" | "title";
export type SortOrder = "asc" | "desc";

export const DEFAULT_GRID_SORT_TYPE: SortType = "takenAt";
export const DEFAULT_GRID_SORT_ORDER: SortOrder = "desc";
export const GRID_INITIAL_LIMIT = 80;

export const VALID_SORT_TYPES: SortType[] = ["createdAt", "takenAt", "title"];
export const VALID_SORT_ORDERS: SortOrder[] = ["asc", "desc"];

export async function getGridPageData(
	sortType: SortType = DEFAULT_GRID_SORT_TYPE,
	sortOrder: SortOrder = DEFAULT_GRID_SORT_ORDER,
) {
	const [photos, photoCount, years, cameras, films] = await Promise.all([
		getGridPhotos(sortType, sortOrder, 0, GRID_INITIAL_LIMIT + 1),
		getPhotoCountCached(),
		getUniqueYearsCached(),
		getUniqueCamerasCached(),
		getUniqueFilmsCached(),
	]);

	return {
		photos: photos.slice(0, GRID_INITIAL_LIMIT),
		hasMore: photos.length > GRID_INITIAL_LIMIT,
		nextOffset: GRID_INITIAL_LIMIT,
		photoCount,
		years,
		cameras,
		films,
	};
}
