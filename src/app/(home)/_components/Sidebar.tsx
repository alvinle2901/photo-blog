'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isPathGrid } from '@/utils/string';

import LinksItem from './links-item';
import ViewSwitcher, { SwitcherSelection } from './view-switcher';

const Sidebar = () => {
  const pathname = usePathname();

  const homeRoutes = [
    {
      label: 'Home.',
      href: '/',
    },
    {
      label: 'Map.',
      href: '/map',
    },
    {
      label: '35mm.',
      href: '/35mm',
    },
  ];

  const switcherSelectionForPath = (): SwitcherSelection | undefined => {
    if (pathname === '/') {
      return 'feed';
    } else if (isPathGrid(pathname)) {
      return 'grid';
    }
  };

  return (
    <div className="h-[95dvh] w-[19%] pt-12 pl-3 fixed md:flex flex-col items-end gap-4 z-50 hidden">
      <Link href={'/'}>
        <Image src="/momento.svg" width={200} height={200} alt="Logo" />
      </Link>
      <ViewSwitcher currentSelection={switcherSelectionForPath()} />
      <nav className="flex flex-col text-[#1F1F1F] gap-8 mt-4">
        <ul className="text-[18px] text-right font-helveticaNeue uppercase space-y-[4px]">
          {homeRoutes.map((route) => (
            <LinksItem label={route.label} href={route.href}></LinksItem>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
