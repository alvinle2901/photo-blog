"use client";

import Link, { useLinkStatus } from "next/link";
import type { ReactElement } from "react";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/Tooltip";
import { cn } from "@/utils/cn";

function LinkPendingSpinner() {
	const { pending } = useLinkStatus();

	return (
		<span
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute inset-0 flex items-center justify-center rounded-sm bg-[#f7f5f2]/85 transition-opacity",
				pending ? "opacity-100" : "opacity-0",
			)}
		>
			<span className="size-4 animate-spin rounded-full border border-[#9a7656] border-t-transparent" />
		</span>
	);
}

const SwitcherItem = ({
	icon,
	title,
	href,
	className: classNameProp,
	onClick,
	active,
	noPadding,
}: {
	icon: ReactElement;
	title?: string;
	href?: string;
	className?: string;
	onClick?: () => void;
	active?: boolean;
	noPadding?: boolean;
}) => {
	const showsPendingSpinner =
		title === "feed" || title === "grid" || title === "map";
	const className = cn(
		classNameProp,
		"relative py-0.5 px-1.5",
		"cursor-pointer",
		"hover:bg-gray-100/60 active:bg-gray-100",
		active ? "text-black" : "text-gray-400",
		active ? "hover:text-black" : "hover:text-gray-500",
	);

	const renderIcon = () =>
		noPadding ? (
			icon
		) : (
			<div className="w-[28px] h-[24px] flex items-center justify-center">
				{icon}
			</div>
		);

	const item = href ? (
		<Link
			href={href}
			className={className}
			aria-label={title}
			prefetch={showsPendingSpinner ? false : undefined}
		>
			{renderIcon()}
			{showsPendingSpinner && <LinkPendingSpinner />}
		</Link>
	) : (
		<button
			type="button"
			onClick={onClick}
			className={className}
			aria-label={title}
		>
			{renderIcon()}
		</button>
	);

	if (!title) return item;

	return (
		<Tooltip>
			<TooltipTrigger asChild>{item}</TooltipTrigger>
			<TooltipContent className="border-0">{title}</TooltipContent>
		</Tooltip>
	);
};

export default SwitcherItem;
