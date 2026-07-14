import Link from "next/link";

import ImageLarge from "@/components/images/ImageLarge";
import PhotoContentSide from "@/components/images/PhotoContentSide";
import SiteGrid from "@/components/ui/SiteGrid";
import type { Photo } from "@/photo";

const PhotoLarge = ({
	photo,
	priority,
}: {
	photo: Photo & { gpsAltitude?: number | null };
	priority?: boolean;
}) => {
	return (
		<SiteGrid
			className="border-b border-[#e5e0d9]"
			contentMain={
				<Link href={`/p/${photo.id}`} className="block active:brightness-75">
					<ImageLarge
						className="w-full max-h-[90vh] object-contain"
						alt={photo.title}
						src={photo.url}
						aspectRatio={photo.aspectRatio}
						priority={priority}
						id={photo.id}
						blurData={photo.blurData}
					/>
				</Link>
			}
			contentSide={
				<PhotoContentSide
					photo={photo}
					className="sticky top-4 my-2 self-start -translate-y-1 px-3 md:my-4 md:px-4"
				/>
			}
		/>
	);
};

export default PhotoLarge;
