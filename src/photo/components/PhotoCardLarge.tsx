"use client";

import { useRouter } from "next/navigation";

import PhotoContentSide from "@/components/images/PhotoContentSide";
import SiteGrid from "@/components/ui/SiteGrid";
import type { Photo } from "@/photo";

import PhotoCard from "./Photo";

const PhotoCardLarge = ({
	photo,
}: {
	photo: Photo & { gpsAltitude?: number | null };
	priority?: boolean;
}) => {
	const router = useRouter();

	return (
		<SiteGrid
			// className="border-b border-[#e5e0d9]"
			contentMain={
				<div className="overflow-hidden py-1">
					<PhotoCard
						photo={photo}
						onClick={() => router.push(`/p/${photo.id}`)}
						onFavourite={() => {}}
					/>
				</div>
			}
			contentSide={
				<PhotoContentSide
					photo={photo}
					className="h-full content-start p-4 border-b border-l border-[#e5e0d9]"
				/>
			}
		/>
	);
};

export default PhotoCardLarge;
