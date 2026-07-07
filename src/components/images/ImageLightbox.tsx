"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Maximize2, Minus, Plus, RotateCcw, X } from "lucide-react";
import Image from "next/image";
import type { PointerEvent, ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

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

export type LightboxImage = {
	src: string;
	alt: string;
	aspectRatio: number;
	blurData?: string | null;
};

type LightboxContextValue = {
	openLightbox: (image: LightboxImage, zoom?: number) => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

function useLightbox() {
	const context = useContext(LightboxContext);
	if (!context) {
		throw new Error("Lightbox components must be used inside LightboxProvider");
	}
	return context;
}

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

export function LightboxButton({
	image,
	className,
}: {
	image: LightboxImage;
	className?: string;
}) {
	const { openLightbox } = useLightbox();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					aria-label="Open image lightbox"
					onClick={() => openLightbox(image)}
					className={cn(
						"h-8 w-8 rounded-full",
						"text-[#61594f] hover:bg-[#ece7df] hover:text-[#18170f]",
						"focus-visible:ring-[#d8ccbd]",
						className,
					)}
				>
					<Maximize2 className="h-4 w-4" />
				</Button>
			</TooltipTrigger>
			<TooltipContent>Open</TooltipContent>
		</Tooltip>
	);
}

export function LightboxTrigger({
	image,
	children,
	className,
}: {
	image: LightboxImage;
	children: ReactNode;
	className?: string;
}) {
	const { openLightbox } = useLightbox();

	return (
		<button
			type="button"
			aria-label="Open image lightbox"
			className={cn("block w-full cursor-zoom-in text-left", className)}
			onClick={() => openLightbox(image)}
		>
			{children}
		</button>
	);
}

export default function LightboxProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const [image, setImage] = useState<LightboxImage | null>(null);
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState<PanPosition>({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const dragStartRef = useRef<{
		pointerId: number;
		clientX: number;
		clientY: number;
		pan: PanPosition;
	} | null>(null);

	const resetView = () => {
		dragStartRef.current = null;
		setZoom(1);
		setPan({ x: 0, y: 0 });
		setIsDragging(false);
	};

	const openLightbox = (nextImage: LightboxImage, nextZoom = 1) => {
		resetView();
		setImage(nextImage);
		setZoom(clampZoom(nextZoom));
		setOpen(true);
	};

	const closeLightbox = () => {
		setOpen(false);
		resetView();
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

	const optimizedSrc = image ? getOptimizedUrl(image.src, "lg") : "";

	return (
		<TooltipProvider>
			<LightboxContext.Provider value={{ openLightbox }}>
				{children}
				<Dialog.Root
					open={open}
					onOpenChange={(nextOpen) => {
						if (nextOpen) {
							setOpen(true);
						} else {
							closeLightbox();
						}
					}}
				>
					<Dialog.Portal>
						<Dialog.Overlay className="fixed inset-0 z-50 bg-black/95" />
						<Dialog.Content
							data-photo-lightbox-open="true"
							className="fixed inset-0 z-50 overflow-hidden outline-none"
							onOpenAutoFocus={(event) => event.preventDefault()}
						>
							<Dialog.Title className="sr-only">
								{image?.alt || "Image lightbox"}
							</Dialog.Title>
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
								{image ? (
									<div
										className={cn(
											"relative max-h-full max-w-full origin-center touch-none select-none",
											zoom > ZOOM_MIN
												? "cursor-grab active:cursor-grabbing"
												: "cursor-default",
										)}
										onPointerDown={handlePointerDown}
										onPointerMove={handlePointerMove}
										onPointerUp={handlePointerEnd}
										onPointerCancel={handlePointerEnd}
										style={{
											width: "min(96vw, 1600px)",
											aspectRatio: image.aspectRatio,
											transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
											transition: isDragging
												? "none"
												: "transform 150ms ease-out",
										}}
									>
										<Image
											src={optimizedSrc}
											alt={image.alt}
											fill
											priority
											sizes="100vw"
											placeholder={image.blurData ? "blur" : undefined}
											blurDataURL={image.blurData ?? undefined}
											className="object-contain"
										/>
									</div>
								) : null}
							</div>
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>
			</LightboxContext.Provider>
		</TooltipProvider>
	);
}
