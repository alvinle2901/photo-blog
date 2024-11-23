'use client';

import { BiCopy } from 'react-icons/bi';
import { PiFacebookLogo, PiXLogo } from 'react-icons/pi';
import { TbPhotoShare } from 'react-icons/tb';

import { toast } from 'sonner';

import Image from 'next/image';

import { useShareModal } from '@/hooks/use-share-modal';
import { cn } from '@/utils/cn';
import { checkImageOrientation } from '@/utils/image';
import {
  createFacebookShareLink,
  generateXPostText,
  getPathShare,
  shortenUrl,
} from '@/utils/string';

import { Dialog, DialogContent } from '../ui/dialog';

export default function PhotoShareModal() {
  const { isOpen, onClose, photoShareData } = useShareModal();
  const renderIcon = (icon: JSX.Element, action: () => void, embedded?: boolean) => (
    <div
      className={cn(
        'py-3 px-3.5',
        embedded ? 'border-l' : 'border rounded-md',
        'border-gray-200 bg-gray-50 active:bg-gray-100',
        'dark:border-gray-800 dark:bg-gray-900/75 dark:hover:bg-gray-800/75 dark:active:bg-gray-900',
        'cursor-pointer',
      )}
      onClick={action}
    >
      {icon}
    </div>
  );

  const handleClose = () => {
    // setRes(null);
    onClose();
  };

  if (!photoShareData) return <></>;

  const photo = photoShareData.photo;
  const pathShare = getPathShare(photo.id);

  const { width, height } =
    checkImageOrientation(photo.width, photo.height) === 'landscape'
      ? { width: 500, height: 320 }
      : { width: 280, height: 350 };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px]">
        <div className="space-y-3 md:space-y-4 flex flex-col justify-center items-center">
          <Image
            src={photo.url}
            alt={photo.title}
            width={width}
            height={height}
            placeholder="blur"
            blurDataURL={photo.blurData}
          />
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'rounded-md',
                'w-full overflow-hidden',
                'flex items-center justify-stretch',
                'border border-gray-200 dark:border-gray-800',
              )}
            >
              <div className="truncate p-2 w-full">{shortenUrl(pathShare)}</div>
              {renderIcon(
                <BiCopy size={18} />,
                () => {
                  navigator.clipboard.writeText(pathShare);
                  toast.success('Copied!')
                },
                true,
              )}
            </div>
            {/* {renderIcon(<PiXLogo size={18} />, () =>
              window.open(generateXPostText(pathShare, photoShareData.socialText), '_blank'),
            )} */}
            {renderIcon(<PiFacebookLogo size={18} />, () =>
              window.open(createFacebookShareLink(pathShare), '_blank'),
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
