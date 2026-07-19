import { labelForFilm } from "@/film";
import PhotoFilmIcon from "@/film/PhotoFilmIcon";
import type { Photo } from "@/photo";
import InfinitePhotoGrid from "@/photo/components/InfinitePhotoGrid";
import OverviewHeader from "@/photo/components/OverviewHeader";

export default function FilmOverview({
	film,
	photos,
	count,
}: {
	film: string;
	photos: Photo[];
	count: number;
}) {
	return (
		<section className="space-y-5 pb-6 md:py-6">
			<OverviewHeader
				category="Film"
				title={labelForFilm(film)}
				count={count}
				icon={
					<PhotoFilmIcon film={film} className="text-[#3d3a35]" height={14} />
				}
			/>

			<InfinitePhotoGrid
				initialPhotos={photos}
				initialHasMore={photos.length < count}
				initialNextOffset={photos.length}
				collection="film"
				film={film}
				hrefBase="film"
			/>
		</section>
	);
}
