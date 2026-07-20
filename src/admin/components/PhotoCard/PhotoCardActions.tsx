"use client";

import Link from "next/link";

import { DeletePhotoButton } from "@/admin/components/DeletePhotoButton";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

export function PhotoCardActions({
	deleteType = "digital",
	editHref,
	id,
	onDeleted,
}: {
	deleteType?: "digital" | "35mm";
	editHref?: string;
	id: string;
	onDeleted?: (photoId: string) => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="icon"
					aria-label="Photo actions"
					className="absolute right-2 top-2 z-10 size-8 rounded-full border-[#d8d1c7] bg-[#f7f5f2] text-[#18170f] opacity-95 shadow-sm transition-all hover:bg-[#ebe7df] group-hover:opacity-100"
				>
					<Icons.moreHorizontal size={16} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="min-w-[140px] border-[#ddd5ca] bg-[#fffdf9] p-1.5 text-sm text-[#4b4640] [font-family:'DM_Mono',monospace]"
			>
				{editHref && (
					<DropdownMenuItem asChild>
						<Link
							href={editHref}
							className="flex cursor-pointer items-center gap-2 rounded px-2.5 py-2 text-sm outline-none transition-colors hover:bg-[#ece7df]"
						>
							<Icons.pencil size={14} />
							<span>Edit</span>
						</Link>
					</DropdownMenuItem>
				)}
				<DropdownMenuItem asChild>
					<DeletePhotoButton
						id={id}
						type={deleteType}
						label={deleteType === "35mm" ? "Delete scan" : "Delete photo"}
						onDeleted={onDeleted}
						presentation="menu-item"
						className='cursor-pointer'
					/>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
