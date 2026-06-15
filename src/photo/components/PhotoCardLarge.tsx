"use client";

import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { absolutePathForCamera } from "@/camera";
import { Icons } from "@/components/icons";
import ImageLarge from "@/components/images/ImageLarge";
import PhotoShareButton from "@/components/images/PhotoShareButton";
import SiteGrid from "@/components/ui/SiteGrid";
import { absolutePathForFilm, labelForFilm } from "@/film";
import PhotoFilmIcon from "@/film/PhotoFilmIcon";
import type { Photo } from "@/photo";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date";
import { formatExposureTime } from "@/utils/format-exif";
import { getShortenLocation } from "@/utils/string";
import PhotoCard from "./Photo";

const PhotoCardLarge = ({
	photo,
	priority,
}: {
	photo: Photo & { gpsAltitude?: number | null };
	priority?: boolean;
}) => {
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

	return (
		<SiteGrid
			// className="border-b border-[#e5e0d9]"
			contentMain={
				<div className="overflow-hidden py-1">
					<PhotoCard
						photo={photo}
						onClick={() => router.push(`/p/${photo.id}`)}
						onFavourite={() => {}}
					/>
				</div>
			}
			contentSide={
				<div
					className={cn(
						"text-sm h-full",
						"grid grid-cols-2 lg:grid-cols-1 content-start",
						"gap-y-4",
						"p-4",
						"border-b border-l border-[#e5e0d9]",
					)}
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					{renderMiniGrid(
						<>
							{/* TITLE  */}
							<button
								type="button"
								className="text-left"
								onClick={() => router.push(`/p/${photo.id}`)}
							>
								<h2
									className="italic text-2xl text-[#18170f] font-normal leading-tight"
									style={{ fontFamily: "'Cormorant', serif" }}
								>
									{photo.title}
								</h2>
							</button>
							{/* CAMERA  */}
							<button
								type="button"
								className="flex items-center"
								onClick={() =>
									router.push(absolutePathForCamera(photo.make, photo.model))
								}
							>
								<Icons.camera className="h-4 w-4" />
								<div className="uppercase font-medium pl-1">
									{photo.make} {photo.model}
								</div>
							</button>
						</>,
					)}
					{renderMiniGrid(
						<>
							<ul className={cn("text-gray-500", "dark:text-gray-400")}>
								<li>
									{photo.focalLength ? photo.focalLength + "mm" : "-"}{" "}
									<span
										className={cn("text-gray-400/80", "dark:text-gray-400/50")}
									>
										{photo.focalLength35mm ? photo.focalLength35mm + "mm" : "-"}
									</span>
								</li>
								<li>{photo.fStop ? "ƒ/" + photo.fStop : "-"}</li>
								<li>ISO {photo.iso}</li>
								<li>{formatExposureTime(photo.exposureTime || 0)}</li>
								{photo.locationName && photo.locationName !== "unknown" ? (
									<li className="hidden lg:block">
										{getShortenLocation(photo.locationName)}
									</li>
								) : null}
								{photo.gpsAltitude ? (
									<li className="hidden lg:block">{photo.gpsAltitude + "m"}</li>
								) : null}
							</ul>
							{/* FILM SIMULATION */}
							{photo.filmSimulation && (
								<button
									type="button"
									className="flex w-fit items-center gap-1 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
									onClick={() =>
										router.push(absolutePathForFilm(photo.filmSimulation))
									}
								>
									<PhotoFilmIcon film={photo.filmSimulation} height={14} />
									<span>{labelForFilm(photo.filmSimulation)}</span>
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
					{/* Share button */}
					<PhotoShareButton />
				</div>
			}
		/>
	);
};

export default PhotoCardLarge;
