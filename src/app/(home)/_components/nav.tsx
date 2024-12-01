'use client';

import { usePathname } from 'next/navigation';

import { isPathGrid } from '@/utils/string';

import ViewSwitcher, { SwitcherSelection } from './view-switcher';

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
    <div className="md:hidden ml-5 mt-5">
      <ViewSwitcher currentSelection={switcherSelectionForPath()} />
    </div>
  );
};

export default Nav;
