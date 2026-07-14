"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import type { Photo } from "@/photo";
import {
	setPhotoDetailDirection,
	startPhotoDetailNavigation,
} from "@/photo/components/PhotoDetailTransition";
import { getOptimizedUrl } from "@/storage/utils";

const shouldIgnoreKeydown = (target: EventTarget | null) => {
	if (document.body.dataset.photoLightboxOpen === "true") return true;

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

export default function PhotoDetailEnhancements({
	prevPhoto,
	nextPhoto,
	nextPhotos,
	prevHref,
	nextHref,
}: {
	prevPhoto: Photo | null;
	nextPhoto: Photo | null;
	nextPhotos: Photo[];
	prevHref: string | null;
	nextHref: string | null;
}) {
	const router = useRouter();
	const swipeStart = useRef<{ x: number; y: number } | null>(null);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (shouldIgnoreKeydown(event.target)) return;

			if (event.key === "ArrowLeft" && prevHref) {
				event.preventDefault();
				startPhotoDetailNavigation();
				setPhotoDetailDirection("prev");
				router.prefetch(prevHref);
				router.push(prevHref);
			}

			if (event.key === "ArrowRight" && nextHref) {
				event.preventDefault();
				startPhotoDetailNavigation();
				setPhotoDetailDirection("next");
				router.prefetch(nextHref);
				router.push(nextHref);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [router, prevHref, nextHref]);

	useEffect(() => {
		preloadImage(prevPhoto ? getOptimizedUrl(prevPhoto.url, "lg") : null);
		preloadImage(nextPhoto ? getOptimizedUrl(nextPhoto.url, "lg") : null);

		if (prevHref) {
			router.prefetch(prevHref);
		}

		if (nextHref) {
			router.prefetch(nextHref);
		}

		// Warm a few full-size next images for fast keyboard/link navigation.
		nextPhotos.slice(0, 3).forEach((photo) => {
			preloadImage(getOptimizedUrl(photo.url, "lg"));
		});

		// Preload additional upcoming thumbnails for the related grid.
		nextPhotos.slice(3, 9).forEach((photo) => {
			preloadImage(getOptimizedUrl(photo.url, "md"));
		});
	}, [router, prevPhoto, nextPhoto, nextPhotos, prevHref, nextHref]);

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

			if (horizontalDistance > 0 && prevHref) {
				event.preventDefault();
				startPhotoDetailNavigation();
				setPhotoDetailDirection("prev");
				router.push(prevHref);
			}

			if (horizontalDistance < 0 && nextHref) {
				event.preventDefault();
				startPhotoDetailNavigation();
				setPhotoDetailDirection("next");
				router.push(nextHref);
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
	}, [router, prevHref, nextHref]);

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
