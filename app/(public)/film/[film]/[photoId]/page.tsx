import {
  absolutePathForPhoto,
  descriptionForPhoto,
  titleForPhoto,
} from '@/film';
import { Metadata } from 'next/types';
import { notFound } from 'next/navigation';
import FilmPhotoDetailPage from '@/film/FilmPhotoDetailPage';
import { getPhotoFilmPageDataCached } from '@/film/data';
import { cache } from 'react';

const getPhotosNearIdCachedCached = cache((
  photoId: string,
  film: string,
) =>
  getPhotoFilmPageDataCached(photoId, film));

interface PhotoFilmProps {
  params: Promise<{ photoId: string, film: string }>
}

export async function generateMetadata({
  params,
}: PhotoFilmProps): Promise<Metadata> {
  const { photoId, film } = await params;

  const data = await getPhotosNearIdCachedCached(photoId, film);

  if (!data?.photo) { return {}; }

  const { photo } = data;

  const title = titleForPhoto(photo);
  const description = descriptionForPhoto(photo, false);
  const descriptionHtml = descriptionForPhoto(photo, true);
  const images = [photo.url];
  const url = absolutePathForPhoto(film, photo.id);

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

export default async function PhotoFilmPage({
  params,
}: PhotoFilmProps) {
  const { photoId, film } = await params;

  const data = await getPhotosNearIdCachedCached(photoId, film);

  if (!data) { notFound(); }

  const { photo, prevPhoto, nextPhoto, nextPhotos } = data;

  return (
    <FilmPhotoDetailPage {...{
      film,
      photo,
      prevPhoto,
      nextPhoto,
      nextPhotos,
    }} />
  );
}
