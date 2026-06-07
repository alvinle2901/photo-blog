import { notFound } from 'next/navigation';
import PhotoGridPage from '@/photo/components/PhotoGridPage';
import { getPhotos } from '@/photo/query';
import type { Photo } from '@/photo';

type SortType = 'createdAt' | 'takenAt' | 'title';
type SortOrder = 'asc' | 'desc';

const VALID_SORT_TYPES: SortType[] = ['createdAt', 'takenAt', 'title'];
const VALID_SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

function sortPhotos(photos: Photo[], sortType: SortType, sortOrder: SortOrder): Photo[] {
  const sorted = [...photos];

  sorted.sort((a, b) => {
    let aValue: string | number | Date | null = null;
    let bValue: string | number | Date | null = null;

    if (sortType === 'createdAt') {
      aValue = a.createdAt;
      bValue = b.createdAt;
    }

    if (sortType === 'takenAt') {
      aValue = a.takenAt;
      bValue = b.takenAt;
    }

    if (sortType === 'title') {
      aValue = (a.title || '').toLowerCase();
      bValue = (b.title || '').toLowerCase();
    }

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    const aComparable = aValue instanceof Date ? aValue.getTime() : aValue;
    const bComparable = bValue instanceof Date ? bValue.getTime() : bValue;

    if (aComparable < bComparable) return sortOrder === 'asc' ? -1 : 1;
    if (aComparable > bComparable) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

export default async function GridSortedPage({
  params,
}: {
  params: Promise<{ sortType: string; sortOrder: string }>;
}) {
  const { sortType, sortOrder } = await params;

  if (
    !VALID_SORT_TYPES.includes(sortType as SortType)
    || !VALID_SORT_ORDERS.includes(sortOrder as SortOrder)
  ) {
    notFound();
  }

  const photos = await getPhotos();
  const sortedPhotos = sortPhotos(
    photos,
    sortType as SortType,
    sortOrder as SortOrder,
  );

  return (
    <PhotoGridPage
      photos={sortedPhotos}
      sortType={sortType as SortType}
      sortOrder={sortOrder as SortOrder}
    />
  );
}
