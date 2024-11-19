import { QueryProvider } from '@/components/providers/QueryClientProvider';

import FloatingDockMobile from './_components/floating-dock-mobile';
import Nav from './_components/nav';

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="px-5">
      <QueryProvider>
        <Nav siteDomainOrTitle={'123.com'} />
        {children}
        <FloatingDockMobile />
      </QueryProvider>
    </main>
  );
};

export default HomeLayout;
