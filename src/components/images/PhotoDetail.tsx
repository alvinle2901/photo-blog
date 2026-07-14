import ImageLarge from "@/components/images/ImageLarge";
import { LightboxTrigger } from "@/components/images/LightboxTrigger";
import PhotoContentSide from "@/components/images/PhotoContentSide";
import SiteGrid from "@/components/ui/SiteGrid";
import type { Photo } from "@/photo";
import PhotoImageNavigationControls from "@/photo/components/PhotoImageNavigationControls";
import PhotoImageNavigationLoader from "@/photo/components/PhotoImageNavigationLoader";
import { getOptimizedUrl } from "@/storage/utils";

const PhotoDetail = ({
	photo,
	priority,
	prevPhoto,
	nextPhoto,
	prevHref,
	nextHref,
}: {
	photo: Photo & { gpsAltitude?: number | null };
	priority?: boolean;
	prevPhoto?: Photo | null;
	nextPhoto?: Photo | null;
	prevHref?: string | null;
	nextHref?: string | null;
}) => {
	const lightboxImage = {
		src: photo.url,
		alt: photo.title || photo.id,
		aspectRatio: photo.aspectRatio,
		blurData: photo.blurData,
	};

	return (
		<SiteGrid
			contentMain={
				<div data-photo-navigation-surface className="relative touch-pan-y">
					<LightboxTrigger image={lightboxImage}>
						<ImageLarge
							className="w-full max-h-[80vh] object-contain"
							alt={photo.title}
							src={photo.url}
							aspectRatio={photo.aspectRatio}
							priority={priority}
							id={photo.id}
							blurData={photo.blurData}
						/>
					</LightboxTrigger>
					<PhotoImageNavigationLoader />
					<PhotoImageNavigationControls
						previous={
							prevPhoto && prevHref
								? {
										href: prevHref,
										imageUrl: getOptimizedUrl(prevPhoto.url, "lg"),
									}
								: null
						}
						next={
							nextPhoto && nextHref
								? {
										href: nextHref,
										imageUrl: getOptimizedUrl(nextPhoto.url, "lg"),
									}
								: null
						}
					/>
				</div>
			}
			contentSide={
				<PhotoContentSide
					photo={photo}
					className="sticky top-4 self-start -translate-y-1 my-2 md:my-4 px-3 md:px-4"
				/>
			}
		/>
	);
};

export default PhotoDetail;
