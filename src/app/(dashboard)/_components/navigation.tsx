'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/utils/cn';

const routes = [
  {
    href: '/dashboard',
    label: 'Dashboard',
  },
  {
    href: '/photos',
    label: 'Collections',
  },
];
const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-x-4 overflow-x-auto md:flex">
      {routes.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            pathname.startsWith(href) && 'text-sky-500',
            'transition-all duration-150 hover:text-sky-500',
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
