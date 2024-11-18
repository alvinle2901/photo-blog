import Link from 'next/link';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const HomeButton = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="size-8 rounded-full" asChild>
            <Link href="/">
              <Icons.arrowUpRight size={16} />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent align="end">
          <p>Home</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default HomeButton;
