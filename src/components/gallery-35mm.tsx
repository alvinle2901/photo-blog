'use client';

import { Gallery } from 'react-grid-gallery';
import { ColumnsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/columns.css';
import { useMediaQuery } from 'react-responsive';

import { useGet35mmPhotos } from '@/features/photos_35mm/api/use-get-photos';

import { Icons } from './icons';
import renderNextImage from './render-next-image';

const Gallery35mm = () => {
  const photosQuery = useGet35mmPhotos();
  const isDesktopOrTablet = useMediaQuery({ query: '(min-width: 768px)' });

  const photos =
    photosQuery.data?.map((photo) => ({
      id: photo.id,
      src: photo.url,
      width: photo.width,
      height: photo.height,
    })) ?? [];

  const renderGallery = () => {
    if (photosQuery.isPending) {
      return (
        <div className="w-full flex items-center justify-center">
          <Icons.loader className="animate-spin" />
        </div>
      );
    }

    return isDesktopOrTablet ? (
      <Gallery
        images={photos}
        margin={3}
        enableImageSelection={false}
        rowHeight={390}
      />
    ) : (
      <ColumnsPhotoAlbum
        photos={photos}
        render={{ image: renderNextImage }}
        defaultContainerWidth={1200}
        spacing={6}
        columns={1}
        sizes={{
          size: '1168px',
          sizes: [{ viewport: '(max-width: 1200px)', size: 'calc(100vw - 32px)' }],
        }}
      />
    );
  };

  return renderGallery();
};

export default Gallery35mm;
