import PhotoGridPage from "@/photo/components/PhotoGridPage";
import { parseSortOrder, parseSortSeed, parseSortType } from "@/photo/sort";

import { getGridPageData } from "./data";

export default async function GridPage({
	searchParams,
}: {
	searchParams: Promise<{
		sortType?: string;
		sortOrder?: string;
		seed?: string;
	}>;
}) {
	const params = await searchParams;
	const sortType = parseSortType(params.sortType);
	const sortOrder = parseSortOrder(params.sortOrder);
	const seed = parseSortSeed(params.seed);
	const { photos, years, cameras, films } = await getGridPageData(
		sortType,
		sortOrder,
		seed,
	);

	return (
		<PhotoGridPage
			photos={photos}
			sortType={sortType}
			sortOrder={sortOrder}
			years={years}
			cameras={cameras}
			films={films}
		/>
	);
}
