import { labelForFilm } from "@/film";
import PhotoFilmIcon from "@/film/PhotoFilmIcon";
import type { Photo } from "@/photo";
import CollectionImageResponse from "@/photo/components/CollectionImageResponse";

export default function FilmImageResponse({
	film,
	photos,
}: {
	film: string;
	photos: Photo[];
}) {
	return (
		<CollectionImageResponse
			photos={photos}
			title={
				<>
				<PhotoFilmIcon film={film} height={28} />
				<span>{labelForFilm(film)}</span>
				</>
			}
		/>
	);
}
