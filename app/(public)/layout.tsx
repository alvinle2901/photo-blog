import CommandK from "@/components/cmdk/CommandK";
import FloatingDockMobile from "@/photo/components/FloatingDockHome";
import Nav from "@/photo/components/Navbar";
import Sidebar from "@/photo/components/Sidebar";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<main className="max-w-[1400px] mx-auto bg-[#f7f5f2]">
			{/* <QueryProvider> */}
			<Nav />
			<div className="flex">
				<Sidebar />
				<div className="flex-1 min-w-0">{children}</div>
			</div>
			<FloatingDockMobile />
			<CommandK />
			{/* <PhotoShareModalProvider />
      </QueryProvider> */}
		</main>
	);
};

export default HomeLayout;
