import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { cache } from "react";
import {
	absolutePathFor35mmPhoto,
	descriptionFor35mmPhoto,
	titleFor35mmPhoto,
} from "@/35mm";
import { getFilmPhotoPageDataCached } from "@/35mm/data";
import Photo35mmDetailPage from "@/35mm/Photo35mmDetailPage";

const getPhotosNearIdCachedCached = cache((photoId: string) =>
	getFilmPhotoPageDataCached(photoId),
);

interface Photo35mmProps {
	params: Promise<{ photoId: string }>;
}

export async function generateMetadata({
	params,
}: Photo35mmProps): Promise<Metadata> {
	const { photoId } = await params;

	const data = await getPhotosNearIdCachedCached(photoId);

	if (!data?.photo) {
		return {};
	}

	const { photo } = data;

	const title = titleFor35mmPhoto(photo);
	const description = descriptionFor35mmPhoto(photo, false);
	const descriptionHtml = descriptionFor35mmPhoto(photo, true);
	const images = [photo.url];
	const url = absolutePathFor35mmPhoto(photo.id);

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

export default async function Photo35mmPage({ params }: Photo35mmProps) {
	const { photoId } = await params;

	const data = await getPhotosNearIdCachedCached(photoId);

	if (!data) {
		notFound();
	}

	const { photo, prevPhoto, nextPhoto, nextPhotos } = data;

	return (
		<Photo35mmDetailPage
			photo={photo}
			prevPhoto={prevPhoto}
			nextPhoto={nextPhoto}
			nextPhotos={nextPhotos}
		/>
	);
}
