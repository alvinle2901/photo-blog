"use client";

import { useEffect, useRef, useState } from "react";

import PhotoDetailNavLink from "@/photo/components/PhotoDetailNavLink";
import { cn } from "@/utils/cn";

type NavigationTarget = {
	href: string;
	imageUrl: string;
};

export default function PhotoImageNavigationControls({
	previous,
	next,
}: {
	previous?: NavigationTarget | null;
	next?: NavigationTarget | null;
}) {
	const [isVisible, setIsVisible] = useState(true);
	const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		const dismiss = () => {
			if (dismissTimer.current) clearTimeout(dismissTimer.current);
			dismissTimer.current = setTimeout(() => setIsVisible(false), 3000);
		};
		const revealOnImageTouch = (event: PointerEvent) => {
			if (
				event.pointerType !== "touch" ||
				!(event.target instanceof Element) ||
				!event.target.closest("[data-photo-navigation-surface]")
			)
				return;

			setIsVisible(true);
			dismiss();
		};

		dismiss();
		document.addEventListener("pointerdown", revealOnImageTouch, true);
		return () => {
			if (dismissTimer.current) clearTimeout(dismissTimer.current);
			document.removeEventListener("pointerdown", revealOnImageTouch, true);
		};
	}, []);

	const buttonClass =
		"pointer-events-auto inline-flex size-5 items-center justify-center rounded-full border border-[#d8d0c5]/80 bg-[#f7f5f2]/80 text-xs text-[#61594f] shadow-[0_1px_4px_rgb(48,40,27,0.12)] backdrop-blur-[2px] opacity-55 transition-[background-color,opacity,transform] active:scale-95 active:bg-[#e8e4de] active:opacity-100";
	const interactiveButtonClass = cn(
		buttonClass,
		!isVisible && "pointer-events-none",
	);

	return (
		<div
			aria-label="Photo navigation"
			className={cn(
				"pointer-events-none absolute inset-x-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-between transition-opacity duration-500 md:hidden",
				isVisible ? "opacity-100" : "opacity-0",
			)}
		>
			{previous ? (
				<PhotoDetailNavLink
					href={previous.href}
					direction="prev"
					imageUrl={previous.imageUrl}
					className={interactiveButtonClass}
					tabIndex={isVisible ? 0 : -1}
				>
					<span aria-hidden="true">←</span>
				</PhotoDetailNavLink>
			) : (
				<span aria-hidden="true" className={cn(buttonClass, "opacity-25")}>
					←
				</span>
			)}

			{next ? (
				<PhotoDetailNavLink
					href={next.href}
					direction="next"
					imageUrl={next.imageUrl}
					className={interactiveButtonClass}
					tabIndex={isVisible ? 0 : -1}
				>
					<span aria-hidden="true">→</span>
				</PhotoDetailNavLink>
			) : (
				<span aria-hidden="true" className={cn(buttonClass, "opacity-25")}>
					→
				</span>
			)}
		</div>
	);
}
