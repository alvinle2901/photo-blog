import Link from 'next/link';
import Image from 'next/image';
import { getOptimizedUrl } from '@/storage/utils';
import type { Photo } from '@/photo';

type SortType = 'createdAt' | 'takenAt' | 'title';
type SortOrder = 'asc' | 'desc';

type Props = {
  photos: Photo[];
  sortType: SortType;
  sortOrder: SortOrder;
};

export default function PhotoGridPage({ photos, sortType, sortOrder }: Props) {
  void sortType;
  void sortOrder;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2">
      {photos.map((photo, index) => (
        <Link
          key={photo.id}
          href={`/p/${photo.id}`}
          className="relative overflow-hidden bg-[#ebe7df]"
          style={{ aspectRatio: '1 / 1' }}
        >
          <Image
            src={getOptimizedUrl(photo.url, 'md')}
            alt={photo.title || photo.id}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            placeholder={photo.blurData ? 'blur' : 'empty'}
            blurDataURL={photo.blurData || undefined}
            priority={index < 8}
          />
        </Link>
      ))}
    </div>
  );
}
