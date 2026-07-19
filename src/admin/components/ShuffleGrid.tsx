"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Icons } from "@/components/icons";
import { getOptimizedUrl } from "@/storage/utils";

export type ShuffleGridPhoto = {
	id: string;
	url: string;
	title: string | null;
	blurData: string | null;
};

type ShuffleGridProps = {
	photos: ShuffleGridPhoto[];
};

const GRID_SIZE = 16;

const seededRandom = (seed: number) => {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
};

const shuffle = (array: ShuffleGridPhoto[], seed = 1) => {
	const shuffled = [...array];
	let currentIndex = shuffled.length;
	let step = 0;

	while (currentIndex !== 0) {
		const randomIndex = Math.floor(seededRandom(seed + step) * currentIndex);
		currentIndex--;
		step++;

		[shuffled[currentIndex], shuffled[randomIndex]] = [
			shuffled[randomIndex],
			shuffled[currentIndex],
		];
	}

	return shuffled;
};

const generateSquares = (squareData: ShuffleGridPhoto[], seed: number) => {
	return shuffle(squareData, seed).map((photo, index) => (
		<motion.div
			key={photo.id}
			layout
			transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
			className="group relative h-full w-full overflow-hidden rounded-[2px] bg-[#ebe7df] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(24,23,15,0.18)]"
		>
			<Link
				href={`/p/${photo.id}`}
				aria-label={photo.title || `Open photo ${index + 1}`}
				className="relative block h-full w-full"
			>
				<span className="pointer-events-none absolute inset-0 z-10 opacity-0 ring-1 ring-inset ring-[#f7f5f2]/80 transition-opacity duration-300 group-hover:opacity-100" />
				<Image
					src={getOptimizedUrl(photo.url, "md")}
					alt={photo.title || `Photo ${index + 1}`}
					fill
					sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, (max-width: 1024px) 33vw, 25vw"
					placeholder={photo.blurData ? "blur" : "empty"}
					blurDataURL={photo.blurData || undefined}
					className="object-cover transition duration-500 group-hover:scale-105 group-hover:brightness-105"
				/>
			</Link>
		</motion.div>
	));
};

export default function ShuffleGrid({ photos }: ShuffleGridProps) {
	const [shuffleSeed, setShuffleSeed] = useState(0);
	const squareData = useMemo(() => {
		if (photos.length === 0) return [];
		return photos.length <= GRID_SIZE
			? photos
			: shuffle(photos, photos.length).slice(0, GRID_SIZE);
	}, [photos]);
	const squares = useMemo(
		() => generateSquares(squareData, shuffleSeed),
		[squareData, shuffleSeed],
	);

	useEffect(() => {
		if (squareData.length === 0) return;

		const interval = setInterval(() => {
			setShuffleSeed((current) => current + 1);
		}, 3600);

		return () => clearInterval(interval);
	}, [squareData.length]);

	if (photos.length === 0) {
		return (
			<div className="flex h-full min-h-[450px] w-full items-center justify-center rounded-sm border border-[#e5e0d9] bg-[#f7f5f2] text-sm text-[#8c857a]">
				No photos yet.
			</div>
		);
	}

	if (squares.length === 0) {
		return (
			<div className="flex h-full min-h-[450px] w-full items-center justify-center rounded-sm border border-[#e5e0d9] bg-[#f7f5f2]">
				<Icons.loader className="animate-spin" />
			</div>
		);
	}

	return (
		<section className="flex h-full min-h-[450px] w-full flex-col overflow-hidden rounded-sm border border-[#e5e0d9] bg-[#f7f5f2] p-2 shadow-sm">
			<div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-4 gap-1">
				{squares}
			</div>
		</section>
	);
}
