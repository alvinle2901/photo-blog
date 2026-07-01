'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

import ImageLarge from '@/components/images/ImageLarge';
import { formatDate } from '@/utils/date';
import { getShortenLocation } from '@/utils/string';

import type { Photo } from '..';

interface PhotoCardProps {
  photo: Photo;
  onClick?: (id: string) => void;
  onFavourite?: (id: string) => void;
}

interface TapeProps {
  className?: string;
  style?: React.CSSProperties;
}

function Tape({ style }: TapeProps) {
  return (
    <div
      className="absolute z-10 h-[17px] rounded-[1px]"
      style={{ background: 'rgba(200,180,130,0.65)', ...style }}
      aria-hidden="true"
    />
  );
}

function seededRotation(seed: string, min: number, max: number) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }

  const normalized = (Math.abs(hash) % 1000) / 1000;
  return min + normalized * (max - min);
}

export default function PhotoCard({
  photo,
  onClick,
  onFavourite
}: PhotoCardProps) {
  const [favourited, setFavourited] = useState(false);
  const isPortrait = photo.aspectRatio && photo.aspectRatio < 1;
  const portraitRotation = seededRotation(`${photo.id}-portrait`, -2.0, 2.0);
  const landscapeRotation = seededRotation(`${photo.id}-landscape`, -1.5, 1.5);

  function handleFavourite(e: React.MouseEvent) {
    e.stopPropagation();
    setFavourited((f) => !f);
    onFavourite?.(photo.id);
  }

  function handleOpen() {
    onClick?.(photo.id);
  }

  function handleOpenKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    handleOpen();
  }

  const starButton = (
    <button
      type="button"
      onClick={handleFavourite}
      aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
      className="flex-shrink-0">
      <Star
        size={16}
        className={
          favourited ? 'fill-[#b0a07a] text-[#b0a07a]' : 'text-[#b0a07a]'
        }
      />
    </button>
  );

  /* ── Portrait layout ── */
  if (isPortrait) {
    return (
      // biome-ignore lint/a11y/useSemanticElements: This wrapper contains a nested favorite button, so it cannot be a semantic button.
      <div
        className="relative py-5 cursor-pointer group self-center mx-auto max-w-[65vh]"
        style={{ transform: `rotate(${portraitRotation.toFixed(2)}deg)` }}
        onClick={handleOpen}
        onKeyDown={handleOpenKeyDown}
        role="button"
        tabIndex={0}>
        <Tape
          style={{
            top: 10,
            left: '50%',
            width: '56px',
            transform: 'translateX(-50%) rotate(1.5deg)'
          }}
        />

        <div className="flex cursor-pointer items-stretch gap-0 border border-[#d4c8a8] bg-[#faf6ef] p-2">
          {/* Date — runs up the left side */}
          <div className="flex items-center justify-center px-1.5">
            <span
              className="font-courier-prime text-[11px] text-[#8a7a58] tracking-wider whitespace-nowrap"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)'
              }}>
              {formatDate(photo.takenAt, false)}
            </span>
          </div>

          {/* Photo */}
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: '3/4', minWidth: '180px' }}>
            <ImageLarge
              className="h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              alt={photo.title}
              src={photo.url}
              aspectRatio={photo.aspectRatio}
              id={photo.id}
              blurData={photo.blurData}
            />
          </div>

          {/* Location + star — run down the right side */}
          <div className="flex flex-col items-center justify-between px-1.5 py-1">
            <span
              className="font-dancing text-[14px] text-[#5a4a2a] whitespace-nowrap"
              style={{ writingMode: 'vertical-rl' }}>
              {getShortenLocation(photo.locationName)}
            </span>
            {starButton}
          </div>
        </div>
      </div>
    );
  }

  /* ── Landscape layout ── */
  return (
    // biome-ignore lint/a11y/useSemanticElements: This wrapper contains a nested favorite button, so it cannot be a semantic button.
    <div
      className="relative py-5 cursor-pointer group mx-auto max-w-[90vh] self-center"
      style={{ transform: `rotate(${landscapeRotation.toFixed(2)}deg)` }}
      onClick={handleOpen}
      onKeyDown={handleOpenKeyDown}
      role="button"
      tabIndex={0}>
      <Tape
        style={{
          top: 10,
          left: '22%',
          width: '56px',
          transform: 'rotate(-2.5deg)'
        }}
      />
      <Tape
        style={{
          top: 10,
          right: '18%',
          width: '48px',
          transform: 'rotate(2deg)',
          opacity: 0.85
        }}
      />

      <div className="cursor-pointer border border-[#d4c8a8] bg-[#faf6ef] p-2 pb-5">
        {/* Photo */}
        <div
          className="relative overflow-hidden w-full"
          style={{ aspectRatio: '16/10' }}>
          <ImageLarge
            src={photo.url}
            alt={photo.title}
            className="h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            aspectRatio={photo.aspectRatio}
            id={photo.id}
            blurData={photo.blurData}
          />
        </div>

        {/* Caption row */}
        <div className="flex items-center justify-between mt-2 px-0.5">
          <span className="font-courier-prime text-[11px] text-[#8a7a58] tracking-wider">
            {formatDate(photo.takenAt, false)}
          </span>
          <span className="font-dancing text-[14px] text-[#5a4a2a] truncate mx-2">
            {photo.locationName}
          </span>
          {starButton}
        </div>
      </div>
    </div>
  );
}
