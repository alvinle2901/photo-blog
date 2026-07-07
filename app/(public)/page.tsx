import { getPhotosPaginatedCached } from "@/photo/cache";
import PhotoList from "@/photo/components/PhotoList";
import { parseSortOrder, parseSortSeed, parseSortType } from "@/photo/sort";

const INITIAL_LIMIT = 20;

export default async function HomePage({
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
	const photos = await getPhotosPaginatedCached(
		0,
		INITIAL_LIMIT + 1,
		sortType,
		sortOrder,
		seed,
	);
	const initialPhotos = photos.slice(0, INITIAL_LIMIT);
	const initialHasMore = photos.length > INITIAL_LIMIT;

	return (
		<PhotoList
			initialPhotos={initialPhotos}
			initialHasMore={initialHasMore}
			initialNextOffset={INITIAL_LIMIT}
			sortType={sortType}
			sortOrder={sortOrder}
			seed={seed}
		/>
	);
}
