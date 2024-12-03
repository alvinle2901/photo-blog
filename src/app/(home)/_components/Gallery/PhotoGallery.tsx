'use client';

// Grid photos gallery
import { MasonryPhotoAlbum, RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/masonry.css';
import 'react-photo-album/rows.css';
import { useMediaQuery } from 'react-responsive';

import { Icons } from '@/components/icons';
import renderNextImage from '@/components/images/render-next-image';

import { useGetPhotos } from '@/features/photos/api/use-get-photos';

const PhotoGallery = () => {
  const photosQuery = useGetPhotos();
  const isDesktopOrTablet = useMediaQuery({ query: '(min-width: 768px)' });

  const photos =
    photosQuery.data?.map((photo) => ({
      id: photo.id,
      src: photo.url,
      width: photo.width,
      height: photo.height,
      alt: photo.description,
      blurDataURL: photo.blurData,
    })) ?? [];

  return photosQuery.isPending ? (
    <div className="w-full flex items-center justify-center">
      <Icons.loader className="animate-spin" />
    </div>
  ) : (
    <RowsPhotoAlbum
      photos={photos}
      render={{ image: renderNextImage }}
      defaultContainerWidth={1200}
      spacing={6}
      sizes={{
        size: '1168px',
        sizes: [{ viewport: '(max-width: 1200px)', size: 'calc(100vw - 32px)' }],
      }}
      rowConstraints={{ maxPhotos: isDesktopOrTablet ? 6 : 2 }}
    />
  );
};

export default PhotoGallery;
