import Link from "next/link";
import type { ReactElement } from "react";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/Tooltip";
import { cn } from "@/utils/cn";

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
	const className = cn(
		classNameProp,
		"py-0.5 px-1.5",
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
		<Link href={href} className={className} aria-label={title}>
			{renderIcon()}
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
			<TooltipContent>{title}</TooltipContent>
		</Tooltip>
	);
};

export default SwitcherItem;
