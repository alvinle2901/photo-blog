"use client";

import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { Icons } from "@/components/icons";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/Tooltip";
import {
	DEFAULT_SORT_TYPE,
	getSortLabel,
	isDefaultSort,
	SORT_ORDER_OPTIONS,
	SORT_TYPE_OPTIONS,
	type SortOrder,
	type SortType,
} from "@/photo/sort";
import { cn } from "@/utils/cn";

function getSortHref(
	basePath: "/" | "/grid",
	sortType: SortType,
	sortOrder: SortOrder,
) {
	if (basePath === "/" && isDefaultSort(sortType, sortOrder)) return "/";
	if (basePath === "/grid" && isDefaultSort(sortType, sortOrder))
		return "/grid";

	const params = new URLSearchParams({ sortType, sortOrder });

	return `${basePath}?${params.toString()}`;
}

export default function PhotoSortDropdown({
	basePath,
	sortType,
	sortOrder,
	align = "end",
	triggerVariant = "default",
}: {
	basePath: "/" | "/grid";
	sortType: SortType;
	sortOrder: SortOrder;
	align?: "start" | "end";
	triggerVariant?: "default" | "icon";
}) {
	const router = useRouter();
	const activeLabel = getSortLabel(sortType, sortOrder);
	const isIconTrigger = triggerVariant === "icon";
	const sortTypeForOrder = sortType === "random" ? DEFAULT_SORT_TYPE : sortType;
	const itemClassName =
		"flex cursor-pointer items-center justify-between rounded px-2.5 py-2 text-sm outline-none transition-colors focus:bg-[#ece7df]";

	const handleRandomSort = (event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		const params = new URLSearchParams({
			sortType: "random",
			sortOrder: "desc",
			seed: Date.now().toString(36),
		});
		router.push(`${basePath}?${params.toString()}`);
	};

	const trigger = (
		<DropdownMenuTrigger
			aria-label={`Sort photos by ${activeLabel}`}
			className={cn(
				isIconTrigger
					? "inline-flex h-8 w-8 appearance-none cursor-pointer items-center justify-center rounded border-0 bg-transparent text-gray-400 outline-none transition-colors hover:bg-gray-100/60 hover:text-gray-700 active:bg-gray-100"
					: "inline-flex h-8 w-fit items-center gap-1.5 rounded border border-[#ddd5ca] bg-[#fffdf9] px-2.5 text-sm text-[#61594f] outline-none transition-colors hover:bg-[#ece7df] hover:text-[#18170f] focus-visible:ring-2 focus-visible:ring-[#d8ccbd] [font-family:'DM_Mono',monospace]",
			)}
		>
			{isIconTrigger ? (
				<ArrowUpDown size={18} />
			) : (
				<>
					<span>sort</span>
					<Icons.chevronDown size={11} className="text-[#2b2824]" />
				</>
			)}
		</DropdownMenuTrigger>
	);

	return (
		<DropdownMenu>
			{isIconTrigger ? (
				<Tooltip>
					<TooltipTrigger asChild>{trigger}</TooltipTrigger>
					<TooltipContent>sort</TooltipContent>
				</Tooltip>
			) : (
				trigger
			)}
			<DropdownMenuContent
				align={align}
				className="min-w-[160px] border-[#ddd5ca] bg-[#fffdf9] p-1.5 text-sm text-[#4b4640] [font-family:'DM_Mono',monospace]"
			>
				{SORT_ORDER_OPTIONS.map((option) => {
					const isActive =
						sortType !== "random" && option.sortOrder === sortOrder;

					return (
						<DropdownMenuItem key={option.sortOrder} asChild>
							<Link
								href={getSortHref(basePath, sortTypeForOrder, option.sortOrder)}
								aria-current={isActive ? "page" : undefined}
								className={cn(
									itemClassName,
									isActive ? "bg-[#ece7df] text-[#18170f]" : "text-[#61594f]",
								)}
							>
								<span>{option.label}</span>
								{isActive && <Icons.check size={13} />}
							</Link>
						</DropdownMenuItem>
					);
				})}
				<DropdownMenuSeparator className="bg-[#e8dfd3]" />
				{SORT_TYPE_OPTIONS.map((option) => {
					const isActive = option.sortType === sortType;

					return (
						<DropdownMenuItem key={option.sortType} asChild>
							<Link
								href={getSortHref(basePath, option.sortType, sortOrder)}
								aria-current={isActive ? "page" : undefined}
								className={cn(
									itemClassName,
									isActive ? "bg-[#ece7df] text-[#18170f]" : "text-[#61594f]",
								)}
							>
								<span>{option.label}</span>
								{isActive && <Icons.check size={13} />}
							</Link>
						</DropdownMenuItem>
					);
				})}
				<DropdownMenuSeparator className="bg-[#e8dfd3]" />
				<DropdownMenuItem asChild>
					<Link
						href={`${basePath}?sortType=random&sortOrder=desc`}
						onClick={handleRandomSort}
						aria-current={sortType === "random" ? "page" : undefined}
						className={cn(
							itemClassName,
							sortType === "random"
								? "bg-[#ece7df] text-[#18170f]"
								: "text-[#61594f]",
						)}
					>
						<span>random</span>
						{sortType === "random" && <Icons.check size={13} />}
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
