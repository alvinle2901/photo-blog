'use client';

import { House, LayoutDashboardIcon, MapPinned, Film } from 'lucide-react';

import { FloatingDock } from '@/components/floating-dock';

const links = [
  {
    title: 'Home',
    icon: House,
    href: '/',
  },
  {
    title: 'Grid',
    icon: LayoutDashboardIcon,
    href: '/grid',
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
