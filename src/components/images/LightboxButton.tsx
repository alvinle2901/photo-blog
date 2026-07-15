"use client";

import { Expand } from "lucide-react";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/Tooltip";
import { type LightboxImage,useLightbox } from "@/providers/lightbox";
import { cn } from "@/utils/cn";

export function LightboxButton({
	className,
	image,
}: {
	image: LightboxImage;
	className?: string;
}) {
	const { openLightbox } = useLightbox();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label="Open image lightbox"
					onClick={() => openLightbox(image)}
					className={cn("cursor-pointer hover:text-gray-500", className)}
				>
					<Expand className="h-4 w-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent>zoom in</TooltipContent>
		</Tooltip>
	);
}
