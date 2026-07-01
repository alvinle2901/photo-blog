import { getMapPhotosCached } from "@/photo/cache";

import MapPageClient from "./MapPageClient";

// meta
export const metadata = {
	title: "Map",
};

const getMapPhotos = async () => {
	try {
		return getMapPhotosCached();
	} catch (error) {
		if (process.env.NODE_ENV !== "production") {
			console.error("Failed to load map photos:", error);
		}
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
