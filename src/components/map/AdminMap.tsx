"use client";

import type { Photo } from "@/photo";
import { cn } from "@/utils/cn";

import MapCanvas from "./MapCanvas";

interface Props {
	showLocal?: boolean;
	photos?: Photo[];
}

function AdminMapPin({ photo }: { photo: Photo }) {
	return (
		<span
			className={cn(
				"block h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-500 shadow-md shadow-black/30",
				"transition-transform hover:scale-125",
			)}
			title={photo.title || photo.id}
		>
			<span className="sr-only">{photo.title || photo.id}</span>
		</span>
	);
}

function renderAdminPhotoMarker(photo: Photo) {
	return <AdminMapPin photo={photo} />;
}

export default function AdminMap(props: Props) {
	return <MapCanvas {...props} renderPhotoMarker={renderAdminPhotoMarker} />;
}
