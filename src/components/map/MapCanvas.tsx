"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import type { Projection } from "mapbox-gl";
import { useEffect, useState } from "react";
import ReactMap, {
	Marker,
	NavigationControl,
	useMap,
} from "react-map-gl/mapbox";

import { useHoverSupport } from "@/hooks/use-hover-support";
import type { Photo } from "@/photo";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export interface MapCanvasProps {
	showLocal?: boolean;
	photos?: Photo[];
	renderPhotoMarker: (photo: Photo, supportsHover: boolean) => React.ReactNode;
}

export default function MapCanvas({
	showLocal = true,
	photos = [],
	renderPhotoMarker,
}: MapCanvasProps) {
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
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
						<span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
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
						{renderPhotoMarker(photo, supportsHover)}
					</Marker>
				);
			})}
		</ReactMap>
	);
}
