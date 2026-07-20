import { notFound } from "next/navigation";

import PhotoGridPage from "@/photo/components/PhotoGridPage";

import {
	getGridPageData,
	type SortOrder,
	type SortType,
	VALID_SORT_ORDERS,
	VALID_SORT_TYPES,
} from "../../data";

export default async function GridSortedPage({
	params,
}: {
	params: Promise<{ sortType: string; sortOrder: string }>;
}) {
	const { sortType, sortOrder } = await params;

	if (
		!VALID_SORT_TYPES.includes(sortType as SortType) ||
		!VALID_SORT_ORDERS.includes(sortOrder as SortOrder)
	) {
		notFound();
	}

	const {
		photos: sortedPhotos,
		photoCount,
		hasMore,
		nextOffset,
		years,
		cameras,
		films,
	} = await getGridPageData(sortType as SortType, sortOrder as SortOrder);

	return (
		<PhotoGridPage
			photos={sortedPhotos}
			photoCount={photoCount}
			hasMore={hasMore}
			nextOffset={nextOffset}
			sortType={sortType as SortType}
			sortOrder={sortOrder as SortOrder}
			years={years}
			cameras={cameras}
			films={films}
		/>
	);
}
