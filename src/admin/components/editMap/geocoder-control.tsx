import * as React from 'react';
import { useEffect, useRef } from 'react';

import MapboxGeocoder, { GeocoderOptions } from '@mapbox/mapbox-gl-geocoder';

import styles from './geocoder-control.module.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

type GeocoderResultEvent = {
  result?: {
    center?: number[];
    geometry?: {
      type?: string;
      coordinates?: number[];
    };
    place_name?: string;
  };
};

type GeocoderControlProps = Omit<GeocoderOptions, 'accessToken' | 'mapboxgl' | 'marker'> & {
  mapboxAccessToken: string;
  onLoading?: (e: object) => void;
  onResults?: (e: object) => void;
  onResult?: (e: GeocoderResultEvent) => void;
  onError?: (e: object) => void;
};

const noop = () => {};

export default function GeocoderControl(props: GeocoderControlProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const callbacksRef = useRef({
    onLoading: props.onLoading || noop,
    onResults: props.onResults || noop,
    onResult: props.onResult || noop,
    onError: props.onError || noop,
  });

  useEffect(() => {
    callbacksRef.current = {
      onLoading: props.onLoading || noop,
      onResults: props.onResults || noop,
      onResult: props.onResult || noop,
      onError: props.onError || noop,
    };
  }, [props.onError, props.onLoading, props.onResult, props.onResults]);

  useEffect(() => {
    if (!containerRef.current) return;

    const geocoder = new MapboxGeocoder({
      collapsed: false,
      clearAndBlurOnEsc: true,
      countries: props.countries,
      flyTo: false,
      language: props.language,
      limit: props.limit ?? 6,
      marker: false,
      minLength: props.minLength ?? 2,
      proximity: props.proximity,
      placeholder: props.placeholder ?? 'Search for a city, address, or landmark',
      trackProximity: props.trackProximity,
      types: props.types,
      accessToken: props.mapboxAccessToken,
    });

    geocoder.on('loading', (evt) => callbacksRef.current.onLoading(evt));
    geocoder.on('results', (evt) => callbacksRef.current.onResults(evt));
    geocoder.on('result', (evt) => {
      callbacksRef.current.onResult(evt);
    });
    geocoder.on('error', (evt) => callbacksRef.current.onError(evt));
    geocoder.addTo(containerRef.current);

    return () => {
      geocoder.onRemove();
    };
  }, [
    props.countries,
    props.language,
    props.limit,
    props.mapboxAccessToken,
    props.minLength,
    props.placeholder,
    props.proximity,
    props.trackProximity,
    props.types,
  ]);

  return <div ref={containerRef} className={styles.geocoder} />;
}

GeocoderControl.defaultProps = {
  onLoading: noop,
  onResults: noop,
  onResult: noop,
  onError: noop,
};
