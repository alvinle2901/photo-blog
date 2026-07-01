import type { Photo } from "@/photo";
import {
	getPhotosCached,
	getUniqueCamerasCached,
	getUniqueFilmsCached,
	getUniqueYearsCached,
} from "@/photo/cache";

export type SortType = "createdAt" | "takenAt" | "title";
export type SortOrder = "asc" | "desc";

export const DEFAULT_GRID_SORT_TYPE: SortType = "takenAt";
export const DEFAULT_GRID_SORT_ORDER: SortOrder = "desc";

export const VALID_SORT_TYPES: SortType[] = ["createdAt", "takenAt", "title"];
export const VALID_SORT_ORDERS: SortOrder[] = ["asc", "desc"];

function sortPhotos(
	photos: Photo[],
	sortType: SortType,
	sortOrder: SortOrder,
): Photo[] {
	const sorted = [...photos];

	sorted.sort((a, b) => {
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

		if (sortType === "title") {
			aValue = (a.title || "").toLowerCase();
			bValue = (b.title || "").toLowerCase();
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
	sortType: SortType = DEFAULT_GRID_SORT_TYPE,
	sortOrder: SortOrder = DEFAULT_GRID_SORT_ORDER,
) {
	const [photos, years, cameras, films] = await Promise.all([
		getPhotosCached(),
		getUniqueYearsCached(),
		getUniqueCamerasCached(),
		getUniqueFilmsCached(),
	]);

	return {
		photos: sortPhotos(photos, sortType, sortOrder),
		years,
		cameras,
		films,
	};
}
