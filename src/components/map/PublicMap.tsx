"use client";

import { LightboxTrigger } from "@/components/images/LightboxTrigger";
import type { Photo } from "@/photo";

import MapCanvas from "./MapCanvas";
import { MapPinHover, MapPinThumbnail } from "./pins";

interface Props {
	showLocal?: boolean;
	photos?: Photo[];
}

function PublicMapPin({
	photo,
	supportsHover,
}: {
	photo: Photo;
	supportsHover: boolean;
}) {
	const trigger = (
		<LightboxTrigger
			image={{
				src: photo.url,
				alt: photo.title || photo.id,
				aspectRatio: photo.aspectRatio,
				blurData: photo.blurData,
			}}
		>
			<MapPinThumbnail photo={photo} />
		</LightboxTrigger>
	);

	return supportsHover ? (
		<MapPinHover photo={photo}>{trigger}</MapPinHover>
	) : (
		trigger
	);
}

export default function PublicMap(props: Props) {
	return (
		<MapCanvas
			{...props}
			renderPhotoMarker={(photo, supportsHover) => (
				<PublicMapPin photo={photo} supportsHover={supportsHover} />
			)}
		/>
	);
}
