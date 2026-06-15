import { getPhotosForRequest } from "@/photo/cache";
import PhotoList from "@/photo/components/PhotoList";

const INITIAL_LIMIT = 20;

export default async function HomePage() {
	const allPhotos = await getPhotosForRequest();
	const initialPhotos = allPhotos.slice(0, INITIAL_LIMIT);
	const initialHasMore = allPhotos.length > INITIAL_LIMIT;

	return (
		<PhotoList
			initialPhotos={initialPhotos}
			initialHasMore={initialHasMore}
			initialNextOffset={INITIAL_LIMIT}
		/>
	);
}
