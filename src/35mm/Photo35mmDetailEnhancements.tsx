"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { FilmPhoto } from "@/35mm/query";
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

export default function Photo35mmDetailEnhancements({
	prevPhoto,
	nextPhoto,
	nextPhotos,
}: {
	prevPhoto: FilmPhoto | null;
	nextPhoto: FilmPhoto | null;
	nextPhotos: FilmPhoto[];
}) {
	const router = useRouter();

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (shouldIgnoreKeydown(event.target)) return;

			if (event.key === "ArrowLeft" && prevPhoto) {
				event.preventDefault();
				router.push(`/35mm/${prevPhoto.id}`);
			}

			if (event.key === "ArrowRight" && nextPhoto) {
				event.preventDefault();
				router.push(`/35mm/${nextPhoto.id}`);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [router, prevPhoto, nextPhoto]);

	useEffect(() => {
		preloadImage(prevPhoto ? getOptimizedUrl(prevPhoto.url, "lg") : null);
		preloadImage(nextPhoto ? getOptimizedUrl(nextPhoto.url, "lg") : null);

		if (prevPhoto) {
			router.prefetch(`/35mm/${prevPhoto.id}`);
		}

		if (nextPhoto) {
			router.prefetch(`/35mm/${nextPhoto.id}`);
		}

		nextPhotos.slice(0, 6).forEach((photo) => {
			preloadImage(getOptimizedUrl(photo.url, "md"));
		});
	}, [router, prevPhoto, nextPhoto, nextPhotos]);

	return null;
}
