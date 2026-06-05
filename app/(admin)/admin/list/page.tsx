'use client'

import { useEffect, useState } from 'react';

import type { Photo } from '@/photo';
import { fetchAllPhotos } from '@/photo/actions';
import PhotoTabs from '@/admin/components/PhotoTabs';
import Mapbox from '@/components/map';
import { MapProvider } from 'react-map-gl/mapbox';

export default function AdminPhotoListPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    fetchAllPhotos()
      .then(setPhotos)
      .finally(() => setIsPending(false));
  }, []);

  return (
    <MapProvider>
      <div className="flex h-[calc(100vh-60px)] overflow-hidden">
        {/* Left content — scrolls independently */}
        <div className="w-full overflow-y-auto lg:w-7/12">
          <PhotoTabs photos={photos} isPending={isPending} />
        </div>

        {/* Right Content — stays fixed */}
        <div className="hidden h-full w-full bg-muted lg:block lg:w-5/12">
          <Mapbox photos={photos} />
        </div>
      </div>
    </MapProvider>
  );
}
