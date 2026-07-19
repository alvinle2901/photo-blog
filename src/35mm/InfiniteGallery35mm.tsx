"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import useSWRInfinite from "swr/infinite";

import Gallery35mm, { type Gallery35mmPhoto } from "@/35mm/Gallery35mm";
import { Icons } from "@/components/icons";

const INITIAL_LIMIT = 24;
const PAGE_LIMIT = 18;

type FilmPhotosPage = {
	photos: Gallery35mmPhoto[];
	hasMore: boolean;
	nextOffset: number;
	limit: number;
};

type InfiniteGallery35mmProps = {
	initialPhotos: Gallery35mmPhoto[];
	initialHasMore: boolean;
	initialNextOffset?: number;
};

const fetcher = async (url: string): Promise<FilmPhotosPage> => {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error("Failed to load 35mm photos");
	}

	return response.json();
};

export default function InfiniteGallery35mm({
	initialPhotos,
	initialHasMore,
	initialNextOffset = INITIAL_LIMIT,
}: InfiniteGallery35mmProps) {
	const { data, error, setSize } = useSWRInfinite<FilmPhotosPage>(
		(pageIndex, previousPageData) => {
			if (previousPageData && !previousPageData.hasMore) return null;

			const offset = pageIndex === 0 ? 0 : (previousPageData?.nextOffset ?? 0);
			const limit = pageIndex === 0 ? INITIAL_LIMIT : PAGE_LIMIT;
			const params = new URLSearchParams({
				offset: String(offset),
				limit: String(limit),
			});

			return `/api/photos/35mm?${params.toString()}`;
		},
		fetcher,
		{
			fallbackData: [
				{
					photos: initialPhotos,
					hasMore: initialHasMore,
					nextOffset: initialNextOffset,
					limit: INITIAL_LIMIT,
				},
			],
			revalidateFirstPage: false,
		},
	);

	const photos = data?.flatMap((page) => page.photos) ?? [];
	const lastPage = data?.[data.length - 1];
	const hasMore = lastPage?.hasMore ?? initialHasMore;

	return (
		<InfiniteScroll
			dataLength={photos.length}
			next={() => setSize((size) => size + 1)}
			hasMore={hasMore}
			loader={
				<div className="mx-auto my-7 flex w-fit items-center gap-2 rounded-full border border-[#e5e0d9] bg-[#f7f5f2] px-4 py-1.5 text-sm text-[#8c857a]">
					<Icons.loader className="animate-spin" size={16} />
					Loading scans
				</div>
			}
		>
			{error ? (
				<div className="mx-auto my-7 w-fit rounded-full border border-[#d9b8aa] bg-[#fff7f3] px-4 py-1.5 text-sm text-[#9a4d35]">
					Could not load more scans.
				</div>
			) : null}
			<Gallery35mm filmPhotos={photos} />
		</InfiniteScroll>
	);
}
