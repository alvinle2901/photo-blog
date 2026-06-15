"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Photo } from "@/photo";
import { getOptimizedUrl } from "@/storage/utils";

const shouldIgnoreKeydown = (target: EventTarget | null) => {
	const el = target as HTMLElement | null;
	if (!el) return false;
	const tagName = el.tagName?.toLowerCase();
	return (
		tagName === "input" ||
		tagName === "textarea" ||
		tagName === "select" ||
		el.isContentEditable
	);
};

const preloadImage = (url: string | null | undefined) => {
	if (!url) return;
	const image = new window.Image();
	image.decoding = "async";
	image.src = url;
};

export default function PhotoDetailEnhancements({
	prevPhoto,
	nextPhoto,
	nextPhotos,
}: {
	prevPhoto: Photo | null;
	nextPhoto: Photo | null;
	nextPhotos: Photo[];
}) {
	const router = useRouter();

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (shouldIgnoreKeydown(event.target)) return;

			if (event.key === "ArrowLeft" && prevPhoto) {
				event.preventDefault();
				router.push(`/p/${prevPhoto.id}`);
			}

			if (event.key === "ArrowRight" && nextPhoto) {
				event.preventDefault();
				router.push(`/p/${nextPhoto.id}`);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [router, prevPhoto, nextPhoto]);

	useEffect(() => {
		preloadImage(prevPhoto ? getOptimizedUrl(prevPhoto.url, "lg") : null);
		preloadImage(nextPhoto ? getOptimizedUrl(nextPhoto.url, "lg") : null);

		// Preload a few upcoming thumbnails to warm browser cache
		nextPhotos
			.slice(0, 6)
			.forEach((photo) => preloadImage(getOptimizedUrl(photo.url, "md")));
	}, [prevPhoto, nextPhoto, nextPhotos]);

	return null;
}
