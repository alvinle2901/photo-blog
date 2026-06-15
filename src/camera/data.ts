import {
	getPhotoPageDataByCameraCached,
	getPhotosByCameraCached,
} from "@/photo/cache";

export async function getPhotosCameraDataCached({
	make,
	model,
	limit,
}: {
	make: string;
	model: string;
	limit?: number;
}) {
	const [photos, allPhotos] = await Promise.all([
		getPhotosByCameraCached(make, model, limit),
		getPhotosByCameraCached(make, model),
	]);

	return [photos, { count: allPhotos.length }] as const;
}

export const getPhotoCameraPageDataCached = (
	photoId: string,
	make: string,
	model: string,
) => getPhotoPageDataByCameraCached(photoId, make, model);
