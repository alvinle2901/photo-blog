'use client';

import { Icons } from '@/components/icons';
import { useGetPhotos } from '@/features/photos/api/use-get-photos';

import PhotoCard from './photo-card';
import SortBar from './sort';

const PhotoList = () => {
  const photosQuery = useGetPhotos();

  const photos = photosQuery.data || [];

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
          {photos.map((item) => (
            <PhotoCard key={item.id} photo={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoList;
