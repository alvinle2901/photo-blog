"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Plus, RotateCcw, X } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { LightboxIconButton } from "@/components/images/LightboxControls";
import { Button } from "@/components/ui/Button";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { useBodyLightboxState } from "@/hooks/use-body-lightbox-state";
import {
	useLightboxView,
	ZOOM_MAX,
	ZOOM_MIN,
	ZOOM_STEP,
} from "@/hooks/use-lightbox-view";
import { cn } from "@/utils/cn";

import { LightboxContext, type LightboxImage } from ".";

export default function LightboxProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);
	const [image, setImage] = useState<LightboxImage | null>(null);
	const prefersReducedMotion = useReducedMotion();
	const {
		handlePointerDown,
		handlePointerEnd,
		handlePointerMove,
		isDragging,
		pan,
		resetView,
		setInitialZoom,
		zoom,
		zoomTo,
	} = useLightboxView();

	useBodyLightboxState(open);

	const openLightbox = useCallback(
		(nextImage: LightboxImage, nextZoom = 1) => {
			resetView();
			setImage(nextImage);
			setInitialZoom(nextZoom);
			setOpen(true);
		},
		[resetView, setInitialZoom],
	);

	const closeLightbox = useCallback(() => {
		setOpen(false);
		resetView();
	}, [resetView]);

	const contextValue = useMemo(() => ({ openLightbox }), [openLightbox]);

	return (
		<TooltipProvider>
			<LightboxContext.Provider value={contextValue}>
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
					<AnimatePresence>
						{open && (
							<Dialog.Portal forceMount>
								<Dialog.Overlay asChild forceMount>
									<motion.div
										className="fixed inset-0 z-50 bg-black/95"
										initial={prefersReducedMotion ? false : { opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.2, ease: "easeOut" }}
									/>
								</Dialog.Overlay>
								<Dialog.Content
									asChild
									forceMount
									onOpenAutoFocus={(event) => event.preventDefault()}
								>
									<motion.div
										data-photo-lightbox-open="true"
										className="fixed inset-0 z-50 overflow-hidden outline-none"
										initial={
											prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }
										}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ duration: 0.2, ease: "easeOut" }}
									>
										<Dialog.Title className="sr-only">
											{image?.alt || "Image lightbox"}
										</Dialog.Title>
										<div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2">
											<LightboxIconButton
												label="Zoom out"
												onClick={() => zoomTo(zoom - ZOOM_STEP)}
												disabled={zoom <= ZOOM_MIN}
											>
												<Minus className="h-4 w-4" />
											</LightboxIconButton>
											<LightboxIconButton
												label="Reset zoom"
												onClick={resetView}
											>
												<RotateCcw className="h-4 w-4" />
											</LightboxIconButton>
											<LightboxIconButton
												label="Zoom in"
												onClick={() => zoomTo(zoom + ZOOM_STEP)}
												disabled={zoom >= ZOOM_MAX}
											>
												<Plus className="h-4 w-4" />
											</LightboxIconButton>
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
														src={image.src}
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
									</motion.div>
								</Dialog.Content>
							</Dialog.Portal>
						)}
					</AnimatePresence>
				</Dialog.Root>
			</LightboxContext.Provider>
		</TooltipProvider>
	);
}
