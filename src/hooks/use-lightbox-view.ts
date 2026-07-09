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

	const resetView = useCallback(() => {
		dragStartRef.current = null;
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
			if (zoom <= ZOOM_MIN) return;

			event.currentTarget.setPointerCapture(event.pointerId);
			dragStartRef.current = {
				pointerId: event.pointerId,
				clientX: event.clientX,
				clientY: event.clientY,
				pan,
			};
			setIsDragging(true);
		},
		[pan, zoom],
	);

	const handlePointerMove = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			const dragStart = dragStartRef.current;
			if (!dragStart || dragStart.pointerId !== event.pointerId) return;

			setPan({
				x: dragStart.pan.x + event.clientX - dragStart.clientX,
				y: dragStart.pan.y + event.clientY - dragStart.clientY,
			});
		},
		[],
	);

	const handlePointerEnd = useCallback(
		(event: PointerEvent<HTMLDivElement>) => {
			if (dragStartRef.current?.pointerId === event.pointerId) {
				dragStartRef.current = null;
				setIsDragging(false);
			}
		},
		[],
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
