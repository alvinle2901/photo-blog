"use client";

import Image from "next/image";
import Link from "next/link";
import { useMap } from "react-map-gl/mapbox";

import { Icons } from "@/components/icons";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Button } from "@/components/ui/Button";

// import { useEditPhoto } from '@/features/photos/api/use-edit-photo';

import type { Photo } from "@/photo";
import { convertToCoordination } from "@/utils/convert-coordination";
import { formatDate } from "@/utils/date";

const PhotoCard = ({ photo }: { photo: Photo }) => {
	const { map } = useMap();
	// const editMutation = useEditPhoto(photo.id);

	const handlePhotoClick = () => {
		if (photo.longitude && photo.latitude) {
			map?.flyTo({ center: [photo.longitude, photo.latitude], zoom: 17 });
		}
	};

	const handleHeartClick = () => {
		// editMutation.mutate(
		//   {
		//     isFavorite: !photo.isFavorite,
		//   },
		//   {
		//     onSuccess: () => {},
		//   },
		// );
	};

	return (
		<div className="relative">
			<AspectRatio
				ratio={4 / 5}
				className="overflow-hidden rounded-t-sm bg-muted"
			>
				<Image
					src={photo.url}
					fill
					alt="Image"
					placeholder="blur"
					blurDataURL={photo.blurData}
					className="cursor-pointer object-cover brightness-100 transition-all duration-300 hover:brightness-110"
					onClick={handlePhotoClick}
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
			</AspectRatio>
			<Button
				variant="outline"
				size="icon"
				className="absolute right-2 top-2 size-8 rounded-full bg-white"
				onClick={handleHeartClick}
			>
				{photo.isFavorite ? (
					<Icons.heart
						size={18}
						className="fill-rose-500 text-muted-foreground text-rose-500"
					/>
				) : (
					<Icons.heart size={18} className="text-muted-foreground" />
				)}
			</Button>

			<Link href={`/photos/${photo.id}`} className="group">
				<div className="w-full">
					<div className="w-full space-y-2 bg-[#f7f5f2] border-b border-l border-r border-[#e5e0d9] rounded-b-sm overflow-hidden p-2 transition duration-150">
						<p
							className="italic text-lg text-[#18170f] leading-tight truncate"
							style={{ fontFamily: "'Cormorant', serif" }}
						>
							{photo.title}
						</p>
						<p
							className="text-[12px] text-[#b5b0a8] mt-0.5 tracking-wide truncate"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							{formatDate(photo.takenAt)}
						</p>
						<p className="flex items-center text-[11px] font-light text-muted-foreground">
							<Icons.mapPin size={12} className="mr-2 text-gray-500" />
							{convertToCoordination(photo.longitude, photo.latitude)}
						</p>
					</div>
				</div>
			</Link>
		</div>
	);
};

export default PhotoCard;
