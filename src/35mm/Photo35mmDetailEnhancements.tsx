"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import type { FilmPhoto } from "@/35mm/query";
import { setPhotoDetailDirection } from "@/photo/components/PhotoDetailTransition";
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
	(image as HTMLImageElement & { fetchPriority?: "high" }).fetchPriority =
		"high";
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
				setPhotoDetailDirection("prev");
				router.prefetch(`/35mm/${prevPhoto.id}`);
				router.push(`/35mm/${prevPhoto.id}`);
			}

			if (event.key === "ArrowRight" && nextPhoto) {
				event.preventDefault();
				setPhotoDetailDirection("next");
				router.prefetch(`/35mm/${nextPhoto.id}`);
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

		nextPhotos.slice(0, 3).forEach((photo) => {
			preloadImage(getOptimizedUrl(photo.url, "lg"));
		});

		nextPhotos.slice(3, 9).forEach((photo) => {
			preloadImage(getOptimizedUrl(photo.url, "md"));
		});
	}, [router, prevPhoto, nextPhoto, nextPhotos]);

	useEffect(() => {
		const onPointerEnter = (event: PointerEvent | FocusEvent) => {
			const link = (event.target as HTMLElement | null)?.closest(
				"[data-preload-image]",
			);
			if (!(link instanceof HTMLElement)) return;

			const href = link.getAttribute("data-prefetch-href");
			const imageUrl = link.getAttribute("data-preload-image");

			if (href) {
				router.prefetch(href);
			}
			preloadImage(imageUrl);
		};

		document.addEventListener("pointerenter", onPointerEnter, true);
		document.addEventListener("focusin", onPointerEnter, true);
		return () => {
			document.removeEventListener("pointerenter", onPointerEnter, true);
			document.removeEventListener("focusin", onPointerEnter, true);
		};
	}, [router]);

	useEffect(() => {
		const onClick = (event: MouseEvent) => {
			const link = (event.target as HTMLElement | null)?.closest(
				"[data-transition-direction]",
			);
			if (!(link instanceof HTMLElement)) return;
			const direction = link.getAttribute("data-transition-direction");
			if (direction === "prev" || direction === "next") {
				setPhotoDetailDirection(direction);
			}
		};

		document.addEventListener("click", onClick, true);
		return () => document.removeEventListener("click", onClick, true);
	}, []);

	return null;
}
