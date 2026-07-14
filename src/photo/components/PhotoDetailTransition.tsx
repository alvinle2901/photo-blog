"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

export const PHOTO_DETAIL_DIRECTION_KEY = "photo-detail-transition-direction";
export const PHOTO_DETAIL_NAVIGATION_START_EVENT =
	"photo-detail-navigation-start";

export type PhotoDetailDirection = "prev" | "next";

export const setPhotoDetailDirection = (direction: PhotoDetailDirection) => {
	if (typeof window === "undefined") return;
	window.sessionStorage.setItem(PHOTO_DETAIL_DIRECTION_KEY, direction);
};

export const startPhotoDetailNavigation = () => {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new Event(PHOTO_DETAIL_NAVIGATION_START_EVENT));
};

const readPhotoDetailDirection = (): PhotoDetailDirection | null => {
	if (typeof window === "undefined") return null;
	const direction = window.sessionStorage.getItem(PHOTO_DETAIL_DIRECTION_KEY);
	window.sessionStorage.removeItem(PHOTO_DETAIL_DIRECTION_KEY);
	return direction === "prev" || direction === "next" ? direction : null;
};

export default function PhotoDetailTransition({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const pathname = usePathname();
	const prefersReducedMotion = useReducedMotion();
	const [direction] = useState(readPhotoDetailDirection);
	const x = direction === "next" ? 56 : direction === "prev" ? -56 : 0;
	const initial = prefersReducedMotion
		? { opacity: 0 }
		: { opacity: 0, x, scale: direction ? 0.985 : 1 };

	return (
		<motion.div
			key={pathname}
			className={className}
			initial={initial}
			animate={{ opacity: 1, x: 0, scale: 1 }}
			transition={{
				duration: direction ? 0.38 : 0.5,
				ease: [0.22, 1, 0.36, 1],
			}}
		>
			{children}
		</motion.div>
	);
}
