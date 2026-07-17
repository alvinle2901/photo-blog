"use client";

import Image from "next/image";

import type { FilmPhoto } from "@/35mm/query";
import { AspectRatio } from "@/components/ui/AspectRatio";
import { getOptimizedUrl } from "@/storage/utils";

const PhotoOtherCard = ({ photo }: { photo: FilmPhoto }) => {
	return (
		<div className="group relative rounded-sm transition duration-200 hover:shadow-[0_12px_30px_rgba(24,23,15,0.12)]">
			<AspectRatio
				ratio={4 / 5}
				className="overflow-hidden rounded-sm border border-[#e5e0d9] bg-[#ebe7df]"
			>
				<Image
					src={getOptimizedUrl(photo.url, "md")}
					fill
					alt={photo.title ?? "35mm photo"}
					className="object-cover brightness-100 transition duration-300 group-hover:scale-[1.015] group-hover:brightness-105"
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
