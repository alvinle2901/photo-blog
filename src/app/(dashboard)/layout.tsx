import { Metadata } from 'next';

import { QueryProvider } from '@/providers/QueryClientProvider';
import ModalProvider from '@/providers/modal-provider';

import FloatingDockMobile from './_components/FloatingDockDashboard';
import Navbar from './_components/Navbar';

export const metadata: Metadata = {
  title: {
    template: '%s - Dashboard',
    default: 'Dashboard',
  },
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <QueryProvider>
        <Navbar />
        <main>
          {children}
          <FloatingDockMobile />
          <ModalProvider />
        </main>
      </QueryProvider>
    </div>
  );
};

export default DashboardLayout;
