"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import type { Photo } from "@/photo";
import SharedHover from "@/providers/shared-hover/SharedHover";
import { getOptimizedUrl } from "@/storage/utils";
import { cn } from "@/utils/cn";

const PIN_HOVER_WIDTH_LANDSCAPE = 400;
const PIN_HOVER_WIDTH_PORTRAIT = 270;
const PIN_HOVER_WIDTH_SQUARE = 250;
const PIN_THUMBNAIL_SIZE = 48;

function dimensionsForPinHover(photo: Photo) {
	const width =
		photo.aspectRatio > 1.1
			? PIN_HOVER_WIDTH_LANDSCAPE
			: photo.aspectRatio < 0.9
				? PIN_HOVER_WIDTH_PORTRAIT
				: PIN_HOVER_WIDTH_SQUARE;

	return {
		width,
		height: Math.round(width / photo.aspectRatio),
	};
}

function MapPinHoverContent({ photo }: { photo: Photo }) {
	const { width } = dimensionsForPinHover(photo);

	return (
		<div className="relative h-full w-full">
			<Image
				src={getOptimizedUrl(photo.url, "md")}
				alt={photo.title || "Map pin preview"}
				fill
				sizes={`${width}px`}
				className="object-cover"
				placeholder={photo.blurData ? "blur" : "empty"}
				blurDataURL={photo.blurData || undefined}
			/>
			<div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/5 to-black/20" />
			<div className="absolute inset-x-0 bottom-0 p-2.5">
				<div
					className="truncate text-[0.7rem] uppercase tracking-[0.08em] text-white/90 drop-shadow"
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					{photo.title || photo.id}
				</div>
			</div>
		</div>
	);
}

export function MapPinHover({
	photo,
	children,
}: {
	photo: Photo;
	children: ReactNode;
}) {
	const hoverDimensions = dimensionsForPinHover(photo);

	return (
		<SharedHover
			hoverKey={`map-pin-${photo.id}`}
			width={hoverDimensions.width}
			height={hoverDimensions.height}
			offsetAbove={-4}
			offsetBelow={2}
			content={<MapPinHoverContent photo={photo} />}
		>
			{children}
		</SharedHover>
	);
}

export function MapPinThumbnail({
	photo,
	className,
}: {
	photo: Photo;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"group relative block h-12 w-12 overflow-hidden rounded-[4px] border-2 border-white bg-[#ebe7df] shadow-md shadow-black/25",
				"transition-transform hover:scale-105 active:scale-95",
				className,
			)}
		>
			<Image
				src={getOptimizedUrl(photo.url, "md")}
				alt={photo.title || "Map pin thumbnail"}
				fill
				sizes={`${PIN_THUMBNAIL_SIZE}px`}
				className="object-cover"
				placeholder={photo.blurData ? "blur" : "empty"}
				blurDataURL={photo.blurData || undefined}
			/>
			<span className="pointer-events-none absolute inset-0 rounded-[2px] border border-black/10" />
		</span>
	);
}
