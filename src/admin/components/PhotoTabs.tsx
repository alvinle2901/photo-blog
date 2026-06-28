"use client";

import { TabContent, TabList, Tabs, TabTrigger } from "@/components/ui/Tabs";
import type { Photo } from "@/photo";
import type { FilmPhoto } from "@/35mm/query";

import PhotoList from "./PhotoList";

interface Props {
	photos: Photo[];
	filmPhotos: FilmPhoto[];
	isPending: boolean;
}

const PhotoTabs = ({ photos, filmPhotos, isPending }: Props) => {
	return (
		<Tabs className="flex-col" defaultValue="tab1">
			<TabList
				className="flex shrink-0 space-x-8 px-6 text-gray-500 tracking-[0.04em]"
				aria-label="Manage images"
				style={{ fontFamily: "'DM Mono', monospace" }}
			>
				<TabTrigger
					className="flex py-5 cursor-pointer select-none items-center justify-center text-[15px] leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-[#18170f] data-[state=active]:text-[#18170f] data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current"
					value="tab1"
				>
					digital
				</TabTrigger>
				<TabTrigger
					className="flex cursor-pointer select-none items-center justify-center text-[15px] leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-[#18170f] data-[state=active]:text-[#18170f] data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current"
					value="tab2"
				>
					35mm
				</TabTrigger>
				{/* <TabTrigger
          className="flex h-[45px] flex-1 cursor-pointer select-none items-center justify-center bg-white px-5 text-[15px] leading-none outline-none first:rounded-tl-md last:rounded-tr-md hover:text-sky-500 data-[state=active]:text-sky-500 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current"
          value="tab3"
        >
          Polaroid
        </TabTrigger> */}
			</TabList>
			<TabContent value="tab1">
				<PhotoList type={"digital"} photos={photos} isPending={isPending} />
			</TabContent>
			<TabContent value="tab2">
				<PhotoList
					type={"35mm"}
					filmPhotos={filmPhotos}
					isPending={isPending}
				/>
			</TabContent>
			{/* <TabContent value="tab3"><PhotoList /></TabContent> */}
		</Tabs>
	);
};

export default PhotoTabs;
