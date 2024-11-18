'use client';

import { House, Images } from 'lucide-react';

import { FloatingDock } from '@/components/floating-dock';

const links = [
  {
    href: '/dashboard',
    icon: House,
    title: 'Overview',
  },
  {
    href: '/photos',
    icon: Images,
    title: 'Photos',
  },
];

const FloatingDockMobile = () => {
  return <FloatingDock items={links} className="fixed bottom-4 right-4" />;
};

export default FloatingDockMobile;
