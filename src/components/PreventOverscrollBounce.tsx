"use client";

import { useEffect, useRef } from "react";

function isScrollable(element: Element) {
	const style = window.getComputedStyle(element);
	const overflowY = style.overflowY;

	return (
		/(auto|scroll|overlay)/.test(overflowY) &&
		element.scrollHeight > element.clientHeight
	);
}

function findScrollableAncestor(target: EventTarget | null) {
	if (!(target instanceof Element)) return null;

	let element: Element | null = target;
	while (element && element !== document.body) {
		if (isScrollable(element)) return element;
		element = element.parentElement;
	}

	return null;
}

function isAtPageEdge(deltaY: number) {
	const documentElement = document.documentElement;
	const scrollTop = window.scrollY || documentElement.scrollTop;
	const maxScrollTop = documentElement.scrollHeight - window.innerHeight;

	return (
		(deltaY > 0 && scrollTop <= 0) ||
		(deltaY < 0 && scrollTop >= maxScrollTop - 1)
	);
}

export default function PreventOverscrollBounce() {
	const startPoint = useRef<{ x: number; y: number } | null>(null);

	useEffect(() => {
		const onTouchStart = (event: TouchEvent) => {
			const touch = event.touches[0];
			if (!touch) return;

			startPoint.current = { x: touch.clientX, y: touch.clientY };
		};

		const onTouchMove = (event: TouchEvent) => {
			const start = startPoint.current;
			const touch = event.touches[0];
			if (!start || !touch) return;

			const deltaX = touch.clientX - start.x;
			const deltaY = touch.clientY - start.y;

			if (Math.abs(deltaX) > Math.abs(deltaY)) return;

			const scrollableAncestor = findScrollableAncestor(event.target);
			if (scrollableAncestor) {
				const atTop = scrollableAncestor.scrollTop <= 0;
				const atBottom =
					scrollableAncestor.scrollTop + scrollableAncestor.clientHeight >=
					scrollableAncestor.scrollHeight - 1;

				if ((deltaY > 0 && atTop) || (deltaY < 0 && atBottom)) {
					event.preventDefault();
				}
				return;
			}

			if (isAtPageEdge(deltaY)) {
				event.preventDefault();
			}
		};

		const resetTouch = () => {
			startPoint.current = null;
		};

		document.addEventListener("touchstart", onTouchStart, { passive: true });
		document.addEventListener("touchmove", onTouchMove, { passive: false });
		document.addEventListener("touchend", resetTouch, { passive: true });
		document.addEventListener("touchcancel", resetTouch, { passive: true });

		return () => {
			document.removeEventListener("touchstart", onTouchStart);
			document.removeEventListener("touchmove", onTouchMove);
			document.removeEventListener("touchend", resetTouch);
			document.removeEventListener("touchcancel", resetTouch);
		};
	}, []);

	return null;
}
