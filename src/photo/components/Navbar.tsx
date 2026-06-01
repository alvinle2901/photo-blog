'use client';

import { usePathname } from 'next/navigation';

import { cn } from '@/utils/cn';
import { isPathGrid } from '@/utils/string';

import ViewSwitcher, { SwitcherSelection } from './ViewSwitcher';

const Nav = () => {
  const pathname = usePathname();

  const switcherSelectionForPath = (): SwitcherSelection | undefined => {
    if (pathname === '/') {
      return 'feed';
    } else if (isPathGrid(pathname)) {
      return 'grid';
    }
  };

  return (
    <div
      className={cn(
        'md:hidden ml-5 mt-5',
        pathname === '/map' && 'mb-5',
        pathname.startsWith('/p/') && 'hidden',
      )}
    >
      <ViewSwitcher currentSelection={switcherSelectionForPath()} />
    </div>
  );
};

export default Nav;
