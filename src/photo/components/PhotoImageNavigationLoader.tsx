"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { PHOTO_DETAIL_NAVIGATION_START_EVENT } from "@/photo/components/PhotoDetailTransition";

export default function PhotoImageNavigationLoader() {
	const pathname = usePathname();
	const [isNavigating, setIsNavigating] = useState(false);

	useEffect(() => {
		const showNavigationLoader = () => setIsNavigating(true);
		window.addEventListener(
			PHOTO_DETAIL_NAVIGATION_START_EVENT,
			showNavigationLoader,
		);
		return () =>
			window.removeEventListener(
				PHOTO_DETAIL_NAVIGATION_START_EVENT,
				showNavigationLoader,
			);
	}, []);

	useEffect(() => {
		const resetLoader = window.setTimeout(() => setIsNavigating(false), 0);
		return () => window.clearTimeout(resetLoader);
	}, [pathname]);

	if (!isNavigating) return null;

	return (
		<span
			role="status"
			aria-label="Loading photo"
			className="pointer-events-none absolute left-1/2 top-1/2 z-20 inline-flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8d0c5]/80 bg-[#f7f5f2]/85 backdrop-blur-[2px]"
		>
			<span className="size-2.5 animate-spin rounded-full border border-[#8f877c] border-t-transparent" />
		</span>
	);
}
