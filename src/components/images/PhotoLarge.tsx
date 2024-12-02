import React from 'react';
import { TbPhotoShare } from 'react-icons/tb';

import Link from 'next/link';

import SiteGrid from '@/components/ui/SiteGrid';
import { Icons } from '@/components/icons';
import ImageLarge from '@/components/images/ImageLarge';

import { useShareModal } from '@/hooks/use-share-modal';
import { formatExposureTime } from '@/lib/format-exif';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/date';
import { getShortenLocation } from '@/utils/string';

const PhotoLarge = ({ photo, priority }: { photo: any; priority?: boolean }) => {
  const renderMiniGrid = (children: JSX.Element) => (
    <div
      className={cn(
        'flex gap-y-4',
        'flex-col sm:flex-row lg:flex-col',
        '[&>*]:sm:flex-grow',
        'pr-2',
      )}
    >
      {children}
    </div>
  );

  const { onOpen } = useShareModal();

  return (
    <SiteGrid
      contentMain={
        <ImageLarge
          className="w-full max-h-[60vh] object-contain"
          alt={photo.title}
          src={photo.url}
          aspectRatio={photo.aspectRatio}
          priority={priority}
          id={photo.id}
          blurData={photo.blurData}
        />
      }
      contentSide={
        <div
          className={cn(
            'sticky top-4 self-start text-sm',
            'grid grid-cols-2 lg:grid-cols-1',
            'gap-y-4',
            '-translate-y-1',
            'mb-4',
          )}
        >
          {renderMiniGrid(
            <>
              {/* TITLE  */}
              <Link href={`/p/${photo.id}`} className="font-bold uppercase">
                {photo.title}
              </Link>
              {/* CAMERA  */}
              <div className="flex items-center">
                <Icons.camera className="h-4 w-4" />
                <div className="uppercase font-ibmMono font-medium pl-1">
                  {photo.make} {photo.model}
                </div>
              </div>
            </>,
          )}
          {renderMiniGrid(
            <>
              <ul className={cn('text-gray-500', 'dark:text-gray-400 font-ibmMono')}>
                <li>
                  {photo.focalLength ? photo.focalLength + 'mm' : '-'}{' '}
                  <span className={cn('text-gray-400/80', 'dark:text-gray-400/50 font-ibmMono')}>
                    {photo.focalLength35mm ? photo.focalLength35mm + 'mm' : '-'}
                  </span>
                </li>
                <li>{photo.fNumber ? 'ƒ' + photo.fNumber : '-'}</li>
                <li>ISO {photo.iso}</li>
                <li>{formatExposureTime(photo.exposureTime || 0)}</li>
                {photo.locationName !== 'unknown' ? (
                  <li className="hidden lg:block">{getShortenLocation(photo.locationName)}</li>
                ) : null}
                {photo.gpsAltitude ? (
                  <li className="hidden lg:block">{photo.gpsAltitude + 'm'}</li>
                ) : null}
              </ul>
              <div className={cn('flex gap-y-4', 'flex-col sm:flex-row lg:flex-col')}>
                <div className={cn('grow uppercase', 'text-gray-500', 'dark:text-gray-400')}>
                  {formatDate(photo.takeAt)}
                </div>
              </div>
            </>,
          )}
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
      }
    />
  );
};

export default PhotoLarge;
