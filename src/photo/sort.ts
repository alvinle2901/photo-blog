export type SortType = "createdAt" | "takenAt" | "random";
export type SortOrder = "asc" | "desc";

export const DEFAULT_SORT_TYPE: SortType = "takenAt";
export const DEFAULT_SORT_ORDER: SortOrder = "desc";

export const SORT_ORDER_OPTIONS: Array<{
	label: string;
	sortOrder: SortOrder;
}> = [
	{ label: "newest first", sortOrder: "desc" },
	{ label: "oldest first", sortOrder: "asc" },
];

export const SORT_TYPE_OPTIONS: Array<{
	label: string;
	sortType: Exclude<SortType, "random">;
}> = [
	{ label: "taken at", sortType: "takenAt" },
	{ label: "uploaded on", sortType: "createdAt" },
];

export const SORT_OPTIONS: Array<{
	label: string;
	sortType: SortType;
	sortOrder: SortOrder;
}> = [
	...SORT_TYPE_OPTIONS.flatMap(({ label, sortType }) =>
		SORT_ORDER_OPTIONS.map(({ label: orderLabel, sortOrder }) => ({
			label: `${label} ${orderLabel}`,
			sortType,
			sortOrder,
		})),
	),
	{ label: "random", sortType: "random", sortOrder: "desc" },
];

export const VALID_SORT_TYPES: SortType[] = ["createdAt", "takenAt", "random"];
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
	if (sortType === "random") return "random";

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
