import type { Photo } from "@/photo";
import GridFilterSidebar from "@/photo/components/GridFilterSidebar";
import InfinitePhotoGrid from "@/photo/components/InfinitePhotoGrid";
import type { SortOrder, SortType } from "@/photo/sort";

type Props = {
	photos: Photo[];
	photoCount: number;
	hasMore: boolean;
	nextOffset: number;
	sortType: SortType;
	sortOrder: SortOrder;
	seed?: string;
	years: Array<{ year: string; count: number }>;
	cameras: Array<{ make: string; model: string; count: number }>;
	films: Array<{ film: string; count: number }>;
};

export default function PhotoGridPage({
	photos,
	photoCount,
	hasMore,
	nextOffset,
	sortType,
	sortOrder,
	seed,
	years,
	cameras,
	films,
}: Props) {
	return (
		<div className="py-4 sm:py-6 lg:py-8">
			<div className="flex flex-col gap-2 lg:flex-row">
				<div className="min-w-0 flex-1">
					<InfinitePhotoGrid
						initialPhotos={photos}
						initialHasMore={hasMore}
						initialNextOffset={nextOffset}
						sortType={sortType}
						sortOrder={sortOrder}
						seed={seed}
					/>
				</div>

				<div className="order-first lg:order-0 lg:shrink-0 lg:sticky lg:top-8 lg:self-start px-2">
					<GridFilterSidebar
						photoCount={photoCount}
						sortType={sortType}
						sortOrder={sortOrder}
						years={years}
						cameras={cameras}
						films={films}
					/>
				</div>
			</div>
		</div>
	);
}
