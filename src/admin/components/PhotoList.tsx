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
}

const PhotoList = ({
	type,
	photos = [],
	filmPhotos = [],
	isPending = false,
}: Props) => {
	return (
		<div className="space-y-4">
			<div className="flex items-center py-5 border-t border-b border-[#e5e0d9] px-6">
				<h1 className="hidden text-sm font-light tracking-wide text-muted-foreground subpixel-antialiased md:block">
					Showing{" "}
					<span className="text-black">
						{type === "digital" ? photos.length : filmPhotos.length}
					</span>{" "}
					Photos Listing
				</h1>
			</div>

			{/* Grid */}
			<div className="px-6">
				{isPending ? (
					<div className="flex w-full items-center justify-center">
						<Icons.loader className="animate-spin" />
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
						{type === "digital"
							? photos.map((item) => <PhotoCard key={item.id} photo={item} />)
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
