"use client";

import { Command, Search } from "lucide-react";

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/Tooltip";
import { useAppState } from "@/providers/app-state";

export function AdminCommandButton() {
	const { setIsCommandKOpen } = useAppState();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					aria-label="Open command menu"
					aria-keyshortcuts="Meta+K Control+K"
					className="inline-flex h-8 items-center gap-2 rounded-full border border-[#d8d1c7] bg-[#ebe7df] px-3 text-xs uppercase tracking-[0.12em] text-[#777065] transition-colors hover:bg-[#f7f5f2] hover:text-[#18170f]"
					style={{ fontFamily: "'DM Mono', monospace" }}
					onClick={() => setIsCommandKOpen?.(true)}
				>
					<Search size={14} />
					<span className="hidden sm:inline">Command</span>
					<span className="flex items-center gap-0.5 text-[10px] text-[#8c857a]">
						<Command size={11} />
						<span>K</span>
					</span>
				</button>
			</TooltipTrigger>
			<TooltipContent>
				<span className="inline-flex items-center gap-1.5">
					<span>open command menu</span>
					<span className="rounded border border-[#e2d8cb] bg-[#fffdf9] px-1.5 py-0.5">
						Cmd
					</span>
					<span className="rounded border border-[#e2d8cb] bg-[#fffdf9] px-1.5 py-0.5">
						K
					</span>
				</span>
			</TooltipContent>
		</Tooltip>
	);
}
