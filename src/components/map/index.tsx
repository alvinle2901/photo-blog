"use client";

import type { Projection } from "mapbox-gl";
import { useEffect, useState } from "react";
import Map, {
	Marker,
	NavigationControl,
	Popup,
	useMap,
} from "react-map-gl/mapbox";

import type { Photo } from "@/photo";

import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface Props {
	showLocal?: boolean;
	photos?: Photo[];
}

const Mapbox = ({ showLocal = true, photos = [] }: Props) => {
	const { map } = useMap();
	const [hoveredPhoto, setHoveredPhoto] = useState<Photo | null>(null);
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
		<Map
			id="map"
			mapboxAccessToken={TOKEN}
			initialViewState={{
				longitude: 28.97953,
				latitude: 41.015137,
				zoom: 2,
			}}
			style={{
				width: "100%",
				height: "100%",
			}}
			projection={mercator}
			mapStyle="mapbox://styles/mapbox/streets-v12"
		>
			<NavigationControl />
			{hoveredPhoto?.latitude != null && hoveredPhoto?.longitude != null && (
				<Popup
					className='p-0'
					longitude={hoveredPhoto.longitude}
					latitude={hoveredPhoto.latitude}
					anchor="bottom-left"
					closeButton={false}
					closeOnClick={false}
					offset={5}
				>
					<div className="w-50 overflow-hidden bg-white">
						<Image
							src={hoveredPhoto.url}
							alt={hoveredPhoto.title || "Photo thumbnail"}
							className="h-30 w-full object-cover"
							width={180}
							height={108}
						/>
						<p className="truncate text-xs pt-1 text-gray-700">
							{hoveredPhoto.title || hoveredPhoto.id}
						</p>
					</div>
				</Popup>
			)}
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
						<span
							className="relative flex h-3 w-3 cursor-pointer"
							onMouseEnter={() => setHoveredPhoto(photo)}
							onMouseLeave={() => setHoveredPhoto((prev) => (prev?.id === photo.id ? null : prev))}
						>
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
							<span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
						</span>
					</Marker>
				);
			})}
		</Map>
	);
};

export default Mapbox;
