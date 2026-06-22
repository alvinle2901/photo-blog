"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/AspectRatio";
import type { FilmPhoto } from "@/35mm/query";

const PhotoOtherCard = ({ photo }: { photo: FilmPhoto }) => {
	return (
		<div className="relative">
			<AspectRatio ratio={4 / 5} className="overflow-hidden rounded-xl bg-muted">
				<Image
					src={photo.url}
					fill
					alt={photo.title ?? "35mm photo"}
					className="object-cover brightness-100 transition-all duration-300 hover:brightness-110"
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				/>
			</AspectRatio>

			<div className="absolute bottom-0 left-0 w-full p-2">
				<div className="w-full space-y-1 overflow-hidden rounded-md bg-white/80 p-2 backdrop-blur">
					{photo.title && (
						<h1 className="line-clamp-1 text-sm font-medium">{photo.title}</h1>
					)}
					{photo.film && (
						<p className="text-xs text-muted-foreground">{photo.film}</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default PhotoOtherCard;
