import CommandK from '@/components/cmdk/CommandK';
import { QueryProvider } from '@/components/providers/QueryClientProvider';
import PhotoShareModalProvider from '@/components/providers/photo-share-modal-provider';

import Sidebar from './_components/Sidebar';
import FloatingDockMobile from './_components/floating-dock-mobile';
import Nav from './_components/nav';

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
