"use client";

import Image from "next/image";
import Link from "next/link";
import { useMap } from "react-map-gl/mapbox";

import { Icons } from "@/components/icons";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { Button } from "@/components/ui/Button";
import type { Photo } from "@/photo";
import { getOptimizedUrl } from "@/storage/utils";
import { cn } from "@/utils/cn";
import { convertToCoordination } from "@/utils/convert-coordination";
import { formatDate } from "@/utils/date";

const PhotoCard = ({
	photo,
	isSelected = false,
	onSelect,
}: {
	photo: Photo;
	isSelected?: boolean;
	onSelect?: (photoId: string) => void;
}) => {
	const { map } = useMap();

	const handlePhotoSelect = () => {
		onSelect?.(photo.id);

		if (photo.longitude && photo.latitude) {
			map?.flyTo({ center: [photo.longitude, photo.latitude], zoom: 17 });
		}
	};

	return (
		<div
			className={cn(
				"relative rounded-sm transition duration-150",
				isSelected &&
					"bg-white shadow-[0_0_0_2px_#18170f,0_10px_32px_rgba(0,0,0,0.12)]",
			)}
		>
			<Button
				asChild
				variant="outline"
				size="icon"
				className="absolute right-2 top-2 z-10 size-8 rounded-full border-[#d8d1c7] bg-white/95 text-[#18170f] shadow-sm backdrop-blur hover:bg-white"
			>
				<Link
					href={`/admin/photos/${photo.id}/edit`}
					aria-label={`Edit ${photo.title || photo.id}`}
				>
					<Icons.pencil size={15} />
				</Link>
			</Button>

			<button
				type="button"
				className="block w-full cursor-pointer text-left"
				onClick={handlePhotoSelect}
				aria-pressed={isSelected}
			>
				<AspectRatio
					ratio={4 / 5}
					className={cn(
						"overflow-hidden rounded-t-sm bg-muted",
						isSelected && "brightness-105",
					)}
				>
					<Image
						src={getOptimizedUrl(photo.url, "md")}
						fill
						alt={photo.title || "Photo"}
						placeholder="blur"
						blurDataURL={photo.blurData}
						className="object-cover brightness-100 transition-all duration-300 hover:brightness-110"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				</AspectRatio>

				<div className="w-full">
					<div
						className={cn(
							"w-full space-y-2 overflow-hidden rounded-b-sm border-b border-l border-r border-[#e5e0d9] bg-[#f7f5f2] p-2 transition duration-150",
							isSelected && "border-[#18170f] bg-white",
						)}
					>
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
			</button>
		</div>
	);
};

export default PhotoCard;
