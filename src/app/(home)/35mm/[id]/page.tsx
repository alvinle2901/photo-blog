'use client';

import { useEffect } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Icons } from '@/components/icons';

import { use35mmPhotos } from '@/hooks/use-35mm-photos';
import { usePhotoId } from '@/hooks/use-photo-id';

const Photo35mm = () => {
  const router = useRouter();
  const photoId = usePhotoId();
  const photos35mm = use35mmPhotos((state) => state.photos35mm);

  const photo = photos35mm.find((item) => item.id === photoId);
  const index = photos35mm.findIndex((item) => item.id === photoId);

  // Prefetch prev/next page
  useEffect(() => {
    if (index > 0) {
      router.prefetch(`/35mm/${photos35mm[index - 1].id}`);
    }

    if (index < photos35mm.length - 1) {
      router.prefetch(`/35mm/${photos35mm[index + 1].id}`);
    }
  }, [index, photos35mm]);

  // Handle prev/next images
  const handlePrev = () => {
    router.push(`/35mm/${photos35mm[index - 1].id}`);
  };

  const handleNext = () => {
    router.push(`/35mm/${photos35mm[index + 1].id}`);
  };

  if (!photo) {
    return (
      <div className="w-full h-dvh flex items-center justify-center">
        <Icons.loader className="animate-spin" />
      </div>
    );
  }

  return (
    <section className="overflow-hidden ml-0 md:ml-[320px] relative flex items-center justify-center h-[100dvh] flex-col">
      <Image
        src={photo.url}
        width={photo.width}
        height={photo.height}
        alt={''}
        className="w-auto max-h-[80dvh]"
        quality={5}
      />
      <div className="flex mt-3">
        {index === 0 ? (
          <div className="font-helveticaNeue text-gray-500 cursor-default">prev</div>
        ) : (
          <div onClick={handlePrev} className="font-helveticaNeue cursor-pointer">
            prev
          </div>
        )}
        <p className="font-helveticaNeue"> / </p>
        {index === photos35mm.length - 1 ? (
          <div className="font-helveticaNeue text-gray-500 cursor-default">next</div>
        ) : (
          <div onClick={handleNext} className="font-helveticaNeue cursor-pointer ">
            next
          </div>
        )}
      </div>
    </section>
  );
};

export default Photo35mm;
