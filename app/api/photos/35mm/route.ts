import { NextResponse } from "next/server";

import { getFilmPhotosPaginatedCached } from "@/35mm/data";

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 48;

const parsePositiveInteger = (value: string | null, fallback: number) => {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const offset = parsePositiveInteger(searchParams.get("offset"), 0);
	const requestedLimit = parsePositiveInteger(
		searchParams.get("limit"),
		DEFAULT_LIMIT,
	);
	const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);
	const photos = await getFilmPhotosPaginatedCached(offset, limit + 1);

	return NextResponse.json({
		photos: photos.slice(0, limit),
		hasMore: photos.length > limit,
		nextOffset: offset + limit,
		limit,
	});
}
