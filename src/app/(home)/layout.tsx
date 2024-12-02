import CommandK from '@/components/cmdk/CommandK';

import { QueryProvider } from '@/providers/QueryClientProvider';
import PhotoShareModalProvider from '@/providers/photo-share-modal-provider';

import FloatingDockMobile from './_components/FloatingDockHome';
import Nav from './_components/Navbar';
import Sidebar from './_components/Sidebar';

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <QueryProvider>
        <Nav />
        <Sidebar />
        {children}
        <FloatingDockMobile />
        <PhotoShareModalProvider />
        <CommandK />
      </QueryProvider>
    </main>
  );
};

export default HomeLayout;
