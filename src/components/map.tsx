'use client';

import { useEffect, useState } from 'react';
import Map, { Marker, NavigationControl, useMap } from 'react-map-gl';

import { useGetPhotos } from '@/features/photos/api/use-get-photos';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface Props {
  showLocal?: boolean;
}

const Mapbox = ({ showLocal = true }: Props) => {
  const { map } = useMap();
  const [coords, setCoords] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({ latitude: null, longitude: null });

  const photosQuery = useGetPhotos();

  const photos = photosQuery.data || [];

  useEffect(() => {
    if (!showLocal) return;
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by your browser');
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
        console.error('Error getting geolocation:', error);
      },
    );
  }, [map, showLocal]);

  return (
    <Map
      id="map"
      mapboxAccessToken={TOKEN}
      style={{
        width: '100%',
        height: '100%',
      }}
      mapStyle="mapbox://styles/alvinle29/cm3ou99fu007y01qw10b1dnv7"
    >
      <NavigationControl />
      {coords.latitude && coords.longitude && (
        <Marker longitude={coords.longitude} latitude={coords.latitude} anchor="bottom">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
          </span>
        </Marker>
      )}
      {photos.map((photo) => {
        if (!photo.latitude || !photo.longitude) return null;
        return (
          <Marker
            key={photo.id}
            longitude={photo.longitude}
            latitude={photo.latitude}
            anchor="bottom"
          >
            <span className="relative flex h-3 w-3">
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
