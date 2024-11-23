/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { TbPhotoShare } from 'react-icons/tb';

import Image from 'next/image';

import { motion } from 'framer-motion';

import BrandLogo from '@/components/brand-logo';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { useGetPhoto } from '@/features/photos/api/use-get-photo';
import { usePhotoId } from '@/hooks/use-photo-id';
import { useShareModal } from '@/hooks/use-share-modal';
import { formatExposureTime } from '@/lib/format-exif';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/date';
import { getShortenLocation } from '@/utils/string';

/* eslint-disable @next/next/no-img-element */

const PhotoPage = () => {
  const photoId = usePhotoId();
  const [isLoaded, setIsLoaded] = useState(false);
  const photoQuery = useGetPhoto(photoId);
  const { onOpen } = useShareModal();

  const photo = photoQuery.data;

  if (!photo) {
    return (
      <div className="w-full h-dvh flex items-center justify-center">
        <Icons.loader className="animate-spin" />
      </div>
    );
  }

  return (
    <section className="overflow-hidden ml-0 md:ml-[320px] relative flex items-center justify-center h-dvh flex-col p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="z-10 relative shadow-2xl shadow-black p-4 md:p-6 pb-0 md:pb-0 bg-white flex flex-col justify-center items-center"
      >
        <Image
          src={photo.url}
          alt={photo.title}
          width={photo.width}
          height={photo.height}
          placeholder="blur"
          blurDataURL={photo.blurData}
          onLoad={() => setIsLoaded(true)}
          className="z-10 w-auto max-h-[80dvh]"
        />
        {isLoaded && (
          <div className="z-50 flex justify-between items-center select-none h-14 md:h-20 bg-white w-full px-2 lg:px-4">
            <div className="flex flex-col text-center">
              <h1
                className={cn(
                  'font-semibold text-xs sm:text-sm lg:text-lg',
                  photo.aspectRatio < 1 ? 'lg:text-sm' : 'lg:text-lg',
                )}
              >
                {photo.make} {photo.model}
              </h1>
              <p className="text-xs text-muted-foreground">
                {photo.lensModel
                  ? photo.lensModel
                  : photo.locationName && photo.locationName !== 'unknown'
                    ? getShortenLocation(photo.locationName)
                    : null}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <BrandLogo brandName={photo.make} small={photo.aspectRatio < 1 ? true : false} />
              <Separator orientation="vertical" className="hidden sm:block h-10" />
              <div className="hidden sm:flex flex-col gap-[2px]">
                <div className="space-x-[6px] text-xs lg:md:text-sm">
                  <span>{photo.focalLength35mm + 'mm'}</span>
                  <span>{'ƒ/' + photo.fNumber}</span>
                  <span>{formatExposureTime(photo.exposureTime ?? 0)}</span>
                  <span>{'ISO ' + photo.iso}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{formatDate(photo.takeAt)}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="hidden sm:block h-10" />
              {/* Share button */}
              <div
                className="hover:text-gray-500 cursor-pointer"
                onClick={() =>
                  onOpen({
                    socialText: 'Check out this photo',
                    photo: photo,
                  })
                }
              >
                <TbPhotoShare size={18} />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="md:left-[320px] fixed inset-0 blur-lg">
        <Image src={photo.blurData} alt={`${photo.title} blur`} fill />
      </div>
    </section>
  );
};

export default PhotoPage;
