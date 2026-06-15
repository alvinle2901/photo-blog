import { notFound } from "next/navigation";
import { getPhotoPageDataCached, getPhotosCached } from "@/photo/cache";
import PhotoDetailPage from "@/photo/components/PhotoDetailPage";

type PhotoPageProps = {
	params: Promise<{ photoId: string }>;
};

export async function generateStaticParams() {
	const photos = await getPhotosCached();
	return photos.map((photo) => ({ photoId: photo.id }));
}

export default async function PhotoPage({ params }: PhotoPageProps) {
	const { photoId } = await params;
	const data = await getPhotoPageDataCached(photoId);

	if (!data) {
		notFound();
	}

	return <PhotoDetailPage {...data} />;
}
