"use client";

import { useLayoutEffect, useState } from "react";
import { MapProvider } from "react-map-gl/mapbox";

import Mapbox from "@/components/map";
import type { Photo } from "@/photo";

type MapPageClientProps = {
	photos: Photo[];
};

const MapPageClient = ({ photos }: MapPageClientProps) => {
	const [mapKey, setMapKey] = useState(0);

	useLayoutEffect(() => {
		return () => {
			setMapKey((current) => current + 1);
		};
	}, []);

	return (
		<MapProvider key={mapKey}>
			<Mapbox showLocal={false} photos={photos} />
		</MapProvider>
	);
};

export default MapPageClient;
