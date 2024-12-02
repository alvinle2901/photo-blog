import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { cn } from '@/utils/cn';

interface ThumbnailProps {
  title: string;
  url: string;
  description: string;
  width: number;
  height: number;
  blurDataURL: string;
  aspectRatio: number;
}

const Thumbnail = ({
  url,
  description,
  width,
  height,
  blurDataURL,
  aspectRatio,
}: ThumbnailProps) => {
  return (
    <Dialog>
      <DialogTrigger>
        <div className="relative max-h-[500px] w-full cursor-zoom-in overflow-hidden">
          <Image
            src={url}
            alt={description}
            width={width}
            height={height}
            placeholder="blur"
            blurDataURL={blurDataURL}
          />
        </div>
      </DialogTrigger>

      <DialogContent
        className={cn(
          'aspect-ratio-square border-none bg-transparent p-0 shadow-none',
          aspectRatio > 1 ? 'max-w-[70vw]' : '',
        )}
      >
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Image
          src={url}
          alt={description}
          width={width}
          height={height}
          placeholder="blur"
          blurDataURL={blurDataURL}
          className="size-full"
        />
      </DialogContent>
    </Dialog>
  );
};

export default Thumbnail;
