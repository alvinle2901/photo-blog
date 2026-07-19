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
				"group relative rounded-sm transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(24,23,15,0.14)]",
				isSelected &&
					"bg-[#ebe7df] shadow-[0_0_0_1px_#18170f,0_14px_34px_rgba(24,23,15,0.16)]",
			)}
		>
			<Button
				asChild
				variant="outline"
				size="icon"
				className="absolute right-2 top-2 z-10 size-8 rounded-full border-[#d8d1c7] bg-[#f7f5f2] text-[#18170f] opacity-95 shadow-sm transition-all hover:bg-[#ebe7df] group-hover:opacity-100"
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
				className="block w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18170f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f5f2]"
				onClick={handlePhotoSelect}
				aria-pressed={isSelected}
			>
				<AspectRatio
					ratio={4 / 5}
					className={cn(
						"overflow-hidden rounded-t-sm border border-[#e5e0d9] border-b-0 bg-[#ebe7df] transition-colors duration-300 group-hover:border-[#9a7656]",
						isSelected && "brightness-105",
					)}
				>
					<span className="pointer-events-none absolute inset-0 z-10 opacity-0 ring-1 ring-inset ring-[#f7f5f2]/80 transition-opacity duration-300 group-hover:opacity-100" />
					<Image
						src={getOptimizedUrl(photo.url, "md")}
						fill
						alt={photo.title || "Photo"}
						placeholder="blur"
						blurDataURL={photo.blurData}
						className="object-cover brightness-100 transition duration-500 ease-out group-hover:scale-[1.035] group-hover:brightness-105"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				</AspectRatio>

				<div className="w-full">
					<div
						className={cn(
							"w-full space-y-2 overflow-hidden rounded-b-sm border-b border-l border-r border-[#e5e0d9] bg-[#f7f5f2] p-3 transition duration-150",
							isSelected && "border-[#18170f] bg-[#ebe7df]",
						)}
					>
						<p
							className="truncate text-xl italic leading-tight text-[#18170f]"
							style={{ fontFamily: "'Cormorant', serif" }}
						>
							{photo.title || "untitled"}
						</p>
						<p
							className="mt-0.5 truncate text-[11px] uppercase tracking-[0.12em] text-[#b5b0a8]"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							{formatDate(photo.takenAt)}
						</p>
						<p className="flex items-center text-[11px] font-light text-[#777065]">
							<Icons.mapPin size={12} className="mr-2 text-[#8c857a]" />
							{convertToCoordination(photo.longitude, photo.latitude)}
						</p>
					</div>
				</div>
			</button>
		</div>
	);
};

export default PhotoCard;
