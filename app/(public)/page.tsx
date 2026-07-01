import { getPhotosPaginatedCached } from "@/photo/cache";
import PhotoList from "@/photo/components/PhotoList";

const INITIAL_LIMIT = 20;

export default async function HomePage() {
	const photos = await getPhotosPaginatedCached(0, INITIAL_LIMIT + 1);
	const initialPhotos = photos.slice(0, INITIAL_LIMIT);
	const initialHasMore = photos.length > INITIAL_LIMIT;

	return (
		<PhotoList
			initialPhotos={initialPhotos}
			initialHasMore={initialHasMore}
			initialNextOffset={INITIAL_LIMIT}
		/>
	);
}
