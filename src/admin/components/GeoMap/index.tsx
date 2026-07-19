"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import type { GeoJSONSourceSpecification, Projection } from "mapbox-gl";
import ReactMap, { Layer, Source } from "react-map-gl/mapbox";

import geoData from "./geo.json";

type GeoMapProps = {
	countries: string[];
};

type GeoFeature = {
	geometry?: unknown;
	properties?: {
		admin?: string;
		brk_name?: string;
		geounit?: string;
		name?: string;
		name_en?: string;
		name_long?: string;
		sovereignt?: string;
		[key: string]: unknown;
	};
	type?: "Feature";
	[key: string]: unknown;
};

type GeoFeatureCollection = {
	type: "FeatureCollection";
	features: GeoFeature[];
};

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const mercator: Projection = {
	name: "mercator",
};

const geojson = geoData as GeoFeatureCollection;
type GeoJSONSourceData = NonNullable<GeoJSONSourceSpecification["data"]>;

const COUNTRY_ALIASES: Record<string, string[]> = {
	"czech republic": ["czechia"],
	czechia: ["czech republic"],
	"united states": ["united states of america", "usa"],
	usa: ["united states", "united states of america"],
};

function normalizeCountryName(country: string) {
	return country.trim().toLowerCase();
}

function getCountrySearchTerms(countries: string[]) {
	const terms = new Set<string>();

	for (const country of countries) {
		const normalized = normalizeCountryName(country);
		if (!normalized) continue;

		terms.add(normalized);
		for (const alias of COUNTRY_ALIASES[normalized] ?? []) {
			terms.add(alias);
		}
	}

	return terms;
}

function getFeatureNames(feature: GeoFeature) {
	const properties = feature.properties;
	if (!properties) return [];

	return [
		properties.name,
		properties.name_en,
		properties.admin,
		properties.sovereignt,
		properties.geounit,
		properties.name_long,
		properties.brk_name,
	]
		.filter(Boolean)
		.map((name) => normalizeCountryName(String(name)));
}

function getCountryCoordinates(countries: string[]) {
	if (countries.length === 0) return null;

	const searchTerms = getCountrySearchTerms(countries);
	const features = geojson.features.filter((feature) =>
		getFeatureNames(feature).some((name) => searchTerms.has(name)),
	);

	return {
		type: "FeatureCollection",
		features,
	} as unknown as GeoJSONSourceData;
}

const layerStyle = {
	id: "country-fill",
	type: "fill",
	paint: {
		"fill-color": "#9a7656",
		"fill-opacity": 0.64,
	},
} as const;

const lineLayerStyle = {
	id: "country-outline",
	type: "line",
	paint: {
		"line-color": "#4d5c4f",
		"line-opacity": 0.72,
		"line-width": 1.1,
	},
} as const;

export default function GeoMap({ countries }: GeoMapProps) {
	const countryCoordinates = getCountryCoordinates(countries);

	return (
		<section className="relative h-full min-h-[450px] overflow-hidden rounded-sm border border-[#e5e0d9] bg-[#ebe7df] shadow-sm">
			<div
				className="pointer-events-none absolute left-3 top-3 z-10 rounded-full border border-[#d8d1c7] bg-[#f7f5f2] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#6f675d]"
				style={{ fontFamily: "'DM Mono', monospace" }}
			>
				geo map / {countries.length} countries
			</div>
			<ReactMap
				mapboxAccessToken={TOKEN}
				initialViewState={{
					longitude: 12,
					latitude: 28,
					zoom: 0.8,
				}}
				doubleClickZoom={false}
				scrollZoom
				dragPan
				boxZoom={false}
				style={{
					width: "100%",
					height: "100%",
				}}
				mapStyle="mapbox://styles/mapbox/light-v11"
				projection={mercator}
			>
				{countryCoordinates && (
					<Source
						id="visited-countries"
						type="geojson"
						data={countryCoordinates}
					>
						<Layer {...layerStyle} />
						<Layer {...lineLayerStyle} />
					</Source>
				)}
			</ReactMap>
		</section>
	);
}
