"use client";

import { useRouter } from "next/navigation";
import type { JSX } from "react";

import { absolutePathForCamera } from "@/camera";
import { Icons } from "@/components/icons";
import { LightboxButton } from "@/components/images/LightboxButton";
import PhotoShareButton from "@/components/images/PhotoShareButton";
import { absolutePathForFilm, labelForFilm } from "@/film";
import PhotoFilmIcon from "@/film/PhotoFilmIcon";
import type { Photo } from "@/photo";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date";
import { formatExposureTime } from "@/utils/format-exif";
import { getShortenLocation } from "@/utils/string";

export default function PhotoContentSide({
	photo,
	className,
}: {
	photo: Photo & { gpsAltitude?: number | null };
	className?: string;
}) {
	const router = useRouter();
	const renderMiniGrid = (children: JSX.Element) => (
		<div
			className={cn(
				"flex gap-y-4",
				"flex-col sm:flex-row lg:flex-col",
				"[&>*]:sm:flex-grow",
				"pr-2",
			)}
		>
			{children}
		</div>
	);

	const lightboxImage = {
		src: photo.url,
		alt: photo.title || photo.id,
		aspectRatio: photo.aspectRatio,
		blurData: photo.blurData,
	};

	return (
		<div
			className={cn(
				"text-sm",
				"grid grid-cols-2 lg:grid-cols-1",
				"gap-y-4",
				className,
			)}
			style={{ fontFamily: "'DM Mono', monospace" }}
		>
			{renderMiniGrid(
				<>
					<button
						type="button"
						className="cursor-pointer text-left transition-colors hover:text-[#5f5747]"
						onClick={() => router.push(`/p/${photo.id}`)}
					>
						<h2
							className="italic text-2xl text-[#18170f] font-normal leading-tight"
							style={{ fontFamily: "'Cormorant', serif" }}
						>
							{photo.title}
						</h2>
					</button>
					<button
						type="button"
						className="group/camera flex w-fit cursor-pointer items-center rounded-sm border border-transparent px-1 py-0.5 -ml-1 transition-colors hover:border-[#d8cbb3] hover:bg-[#faf6ef] hover:text-[#18170f]"
						onClick={() =>
							router.push(absolutePathForCamera(photo.make, photo.model))
						}
					>
						<Icons.camera className="h-4 w-4 transition-transform group-hover/camera:-rotate-6" />
						<div className="uppercase font-medium pl-1 underline-offset-4 group-hover/camera:underline">
							{photo.make} {photo.model}
						</div>
					</button>
				</>,
			)}
			{renderMiniGrid(
				<>
					<ul className={cn("text-gray-500", "dark:text-gray-400")}>
						<li>
							{photo.focalLength ? `${photo.focalLength}mm` : "-"}{" "}
							<span className={cn("text-gray-400/80", "dark:text-gray-400/50")}>
								{photo.focalLength35mm ? `${photo.focalLength35mm}mm` : "-"}
							</span>
						</li>
						<li>{photo.fStop ? `ƒ/${photo.fStop}` : "-"}</li>
						<li>ISO {photo.iso}</li>
						<li>{formatExposureTime(photo.exposureTime || 0)}</li>
						{photo.locationName && photo.locationName !== "unknown" ? (
							<li className="hidden lg:block">
								{getShortenLocation(photo.locationName)}
							</li>
						) : null}
						{photo.gpsAltitude ? (
							<li className="hidden lg:block">{`${photo.gpsAltitude}m`}</li>
						) : null}
					</ul>
					{photo.filmSimulation && (
						<button
							type="button"
							className="group/film -ml-1 flex w-fit cursor-pointer items-center gap-1 rounded-sm border border-transparent px-1 py-0.5 text-xs text-gray-500 uppercase tracking-wide transition-colors hover:border-[#d8cbb3] hover:bg-[#faf6ef] hover:text-[#18170f] dark:text-gray-400 dark:hover:text-gray-200"
							onClick={() =>
								router.push(absolutePathForFilm(photo.filmSimulation))
							}
						>
							<span className="underline-offset-4 group-hover/film:underline">
								{labelForFilm(photo.filmSimulation)}
							</span>
							<PhotoFilmIcon film={photo.filmSimulation} height={14} />
						</button>
					)}
					<div
						className={cn(
							"flex gap-y-4",
							"flex-col sm:flex-row lg:flex-col",
						)}
					>
						<div
							className={cn(
								"grow uppercase",
								"text-gray-500",
								"dark:text-gray-400",
							)}
						>
							{formatDate(photo.takenAt)}
						</div>
					</div>
				</>,
			)}
			<div className="flex items-center gap-2.5">
				<LightboxButton image={lightboxImage} />
				<PhotoShareButton photo={photo} />
			</div>
		</div>
	);
}
