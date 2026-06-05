'use client';

import type { Photo } from '@/photo';
import { Icons } from '@/components/icons';

import PhotoOtherCard from './PhotoCard/Card35mm';
import PhotoCard from './PhotoCard/CardNormal';
import SortBar from './Sort';

// TODO: define Photo35mm type when 35mm feature is developed
export type { Photo };
export type Photo35mm = Record<string, unknown> & { id: string };

interface Props {
  type: string;
  photos?: Photo[];
  isPending?: boolean;
}

const PhotoList = ({ type, photos = [], isPending = false }: Props) => {

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
        {/* {photos.map((item) => (
          <PhotoOtherCard key={item.id} photo={item as Photo35mm} />
        ))} */}
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center py-5 border-t border-b border-[#e5e0d9] px-6">
        <h1 className="hidden text-sm font-light tracking-wide text-muted-foreground subpixel-antialiased md:block">
          Showing <span className="text-black">{photos.length}</span> Photos Listing
        </h1>

        {/* <SortBar /> */}
      </div>

      {/* Grid  */}
      <div className="px-6">
        {isPending ? (
        <div className="flex w-full items-center justify-center">
          <Icons.loader className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {type === 'digital' ? renderPhotos() : renderOtherPhotos()}
        </div>
      )}
      </div>
      
    </div>
  );
};

export default PhotoList;
