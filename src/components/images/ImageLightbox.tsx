"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Plus, RotateCcw, X, ZoomIn } from "lucide-react";
import Image from "next/image";
import type { PointerEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/Tooltip";
import { getOptimizedUrl } from "@/storage/utils";
import { cn } from "@/utils/cn";

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.5;

const clampZoom = (value: number) =>
	Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));

type PanPosition = {
	x: number;
	y: number;
};

function IconButton({
	label,
	children,
	onClick,
	disabled,
}: {
	label: string;
	children: ReactNode;
	onClick?: () => void;
	disabled?: boolean;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					aria-label={label}
					onClick={onClick}
					disabled={disabled}
					className="h-10 w-10 rounded-full border border-white/15 bg-black/45 text-white shadow-sm backdrop-blur-md hover:bg-black/70 hover:text-white focus-visible:ring-white/70 focus-visible:ring-offset-0"
				>
					{children}
				</Button>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}

export default function ImageLightbox({
	children,
	src,
	alt,
	aspectRatio,
	blurData,
}: {
	children: ReactNode;
	src: string;
	alt: string;
	aspectRatio: number;
	blurData?: string | null;
}) {
	const [open, setOpen] = useState(false);
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState<PanPosition>({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const dragStartRef = useRef<{
		pointerId: number;
		clientX: number;
		clientY: number;
		pan: PanPosition;
	} | null>(null);
	const optimizedSrc = getOptimizedUrl(src, "lg");

	const resetView = () => {
		dragStartRef.current = null;
		setZoom(1);
		setPan({ x: 0, y: 0 });
		setIsDragging(false);
	};

	const openAtZoom = (nextZoom = 1) => {
		dragStartRef.current = null;
		setPan({ x: 0, y: 0 });
		setIsDragging(false);
		setZoom(clampZoom(nextZoom));
		setOpen(true);
	};

	const zoomTo = (nextZoom: number) => {
		const clampedZoom = clampZoom(nextZoom);

		setZoom(clampedZoom);
		if (clampedZoom === ZOOM_MIN) {
			setPan({ x: 0, y: 0 });
		}
	};

	const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
		if (zoom <= ZOOM_MIN) return;

		event.currentTarget.setPointerCapture(event.pointerId);
		dragStartRef.current = {
			pointerId: event.pointerId,
			clientX: event.clientX,
			clientY: event.clientY,
			pan,
		};
		setIsDragging(true);
	};

	const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
		const dragStart = dragStartRef.current;
		if (!dragStart || dragStart.pointerId !== event.pointerId) return;

		setPan({
			x: dragStart.pan.x + event.clientX - dragStart.clientX,
			y: dragStart.pan.y + event.clientY - dragStart.clientY,
		});
	};

	const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
		if (dragStartRef.current?.pointerId === event.pointerId) {
			dragStartRef.current = null;
			setIsDragging(false);
		}
	};

	useEffect(() => {
		document.body.dataset.photoLightboxOpen = open ? "true" : "false";

		return () => {
			delete document.body.dataset.photoLightboxOpen;
		};
	}, [open]);

	return (
		<TooltipProvider>
			<Dialog.Root
				open={open}
				onOpenChange={(nextOpen) => {
					setOpen(nextOpen);
					if (!nextOpen) {
						resetView();
					}
				}}
			>
				<div className="group relative">
					<Dialog.Trigger asChild>
						<button
							type="button"
							aria-label="Open image lightbox"
							className="block w-full cursor-zoom-in text-left"
						>
							{children}
						</button>
					</Dialog.Trigger>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label="Zoom in"
								onClick={() => openAtZoom(2)}
								className={cn(
									"absolute right-3 top-3 h-10 w-10 rounded-full",
									"border border-black/10 bg-white/80 text-[#18170f] shadow-sm backdrop-blur-md",
									"opacity-0 transition-opacity hover:bg-white",
									"focus-visible:opacity-100 group-hover:opacity-100",
								)}
							>
								<ZoomIn className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Zoom in</TooltipContent>
					</Tooltip>
				</div>

				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-50 bg-black/95" />
					<Dialog.Content
						data-photo-lightbox-open="true"
						className="fixed inset-0 z-50 overflow-hidden outline-none"
						onOpenAutoFocus={(event) => event.preventDefault()}
					>
						<Dialog.Title className="sr-only">{alt}</Dialog.Title>
						<div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2">
							<IconButton
								label="Zoom out"
								onClick={() => zoomTo(zoom - ZOOM_STEP)}
								disabled={zoom <= ZOOM_MIN}
							>
								<Minus className="h-4 w-4" />
							</IconButton>
							<IconButton label="Reset zoom" onClick={resetView}>
								<RotateCcw className="h-4 w-4" />
							</IconButton>
							<IconButton
								label="Zoom in"
								onClick={() => zoomTo(zoom + ZOOM_STEP)}
								disabled={zoom >= ZOOM_MAX}
							>
								<Plus className="h-4 w-4" />
							</IconButton>
						</div>
						<Dialog.Close asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label="Close lightbox"
								className="absolute right-4 top-4 z-10 h-10 w-10 rounded-full border border-white/15 bg-black/45 text-white shadow-sm backdrop-blur-md hover:bg-black/70 hover:text-white focus-visible:ring-white/70 focus-visible:ring-offset-0"
							>
								<X className="h-5 w-5" />
							</Button>
						</Dialog.Close>

						<div className="flex h-full w-full items-center justify-center overflow-hidden p-4 pt-20">
							<div
								className={cn(
									"relative max-h-full max-w-full origin-center touch-none select-none",
									zoom > ZOOM_MIN ? "cursor-grab active:cursor-grabbing" : "cursor-default",
								)}
								onPointerDown={handlePointerDown}
								onPointerMove={handlePointerMove}
								onPointerUp={handlePointerEnd}
								onPointerCancel={handlePointerEnd}
								style={{
									width: "min(96vw, 1600px)",
									aspectRatio,
									transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
									transition: isDragging ? "none" : "transform 150ms ease-out",
								}}
							>
								<Image
									src={optimizedSrc}
									alt={alt}
									fill
									priority
									sizes="100vw"
									placeholder={blurData ? "blur" : undefined}
									blurDataURL={blurData ?? undefined}
									className="object-contain"
								/>
							</div>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</TooltipProvider>
	);
}
