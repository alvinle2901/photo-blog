import PhotoSortDropdown from "@/photo/components/PhotoSortDropdown";
import type { SortOrder, SortType } from "@/photo/sort";

export default function GridSortDropdown({
	sortType,
	sortOrder,
}: {
	sortType: SortType;
	sortOrder: SortOrder;
}) {
	return (
		<PhotoSortDropdown
			basePath="/grid"
			sortType={sortType}
			sortOrder={sortOrder}
			align="start"
		/>
	);
}
