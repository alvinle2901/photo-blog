'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isPathGrid } from '@/utils/string';

import LinksItem from './LinksItem';
import SocialLinks from './SocialLinks';
import ViewSwitcher, { SwitcherSelection } from './ViewSwitcher';

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
    <div className="h-[95dvh] w-[19%] pt-12 pl-3 fixed md:flex flex-col items-end justify-between z-50 hidden">
      <div className="flex flex-col items-end gap-4">
        <Link href={'/'}>
          <Image src="/momento.svg" width={200} height={200} alt="Logo" className='mb-4' />
        </Link>
        <ViewSwitcher currentSelection={switcherSelectionForPath()} />
        {/* Navs */}
        <nav className="flex flex-col text-[#1F1F1F] gap-8">
          <ul className="text-[18px] text-right font-helveticaNeue uppercase space-y-[4px]">
            {homeRoutes.map((route) => (
              <LinksItem label={route.label} href={route.href} key={route.href}></LinksItem>
            ))}
          </ul>
        </nav>
      </div>
      {/* Socials */}
      <SocialLinks />
    </div>
  );
};

export default Sidebar;
