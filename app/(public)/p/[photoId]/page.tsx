import { notFound } from 'next/navigation';

import PhotoDetailPage from '@/photo/components/PhotoDetailPage';
import { getPhotoPageDataCached } from '@/photo/cache';

type PhotoPageProps = {
  params: Promise<{ photoId: string }>;
};

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { photoId } = await params;
  const data = await getPhotoPageDataCached(photoId);

  if (!data) {
    notFound();
  }

  return <PhotoDetailPage {...data} />;
}
