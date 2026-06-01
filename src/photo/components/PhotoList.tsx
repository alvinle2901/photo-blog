'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import AnimateItems from '@/components/AnimateItems';
import { Icons } from '@/components/icons';
import PhotoLarge from '@/components/images/PhotoLarge';
import { fetchPhotosPaginated } from '@/photo/actions';

import { Photo } from '..';

const INITIAL_LIMIT = 20;
const PAGE_LIMIT = 10;

const PhotoList = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  // Use refs so the IntersectionObserver callback always sees current values
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const limit = pageRef.current === 1 ? INITIAL_LIMIT : PAGE_LIMIT;
    const newPhotos = await fetchPhotosPaginated(pageRef.current, limit);

    setPhotos((prev) => [...prev, ...newPhotos]);
    const more = newPhotos.length > 0;
    hasMoreRef.current = more;
    setHasMore(more);
    pageRef.current += 1;
    loadingRef.current = false;
    setLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    loadMore();
  }, [loadMore]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (loading && photos.length === 0) {
    return (
      <div className="w-full h-dvh flex items-center justify-center">
        <Icons.loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8 md:ml-[21%] md:p-[50px] md:pl-0">
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
      {hasMore && (
        <div
          ref={loaderRef}
          className="flex justify-center border rounded-full mt-7 py-1 mx-[10%]"
        >
          {loading && <Icons.loader className="animate-spin" size={18} />}
        </div>
      )}
    </div>
  );
};

export default PhotoList;
