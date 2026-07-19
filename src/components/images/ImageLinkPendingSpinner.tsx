"use client";

import { useLinkStatus } from "next/link";

import { cn } from "@/utils/cn";

export default function ImageLinkPendingSpinner() {
	const { pending } = useLinkStatus();

	return (
		<span
			role="status"
			aria-label="Loading photo"
			className={cn(
				"pointer-events-none absolute left-1/2 top-1/2 z-20 inline-flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8d0c5]/80 bg-[#f7f5f2]/90 shadow-sm backdrop-blur-[2px] transition-opacity",
				pending ? "opacity-100" : "opacity-0",
			)}
		>
			<span className="size-4 animate-spin rounded-full border border-[#8f877c] border-t-transparent" />
		</span>
	);
}
