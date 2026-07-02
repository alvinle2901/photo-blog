import PhotoGridPage from "@/photo/components/PhotoGridPage";

import {
	DEFAULT_GRID_SORT_ORDER,
	DEFAULT_GRID_SORT_TYPE,
	getGridPageData,
} from "./data";

export default async function GridPage() {
	const { photos, photoCount, hasMore, nextOffset, years, cameras, films } =
		await getGridPageData();

	return (
		<PhotoGridPage
			photos={photos}
			photoCount={photoCount}
			initialHasMore={hasMore}
			initialNextOffset={nextOffset}
			sortType={DEFAULT_GRID_SORT_TYPE}
			sortOrder={DEFAULT_GRID_SORT_ORDER}
			years={years}
			cameras={cameras}
			films={films}
		/>
	);
}
