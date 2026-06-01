import FloatingDockMobile from "@/photo/components/FloatingDockHome";
import Nav from "@/photo/components/Navbar";
import Sidebar from "@/photo/components/Sidebar";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      {/* <QueryProvider> */}
        <Nav />
        <Sidebar />
        {children}
        <FloatingDockMobile />
        {/* <PhotoShareModalProvider />
        <CommandK />
      </QueryProvider> */}
    </main>
  );
};

export default HomeLayout;
