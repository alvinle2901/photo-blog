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

import type { Photo } from "@/photo";
import SharedHover from "@/providers/shared-hover/SharedHover";
import { getOptimizedUrl } from "@/storage/utils";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface Props {
	showLocal?: boolean;
	photos?: Photo[];
}

const PIN_HOVER_WIDTH_LANDSCAPE = 390;
const PIN_HOVER_WIDTH_PORTRAIT = 270;
const PIN_HOVER_WIDTH_SQUARE = 250;

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

const Mapbox = ({ showLocal = true, photos = [] }: Props) => {
	const { map } = useMap();
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
				const hoverDimensions = dimensionsForPinHover(photo);

				return (
					<Marker
						key={photo.id}
						longitude={photo.longitude}
						latitude={photo.latitude}
						anchor="bottom"
					>
						<SharedHover
							hoverKey={`map-pin-${photo.id}`}
							width={hoverDimensions.width}
							height={hoverDimensions.height}
							offsetAbove={-4}
							offsetBelow={2}
							content={<MapPinHoverContent photo={photo} />}
						>
							<button
								type="button"
								aria-label={photo.title || photo.id}
								className="relative flex h-3 w-3 cursor-pointer border-0 bg-transparent p-0"
							>
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
								<span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
							</button>
						</SharedHover>
					</Marker>
				);
			})}
		</ReactMap>
	);
};

export default Mapbox;
