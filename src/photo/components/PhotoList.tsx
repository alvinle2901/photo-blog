"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import useSWRInfinite from "swr/infinite";

import AnimateItems from "@/components/AnimateItems";
import { Icons } from "@/components/icons";
import PhotoLarge from "@/components/images/PhotoLarge";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { SortOrder, SortType } from "@/photo/sort";

import type { Photo } from "..";
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
	sortType: SortType;
	sortOrder: SortOrder;
	seed: string;
};

const DESKTOP_PHOTO_LIST_QUERY = "(min-width: 1024px)";

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
	sortType,
	sortOrder,
	seed,
}: PhotoListProps) => {
	const isDesktop = useMediaQuery(DESKTOP_PHOTO_LIST_QUERY);
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
			if (previousPageData && !previousPageData.hasMore) return null;

			const offset = pageIndex === 0 ? 0 : (previousPageData?.nextOffset ?? 0);
			const limit = pageIndex === 0 ? INITIAL_LIMIT : PAGE_LIMIT;
			const params = new URLSearchParams({
				offset: String(offset),
				limit: String(limit),
				sortType,
				sortOrder,
				seed,
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
	const hasMore = lastPage?.hasMore ?? true;
	const loadMore = () => setSize((size) => size + 1);

	return (
		<div className="space-y-4 mx-3 lg:mx-0">
			<InfiniteScroll
				key={`${sortType}-${sortOrder}-${seed}`}
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
					items={photos.map((photo) =>
						isDesktop ? (
							<PhotoCardLarge key={photo.id} photo={photo} />
						) : (
							<PhotoLarge key={photo.id} photo={photo} />
						),
					)}
				/>
			</InfiniteScroll>
		</div>
	);
};

export default PhotoList;
