import Link from "next/link";
import type { ComponentProps } from "react";

import type { PhotoDetailDirection } from "@/photo/components/PhotoDetailTransition";
import { cn } from "@/utils/cn";

type PhotoDetailNavLinkProps = ComponentProps<typeof Link> & {
	direction: PhotoDetailDirection;
	imageUrl: string;
};

export default function PhotoDetailNavLink({
	children,
	className,
	direction,
	href,
	imageUrl,
	...props
}: PhotoDetailNavLinkProps) {
	const arrow = direction === "prev" ? "←" : "→";
	const label = direction === "prev" ? "Previous" : "Next";

	return (
		<Link
			{...props}
			href={href}
			prefetch
			data-prefetch-href={typeof href === "string" ? href : undefined}
			data-preload-image={imageUrl}
			data-transition-direction={direction}
			className={cn(
				"group relative inline-flex items-center hover:text-gray-900 transition-colors",
				className,
			)}
		>
			{children}
			<span
				aria-hidden="true"
				className={cn(
					"pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 translate-y-1",
					"inline-flex items-center gap-1.5 whitespace-nowrap rounded border border-[#d8d0c5] bg-[#fbfaf7] px-2.5 py-1.5",
					"text-[13px] leading-none text-[#3b352e] shadow-sm",
					"opacity-0 transition duration-200 ease-out",
					"group-hover:translate-y-0 group-hover:opacity-100",
					"group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
				)}
				style={{ fontFamily: "'DM Mono', monospace" }}
			>
				{direction === "prev" && (
					<span className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-[#bfb5a8] bg-white px-1 text-[13px] shadow-[inset_0_-1px_0_rgba(0,0,0,0.14)]">
						{arrow}
					</span>
				)}
				<span>{label}</span>
				{direction === "next" && (
					<span className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-[#bfb5a8] bg-white px-1 text-[13px] shadow-[inset_0_-1px_0_rgba(0,0,0,0.14)]">
						{arrow}
					</span>
				)}
			</span>
		</Link>
	);
}
