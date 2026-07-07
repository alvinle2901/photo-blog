export type SortType = "createdAt" | "takenAt" | "title" | "random";
export type SortOrder = "asc" | "desc";

export const DEFAULT_SORT_TYPE: SortType = "takenAt";
export const DEFAULT_SORT_ORDER: SortOrder = "desc";

export const SORT_OPTIONS: Array<{
	label: string;
	sortType: SortType;
	sortOrder: SortOrder;
}> = [
	{ label: "taken new", sortType: "takenAt", sortOrder: "desc" },
	{ label: "taken old", sortType: "takenAt", sortOrder: "asc" },
	{ label: "added new", sortType: "createdAt", sortOrder: "desc" },
	{ label: "added old", sortType: "createdAt", sortOrder: "asc" },
	{ label: "title a-z", sortType: "title", sortOrder: "asc" },
	{ label: "title z-a", sortType: "title", sortOrder: "desc" },
	{ label: "random", sortType: "random", sortOrder: "desc" },
];

export const VALID_SORT_TYPES: SortType[] = [
	"createdAt",
	"takenAt",
	"title",
	"random",
];
export const VALID_SORT_ORDERS: SortOrder[] = ["asc", "desc"];

export const DEFAULT_RANDOM_SEED = "default";

export function parseSortType(value: string | null | undefined): SortType {
	return VALID_SORT_TYPES.includes(value as SortType)
		? (value as SortType)
		: DEFAULT_SORT_TYPE;
}

export function parseSortOrder(value: string | null | undefined): SortOrder {
	return VALID_SORT_ORDERS.includes(value as SortOrder)
		? (value as SortOrder)
		: DEFAULT_SORT_ORDER;
}

export function isDefaultSort(sortType: SortType, sortOrder: SortOrder) {
	return sortType === DEFAULT_SORT_TYPE && sortOrder === DEFAULT_SORT_ORDER;
}

export function getSortLabel(sortType: SortType, sortOrder: SortOrder) {
	return (
		SORT_OPTIONS.find(
			(option) =>
				option.sortType === sortType && option.sortOrder === sortOrder,
		)?.label ?? "sort"
	);
}

export function parseSortSeed(value: string | null | undefined) {
	return value?.trim() || DEFAULT_RANDOM_SEED;
}
