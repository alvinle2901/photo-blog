"use client";

import InfiniteScroll from "react-infinite-scroll-component";
import useSWRInfinite from "swr/infinite";

import IconGrid from "@/components/icons/IconGrid";
import ImageSquare from "@/components/images/ImageSquare";
import type { Photo } from "@/photo";
import {
	DEFAULT_RANDOM_SEED,
	type SortOrder,
	type SortType,
} from "@/photo/sort";

const INITIAL_LIMIT = 48;
const PAGE_LIMIT = 32;

type PhotosPage = {
	photos: Photo[];
	hasMore: boolean;
	nextOffset: number;
	limit: number;
};

type InfinitePhotoGridProps = {
	initialPhotos: Photo[];
	initialHasMore: boolean;
	initialNextOffset?: number;
	sortType?: SortType;
	sortOrder?: SortOrder;
	seed?: string;
	collection?: "film" | "year" | "camera";
	film?: string;
	year?: string;
	make?: string;
	model?: string;
	hrefBase?: "default" | "film" | "year" | "camera";
};

const fetcher = async (url: string): Promise<PhotosPage> => {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error("Failed to load photos");
	}

	return response.json();
};

function getPhotoHref({
	photo,
	hrefBase,
	film,
	year,
	make,
	model,
}: {
	photo: Photo;
	hrefBase: InfinitePhotoGridProps["hrefBase"];
	film?: string;
	year?: string;
	make?: string;
	model?: string;
}) {
	if (hrefBase === "film" && film) {
		return `/film/${encodeURIComponent(film)}/${photo.id}`;
	}

	if (hrefBase === "year" && year) {
		return `/year/${encodeURIComponent(year)}/${photo.id}`;
	}

	if (hrefBase === "camera" && make && model) {
		return `/shot-on/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${photo.id}`;
	}

	return `/p/${photo.id}`;
}

export default function InfinitePhotoGrid({
	initialPhotos,
	initialHasMore,
	initialNextOffset = INITIAL_LIMIT,
	sortType = "takenAt",
	sortOrder = "desc",
	seed = DEFAULT_RANDOM_SEED,
	collection,
	film,
	year,
	make,
	model,
	hrefBase = "default",
}: InfinitePhotoGridProps) {
	const fallbackData: PhotosPage[] = [
		{
			photos: initialPhotos,
			hasMore: initialHasMore,
			nextOffset: initialNextOffset,
			limit: INITIAL_LIMIT,
		},
	];

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

			if (collection) params.set("collection", collection);
			if (film) params.set("film", film);
			if (year) params.set("year", year);
			if (make) params.set("make", make);
			if (model) params.set("model", model);

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
				<div className="my-7 flex justify-center">
					<div
						role="status"
						aria-label="Loading more photos"
						className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#d8d1c7] bg-[#f7f5f2] text-[#6f675d]"
					>
						<span className="absolute inset-1 animate-spin rounded-full border border-[#9a7656] border-t-transparent" />
						<IconGrid width={21} includeTitle={false} />
					</div>
				</div>
			}
		>
			{error ? (
				<div className="mx-auto my-7 w-fit rounded-full border border-[#d9b8aa] bg-[#fff7f3] px-4 py-1.5 text-sm text-[#9a4d35]">
					Could not load more photos.
				</div>
			) : null}
			<div className="grid grid-cols-2 gap-1 px-2 sm:grid-cols-4 md:grid-cols-4">
				{photos.map((photo, index) => (
					<ImageSquare
						key={photo.id}
						photo={photo}
						index={index}
						href={getPhotoHref({ photo, hrefBase, film, year, make, model })}
					/>
				))}
			</div>
		</InfiniteScroll>
	);
}
