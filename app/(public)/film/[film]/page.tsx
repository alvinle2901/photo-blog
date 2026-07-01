import { redirect } from "next/navigation";
import type { Metadata } from "next/types";
import { cache } from "react";
import { FILM_GRID_INITIAL, generateMetaForFilm } from "@/film";
import { getPhotosFilmDataCached } from "@/film/data";
import FilmOverview from "@/film/FilmOverview";

const getPhotosFilmDataCachedCached = cache((film: string) =>
	getPhotosFilmDataCached({ film, limit: FILM_GRID_INITIAL }),
);

interface FilmProps {
	params: Promise<{ film: string }>;
}

export async function generateMetadata({
	params,
}: FilmProps): Promise<Metadata> {
	const { film } = await params;

	const [photos, { count }] = await getPhotosFilmDataCachedCached(film);

	if (photos.length === 0) {
		return {};
	}

	const { url, title, description, images } = generateMetaForFilm(
		film,
		photos,
		count,
	);

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images,
			url,
		},
		twitter: {
			title,
			images,
			description,
			card: "summary_large_image",
		},
	};
}

export default async function FilmPage({ params }: FilmProps) {
	const { film } = await params;

	const [photos, { count }] = await getPhotosFilmDataCachedCached(film);

	if (photos.length === 0) {
		redirect("/");
	}

	return (
		<FilmOverview
			{...{
				film,
				photos,
				count,
			}}
		/>
	);
}
