import ImageLarge from "@/components/images/ImageLarge";
import { LightboxTrigger } from "@/components/images/LightboxTrigger";
import PhotoContentSide from "@/components/images/PhotoContentSide";
import SiteGrid from "@/components/ui/SiteGrid";
import type { Photo } from "@/photo";

const PhotoDetail = ({
	photo,
	priority,
}: {
	photo: Photo & { gpsAltitude?: number | null };
	priority?: boolean;
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
