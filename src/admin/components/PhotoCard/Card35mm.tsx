"use client";

import Image from "next/image";

import type { FilmPhoto } from "@/35mm/query";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { getOptimizedUrl } from "@/storage/utils";

import { PhotoCardActions } from "./PhotoCardActions";

const PhotoOtherCard = ({
	photo,
	onDelete,
}: {
	photo: FilmPhoto;
	onDelete?: (photoId: string) => void;
}) => {
	return (
		<div className="group relative rounded-sm transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(24,23,15,0.14)]">
			<PhotoCardActions
				id={photo.id}
				deleteType="35mm"
				onDeleted={onDelete}
			/>
			<AspectRatio
				ratio={4 / 5}
				className="overflow-hidden rounded-sm border border-[#e5e0d9] bg-[#ebe7df] transition-colors duration-300 group-hover:border-[#9a7656]"
			>
				<span className="pointer-events-none absolute inset-0 z-10 opacity-0 ring-1 ring-inset ring-[#f7f5f2]/80 transition-opacity duration-300 group-hover:opacity-100" />
				<Image
					src={getOptimizedUrl(photo.url, "md")}
					fill
					alt={photo.title ?? "35mm photo"}
					className="object-cover brightness-100 transition duration-500 ease-out group-hover:scale-[1.035] group-hover:brightness-105"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
			</AspectRatio>

			<div className="absolute bottom-0 left-0 w-full p-2">
				<div className="w-full space-y-1 overflow-hidden rounded-sm border border-[#e5e0d9] bg-[#f7f5f2] p-2.5">
					{photo.title && (
						<h3
							className="line-clamp-1 text-lg font-light italic leading-tight text-[#18170f]"
							style={{ fontFamily: "'Cormorant', serif" }}
						>
							{photo.title}
						</h3>
					)}
					{photo.film && (
						<p
							className="text-[10px] uppercase tracking-[0.12em] text-[#8c857a]"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							{photo.film}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default PhotoOtherCard;
