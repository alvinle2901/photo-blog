import {
	getPhotoCountByCameraCached,
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
	const [photos, count] = await Promise.all([
		getPhotosByCameraCached(make, model, limit),
		getPhotoCountByCameraCached(make, model),
	]);

	return [photos, { count }] as const;
}

export const getPhotoCameraPageDataCached = (
	photoId: string,
	make: string,
	model: string,
) => getPhotoPageDataByCameraCached(photoId, make, model);
