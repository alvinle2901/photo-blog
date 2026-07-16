import CommandK from "@/components/cmdk/CommandK";
import PhotoShareModal from "@/components/modals/photo-share-modal";
import PreventOverscrollBounce from "@/components/PreventOverscrollBounce";
import FloatingDockMobile from "@/photo/components/FloatingDockHome";
import MusicBar from "@/photo/components/MusicBar";
import Nav from "@/photo/components/Navbar";
import Sidebar from "@/photo/components/Sidebar";
import LightboxProvider from "@/providers/lightbox/LightboxProvider";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<LightboxProvider>
			<main className="mx-auto min-h-dvh overflow-x-clip overscroll-none bg-[#f7f5f2] md:max-w-[1400px]">
				<Nav />
				<div className="flex">
					<Sidebar />
					<div className="flex-1 min-w-0">{children}</div>
				</div>
				<FloatingDockMobile />
				{/* <MusicBar /> */}
				<CommandK />
				<PhotoShareModal />
				<PreventOverscrollBounce />
			</main>
		</LightboxProvider>
	);
};

export default HomeLayout;
