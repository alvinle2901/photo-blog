"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

import { useAppState } from "@/state";
import { cn } from "@/utils/cn";

import { useSharedHoverState } from "./state";

export default function SharedHover({
	hoverKey,
	children,
	content,
	className,
	width,
	height,
	offsetAbove = -1,
	offsetBelow = -6,
	style,
}: {
	hoverKey: string;
	children: ReactNode;
	content: ReactNode;
	className?: string;
	width: number;
	height: number;
	offsetAbove?: number;
	offsetBelow?: number;
	style?: CSSProperties;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const { supportsHover } = useAppState();
	const { showHover, dismissHover, renderHover, isHoverBeingShown } =
		useSharedHoverState();

	const isHovering = isHoverBeingShown?.(hoverKey);

	useEffect(() => {
		const trigger = ref.current;
		return () => dismissHover?.(trigger);
	}, [dismissHover]);

	useEffect(() => {
		if (isHovering) {
			renderHover?.(content);
		}
	}, [content, isHovering, renderHover]);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: This wrapper only tracks pointer hover around its interactive child.
		<div
			role="presentation"
			className={cn("max-w-full", className)}
			ref={ref}
			onMouseEnter={() =>
				supportsHover &&
				showHover?.(
					ref.current,
					{
						key: hoverKey,
						width,
						height,
						offsetAbove,
						offsetBelow,
					},
					style,
				)
			}
			onMouseLeave={() => supportsHover && dismissHover?.(ref.current)}
		>
			{children}
		</div>
	);
}
