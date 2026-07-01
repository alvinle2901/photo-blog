import { ImageResponse } from "next/og";
import { FILM_GRID_INITIAL } from "@/film";
import FilmImageResponse from "@/film/FilmImageResponse";
import { getPhotosByFilmCached } from "@/photo/cache";

export async function GET(
	_: Request,
	context: { params: Promise<{ film: string }> },
) {
	const { film } = await context.params;

	const photos = await getPhotosByFilmCached(film, FILM_GRID_INITIAL);

	const width = 1200;
	const height = 630;

	return new ImageResponse(<FilmImageResponse film={film} photos={photos} />, {
		width,
		height,
		headers: {
			"cache-control": "public, max-age=3600, s-maxage=3600",
		},
	});
}
