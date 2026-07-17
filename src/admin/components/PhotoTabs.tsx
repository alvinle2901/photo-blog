"use client";

import type { FilmPhoto } from "@/35mm/query";
import { TabContent, TabList, Tabs, TabTrigger } from "@/components/ui/Tabs";
import type { Photo } from "@/photo";

import PhotoList from "./PhotoList";

interface Props {
	photos: Photo[];
	filmPhotos: FilmPhoto[];
	isPending: boolean;
	selectedPhotoId?: string | null;
	onSelectPhoto?: (photoId: string) => void;
}

const PhotoTabs = ({
	photos,
	filmPhotos,
	isPending,
	selectedPhotoId,
	onSelectPhoto,
}: Props) => {
	return (
		<Tabs className="flex-col" defaultValue="tab1">
			<TabList
				className="sticky top-0 z-20 flex shrink-0 gap-2 border-b border-[#e5e0d9] bg-[#f7f5f2]/95 px-5 py-3 text-[#8c857a] tracking-[0.04em] backdrop-blur sm:px-7"
				aria-label="Manage images"
				style={{ fontFamily: "'DM Mono', monospace" }}
			>
				<TabTrigger
					className="flex cursor-pointer select-none items-center justify-center rounded-full border border-transparent px-3 py-1.5 text-[11px] uppercase leading-none outline-none transition-colors hover:border-[#d8d1c7] hover:bg-[#ebe7df] hover:text-[#18170f] data-[state=active]:border-[#18170f] data-[state=active]:bg-[#ebe7df] data-[state=active]:text-[#18170f]"
					value="tab1"
				>
					digital
				</TabTrigger>
				<TabTrigger
					className="flex cursor-pointer select-none items-center justify-center rounded-full border border-transparent px-3 py-1.5 text-[11px] uppercase leading-none outline-none transition-colors hover:border-[#d8d1c7] hover:bg-[#ebe7df] hover:text-[#18170f] data-[state=active]:border-[#18170f] data-[state=active]:bg-[#ebe7df] data-[state=active]:text-[#18170f]"
					value="tab2"
				>
					35mm
				</TabTrigger>
			</TabList>
			<TabContent value="tab1">
				<PhotoList
					type={"digital"}
					photos={photos}
					isPending={isPending}
					selectedPhotoId={selectedPhotoId}
					onSelectPhoto={onSelectPhoto}
				/>
			</TabContent>
			<TabContent value="tab2">
				<PhotoList
					type={"35mm"}
					filmPhotos={filmPhotos}
					isPending={isPending}
				/>
			</TabContent>
		</Tabs>
	);
};

export default PhotoTabs;
