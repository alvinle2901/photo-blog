import { notFound } from "next/navigation";
import { getPhotoPageDataCached } from "@/photo/cache";
import PhotoDetailPage from "@/photo/components/PhotoDetailPage";

type PhotoPageProps = {
	params: Promise<{ photoId: string }>;
};

export default async function PhotoPage({ params }: PhotoPageProps) {
	const { photoId } = await params;
	const data = await getPhotoPageDataCached(photoId);

	if (!data) {
		notFound();
	}

	return <PhotoDetailPage {...data} />;
}
