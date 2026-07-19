import type { Metadata } from "next/types";
import { cache } from "react";

import {
	getFilmPhotoCountCached,
	getFilmPhotosPaginatedCached,
} from "@/35mm/data";
import InfiniteGallery35mm from "@/35mm/InfiniteGallery35mm";

const INITIAL_LIMIT = 24;

const getFilmPhotosPageCachedCached = cache(async () => {
	const [filmPhotos, count] = await Promise.all([
		getFilmPhotosPaginatedCached(0, INITIAL_LIMIT + 1),
		getFilmPhotoCountCached(),
	]);

	return [filmPhotos, { count }] as const;
});

export async function generateMetadata(): Promise<Metadata> {
	const [filmPhotos, { count }] = await getFilmPhotosPageCachedCached();
	const noun = count === 1 ? "photo" : "photos";
	const title = `35mm (${count} ${noun})`;
	const description = `${count} ${noun} from the 35mm collection.`;
	const images = filmPhotos[0]?.url ? [filmPhotos[0].url] : undefined;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images,
			url: "/35mm",
		},
		twitter: {
			title,
			description,
			images,
			card: "summary_large_image",
		},
	};
}

const Page35mm = async () => {
	const [filmPhotos, { count }] = await getFilmPhotosPageCachedCached();
	const initialPhotos = filmPhotos.slice(0, INITIAL_LIMIT).map((photo) => ({
		id: photo.id,
		url: photo.url,
		width: photo.width,
		height: photo.height,
		title: photo.title,
	}));

	return (
		<div className="p-2 md:py-10 md:pr-12.5">
			<InfiniteGallery35mm
				initialPhotos={initialPhotos}
				initialHasMore={count > initialPhotos.length}
				initialNextOffset={initialPhotos.length}
			/>
		</div>
	);
};

export default Page35mm;
