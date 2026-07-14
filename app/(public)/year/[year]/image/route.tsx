import { ImageResponse } from "next/og";

import { getPhotosByYearCached } from "@/photo/cache";
import YearImageResponse from "@/year/YearImageResponse";

export async function GET(
	_: Request,
	context: { params: Promise<{ year: string }> },
) {
	const { year } = await context.params;

	const photos = await getPhotosByYearCached(year);

	const width = 1200;
	const height = 630;

	return new ImageResponse(<YearImageResponse year={year} photos={photos} />, {
		width,
		height,
		headers: {
			"cache-control": "public, max-age=3600, s-maxage=3600",
		},
	});
}
