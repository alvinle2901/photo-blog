import type { Photo } from "@/photo";
import GridFilterSidebar from "@/photo/components/GridFilterSidebar";
import PhotoGridInfinite from "@/photo/components/PhotoGridInfinite";

type SortType = "createdAt" | "takenAt" | "title";
type SortOrder = "asc" | "desc";

type Props = {
	photos: Photo[];
	photoCount: number;
	initialHasMore: boolean;
	initialNextOffset: number;
	sortType: SortType;
	sortOrder: SortOrder;
	years: Array<{ year: string; count: number }>;
	cameras: Array<{ make: string; model: string; count: number }>;
	films: Array<{ film: string; count: number }>;
};

export default function PhotoGridPage({
	photos,
	photoCount,
	initialHasMore,
	initialNextOffset,
	sortType,
	sortOrder,
	years,
	cameras,
	films,
}: Props) {
	return (
		<div className="py-8">
			<div className="flex flex-col gap-4 lg:flex-row">
				<div className="min-w-0 flex-1">
					<PhotoGridInfinite
						initialPhotos={photos}
						initialHasMore={initialHasMore}
						initialNextOffset={initialNextOffset}
						sortType={sortType}
						sortOrder={sortOrder}
					/>
				</div>

				<div className="order-first lg:order-0 lg:shrink-0 lg:sticky lg:top-8 lg:self-start">
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
