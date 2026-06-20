'use client';

import { Gallery } from 'react-grid-gallery';
import { ColumnsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/columns.css';
import { useMediaQuery } from 'react-responsive';

import { useRouter } from 'next/navigation';

import { Icons } from '@/components/icons';
import renderNextImage from '@/components/images/render-next-image';

import { useGet35mmPhotos } from '@/features/photos-35mm/api/use-get-photos';

import { use35mmPhotos } from '@/hooks/use-35mm-photos';

const Gallery35mm = () => {
  // Gallery for 35mm images
  const router = useRouter();
  const photosQuery = useGet35mmPhotos();
  const isDesktopOrTablet = useMediaQuery({ query: '(min-width: 768px)' });

  const setPhotos35mm = use35mmPhotos((state) => state.setPhotos35mm);

  const photos =
    photosQuery.data?.map((photo) => ({
      id: photo.id,
      src: photo.url,
      width: photo.width,
      height: photo.height,
    })) ?? [];

  // Save 35mm photos to persist storage
  const photosToSaved =
    photosQuery.data?.map((photo) => ({
      id: photo.id,
      url: photo.url,
      width: photo.width,
      height: photo.height,
      title: photo.title,
      description: photo.description,
      film: photo.film,
      createAt: photo.createAt,
    })) ?? [];
  setPhotos35mm(photosToSaved);

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
        onClick={(index, image, e) => {
          router.push(`/35mm/${image.id}`);
        }}
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
        onClick={({ photo }) => {
          router.push(`/35mm/${photo.id}`);
        }}
      />
    );
  };

  return photosQuery.isPending ? (
    <div className="w-full flex items-center justify-center">
      <Icons.loader className="animate-spin" />
    </div>
  ) : (
    renderGallery()
  );
};

export default Gallery35mm;
