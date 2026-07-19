import {
	getPhotosByCameraPaginatedCached,
	getPhotosByFilmPaginatedCached,
	getPhotosByYearPaginatedCached,
	getPhotosPaginatedCached,
} from "@/photo/cache";
import { parseSortOrder, parseSortSeed, parseSortType } from "@/photo/sort";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const parsePositiveInteger = (value: string | null, fallback: number) => {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const offset = parsePositiveInteger(searchParams.get("offset"), 0);
	const collection = searchParams.get("collection");
	const sortType = parseSortType(searchParams.get("sortType"));
	const sortOrder = parseSortOrder(searchParams.get("sortOrder"));
	const seed = parseSortSeed(searchParams.get("seed"));
	const requestedLimit = parsePositiveInteger(
		searchParams.get("limit"),
		DEFAULT_LIMIT,
	);
	const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);
	const photos =
		collection === "film"
			? await getPhotosByFilmPaginatedCached(
					searchParams.get("film") ?? "",
					offset,
					limit + 1,
				)
			: collection === "year"
				? await getPhotosByYearPaginatedCached(
						searchParams.get("year") ?? "",
						offset,
						limit + 1,
					)
				: collection === "camera"
					? await getPhotosByCameraPaginatedCached(
							searchParams.get("make") ?? "",
							searchParams.get("model") ?? "",
							offset,
							limit + 1,
						)
					: await getPhotosPaginatedCached(
							offset,
							limit + 1,
							sortType,
							sortOrder,
							seed,
						);

	return Response.json({
		photos: photos.slice(0, limit),
		hasMore: photos.length > limit,
		nextOffset: offset + limit,
		limit,
	});
}
