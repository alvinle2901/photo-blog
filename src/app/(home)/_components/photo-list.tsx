'use client';

import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { Photo } from '@/app/(dashboard)/_components/photo-card';
import AnimateItems from '@/components/AnimateItems';
import { Icons } from '@/components/icons';
import PhotoLarge from '@/components/photoLarge';
import { useGetPhotosPagination } from '@/features/photos/api/use-get-photos';

const PhotoList = () => {
  const [page, setPage] = useState(1);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { refetch, isPending } = useGetPhotosPagination(page.toString(), page === 1 ? '20' : '10');

  const fetchMoreData = async () => {
    // Fetch more photos from the server
    const photosQuery = await refetch();
    const newPhotos = photosQuery.data ?? [];

    setPhotos([...photos, ...newPhotos]);
    setHasMore(newPhotos.length > 0);
    setPage(page + 1);
  };

  useEffect(() => {
    // Initial fetch
    fetchMoreData();
  }, []);

  return isPending ? (
    <div className="w-full h-dvh flex items-center justify-center">
      <Icons.loader className="animate-spin" />
    </div>
  ) : (
    <div className="space-y-4 p-8 md:ml-[310px] md:p-[50px] md:pl-0">
      <InfiniteScroll
        dataLength={photos.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center border rounded-full mt-4 py-1 mx-[10%]">
            <Icons.loader className="animate-spin" size={18} />
          </div>
        }
      >
        <AnimateItems
          className="space-y-8"
          duration={0.7}
          staggerDelay={0.15}
          distanceOffset={0}
          staggerOnFirstLoadOnly
          items={photos.map((photo, index) => (
            <PhotoLarge key={photo.id} photo={photo} priority={index <= 1} />
          ))}
        />
      </InfiniteScroll>
    </div>
  );
};

export default PhotoList;
