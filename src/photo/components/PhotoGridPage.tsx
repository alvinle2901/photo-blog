import ImageSquare from "@/components/images/ImageSquare";
import type { Photo } from "@/photo";
import GridFilterSidebar from "@/photo/components/GridFilterSidebar";
import type { SortOrder, SortType } from "@/photo/sort";

type Props = {
	photos: Photo[];
	sortType: SortType;
	sortOrder: SortOrder;
	years: Array<{ year: string; count: number }>;
	cameras: Array<{ make: string; model: string; count: number }>;
	films: Array<{ film: string; count: number }>;
};

export default function PhotoGridPage({
	photos,
	sortType,
	sortOrder,
	years,
	cameras,
	films,
}: Props) {
	const photoCount = photos.length;

	return (
		<div className="py-8">
			<div className="flex flex-col gap-4 lg:flex-row">
				<div className="min-w-0 flex-1">
					<div className="grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-2 md:grid-cols-4">
						{photos.map((photo, index) => (
							<ImageSquare key={photo.id} photo={photo} index={index} />
						))}
					</div>
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
