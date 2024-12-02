'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { useModal } from '@/hooks/use-modal';

const UploadButton = () => {
  const { onOpen } = useModal();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => onOpen()}
            variant="outline"
            size="icon"
            className="size-8 rounded-full"
          >
            <Icons.upload size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>New Photo</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UploadButton;
