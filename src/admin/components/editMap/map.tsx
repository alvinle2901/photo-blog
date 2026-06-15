"use client";

import type { MapLayerMouseEvent } from "mapbox-gl";
import { useEffect, useMemo, useRef } from "react";
import Map, {
	FullscreenControl,
	type MapRef,
	Marker,
	NavigationControl,
} from "react-map-gl/mapbox";
import { getReverseGeocoding } from "@/utils/map";
import "mapbox-gl/dist/mapbox-gl.css";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface Props {
	id: string;
	latitude?: number | null;
	longitude?: number | null;
	locationName?: string | null;
	onLocationSelect?: (location: {
		latitude: number;
		longitude: number;
		locationName?: string | null;
	}) => void;
}

const DEFAULT_VIEW = {
	longitude: 28.97953,
	latitude: 41.015137,
	zoom: 4,
};

const EditMap = ({ id, latitude, longitude, onLocationSelect }: Props) => {
	// const editMutation = useEditPhoto(id);
	const mapRef = useRef<MapRef | null>(null);

	const initialViewState = useMemo(
		() =>
			latitude != null && longitude != null
				? { latitude, longitude, zoom: 14 }
				: DEFAULT_VIEW,
		[latitude, longitude],
	);

	useEffect(() => {
		if (latitude == null || longitude == null) return;

		mapRef.current?.easeTo({
			center: [longitude, latitude],
			duration: 500,
			essential: true,
		});
	}, [latitude, longitude]);

	const handleSelectLocation = async (
		nextLatitude: number,
		nextLongitude: number,
	) => {
		const locationName = await getReverseGeocoding(nextLongitude, nextLatitude);
		onLocationSelect?.({
			latitude: nextLatitude,
			longitude: nextLongitude,
			locationName,
		});
	};

	const handleClick = async (event: MapLayerMouseEvent) => {
		await handleSelectLocation(event.lngLat.lat, event.lngLat.lng);
	};

	return (
		<Map
			ref={mapRef}
			id={id}
			mapboxAccessToken={TOKEN}
			style={{ width: "100%", height: "100%" }}
			initialViewState={initialViewState}
			mapStyle="mapbox://styles/mapbox/streets-v12"
			onClick={handleClick}
		>
			<NavigationControl />
			<FullscreenControl />
			{latitude != null && longitude != null && (
				<Marker longitude={longitude} latitude={latitude} anchor="bottom">
					<span className="relative flex h-3 w-3">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
						<span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
					</span>
				</Marker>
			)}
		</Map>
	);
};

export default EditMap;
