"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import useSWRInfinite from "swr/infinite";

import AnimateItems from "@/components/AnimateItems";
import { Icons } from "@/components/icons";
import PhotoLarge from "@/components/images/PhotoLarge";

import type { Photo } from "..";
import PhotoCard from "./Photo";
import PhotoCardLarge from "./PhotoCardLarge";

const INITIAL_LIMIT = 20;
const PAGE_LIMIT = 10;

type PhotosPage = {
	photos: Photo[];
	hasMore: boolean;
	nextOffset: number;
	limit: number;
};

type PhotoListProps = {
	initialPhotos?: Photo[];
	initialHasMore?: boolean;
	initialNextOffset?: number;
};

const fetcher = async (url: string): Promise<PhotosPage> => {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error("Failed to load photos");
	}

	return response.json();
};

const PhotoList = ({
	initialPhotos,
	initialHasMore = true,
	initialNextOffset = INITIAL_LIMIT,
}: PhotoListProps) => {
	const fallbackData: PhotosPage[] | undefined = initialPhotos
		? [
				{
					photos: initialPhotos,
					hasMore: initialHasMore,
					nextOffset: initialNextOffset,
					limit: INITIAL_LIMIT,
				},
			]
		: undefined;

	const { data, error, setSize } = useSWRInfinite<PhotosPage>(
		(pageIndex, previousPageData) => {
			// Page 0 is already covered by fallbackData — don't re-fetch.
			if (pageIndex === 0 && fallbackData) return null;
			if (previousPageData && !previousPageData.hasMore) return null;

			const offset = previousPageData?.nextOffset ?? 0;
			const limit = PAGE_LIMIT;
			return `/api/photos?offset=${offset}&limit=${limit}`;
		},
		fetcher,
		{
			fallbackData,
			revalidateFirstPage: false,
		},
	);

	const photos = data?.flatMap((page) => page.photos) ?? [];
	const lastPage = data?.[data.length - 1];
	const hasMore = lastPage?.hasMore ?? true;
	const loadMore = () => setSize((size) => size + 1);

	return (
		<div className="space-y-4">
			<InfiniteScroll
				dataLength={photos.length}
				next={loadMore}
				hasMore={hasMore}
				loader={
					<div className="flex justify-center border rounded-full mt-7 py-1 mx-[10%]">
						<Icons.loader className="animate-spin" size={18} />
					</div>
				}
			>
				{error ? (
					<div className="mx-[10%] mt-7 rounded-full border py-1 text-center text-sm text-red-500">
						Could not load photos.
					</div>
				) : null}
				<AnimateItems
					// className="space-y-6"
					duration={0.7}
					staggerDelay={0.15}
					distanceOffset={0}
					staggerOnFirstLoadOnly
					items={photos.map((photo, index) => (
						// <PhotoLarge key={photo.id} photo={photo} priority={index <= 1} />
						<PhotoCardLarge photo={photo} />
					))}
				/>
			</InfiniteScroll>
		</div>
	);
};

export default PhotoList;
