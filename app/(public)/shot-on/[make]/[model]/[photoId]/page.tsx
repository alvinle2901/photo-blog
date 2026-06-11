import { Metadata } from 'next/types';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import PhotoDetailPage from '@/photo/components/PhotoDetailPage';
import { getPhotoCameraPageDataCached } from '@/camera/data';
import {
  absolutePathForPhoto,
  descriptionForPhoto,
  titleForPhoto,
} from '@/camera';

const getPhotosNearIdCachedCached = cache((
  photoId: string,
  make: string,
  model: string,
) =>
  getPhotoCameraPageDataCached(photoId, make, model));

interface PhotoCameraProps {
  params: Promise<{ photoId: string; make: string; model: string }>;
}

export async function generateMetadata({
  params,
}: PhotoCameraProps): Promise<Metadata> {
  const { photoId, make, model } = await params;

  const data = await getPhotosNearIdCachedCached(photoId, make, model);

  if (!data?.photo) { return {}; }

  const { photo } = data;

  const title = titleForPhoto(photo);
  const description = descriptionForPhoto(photo, false);
  const descriptionHtml = descriptionForPhoto(photo, true);
  const images = [photo.url];
  const url = absolutePathForPhoto(make, model, photo.id);

  return {
    title,
    description: descriptionHtml,
    openGraph: {
      title,
      images,
      description,
      url,
    },
    twitter: {
      title,
      description,
      images,
      card: 'summary_large_image',
    },
  };
}

export default async function PhotoCameraPage({
  params,
}: PhotoCameraProps) {
  const { photoId, make, model } = await params;

  const data = await getPhotosNearIdCachedCached(photoId, make, model);

  if (!data) { notFound(); }

  const { photo, prevPhoto, nextPhoto, nextPhotos } = data;

  return <PhotoDetailPage photo={photo} prevPhoto={prevPhoto} nextPhoto={nextPhoto} nextPhotos={nextPhotos} />;
}
