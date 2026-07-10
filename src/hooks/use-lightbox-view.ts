"use client";

import type { PointerEvent } from "react";
import { useCallback, useRef, useState } from "react";

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 4;
export const ZOOM_STEP = 0.5;

type PanPosition = {
	x: number;
	y: number;
};

type PointerPosition = {
	x: number;
	y: number;
};

type PinchStart = {
	distance: number;
	midpoint: PointerPosition;
	pan: PanPosition;
	zoom: number;
};

const clampZoom = (value: number) =>
	Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));

export function useLightboxView() {
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState<PanPosition>({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const dragStartRef = useRef<{
		pointerId: number;
		clientX: number;
		clientY: number;
		pan: PanPosition;
	} | null>(null);
	const pointersRef = useRef(new Map<number, PointerPosition>());
	const pinchStartRef = useRef<PinchStart | null>(null);

	const resetView = useCallback(() => {
		dragStartRef.current = null;
		pointersRef.current.clear();
		pinchStartRef.current = null;
		setZoom(1);
		setPan({ x: 0, y: 0 });
		setIsDragging(false);
	}, []);

	const zoomTo = useCallback((nextZoom: number) => {
		const clampedZoom = clampZoom(nextZoom);

		setZoom(clampedZoom);
		if (clampedZoom === ZOOM_MIN) {
			setPan({ x: 0, y: 0 });
		}
	}, []);

	const setInitialZoom = useCallback((nextZoom: number) => {
		setZoom(clampZoom(nextZoom));
	}, []);

	const handlePointerDown = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			pointersRef.current.set(event.pointerId, {
				x: event.clientX,
				y: event.clientY,
			});
			event.currentTarget.setPointerCapture(event.pointerId);

			if (pointersRef.current.size >= 2) {
				const [first, second] = [...pointersRef.current.values()];
				pinchStartRef.current = {
					distance: Math.hypot(second.x - first.x, second.y - first.y),
					midpoint: {
						x: (first.x + second.x) / 2,
						y: (first.y + second.y) / 2,
					},
					pan,
					zoom,
				};
				dragStartRef.current = null;
				setIsDragging(true);
				return;
			}

			if (zoom <= ZOOM_MIN && event.pointerType === "mouse") return;

			dragStartRef.current = {
				pointerId: event.pointerId,
				clientX: event.clientX,
				clientY: event.clientY,
				pan,
			};
			setIsDragging(zoom > ZOOM_MIN);
		},
		[pan, zoom],
	);

	const handlePointerMove = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			pointersRef.current.set(event.pointerId, {
				x: event.clientX,
				y: event.clientY,
			});

			const pinchStart = pinchStartRef.current;
			if (pinchStart && pointersRef.current.size >= 2) {
				const [first, second] = [...pointersRef.current.values()];
				const distance = Math.hypot(second.x - first.x, second.y - first.y);
				const midpoint = {
					x: (first.x + second.x) / 2,
					y: (first.y + second.y) / 2,
				};
				const nextZoom = clampZoom(
					pinchStart.zoom * (distance / Math.max(pinchStart.distance, 1)),
				);

				setZoom(nextZoom);
				setPan({
					x: pinchStart.pan.x + midpoint.x - pinchStart.midpoint.x,
					y: pinchStart.pan.y + midpoint.y - pinchStart.midpoint.y,
				});
				return;
			}

			const dragStart = dragStartRef.current;
			if (
				!dragStart ||
				dragStart.pointerId !== event.pointerId ||
				zoom <= ZOOM_MIN
			)
				return;

			setPan({
				x: dragStart.pan.x + event.clientX - dragStart.clientX,
				y: dragStart.pan.y + event.clientY - dragStart.clientY,
			});
		},
		[zoom],
	);

	const handlePointerEnd = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			pointersRef.current.delete(event.pointerId);

			if (pinchStartRef.current) {
				pinchStartRef.current = null;
				if (pointersRef.current.size === 1) {
					const [pointerId, pointer] = [...pointersRef.current.entries()][0];
					dragStartRef.current = {
						pointerId,
						clientX: pointer.x,
						clientY: pointer.y,
						pan,
					};
					setIsDragging(zoom > ZOOM_MIN);
					return;
				}
			}

			if (dragStartRef.current?.pointerId === event.pointerId) {
				dragStartRef.current = null;
				setIsDragging(false);
			}
		},
		[pan, zoom],
	);

	return {
		handlePointerDown,
		handlePointerEnd,
		handlePointerMove,
		isDragging,
		pan,
		resetView,
		setInitialZoom,
		zoom,
		zoomTo,
	};
}
