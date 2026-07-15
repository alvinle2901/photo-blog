import { cameraLabel } from "@/camera";
import type { Photo } from "@/photo";
import CollectionImageResponse from "@/photo/components/CollectionImageResponse";

export default function CameraImageResponse({
	make,
	model,
	photos,
}: {
	make: string;
	model: string;
	photos: Photo[];
}) {
	return (
		<CollectionImageResponse title={cameraLabel(make, model)} photos={photos} />
	);
}
