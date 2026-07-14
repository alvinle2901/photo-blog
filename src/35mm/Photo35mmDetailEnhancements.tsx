"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import type { FilmPhoto } from "@/35mm/query";
import {
	setPhotoDetailDirection,
	startPhotoDetailNavigation,
} from "@/photo/components/PhotoDetailTransition";
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
	const swipeStart = useRef<{ x: number; y: number } | null>(null);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (shouldIgnoreKeydown(event.target)) return;

			if (event.key === "ArrowLeft" && prevPhoto) {
				event.preventDefault();
				startPhotoDetailNavigation();
				setPhotoDetailDirection("prev");
				router.prefetch(`/35mm/${prevPhoto.id}`);
				router.push(`/35mm/${prevPhoto.id}`);
			}

			if (event.key === "ArrowRight" && nextPhoto) {
				event.preventDefault();
				startPhotoDetailNavigation();
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
		const onTouchStart = (event: TouchEvent) => {
			if (
				!window.matchMedia("(max-width: 767px)").matches ||
				document.body.dataset.photoLightboxOpen === "true" ||
				event.touches.length !== 1 ||
				!(event.target instanceof Element) ||
				!event.target.closest("[data-photo-navigation-surface]")
			)
				return;

			const [touch] = event.touches;
			swipeStart.current = { x: touch.clientX, y: touch.clientY };
		};

		const onTouchEnd = (event: TouchEvent) => {
			const start = swipeStart.current;
			swipeStart.current = null;
			const [touch] = event.changedTouches;
			if (!start || !touch) return;

			const horizontalDistance = touch.clientX - start.x;
			const verticalDistance = touch.clientY - start.y;
			if (
				Math.abs(horizontalDistance) < 72 ||
				Math.abs(horizontalDistance) <= Math.abs(verticalDistance)
			)
				return;

			if (horizontalDistance > 0 && prevPhoto) {
				event.preventDefault();
				startPhotoDetailNavigation();
				setPhotoDetailDirection("prev");
				router.push(`/35mm/${prevPhoto.id}`);
			}

			if (horizontalDistance < 0 && nextPhoto) {
				event.preventDefault();
				startPhotoDetailNavigation();
				setPhotoDetailDirection("next");
				router.push(`/35mm/${nextPhoto.id}`);
			}
		};

		const resetSwipe = () => {
			swipeStart.current = null;
		};

		document.addEventListener("touchstart", onTouchStart, true);
		document.addEventListener("touchend", onTouchEnd, {
			capture: true,
			passive: false,
		});
		document.addEventListener("touchcancel", resetSwipe, true);
		return () => {
			document.removeEventListener("touchstart", onTouchStart, true);
			document.removeEventListener("touchend", onTouchEnd, true);
			document.removeEventListener("touchcancel", resetSwipe, true);
		};
	}, [router, prevPhoto, nextPhoto]);

	useEffect(() => {
		const onPointerEnter = (event: PointerEvent | FocusEvent) => {
			if (!(event.target instanceof Element)) return;

			const link = event.target.closest("[data-preload-image]");
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
			if (!(event.target instanceof Element)) return;

			const link = event.target.closest("[data-transition-direction]");
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
