"use client";

import Link from "next/link";

import { Icons } from "@/components/icons";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { cn } from "@/utils/cn";

type SortType = "createdAt" | "takenAt" | "title";
type SortOrder = "asc" | "desc";

const sortOptions: Array<{
	label: string;
	sortType: SortType;
	sortOrder: SortOrder;
}> = [
	{ label: "taken new", sortType: "takenAt", sortOrder: "desc" },
	{ label: "taken old", sortType: "takenAt", sortOrder: "asc" },
	{ label: "added new", sortType: "createdAt", sortOrder: "desc" },
	{ label: "added old", sortType: "createdAt", sortOrder: "asc" },
	{ label: "title a-z", sortType: "title", sortOrder: "asc" },
	{ label: "title z-a", sortType: "title", sortOrder: "desc" },
];

function getSortHref(sortType: SortType, sortOrder: SortOrder) {
	return sortType === "takenAt" && sortOrder === "desc"
		? "/grid"
		: `/grid/${sortType}/${sortOrder}`;
}

function getSortLabel(sortType: SortType, sortOrder: SortOrder) {
	return (
		sortOptions.find(
			(option) =>
				option.sortType === sortType && option.sortOrder === sortOrder,
		)?.label ?? "sort"
	);
}

export default function GridSortDropdown({
	sortType,
	sortOrder,
}: {
	sortType: SortType;
	sortOrder: SortOrder;
}) {
	const activeLabel = getSortLabel(sortType, sortOrder);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label={`Sort photos by ${activeLabel}`}
				className="inline-flex h-7 w-fit items-center gap-1.5 rounded border border-[#ddd5ca] bg-[#fffdf9] px-2 text-[10px] uppercase tracking-[0.08em] text-[#61594f] outline-none transition-colors hover:bg-[#ece7df] hover:text-[#18170f] focus-visible:ring-2 focus-visible:ring-[#d8ccbd]"
				style={{ fontFamily: "'DM Mono', monospace" }}
			>
				<span>Sort</span>
				<Icons.chevronDown size={11} className="text-[#2b2824]" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="min-w-[210px] border-[#ddd5ca] bg-[#fffdf9] p-1.5 text-[#4b4640]"
			>
				{sortOptions.map((option) => {
					const isActive =
						option.sortType === sortType && option.sortOrder === sortOrder;

					return (
						<DropdownMenuItem
							key={`${option.sortType}-${option.sortOrder}`}
							asChild
						>
							<Link
								href={getSortHref(option.sortType, option.sortOrder)}
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
