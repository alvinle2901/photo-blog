'use client';

import { House, MapPinned, Film } from 'lucide-react';

import { FloatingDock } from '@/components/ui/FloatingDock';

const links = [
  {
    title: 'Home',
    icon: House,
    href: '/',
  },
  {
    title: 'Map',
    icon: MapPinned,
    href: '/map',
  },
  {
    href: '/35mm',
    icon: Film,
    title: 'Film'
  }
];

const FloatingDockMobile = () => {
  return <FloatingDock items={links} className="fixed bottom-4 right-4" />;
};

export default FloatingDockMobile;
