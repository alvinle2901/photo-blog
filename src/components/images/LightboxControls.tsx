"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/Tooltip";

export function LightboxIconButton({
	label,
	children,
	onClick,
	disabled,
}: {
	label: string;
	children: ReactNode;
	onClick?: () => void;
	disabled?: boolean;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					aria-label={label}
					onClick={onClick}
					disabled={disabled}
					className="h-10 w-10 rounded-full border border-white/15 bg-black/45 text-white shadow-sm backdrop-blur-md hover:bg-black/70 hover:text-white focus-visible:ring-white/70 focus-visible:ring-offset-0"
				>
					{children}
				</Button>
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}
