import ImageSquare from '@/components/images/ImageSquare';
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
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2 py-8">
      {photos.map((photo, index) => (
        <ImageSquare key={photo.id} photo={photo} index={index} />
      ))}
    </div>
  );
}
