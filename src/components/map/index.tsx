"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import type { Projection } from "mapbox-gl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMap, {
	Marker,
	NavigationControl,
	useMap,
} from "react-map-gl/mapbox";

import { useHoverSupport } from "@/hooks/use-hover-support";
import type { Photo } from "@/photo";
import SharedHover from "@/providers/shared-hover/SharedHover";
import { getOptimizedUrl } from "@/storage/utils";
import { cn } from "@/utils/cn";

import { Dialog, DialogContent, DialogTitle } from "../ui/Dialog";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface Props {
	showLocal?: boolean;
	photos?: Photo[];
}

const PIN_HOVER_WIDTH_LANDSCAPE = 400;
const PIN_HOVER_WIDTH_PORTRAIT = 280;
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

function MapPinHover({
	photo,
	children,
}: {
	photo: Photo;
	children: React.ReactNode;
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

function MapPinThumbnail({
	photo,
	supportsHover,
	onPreview,
}: {
	photo: Photo;
	supportsHover: boolean;
	onPreview: (photo: Photo) => void;
}) {
	const className = cn(
		"group relative block h-12 w-12 overflow-hidden rounded-[4px] border-2 border-white bg-[#ebe7df] shadow-md shadow-black/25",
		"transition-transform hover:scale-105 active:scale-95",
	);
	const thumbnail = (
		<>
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
		</>
	);
	const trigger = supportsHover ? (
		<Link
			href={`/p/${photo.id}`}
			aria-label={photo.title || photo.id}
			className={className}
		>
			{thumbnail}
		</Link>
	) : (
		<button
			type="button"
			aria-label={photo.title || photo.id}
			className={className}
			onClick={() => onPreview(photo)}
		>
			{thumbnail}
		</button>
	);

	return supportsHover ? (
		<MapPinHover photo={photo}>{trigger}</MapPinHover>
	) : (
		trigger
	);
}

function MapPinPreviewDialog({
	photo,
	onClose,
}: {
	photo?: Photo;
	onClose: () => void;
}) {
	const isOpen = Boolean(photo);
	const previewWidth = photo && photo.aspectRatio < 1 ? 360 : 640;
	const previewHeight =
		photo && previewWidth ? Math.round(previewWidth / photo.aspectRatio) : 420;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="w-[calc(100vw-1rem)] max-w-[min(680px,calc(100vw-1rem))] rounded-lg border-[#d8d0c5] bg-[#f7f5f2] p-3 shadow-xl sm:p-4">
				{photo ? (
					<div className="space-y-3">
						<DialogTitle
							className="pr-8 italic text-2xl font-normal leading-tight text-[#18170f]"
							style={{ fontFamily: "'Cormorant', serif" }}
						>
							{photo.title || "photo"}
						</DialogTitle>
						<div className="flex justify-center overflow-hidden rounded-md bg-[#ebe7df]">
							<Image
								src={getOptimizedUrl(photo.url, "lg")}
								alt={photo.title || "Map pin preview"}
								width={previewWidth}
								height={previewHeight}
								className="max-h-[70dvh] w-auto object-contain"
								placeholder={photo.blurData ? "blur" : "empty"}
								blurDataURL={photo.blurData || undefined}
							/>
						</div>
						<Link
							href={`/p/${photo.id}`}
							className="block rounded-md border border-[#ddd5ca] bg-[#fbfaf7] px-3 py-2 text-center text-sm text-[#3b352e] active:bg-[#efe8dd]"
						>
							view photo
						</Link>
					</div>
				) : null}
			</DialogContent>
		</Dialog>
	);
}

const Mapbox = ({ showLocal = true, photos = [] }: Props) => {
	const { map } = useMap();
	const supportsHover = useHoverSupport();
	const [previewPhoto, setPreviewPhoto] = useState<Photo>();
	const [coords, setCoords] = useState<{
		latitude: number | null;
		longitude: number | null;
	}>({ latitude: null, longitude: null });

	const mercator: Projection = {
		name: "mercator",
	};

	useEffect(() => {
		if (!showLocal) return;
		if (!navigator.geolocation) {
			console.log("Geolocation is not supported by your browser");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				map?.flyTo({
					center: [position.coords.longitude, position.coords.latitude],
					zoom: 17,
				});

				setCoords({
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				});
			},
			(error) => {
				console.error("Error getting geolocation:", error);
			},
		);
	}, [map, showLocal]);

	return (
		<>
			<ReactMap
				id="map"
				mapboxAccessToken={TOKEN}
				initialViewState={{
					longitude: 28.97953,
					latitude: 41.015137,
					zoom: 3,
				}}
				style={{
					width: "100%",
					height: "100%",
				}}
				projection={mercator}
				mapStyle="mapbox://styles/mapbox/streets-v12"
			>
				<NavigationControl />
				{coords.latitude && coords.longitude && (
					<Marker
						longitude={coords.longitude}
						latitude={coords.latitude}
						anchor="bottom"
					>
						<span className="relative flex h-3 w-3">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
							<span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
						</span>
					</Marker>
				)}
				{photos.map((photo) => {
					if (photo.latitude == null || photo.longitude == null) return null;

					return (
						<Marker
							key={photo.id}
							longitude={photo.longitude}
							latitude={photo.latitude}
							anchor="bottom"
						>
							<MapPinThumbnail
								photo={photo}
								supportsHover={supportsHover}
								onPreview={setPreviewPhoto}
							/>
						</Marker>
					);
				})}
			</ReactMap>
			<MapPinPreviewDialog
				photo={previewPhoto}
				onClose={() => setPreviewPhoto(undefined)}
			/>
		</>
	);
};

export default Mapbox;
