"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

export const PHOTO_DETAIL_DIRECTION_KEY = "photo-detail-transition-direction";

export type PhotoDetailDirection = "prev" | "next";

export const setPhotoDetailDirection = (direction: PhotoDetailDirection) => {
	if (typeof window === "undefined") return;
	window.sessionStorage.setItem(PHOTO_DETAIL_DIRECTION_KEY, direction);
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
	const x = direction === "next" ? 24 : direction === "prev" ? -24 : 0;

	return (
		<motion.div
			key={pathname}
			className={className}
			initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
		>
			{children}
		</motion.div>
	);
}
