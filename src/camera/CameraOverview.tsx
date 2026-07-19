import { cameraLabel } from "@/camera";
import { Icons } from "@/components/icons";
import type { Photo } from "@/photo";
import InfinitePhotoGrid from "@/photo/components/InfinitePhotoGrid";
import OverviewHeader from "@/photo/components/OverviewHeader";

export default function CameraOverview({
	make,
	model,
	photos,
	count,
}: {
	make: string;
	model: string;
	photos: Photo[];
	count: number;
}) {
	return (
		<section className="space-y-5 pb-6 md:py-6">
			<OverviewHeader
				category="Shot on"
				title={cameraLabel(make, model)}
				count={count}
				icon={<Icons.camera size={14} strokeWidth={1.8} />}
			/>

			<InfinitePhotoGrid
				initialPhotos={photos}
				initialHasMore={photos.length < count}
				initialNextOffset={photos.length}
				collection="camera"
				make={make}
				model={model}
				hrefBase="camera"
			/>
		</section>
	);
}
