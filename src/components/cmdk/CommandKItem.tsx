import { Command } from "cmdk";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

import { Icons } from "../icons";

export default function CommandKItem({
	label,
	value,
	keywords,
	onSelect,
	accessory,
	annotation,
	annotationAria,
	loading,
	disabled,
}: {
	label: string;
	value: string;
	keywords?: string[];
	onSelect: () => void;
	accessory?: ReactNode;
	annotation?: ReactNode;
	annotationAria?: string;
	loading?: boolean;
	disabled?: boolean;
}) {
	return (
		<Command.Item
			value={value}
			keywords={keywords}
			className={cn(
				"group relative mx-1 flex min-h-11 items-center overflow-hidden rounded-md px-2.5 py-2",
				"cursor-pointer select-none tracking-wide text-[#4b4640]",
				"transition-colors duration-150",
				"data-[selected=true]:bg-[#f2eee7] data-[selected=true]:text-[#24211d]",
				"data-[selected=true]:shadow-[inset_0_0_0_1px_rgba(169,148,120,0.12)]",
				"active:!bg-[#ede6dc]",
				disabled && "opacity-25",
			)}
			onSelect={onSelect}
			disabled={loading || disabled}
		>
			<div className="flex w-full min-w-0 items-center gap-2.5">
				{accessory && (
					<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[#e2d8cb] bg-[#fffdf9] text-[#8b8175] transition-colors group-data-[selected=true]:border-[#d8ccbd] group-data-[selected=true]:text-[#2b2824]">
						{accessory}
					</span>
				)}
				<span
					className="min-w-0 grow truncate text-sm"
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					{label}
				</span>
				{annotation && !loading && (
					<span
						className="flex h-7 min-w-9 shrink-0 items-center justify-center whitespace-nowrap rounded border border-[#d8ccbd] bg-[#fffdf9] px-2 text-sm font-semibold leading-none text-[#4b4640] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] transition-colors group-data-[selected=true]:border-[#c9b8a5] group-data-[selected=true]:bg-white group-data-[selected=true]:text-[#24211d]"
						style={{ fontFamily: "'DM Mono', monospace" }}
					>
						{annotationAria && (
							<span className="sr-only">{annotationAria}</span>
						)}
						<span aria-hidden={Boolean(annotationAria)}>{annotation}</span>
					</span>
				)}
				{loading && <Icons.loader size={12} className="animate-spin" />}
			</div>
		</Command.Item>
	);
}
