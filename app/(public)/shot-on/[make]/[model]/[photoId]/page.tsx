import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { cache } from "react";

import {
	absolutePathForCamera,
	absolutePathForPhoto,
	decodeCameraParams,
	descriptionForPhoto,
	titleForPhoto,
} from "@/camera";
import { getPhotoCameraPageDataCached } from "@/camera/data";
import PhotoDetailPage from "@/photo/components/PhotoDetailPage";

const getPhotosNearIdCachedCached = cache(
	(photoId: string, make: string, model: string) =>
		getPhotoCameraPageDataCached(photoId, make, model),
);

interface PhotoCameraProps {
	params: Promise<{ photoId: string; make: string; model: string }>;
}

export async function generateMetadata({
	params,
}: PhotoCameraProps): Promise<Metadata> {
	const { photoId, ...cameraParams } = await params;
	const { make, model } = decodeCameraParams(cameraParams);

	const data = await getPhotosNearIdCachedCached(photoId, make, model);

	if (!data?.photo) {
		return {};
	}

	const { photo } = data;

	const title = titleForPhoto(photo);
	const description = descriptionForPhoto(photo, false);
	const descriptionHtml = descriptionForPhoto(photo, true);
	const images = [photo.url];
	const url = absolutePathForPhoto(make, model, photo.id);

	return {
		title,
		description: descriptionHtml,
		openGraph: {
			title,
			images,
			description,
			url,
		},
		twitter: {
			title,
			description,
			images,
			card: "summary_large_image",
		},
	};
}

export default async function PhotoCameraPage({ params }: PhotoCameraProps) {
	const { photoId, ...cameraParams } = await params;
	const { make, model } = decodeCameraParams(cameraParams);

	const data = await getPhotosNearIdCachedCached(photoId, make, model);

	if (!data) {
		notFound();
	}

	const { photo, prevPhoto, nextPhoto, nextPhotos } = data;

	return (
		<PhotoDetailPage
			photo={photo}
			prevPhoto={prevPhoto}
			nextPhoto={nextPhoto}
			nextPhotos={nextPhotos}
			photoPathBase={absolutePathForCamera(make, model)}
		/>
	);
}
