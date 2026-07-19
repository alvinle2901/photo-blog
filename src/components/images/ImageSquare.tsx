import Image from "next/image";
import Link from "next/link";

import ImageLinkPendingSpinner from "@/components/images/ImageLinkPendingSpinner";
import type { Photo } from "@/photo";
import { getOptimizedUrl } from "@/storage/utils";

export default function ImageSquare({
	photo,
	index,
	href,
}: {
	photo: Photo;
	index: number;
	href?: string;
}) {
	return (
		<Link
			key={photo.id}
			href={href ?? `/p/${photo.id}`}
			className="group relative overflow-hidden bg-[#ebe7df] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(24,23,15,0.18)] focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a7656] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f5f2]"
			style={{ aspectRatio: "1 / 1" }}
		>
			<span className="pointer-events-none absolute inset-0 z-10 opacity-0 ring-1 ring-inset ring-[#f7f5f2]/80 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
			<Image
				src={getOptimizedUrl(photo.url, "md")}
				alt={photo.title || photo.id}
				fill
				sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 33vw, 25vw"
				className="object-cover transition duration-500 ease-out group-hover:scale-[1.035] group-hover:brightness-105 group-focus-visible:scale-[1.035] group-focus-visible:brightness-105"
				placeholder={photo.blurData ? "blur" : "empty"}
				blurDataURL={photo.blurData || undefined}
				priority={index < 8}
			/>
			<ImageLinkPendingSpinner />
		</Link>
	);
}
