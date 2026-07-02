"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import useSWRInfinite from "swr/infinite";

import { Icons } from "@/components/icons";
import ImageSquare from "@/components/images/ImageSquare";
import type { Photo } from "@/photo";

type SortType = "createdAt" | "takenAt" | "title";
type SortOrder = "asc" | "desc";

const PAGE_LIMIT = 40;

type PhotosPage = {
	photos: Photo[];
	hasMore: boolean;
	nextOffset: number;
	limit: number;
};

const fetcher = async (url: string): Promise<PhotosPage> => {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error("Failed to load grid photos");
	}

	return response.json();
};

export default function PhotoGridInfinite({
	initialPhotos,
	initialHasMore,
	initialNextOffset,
	sortType,
	sortOrder,
}: {
	initialPhotos: Photo[];
	initialHasMore: boolean;
	initialNextOffset: number;
	sortType: SortType;
	sortOrder: SortOrder;
}) {
	const fallbackData: PhotosPage[] = [
		{
			photos: initialPhotos,
			hasMore: initialHasMore,
			nextOffset: initialNextOffset,
			limit: initialPhotos.length,
		},
	];

	const { data, error, setSize } = useSWRInfinite<PhotosPage>(
		(_pageIndex, previousPageData) => {
			if (previousPageData && !previousPageData.hasMore) return null;

			const offset = previousPageData?.nextOffset ?? 0;
			const params = new URLSearchParams({
				offset: String(offset),
				limit: String(PAGE_LIMIT),
				sortType,
				sortOrder,
			});

			return `/api/photos?${params.toString()}`;
		},
		fetcher,
		{
			fallbackData,
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
				<div className="col-span-full flex justify-center py-6">
					<Icons.loader className="animate-spin text-[#8f877c]" size={18} />
				</div>
			}
			className="grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-2 md:grid-cols-4"
		>
			{photos.map((photo, index) => (
				<ImageSquare key={photo.id} photo={photo} index={index} />
			))}
			{error ? (
				<div className="col-span-full py-4 text-center text-sm text-red-500">
					Could not load more photos.
				</div>
			) : null}
		</InfiniteScroll>
	);
}
