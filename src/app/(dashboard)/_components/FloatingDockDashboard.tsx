'use client';

import { House, Images } from 'lucide-react';

import { FloatingDock } from '@/components/ui/FloatingDock';

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

const FloatingDockDashboard = () => {
  return <FloatingDock items={links} className="fixed bottom-4 right-4" />;
};

export default FloatingDockDashboard;
