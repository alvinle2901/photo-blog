"use client";

import { TbPhotoShare } from "react-icons/tb";

import type { Photo } from "@/photo";
import { useAppState } from "@/state";
import { getOptimizedUrl } from "@/storage/utils";

let prefetchedImage: HTMLImageElement | null = null;

export default function PhotoShareButton({
	photo,
	className,
}: {
	photo: Photo;
	className?: string;
}) {
	const { setPhotoShareData } = useAppState();

	return (
		<button
			type="button"
			className="hover:text-gray-500 cursor-pointer"

			onMouseEnter={() => {
				prefetchedImage = new Image();
				prefetchedImage.src = getOptimizedUrl(photo.url, "lg");
			}}
			onClick={() => {
				setPhotoShareData?.({ photo });
			}}
			aria-label="Share photo"
		>
			<TbPhotoShare size={18} />
		</button>
	);
}
