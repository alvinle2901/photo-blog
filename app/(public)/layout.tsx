import CommandK from "@/components/cmdk/CommandK";
import PhotoShareModal from "@/components/modals/photo-share-modal";
import FloatingDockMobile from "@/photo/components/FloatingDockHome";
import MusicBar from "@/photo/components/MusicBar";
import Nav from "@/photo/components/Navbar";
import Sidebar from "@/photo/components/Sidebar";
import LightboxProvider from "@/providers/lightbox/LightboxProvider";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<LightboxProvider>
			<main className="max-w-[1400px] mx-auto bg-[#f7f5f2]">
				{/* <QueryProvider> */}
				<Nav />
				<div className="flex">
					<Sidebar />
					<div className="flex-1 min-w-0">{children}</div>
				</div>
				<FloatingDockMobile />
				<MusicBar />
				<CommandK />
				<PhotoShareModal />
			</main>
		</LightboxProvider>
	);
};

export default HomeLayout;
