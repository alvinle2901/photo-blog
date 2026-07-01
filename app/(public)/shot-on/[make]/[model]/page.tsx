import type { Metadata } from "next/types";
import { cache } from "react";

import {
	CAMERA_GRID_INITIAL,
	decodeCameraParams,
	generateMetaForCamera,
} from "@/camera";
import CameraOverview from "@/camera/CameraOverview";
import { getPhotosCameraDataCached } from "@/camera/data";

const getPhotosCameraDataCachedCached = cache((make: string, model: string) =>
	getPhotosCameraDataCached({ make, model, limit: CAMERA_GRID_INITIAL }),
);

interface CameraProps {
	params: Promise<{ make: string; model: string }>;
}

export async function generateMetadata({
	params,
}: CameraProps): Promise<Metadata> {
	const { make, model } = decodeCameraParams(await params);

	const [photos, { count }] = await getPhotosCameraDataCachedCached(
		make,
		model,
	);

	const { url, title, description, images } = generateMetaForCamera(
		make,
		model,
		photos,
		count,
	);

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images,
			url,
		},
		twitter: {
			title,
			images,
			description,
			card: "summary_large_image",
		},
	};
}

export default async function CameraPage({ params }: CameraProps) {
	const { make, model } = decodeCameraParams(await params);

	const [photos, { count }] = await getPhotosCameraDataCachedCached(
		make,
		model,
	);

	return (
		<CameraOverview make={make} model={model} photos={photos} count={count} />
	);
}
