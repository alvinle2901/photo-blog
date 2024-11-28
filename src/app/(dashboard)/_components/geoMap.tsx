'use client';

import Map, { Layer, Source } from 'react-map-gl';
import type { FillLayer } from 'react-map-gl';

import type { Feature, FeatureCollection } from 'geojson';
import type { Projection } from 'mapbox-gl';

import { useGetSummary } from '@/features/summary/api/use-get-summary';

import geoData from '../../../../public/geo.json';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const mercator: Projection = {
  name: 'mercator',
};

const geojson: FeatureCollection = geoData as FeatureCollection;

const getCountryCoordinates = (countries: string[]) => {
  if (!countries || countries.length === 0) return null;

  const features: Feature[] = geojson.features.filter((feature) =>
    countries.some((country) => feature.properties?.name_en === country),
  );

  return {
    type: 'FeatureCollection',
    features,
  } as FeatureCollection;
};

const layerStyle: FillLayer = {
  id: 'country-fill',
  type: 'fill',
  paint: {
    'fill-color': '#0ea5e9',
    'fill-opacity': 0.5,
  },
};

const GeoMap = () => {
  const query = useGetSummary();

  const data = query.data?.countryArray ?? [];

  const countryCoordinates = getCountryCoordinates(data);

  return (
    <Map
      id="map"
      mapboxAccessToken={TOKEN}
      initialViewState={{
        zoom: 0,
      }}
      doubleClickZoom={false}
      scrollZoom={true}
      dragPan={true}
      boxZoom={false}
      style={{
        width: '100%',
        height: '100%',
      }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      projection={mercator}
    >
      {countryCoordinates && (
        <Source id="my-data" type="geojson" data={countryCoordinates}>
          <Layer {...layerStyle} />
        </Source>
      )}
    </Map>
  );
};

export default GeoMap;
