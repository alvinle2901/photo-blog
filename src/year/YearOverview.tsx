import { Icons } from "@/components/icons";
import type { Photo } from "@/photo";
import InfinitePhotoGrid from "@/photo/components/InfinitePhotoGrid";
import OverviewHeader from "@/photo/components/OverviewHeader";

export default function YearOverview({
	year,
	photos,
	count,
}: {
	year: string;
	photos: Photo[];
	count: number;
}) {
	return (
		<section className="space-y-5 pb-6 md:py-6">
			<OverviewHeader
				category="Year"
				title={year}
				count={count}
				icon={<Icons.time size={14} strokeWidth={1.8} />}
			/>

			<InfinitePhotoGrid
				initialPhotos={photos}
				initialHasMore={photos.length < count}
				initialNextOffset={photos.length}
				collection="year"
				year={year}
				hrefBase="year"
			/>
		</section>
	);
}
