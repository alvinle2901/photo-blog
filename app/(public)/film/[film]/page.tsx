import { FILM_GRID_INITIAL, generateMetaForFilm } from '@/film';
import FilmOverview from '@/film/FilmOverview';
import { getPhotosFilmDataCached } from '@/film/data';
import { Metadata } from 'next/types';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getUniqueFilmsCached } from '@/photo/cache';

const getPhotosFilmDataCachedCached = cache((film: string) =>
  getPhotosFilmDataCached({ film, limit: FILM_GRID_INITIAL }));

export async function generateStaticParams() {
  const films = await getUniqueFilmsCached();
  return films.map(({ film }) => ({ film }));
}

interface FilmProps {
  params: Promise<{ film: string }>
}

export async function generateMetadata({
  params,
}: FilmProps): Promise<Metadata> {
  const { film } = await params;

  const [
    photos,
    { count },
  ] = await getPhotosFilmDataCachedCached(film);

  if (photos.length === 0) { return {}; }

  const {
    url,
    title,
    description,
    images,
  } = generateMetaForFilm(film, photos, count);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      url,
    },
    twitter: {
      title,
      images,
      description,
      card: 'summary_large_image',
    },
  };
}

export default async function FilmPage({
  params,
}: FilmProps) {
  const { film } = await params;

  const [
    photos,
    { count },
  ] = await getPhotosFilmDataCachedCached(film);

  if (photos.length === 0) { redirect('/'); }

  return (
    <FilmOverview {...{
      film,
      photos,
      count,
    }} />
  );
}
