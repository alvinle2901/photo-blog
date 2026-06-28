import { getPhotosForRequest } from "@/photo/cache";

import MapPageClient from "./MapPageClient";

// meta
export const metadata = {
	title: "Map",
};

const getMapPhotos = async () => {
	try {
		const photos = await getPhotosForRequest();
		return photos.filter(
			(photo) => photo.latitude !== null && photo.longitude !== null,
		);
	} catch (error) {
		console.error("Failed to load map photos:", error);
		return [];
	}
};

const MapPage = async () => {
	const photosWithCoords = await getMapPhotos();

	return (
		<section className="ml-0 h-dvh">
			<MapPageClient photos={photosWithCoords} />
		</section>
	);
};

export default MapPage;
