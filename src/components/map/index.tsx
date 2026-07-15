"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import type { Projection } from "mapbox-gl";
import Image from "next/image";
import { useEffect, useState } from "react";
import ReactMap, {
	Marker,
	NavigationControl,
	useMap,
} from "react-map-gl/mapbox";

import { LightboxTrigger } from "@/components/images/LightboxTrigger";
import { useHoverSupport } from "@/hooks/use-hover-support";
import type { Photo } from "@/photo";
import SharedHover from "@/providers/shared-hover/SharedHover";
import { getOptimizedUrl } from "@/storage/utils";
import { cn } from "@/utils/cn";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface Props {
	showLocal?: boolean;
	photos?: Photo[];
}

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
}: {
	photo: Photo;
	supportsHover: boolean;
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
	const trigger = (
		<LightboxTrigger
			image={{
				src: photo.url,
				alt: photo.title || photo.id,
				aspectRatio: photo.aspectRatio,
				blurData: photo.blurData,
			}}
		>
			<span className={className} aria-label={photo.title || photo.id}>
				{thumbnail}
			</span>
		</LightboxTrigger>
	);

	return supportsHover ? (
		<MapPinHover photo={photo}>{trigger}</MapPinHover>
	) : (
		trigger
	);
}

const Mapbox = ({ showLocal = true, photos = [] }: Props) => {
	const { map } = useMap();
	const supportsHover = useHoverSupport();
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
							<MapPinThumbnail photo={photo} supportsHover={supportsHover} />
						</Marker>
					);
				})}
			</ReactMap>
		</>
	);
};

export default Mapbox;
