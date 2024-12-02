'use client';

import { useMap } from 'react-map-gl';

import Image from 'next/image';
import Link from 'next/link';

import { InferResponseType } from 'hono';

import { Icons } from '@/components/icons';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { Button } from '@/components/ui/Button';
import { useEditPhoto } from '@/features/photos/api/use-edit-photo';
import { client } from '@/lib/hono';
import { convertToCoordination } from '@/utils/convert-coordination';
import { formatDate } from '@/utils/date';

export type Photo = InferResponseType<typeof client.api.photos_35mm.$get, 200>['data'][0];

const PhotoOtherCard = ({ photo }: { photo: Photo }) => {
  const editMutation = useEditPhoto(photo.id);

  return (
    <div className="relative">
      <AspectRatio ratio={4 / 5} className="overflow-hidden rounded-xl bg-muted">
        <Image
          src={photo.url}
          fill
          alt="Image"
          // placeholder="blur"
          // blurDataURL={photo.blurData}
          className="cursor-pointer object-cover brightness-100 transition-all duration-300 hover:brightness-110"
          // onClick={handlePhotoClick}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </AspectRatio>
      {/* <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-2 size-8 rounded-full bg-white"
        onClick={handleHeartClick}
      >
        {photo.isFavorite ? (
          <Icons.heart size={18} className="fill-rose-500 text-muted-foreground text-rose-500" />
        ) : (
          <Icons.heart size={18} className="text-muted-foreground" />
        )}
      </Button> */}

      <Link href={`/photos/${photo.id}`} className="group">
        <div className="absolute bottom-0 left-0 w-full p-2">
          <div className="w-full space-y-2 overflow-hidden rounded-md bg-white p-2 backdrop-blur transition duration-150 supports-[backdrop-filter]:bg-background/75 group-hover:supports-[backdrop-filter]:bg-background/85">
            <h1 className="line-clamp-1 group-hover:underline">{photo.title}</h1>
            {/* <h3 className="text-xs text-muted-foreground">{formatDate(photo.takeAt)}</h3> */}
            {/* <p className="flex items-center text-[10px] font-light text-muted-foreground">
              <Icons.mapPin size={12} className="mr-2 text-sky-500" />
              {convertToCoordination(photo.longitude, photo.latitude)}
            </p> */}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PhotoOtherCard;
