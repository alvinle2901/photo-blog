import { Metadata } from 'next/types';
import { cache } from 'react';
import { redirect } from 'next/navigation';

import YearOverview from '@/year/YearOverview';
import { getPhotosYearDataCached } from '@/year/data';
import { YEAR_GRID_INITIAL, generateMetaForYear } from '@/year';
import { getUniqueYearsCached } from '@/photo/cache';

const getPhotosYearDataCachedCached = cache((year: string) =>
  getPhotosYearDataCached({ year, limit: YEAR_GRID_INITIAL }));

export async function generateStaticParams() {
  const years = await getUniqueYearsCached();
  return years.map(({ year }) => ({ year }));
}

interface YearProps {
  params: Promise<{ year: string }>
}

export async function generateMetadata({
  params,
}: YearProps): Promise<Metadata> {
  const { year } = await params;

  const [
    photos,
    { count },
  ] = await getPhotosYearDataCachedCached(year);

  if (photos.length === 0) { return {}; }

  const {
    url,
    title,
    description,
    images,
  } = generateMetaForYear(year, photos, count);

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

export default async function YearPage({
  params,
}: YearProps) {
  const { year } = await params;

  const [
    photos,
    { count },
  ] = await getPhotosYearDataCachedCached(year);

  if (photos.length === 0) { redirect('/'); }

  return (
    <YearOverview {...{
      year,
      photos,
      count,
    }} />
  );
}