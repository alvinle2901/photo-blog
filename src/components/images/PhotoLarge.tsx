import { JSX } from 'react';

import Link from 'next/link';

import SiteGrid from '@/components/ui/SiteGrid';
import { Icons } from '@/components/icons';
import ImageLarge from '@/components/images/ImageLarge';
import PhotoShareButton from '@/components/images/PhotoShareButton';

import { formatExposureTime } from '@/utils/format-exif';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/date';
import { getShortenLocation } from '@/utils/string';
import { labelForFujifilmSimulation } from '@/platforms/fujifilm/simulation';
import type { FujifilmSimulation } from '@/platforms/fujifilm/simulation';

const PhotoLarge = ({
  photo,
  priority
}: {
  photo: any;
  priority?: boolean;
}) => {
  const renderMiniGrid = (children: JSX.Element) => (
    <div
      className={cn(
        'flex gap-y-4',
        'flex-col sm:flex-row lg:flex-col',
        '[&>*]:sm:flex-grow',
        'pr-2'
      )}>
      {children}
    </div>
  );

  return (
    <SiteGrid
      className="border-b border-[#e5e0d9]"
      contentMain={
        <Link href={`/p/${photo.id}`} className="active:brightness-75">
          <ImageLarge
            className="w-full max-h-[90vh] object-contain"
            alt={photo.title}
            src={photo.url}
            aspectRatio={photo.aspectRatio}
            priority={priority}
            id={photo.id}
            blurData={photo.blurData}
          />
        </Link>
      }
      contentSide={
        <div
          className={cn(
            'sticky top-4 self-start text-sm',
            'grid grid-cols-2 lg:grid-cols-1',
            'gap-y-4',
            '-translate-y-1',
            'my-4'
          )}
          style={{ fontFamily: "'DM Mono', monospace" }}>
          {renderMiniGrid(
            <>
              {/* TITLE  */}
              <Link href={`/p/${photo.id}`}>
                <h2
                  className="italic text-2xl text-[#18170f] font-normal leading-tight"
                  style={{ fontFamily: "'Cormorant', serif" }}>
                  {photo.title}
                </h2>
              </Link>
              {/* CAMERA  */}
              <div className="flex items-center">
                <Icons.camera className="h-4 w-4" />
                <div className="uppercase font-medium pl-1">
                  {photo.make} {photo.model}
                </div>
              </div>
              {/* FILM SIMULATION */}
              {photo.filmSimulation && (
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {labelForFujifilmSimulation(
                    photo.filmSimulation as FujifilmSimulation
                  )}
                </div>
              )}
            </>
          )}
          {renderMiniGrid(
            <>
              <ul className={cn('text-gray-500', 'dark:text-gray-400')}>
                <li>
                  {photo.focalLength ? photo.focalLength + 'mm' : '-'}{' '}
                  <span
                    className={cn('text-gray-400/80', 'dark:text-gray-400/50')}>
                    {photo.focalLength35mm ? photo.focalLength35mm + 'mm' : '-'}
                  </span>
                </li>
                <li>{photo.fStop ? 'ƒ/' + photo.fStop : '-'}</li>
                <li>ISO {photo.iso}</li>
                <li>{formatExposureTime(photo.exposureTime || 0)}</li>
                {photo.locationName && photo.locationName !== 'unknown' ? (
                  <li className="hidden lg:block">
                    {getShortenLocation(photo.locationName)}
                  </li>
                ) : null}
                {photo.gpsAltitude ? (
                  <li className="hidden lg:block">{photo.gpsAltitude + 'm'}</li>
                ) : null}
              </ul>
              <div
                className={cn(
                  'flex gap-y-4',
                  'flex-col sm:flex-row lg:flex-col'
                )}>
                <div
                  className={cn(
                    'grow uppercase',
                    'text-gray-500',
                    'dark:text-gray-400'
                  )}>
                  {formatDate(photo.takenAt)}
                </div>
              </div>
            </>
          )}
          {/* Share button */}
          <PhotoShareButton />
        </div>
      }
    />
  );
};

export default PhotoLarge;
