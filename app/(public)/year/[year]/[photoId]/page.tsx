import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { cache } from "react";

import PhotoDetailPage from "@/photo/components/PhotoDetailPage";
import {
	absolutePathForPhoto,
	descriptionForPhoto,
	titleForPhoto,
} from "@/year";
import { getPhotoYearPageDataCached } from "@/year/data";

const getPhotosNearIdCachedCached = cache((photoId: string, year: string) =>
	getPhotoYearPageDataCached(photoId, year),
);

interface PhotoYearProps {
	params: Promise<{ photoId: string; year: string }>;
}

export async function generateMetadata({
	params,
}: PhotoYearProps): Promise<Metadata> {
	const { photoId, year } = await params;

	const data = await getPhotosNearIdCachedCached(photoId, year);

	if (!data?.photo) {
		return {};
	}

	const { photo } = data;

	const title = titleForPhoto(photo);
	const description = descriptionForPhoto(photo, false);
	const descriptionHtml = descriptionForPhoto(photo, true);
	const images = [photo.url];
	const url = absolutePathForPhoto(year, photo.id);

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

export default async function PhotoYearPage({ params }: PhotoYearProps) {
	const { photoId, year } = await params;

	const data = await getPhotosNearIdCachedCached(photoId, year);

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
		/>
	);
}
