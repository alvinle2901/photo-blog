import {
	getPhotosPaginatedCached,
	getUniqueCamerasCached,
	getUniqueFilmsCached,
	getUniqueYearsCached,
} from "@/photo/cache";
import {
	DEFAULT_RANDOM_SEED,
	DEFAULT_SORT_ORDER,
	DEFAULT_SORT_TYPE,
	type SortOrder,
	type SortType,
	VALID_SORT_ORDERS,
	VALID_SORT_TYPES,
} from "@/photo/sort";

export type { SortOrder, SortType };
export {
	DEFAULT_SORT_ORDER as DEFAULT_GRID_SORT_ORDER,
	DEFAULT_SORT_TYPE as DEFAULT_GRID_SORT_TYPE,
	VALID_SORT_ORDERS,
	VALID_SORT_TYPES,
};

export const GRID_INITIAL_LIMIT = 48;

export async function getGridPageData(
	sortType: SortType = DEFAULT_SORT_TYPE,
	sortOrder: SortOrder = DEFAULT_SORT_ORDER,
	seed = DEFAULT_RANDOM_SEED,
) {
	const [photos, years, cameras, films] = await Promise.all([
		getPhotosPaginatedCached(
			0,
			GRID_INITIAL_LIMIT + 1,
			sortType,
			sortOrder,
			seed,
		),
		getUniqueYearsCached(),
		getUniqueCamerasCached(),
		getUniqueFilmsCached(),
	]);

	return {
		photos: photos.slice(0, GRID_INITIAL_LIMIT),
		hasMore: photos.length > GRID_INITIAL_LIMIT,
		nextOffset: GRID_INITIAL_LIMIT,
		years,
		cameras,
		films,
	};
}
