import type { Photo } from "@/photo";
import {
	getGridPhotosCached,
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

function randomValue(id: string, seed: string) {
	let hash = 0;
	const value = `${seed}:${id}`;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) | 0;
	}

	return Math.abs(hash);
}

function sortPhotos(
	photos: Photo[],
	sortType: SortType,
	sortOrder: SortOrder,
	seed = DEFAULT_RANDOM_SEED,
): Photo[] {
	const sorted = [...photos];

	sorted.sort((a, b) => {
		if (sortType === "random") {
			return randomValue(a.id, seed) - randomValue(b.id, seed);
		}

		let aValue: string | number | Date | null = null;
		let bValue: string | number | Date | null = null;

		if (sortType === "createdAt") {
			aValue = a.createdAt;
			bValue = b.createdAt;
		}

		if (sortType === "takenAt") {
			aValue = a.takenAt;
			bValue = b.takenAt;
		}

		if (aValue == null && bValue == null) return 0;
		if (aValue == null) return 1;
		if (bValue == null) return -1;

		const aComparable = aValue instanceof Date ? aValue.getTime() : aValue;
		const bComparable = bValue instanceof Date ? bValue.getTime() : bValue;

		if (aComparable < bComparable) return sortOrder === "asc" ? -1 : 1;
		if (aComparable > bComparable) return sortOrder === "asc" ? 1 : -1;
		return 0;
	});

	return sorted;
}

export async function getGridPageData(
	sortType: SortType = DEFAULT_SORT_TYPE,
	sortOrder: SortOrder = DEFAULT_SORT_ORDER,
	seed = DEFAULT_RANDOM_SEED,
) {
	const [photos, years, cameras, films] = await Promise.all([
		getGridPhotosCached(),
		getUniqueYearsCached(),
		getUniqueCamerasCached(),
		getUniqueFilmsCached(),
	]);

	return {
		photos: sortPhotos(photos, sortType, sortOrder, seed),
		years,
		cameras,
		films,
	};
}
