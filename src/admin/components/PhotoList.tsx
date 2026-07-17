"use client";

import type { FilmPhoto } from "@/35mm/query";
import { Icons } from "@/components/icons";
import type { Photo } from "@/photo";

import PhotoOtherCard from "./PhotoCard/Card35mm";
import PhotoCard from "./PhotoCard/CardNormal";

export type { FilmPhoto, Photo };

interface Props {
	type: "digital" | "35mm";
	photos?: Photo[];
	filmPhotos?: FilmPhoto[];
	isPending?: boolean;
	selectedPhotoId?: string | null;
	onSelectPhoto?: (photoId: string) => void;
}

const PhotoList = ({
	type,
	photos = [],
	filmPhotos = [],
	isPending = false,
	selectedPhotoId,
	onSelectPhoto,
}: Props) => {
	const count = type === "digital" ? photos.length : filmPhotos.length;
	const label = type === "digital" ? "digital frames" : "35mm scans";

	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between px-5 pt-5 sm:px-7">
				<h2
					className="text-xs uppercase tracking-[0.16em] text-[#8c857a]"
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					<span className="text-[#18170f]">{count}</span> {label}
				</h2>
				<p
					className="hidden text-[10px] uppercase tracking-[0.16em] text-[#b5b0a8] sm:block"
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					click a card to locate it
				</p>
			</div>

			<div className="px-5 pb-8 sm:px-7">
				{isPending ? (
					<div className="flex min-h-60 w-full items-center justify-center rounded-sm border border-[#e5e0d9] bg-[#ebe7df]">
						<Icons.loader className="animate-spin" />
					</div>
				) : (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
						{type === "digital"
							? photos.map((item) => (
									<PhotoCard
										key={item.id}
										photo={item}
										isSelected={item.id === selectedPhotoId}
										onSelect={onSelectPhoto}
									/>
								))
							: filmPhotos.map((item) => (
									<PhotoOtherCard key={item.id} photo={item} />
								))}
					</div>
				)}
			</div>
		</div>
	);
};

export default PhotoList;
