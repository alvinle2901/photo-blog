'use client';

import { InferResponseType } from 'hono';

import { Icons } from '@/components/icons';
import { useGetPhotos } from '@/features/photos/api/use-get-photos';
import { useGet35mmPhotos } from '@/features/photos-35mm/api/use-get-photos';
import { client } from '@/lib/hono';

import PhotoCard from './PhotoCard/CardNormal';
import PhotoOtherCard from './PhotoCard/Card35mm';
import SortBar from './Sort';

export type Photo = InferResponseType<typeof client.api.photos.$get, 200>['data'][0];
export type Photo35mm = InferResponseType<typeof client.api.photos_35mm.$get, 200>['data'][0];

const PhotoList = ({ type }: { type: string }) => {
  const photosQuery = type === 'digital' ? useGetPhotos() : useGet35mmPhotos();

  const photos = photosQuery.data || [];

  const renderPhotos = () => {
    return (
      <>
        {photos.map((item) => (
          <PhotoCard key={item.id} photo={item as Photo} />
        ))}
      </>
    );
  };

  const renderOtherPhotos = () => {
    return (
      <>
        {photos.map((item) => (
          <PhotoOtherCard key={item.id} photo={item as Photo35mm} />
        ))}
      </>
    );
  };

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex items-center">
        <h1 className="hidden text-sm font-light tracking-wide text-muted-foreground subpixel-antialiased md:block">
          Showing <span className="text-black">{photos.length}</span> Photos Listing
        </h1>

        <SortBar />
      </div>

      {/* Grid  */}
      {photosQuery.isPending ? (
        <div className="flex w-full items-center justify-center">
          <Icons.loader className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {type === 'digital' ? renderPhotos() : renderOtherPhotos()}
        </div>
      )}
    </div>
  );
};

export default PhotoList;
