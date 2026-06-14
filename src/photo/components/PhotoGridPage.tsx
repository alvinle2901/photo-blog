import ImageSquare from '@/components/images/ImageSquare';
import type { Photo } from '@/photo';
import GridFilterSidebar from '@/photo/components/GridFilterSidebar';

type SortType = 'createdAt' | 'takenAt' | 'title';
type SortOrder = 'asc' | 'desc';

type Props = {
  photos: Photo[];
  sortType: SortType;
  sortOrder: SortOrder;
  years: Array<{ year: string; count: number }>;
  cameras: Array<{ make: string; model: string; count: number }>;
  films: Array<{ film: string; count: number }>;
};

export default function PhotoGridPage({
  photos,
  sortType,
  sortOrder,
  years,
  cameras,
  films
}: Props) {
  void sortType;
  void sortOrder;

  return (
    <div className="py-8">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-1 sm:gap-2">
          {photos.map((photo, index) => (
            <ImageSquare key={photo.id} photo={photo} index={index} />
          ))}
        </div>

        <div className="order-first lg:order-0 lg:shrink-0">
          <GridFilterSidebar years={years} cameras={cameras} films={films} />
        </div>
      </div>
    </div>
  );
}
