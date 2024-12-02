'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/cn';

const LinksItem = ({ label, href }: { label: string; href: string }) => {
  const pathname = usePathname();

  const isActive =
    (pathname === '/' && href === '/') || pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <li className="group cursor-pointer">
      <Link
        href={href}
        prefetch
        className={cn(
          'group-hover:font-bold transition-colors duration-150',
          isActive && 'font-bold',
        )}
      >
        {label}
      </Link>
    </li>
  );
};

export default LinksItem;
