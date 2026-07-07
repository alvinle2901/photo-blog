"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Icons } from "@/components/icons";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
	getSortLabel,
	isDefaultSort,
	SORT_OPTIONS,
	type SortOrder,
	type SortType,
} from "@/photo/sort";
import { cn } from "@/utils/cn";

function getSortHref(basePath: "/" | "/grid", sortType: SortType, sortOrder: SortOrder) {
	if (basePath === "/" && isDefaultSort(sortType, sortOrder)) return "/";
	if (basePath === "/grid" && isDefaultSort(sortType, sortOrder)) return "/grid";

	const params = new URLSearchParams({ sortType, sortOrder });

	return `${basePath}?${params.toString()}`;
}

export default function PhotoSortDropdown({
	basePath,
	sortType,
	sortOrder,
	align = "end",
}: {
	basePath: "/" | "/grid";
	sortType: SortType;
	sortOrder: SortOrder;
	align?: "start" | "end";
}) {
	const router = useRouter();
	const activeLabel = getSortLabel(sortType, sortOrder);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label={`Sort photos by ${activeLabel}`}
				className="inline-flex h-8 w-fit items-center gap-1.5 rounded border border-[#ddd5ca] bg-[#fffdf9] px-2.5 text-[10px] uppercase tracking-[0.08em] text-[#61594f] outline-none transition-colors hover:bg-[#ece7df] hover:text-[#18170f] focus-visible:ring-2 focus-visible:ring-[#d8ccbd]"
				style={{ fontFamily: "'DM Mono', monospace" }}
			>
				<span>Sort</span>
				<Icons.chevronDown size={11} className="text-[#2b2824]" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align={align}
				className="min-w-[210px] border-[#ddd5ca] bg-[#fffdf9] p-1.5 text-[#4b4640]"
			>
				{SORT_OPTIONS.map((option) => {
					const isActive =
						option.sortType === sortType && option.sortOrder === sortOrder;

					return (
						<DropdownMenuItem
							key={`${option.sortType}-${option.sortOrder}`}
							asChild
						>
							<Link
								href={getSortHref(basePath, option.sortType, option.sortOrder)}
								onClick={(event) => {
									if (option.sortType !== "random") return;

									event.preventDefault();
									const params = new URLSearchParams({
										sortType: option.sortType,
										sortOrder: option.sortOrder,
										seed: Date.now().toString(36),
									});
									router.push(`${basePath}?${params.toString()}`);
								}}
								aria-current={isActive ? "page" : undefined}
								className={cn(
									"flex cursor-pointer items-center justify-between rounded px-2.5 py-2 text-[11px] uppercase tracking-[0.08em] outline-none transition-colors focus:bg-[#ece7df]",
									isActive ? "bg-[#ece7df] text-[#18170f]" : "text-[#61594f]",
								)}
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								<span>{option.label}</span>
								{isActive && <Icons.check size={13} />}
							</Link>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
