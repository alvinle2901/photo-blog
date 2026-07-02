import Image from "next/image";

import { getOptimizedUrl } from "@/storage/utils";

// Height determined by intrinsic photo aspect ratio
export const IMAGE_TINY_WIDTH = 50;
// Height determined by intrinsic photo aspect ratio
export const IMAGE_SMALL_WIDTH = 300;
// Height determined by intrinsic photo aspect ratio
export const IMAGE_LARGE_WIDTH = 1600;

export default function ImageLarge({
	className,
	src,
	aspectRatio,
	alt,
	priority,
	blurData,
}: {
	className?: string;
	src: string;
	aspectRatio: number;
	alt: string;
	priority?: boolean;
	id: string;
	blurData: string;
}) {
	return (
		<Image
			{...{
				className,
				src: getOptimizedUrl(src, "lg"),
				alt,
				priority,
				fetchPriority: priority ? "high" : "auto",
				blurDataURL: blurData,
				placeholder: "blur",
				sizes: "(max-width: 1024px) 100vw, calc(100vw - 360px)",
				width: IMAGE_LARGE_WIDTH,
				height: Math.round(IMAGE_LARGE_WIDTH / aspectRatio),
			}}
		/>
	);
}
