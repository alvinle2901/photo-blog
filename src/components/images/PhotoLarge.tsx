import Link from "next/link";
import type { JSX } from "react";

import { absolutePathForCamera } from "@/camera";
import { Icons } from "@/components/icons";
import ImageLarge from "@/components/images/ImageLarge";
import { LightboxButton } from "@/components/images/ImageLightbox";
import PhotoShareButton from "@/components/images/PhotoShareButton";
import SiteGrid from "@/components/ui/SiteGrid";
import { absolutePathForFilm, labelForFilm } from "@/film";
import PhotoFilmIcon from "@/film/PhotoFilmIcon";
import type { Photo } from "@/photo";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date";
import { formatExposureTime } from "@/utils/format-exif";
import { getShortenLocation } from "@/utils/string";

const PhotoLarge = ({
	photo,
	priority,
}: {
	photo: Photo & { gpsAltitude?: number | null };
	priority?: boolean;
}) => {
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
			<SiteGrid
				className="border-b border-[#e5e0d9]"
				contentMain={
					<Link href={`/p/${photo.id}`} className="block active:brightness-75">
						<ImageLarge
							className="w-full max-h-[90vh] object-contain"
							alt={photo.title}
							src={photo.url}
							aspectRatio={photo.aspectRatio}
							priority={priority}
							id={photo.id}
							blurData={photo.blurData}
						/>
					</Link>
				}
				contentSide={
					<div
						className={cn(
							"sticky top-4 self-start text-sm",
							"grid grid-cols-2 lg:grid-cols-1",
							"gap-y-4",
							"-translate-y-1",
							"my-4",
						)}
						style={{ fontFamily: "'DM Mono', monospace" }}
					>
						{renderMiniGrid(
							<>
								{/* TITLE  */}
								<Link href={`/p/${photo.id}`}>
									<h2
										className="italic text-2xl text-[#18170f] font-normal leading-tight"
										style={{ fontFamily: "'Cormorant', serif" }}
									>
										{photo.title}
									</h2>
								</Link>
								{/* CAMERA  */}
								<Link
									href={absolutePathForCamera(photo.make, photo.model)}
									className="flex items-center"
								>
									<Icons.camera className="h-4 w-4" />
									<div className="uppercase font-medium pl-1">
										{photo.make} {photo.model}
									</div>
								</Link>
							</>,
						)}
						{renderMiniGrid(
							<>
								<ul className={cn("text-gray-500", "dark:text-gray-400")}>
									<li>
										{photo.focalLength ? `${photo.focalLength}mm` : "-"}{" "}
										<span
											className={cn(
												"text-gray-400/80",
												"dark:text-gray-400/50",
											)}
										>
											{photo.focalLength35mm
												? `${photo.focalLength35mm}mm`
												: "-"}
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
								{/* FILM SIMULATION */}
								{photo.filmSimulation && (
									<Link
										href={absolutePathForFilm(photo.filmSimulation)}
										className="flex w-fit items-center gap-1 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
									>
										<PhotoFilmIcon film={photo.filmSimulation} height={14} />
										<span>{labelForFilm(photo.filmSimulation)}</span>
									</Link>
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
						<div className="flex items-center gap-1">
							<LightboxButton image={lightboxImage} />
							<PhotoShareButton photo={photo} />
						</div>
					</div>
				}
			/>
	);
};

export default PhotoLarge;
