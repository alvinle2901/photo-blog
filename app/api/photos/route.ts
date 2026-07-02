import { getGridPhotos } from "@/photo/query";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 80;

type SortType = "createdAt" | "takenAt" | "title";
type SortOrder = "asc" | "desc";

const SORT_TYPES: SortType[] = ["createdAt", "takenAt", "title"];
const SORT_ORDERS: SortOrder[] = ["asc", "desc"];

const parsePositiveInteger = (value: string | null, fallback: number) => {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

const parseSortType = (value: string | null): SortType =>
	SORT_TYPES.includes(value as SortType) ? (value as SortType) : "takenAt";

const parseSortOrder = (value: string | null): SortOrder =>
	SORT_ORDERS.includes(value as SortOrder) ? (value as SortOrder) : "desc";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const offset = parsePositiveInteger(searchParams.get("offset"), 0);
	const requestedLimit = parsePositiveInteger(
		searchParams.get("limit"),
		DEFAULT_LIMIT,
	);
	const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);
	const sortType = parseSortType(searchParams.get("sortType"));
	const sortOrder = parseSortOrder(searchParams.get("sortOrder"));
	const photos = await getGridPhotos(sortType, sortOrder, offset, limit + 1);

	return Response.json({
		photos: photos.slice(0, limit),
		hasMore: photos.length > limit,
		nextOffset: offset + limit,
		limit,
	});
}
