import { Suspense } from 'react';

import type { Metadata } from 'next';
import { Readex_Pro } from 'next/font/google';

import 'mapbox-gl/dist/mapbox-gl.css';

import { TailwindIndicator } from '@/components/tailwind-indicator';
import { Toaster } from '@/components/ui/Sonner';
import AppStateProvider from '@/state/AppStateProvider';
import '@/styles/globals.css';

const readex = Readex_Pro({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s - momento of alvin',
    default: 'momento of alvin',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={readex.className}>
        <AppStateProvider>
          <Suspense>{children}</Suspense>
          <Toaster />
          <TailwindIndicator />
        </AppStateProvider>
      </body>
    </html>
  );
}
