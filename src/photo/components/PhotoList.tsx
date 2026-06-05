'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import AnimateItems from '@/components/AnimateItems';
import { Icons } from '@/components/icons';
import PhotoLarge from '@/components/images/PhotoLarge';
import { fetchPhotosPaginated } from '@/photo/actions';

import { Photo } from '..';

const INITIAL_LIMIT = 20;
const PAGE_LIMIT = 10;

const PhotoList = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const loadMore = useCallback(async () => {
    const limit = pageRef.current === 1 ? INITIAL_LIMIT : PAGE_LIMIT;
    const newPhotos = await fetchPhotosPaginated(pageRef.current, limit);
    setPhotos((prev) => [...prev, ...newPhotos]);
    setHasMore(newPhotos.length > 0);
    pageRef.current += 1;
  }, []);

  // Initial fetch
  useEffect(() => {
    loadMore();
  }, [loadMore]);

  return (
    <div className="space-y-4">
      <InfiniteScroll
        dataLength={photos.length}
        next={loadMore}
        hasMore={hasMore}
        loader={
          <div className="flex justify-center border rounded-full mt-7 py-1 mx-[10%]">
            <Icons.loader className="animate-spin" size={18} />
          </div>
        }
      >
        <AnimateItems
          className="space-y-1"
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
