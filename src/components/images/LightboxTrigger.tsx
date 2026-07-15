"use client";

import type { ReactNode } from "react";

import { type LightboxImage,useLightbox } from "@/providers/lightbox";
import { cn } from "@/utils/cn";

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
