import type { Metadata } from 'next';
import { Readex_Pro } from 'next/font/google';

import './globals.css';

const readex = Readex_Pro({ subsets: ['latin'] });

import AppStateProvider from '@/state/AppStateProvider';


export const metadata: Metadata = {
  title: {
    template: '%s - momento of alvin',
    default: 'momento of alvin',
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={readex.className}>
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}

