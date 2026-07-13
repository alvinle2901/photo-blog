import type { Photo } from "@/photo";
import CollectionImageResponse from "@/photo/components/CollectionImageResponse";

export default function YearImageResponse({
	year,
	photos,
}: {
	year: string;
	photos: Photo[];
}) {
	return <CollectionImageResponse title={year} photos={photos} />;
}
