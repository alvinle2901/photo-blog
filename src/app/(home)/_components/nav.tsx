'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { isPathGrid } from '@/utils/validatePath';

import ViewSwitcher, { SwitcherSelection } from './view-switcher';

export default function Nav({ siteDomainOrTitle }: { siteDomainOrTitle: string }) {
  const renderLink = (text: string, linkOrAction: any) => (
    <Link href={linkOrAction} className="text-black">
      {text}
    </Link>
  );
  const pathname = usePathname();

  const switcherSelectionForPath = (): SwitcherSelection | undefined => {
    if (pathname === '/') {
      return 'feed';
    } else if (isPathGrid(pathname)) {
      return 'grid';
    }
  };

  return (
    <div className='flex items-center w-full min-h-[4rem]'>
      <ViewSwitcher currentSelection={switcherSelectionForPath()} />
      <div
        className='flex-grow text-right min-w-0 hidden xs:block translate-y-[-1px]'
      >
        <div className='truncate overflow-hidden'>
          {renderLink(siteDomainOrTitle, process.env.NEXT_PUBLIC_APP_URL)}
        </div>
      </div>
    </div>
  );
}
